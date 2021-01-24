// Load Node modules
const express = require('express');
const parser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const User = require('./model');
const Assignment = require('./assignments');
const Submission = require('./submissions');
// Initialise Express
const app = express();
require('./mongoose');
app.use(parser.urlencoded({extended: false}))
app.use(parser.json())
// Render static files
app.use(express.static('public'));
app.set('view engine', 'ejs');
// Port website will run on
app.listen(process.env.PORT || 8080);

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({storage}).single('question');


// *** GET Routes - display pages ***
// Root Route
app.get('/', function (req, res) {
    res.render('pages/index');
});

app.post('/register', function (req, res) {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        type: req.body.type,
    };
    if (req.body.type === 'instructor') {
        user.subjects = req.body.subjects;
    }
    console.log(user);
    User.create(user);
    res.render('pages/index', {
        message: 'Registration Successful. Please login to continue.',
        messageClass: 'alert-danger'
    });
});

app.get('/logout', function (req, res) {
    res.clearCookie('user_id');
    res.render('pages/index');
});

app.post('/login', async function (req, res) {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };
    console.log(user);
    const result = await User.findOne(user);
    console.log(result);
    if (!result) {
        res.render('pages/index', {
            message: 'Login failed! Please login again',
            messageClass: 'alert-danger'
        });
    }
    res.cookie('user_id', result._id.toString());
    const user_id = result._id;
    if (result) {
        if (result.type === 'instructor') {
            const submissions = await Submission.aggregate([
                {
                    $lookup: {
                        from: "assignments",
                        localField: "assignment_id",
                        foreignField: "_id",
                        as: "assignment"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $sort: {
                        submission_time: -1
                    }
                },
                {
                    $project: {
                        assignment_name: "$assignment.name",
                        assignment_subject: "$assignment.subject",
                        assignment_question: "$assignment.question",
                        assignment_user_id: "$assignment.user_id",
                        user_name: "$user.name",
                        solution: 1,
                        submission_time: 1,
                        grade: 1
                    }
                },
                {
                    $match: {
                        assignment_user_id: user_id
                    }
                },
            ]);
            console.log(submissions);
            res.render('pages/instructor-dashboard', {submissions});
        } else {
            const assignments = await Assignment.find({submitted_by: {$ne: user_id}});
            const submissions = await Submission.aggregate([
                {
                    $match: {
                        user_id
                    }
                }, {
                    $lookup: {
                        from: "assignments",
                        localField: "assignment_id",
                        foreignField: "_id",
                        as: "assignment"
                    }
                },
                {
                    $project: {
                        assignment_name: "$assignment.name",
                        assignment_subject: "$assignment.subject",
                        assignment_question: "$assignment.question",
                        solution: 1
                    }
                }
            ]);
            console.log(submissions);
            res.render('pages/student-dashboard', {assignments, submissions});
        }
    } else {
        res.render('pages/index');
    }
});

app.post('/assignment', async function (req, res) {
    upload(req, res, async function (err) {
        if (err) {
            console.log('error: ', err);
            return res.end("Error uploading file:", err);
        }
        console.log('fiLE UPLOADED successfully');
        // res.end("File is uploaded successfully!");
        // console.log('BODY: ', req.body, 'FILE: ', req.file, 'cookies: ', req);
        let user_id = req.headers.cookie.split(';')[0].split('=')[1];
        user_id = mongoose.Types.ObjectId(user_id);
        const assignment = {
            user_id,
            name: req.body.name,
            subject: req.body.subject,
            question: req.file.filename,
            deadline: req.body.deadline
        };
        console.log(assignment);
        await Assignment.create(assignment);
        const submissions = await Submission.aggregate([
            {
                $lookup: {
                    from: "assignments",
                    localField: "assignment_id",
                    foreignField: "_id",
                    as: "assignment"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $sort: {
                    submission_time: -1
                }
            },
            {
                $project: {
                    assignment_name: "$assignment.name",
                    assignment_subject: "$assignment.subject",
                    assignment_question: "$assignment.question",
                    assignment_user_id: "$assignment.user_id",
                    user_name: "$user.name",
                    solution: 1,
                    submission_time: 1,
                    grade: 1
                }
            },
            {
                $match: {
                    assignment_user_id: user_id
                }
            },
        ]);
        console.log(submissions);
        res.render('pages/instructor-dashboard', {submissions});
    });
});

app.post('/submission', async function (req, res) {
    upload(req, res, async function (err) {
        if (err) {
            console.log('error: ', err);
            return res.end("Error uploading file:", err);
        }
        console.log('fiLE UPLOADED successfully');
        // res.end("File is uploaded successfully!");
        // console.log('BODY: ', req.body, 'FILE: ', req.file, 'cookies: ', req);
        let user_id = req.headers.cookie.split(';')[0].split('=')[1];
        user_id = mongoose.Types.ObjectId(user_id);
        const assignment = {
            user_id,
            assignment_id: req.body.assignment_id,
            solution: req.file.filename,
        };
        console.log(assignment);
        await Submission.create(assignment);
        await Assignment.updateOne({_id: req.body.assignment_id}, {$push: {submitted_by: user_id}});
        const assignments = await Assignment.find({submitted_by: {$ne: user_id}});
        const submissions = await Submission.aggregate([
            {$match: {user_id}},
            {
                $lookup: {
                    from: "assignments",
                    localField: "assignment_id",
                    foreignField: "_id",
                    as: "assignment"
                }
            },
            {
                $project: {
                    assignment_name: "$assignment.name",
                    assignment_subject: "$assignment.subject",
                    assignment_question: "$assignment.question",
                    solution: 1
                }
            }
        ]);
        console.log(assignments, submissions);
        res.render('pages/student-dashboard', {assignments, submissions});
    });
});

app.post('/grade', async function (req, res) {
    console.log(req.body);
    await Submission.updateOne({_id: req.body.submission_id}, {$set: {grade: req.body.grade}});
    let user_id = req.headers.cookie.split(';')[0].split('=')[1];
    user_id = mongoose.Types.ObjectId(user_id);
    const submissions = await Submission.aggregate([
        {
            $lookup: {
                from: "assignments",
                localField: "assignment_id",
                foreignField: "_id",
                as: "assignment"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $sort: {
                submission_time: -1
            }
        },
        {
            $project: {
                assignment_name: "$assignment.name",
                assignment_subject: "$assignment.subject",
                assignment_question: "$assignment.question",
                assignment_user_id: "$assignment.user_id",
                user_name: "$user.name",
                solution: 1,
                submission_time: 1,
                grade: 1
            }
        },
        {
            $match: {
                assignment_user_id: user_id
            }
        },
    ]);
    console.log(submissions);
    res.render('pages/instructor-dashboard', {submissions});
});

