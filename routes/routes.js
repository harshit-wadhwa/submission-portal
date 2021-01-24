const express = require('express');

const userRoutes = require('./user.route');
const assignmentRoutes = require('./assignment.route');
const submissionRoutes = require('./submission.route');

const router = express.Router();

router.use('/', userRoutes);
router.use('/', assignmentRoutes);
router.use('/', submissionRoutes);

module.exports = router;
