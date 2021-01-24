const express = require('express');
const asyncHandler = require('express-async-handler');
const assignmentController = require('../controllers/assignment.controller');

const router = express.Router();
module.exports = router;

router.route('/assignment').post(asyncHandler(assignmentController.addAssignmentByInstructor));
router.route('/show-file').post(asyncHandler(assignmentController.viewAssignment));