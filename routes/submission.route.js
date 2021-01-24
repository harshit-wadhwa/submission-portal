const express = require('express');
const asyncHandler = require('express-async-handler');
const submissionController = require('../controllers/submission.controller');

const router = express.Router();
module.exports = router;

router.route('/submissions').post(asyncHandler(submissionController.getFilteredSubmissions));
router.route('/submission').post(asyncHandler(submissionController.addSubmissionByStudent));
router.route('/grade').post(asyncHandler(submissionController.gradeAssignment));
