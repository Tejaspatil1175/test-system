const express = require('express');
const router = express.Router();
const {
  createTeam,
  listTeams,
  addQuestion,
  getQuestions,
  deleteQuestion,
  calculateResults,
  getResults,
  downloadTeamPdf,
} = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

router.post('/create-team', verifyToken, isAdmin, createTeam);
router.get('/teams', verifyToken, isAdmin, listTeams);

router.post('/questions', verifyToken, isAdmin, addQuestion);
router.get('/questions', verifyToken, isAdmin, getQuestions);
router.delete('/questions/:id', verifyToken, isAdmin, deleteQuestion);

router.post('/calculate-results', verifyToken, isAdmin, calculateResults);
router.get('/results', verifyToken, isAdmin, getResults);

router.get('/pdf/:teamId', verifyToken, isAdmin, downloadTeamPdf);

module.exports = router;




