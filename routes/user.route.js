const express = require('express');
const asyncHandler = require('express-async-handler');
const userController = require('../controllers/user.controller');

const router = express.Router();
module.exports = router;

router.route('/register').post(asyncHandler(userController.register));
router.route('/login').post(asyncHandler(userController.login));
router.route('/logout').get(asyncHandler(userController.logout));