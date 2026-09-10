const express = require('express');
const router = express.Router();
const { createTeam } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/create-team', verifyToken, isAdmin, createTeam);

module.exports = router;
