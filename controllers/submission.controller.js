const mongoose = require('mongoose');

const Submission = require('../models/submission.model.');
const Assignment = require('../models/assignment.model');

const helperController = require('./helper.controller');
const assignmentController = require('./assignment.controller');

const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + "-" + file.originalname);
    }
});

const limits = {
    files: 1, // allow only 1 file per request
    fileSize: 10 * 1024 * 1024, // 1 MB (max file size)
};

const upload = multer({storage, limits}).single('question');

async function getSubmissionsByStudent(user_id) {
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
                solution: 1,
                grade: 1
            }
        }
    ]);
    return submissions;
}

async function addSubmissionByStudent(req, res) {
    upload(req, res, async function (err) {
        if (err) {
            console.log('error: ', err);
            return res.end("Error uploading file:", err);
        }
        // console.log('fiLE UPLOADED successfully');
        let user_id = req.headers.cookie.split(';')[0].split('=')[1];
        user_id = mongoose.Types.ObjectId(user_id);
        const assignment = {
            user_id,
            assignment_id: req.body.assignment_id,
            solution: req.file.filename,
        };
        // console.log(assignment);
        await Submission.create(assignment);
        await Assignment.updateOne({_id: req.body.assignment_id}, {$push: {submitted_by: user_id}});
        const assignments = await assignmentController.getUpcomingAssignmentsForStudent(user_id);
        const submissions = await getSubmissionsByStudent(user_id);
        // console.log(assignments, submissions);
        return res.render('pages/student-dashboard', {assignments, submissions});
    });
}

async function gradeAssignment(req, res) {
    // console.log(req.body);
    await Submission.updateOne({_id: req.body.submission_id}, {$set: {grade: req.body.grade}});
    let user_id = req.headers.cookie.split(';')[0].split('=')[1];
    user_id = mongoose.Types.ObjectId(user_id);
    const submissions = await helperController.getSubmissionsForInstructor(user_id);
    // console.log(submissions);
    return res.render('pages/instructor-dashboard', {submissions});
}

async function getFilteredSubmissions(req, res) {
    const filterText = req.body.search;
    let user_id = req.headers.cookie.split(';')[0].split('=')[1];
    user_id = mongoose.Types.ObjectId(user_id);
    const submissions = filterText ? await helperController.getSubmissionsForInstructor(user_id, filterText) : await helperController.getSubmissionsForInstructor(user_id);
    return res.render('pages/instructor-dashboard', {submissions});
}

module.exports = {
    getSubmissionsByStudent,
    addSubmissionByStudent,
    gradeAssignment,
    getFilteredSubmissions
};