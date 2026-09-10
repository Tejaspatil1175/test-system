const express = require('express');
const router = express.Router();
const { adminLogin, teamLogin } = require('../controllers/authController');

router.post('/admin/login', adminLogin);
router.post('/team/login', teamLogin);

module.exports = router;
