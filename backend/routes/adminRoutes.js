const express = require('express');
const router = express.Router();
const {
  createTeam,
  listTeams,
  addQuestion,
  getQuestions,
  deleteQuestion,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/create-team', verifyToken, isAdmin, createTeam);
router.get('/teams', verifyToken, isAdmin, listTeams);

router.post('/questions', verifyToken, isAdmin, addQuestion);
router.get('/questions', verifyToken, isAdmin, getQuestions);
router.delete('/questions/:id', verifyToken, isAdmin, deleteQuestion);

module.exports = router;


