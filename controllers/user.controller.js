const User = require('../models/user.model');

const helperController = require('./helper.controller');
const submissionsController = require('./submission.controller');
const assignmentsController = require('./assignment.controller');

async function register(req, res) {
    const user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        type: req.body.type,
    };
    if (req.body.type === 'instructor') {
        user.subjects = req.body.subjects;
    }
    // console.log(user);
    await User.create(user);
    return res.render('pages/index', {
        message: 'Registration Successful. Please login to continue.',
        messageClass: 'alert-danger'
    });
}

async function logout(req, res) {
    res.clearCookie('user_id');
    return res.render('pages/index');
}

async function login(req, res) {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };
    // console.log(user);
    const result = await User.findOne(user);
    // console.log(result);
    if (!result) {
        res.render('pages/index', {
            message: 'Login failed! Please login again',
            messageClass: 'alert-danger'
        });
    }
    if (result) {
        res.cookie('user_id', result._id.toString());
        const user_id = result._id;
        if (result.type === 'instructor') {
            const submissions = await helperController.getSubmissionsForInstructor(user_id);
            // console.log(submissions);
            return res.render('pages/instructor-dashboard', {submissions});
        } else {
            const assignments = await assignmentsController.getUpcomingAssignmentsForStudent(user_id);
            const submissions = await submissionsController.getSubmissionsByStudent(user_id);
            // console.log(submissions);
            return res.render('pages/student-dashboard', {assignments, submissions});
        }
    } else {
        return res.render('pages/index');
    }
}

module.exports = {
    register,
    login,
    logout
};