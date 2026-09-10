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
  clearSubmissions,
  clearTeams,
  clearQuestions,
  clearEntireDatabase,
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

// Database Maintenance & Reset Endpoints
router.post('/reset/submissions', verifyToken, isAdmin, clearSubmissions);
router.post('/reset/teams', verifyToken, isAdmin, clearTeams);
router.post('/reset/questions', verifyToken, isAdmin, clearQuestions);
router.post('/reset/all', verifyToken, isAdmin, clearEntireDatabase);

module.exports = router;




