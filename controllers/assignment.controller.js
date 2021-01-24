const mongoose = require('mongoose');

const multer = require('multer');
const path = require('path');

const Assignment = require('../models/assignment.model');

const helperController = require('./helper.controller');

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

async function getUpcomingAssignmentsForStudent(user_id) {
    return await Assignment.find({submitted_by: {$ne: user_id}});
}

async function addAssignmentByInstructor(req, res) {
    upload(req, res, async function (err) {
        if (err) {
            console.log('error: ', err);
            return res.end("Error uploading file:", err);
        }
        // console.log('fiLE UPLOADED successfully: ');
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
        // console.log(assignment);
        await Assignment.create(assignment);
        const submissions = await helperController.getSubmissionsForInstructor(user_id);
        // console.log(submissions);
        return res.render('pages/instructor-dashboard', {submissions});
    });
}

async function viewAssignment(req, res) {
    // console.log(req.body);
    const filePath = path.join(__dirname, "../uploads/" + req.body.file_name);
    // console.log(filePath);
    res.sendFile(filePath);
}

module.exports = {
    getUpcomingAssignmentsForStudent,
    addAssignmentByInstructor,
    viewAssignment
};

