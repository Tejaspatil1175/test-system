const express = require('express');
const router = express.Router();
const { createTeam, listTeams } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/create-team', verifyToken, isAdmin, createTeam);
router.get('/teams', verifyToken, isAdmin, listTeams);

module.exports = router;

