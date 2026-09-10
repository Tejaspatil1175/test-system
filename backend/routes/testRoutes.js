const express = require('express');
const router = express.Router();
const {
  startTest,
  getTestQuestions,
  submitTest,
  autosaveAnswers,
} = require('../controllers/testController');
const verifyToken = require('../middleware/auth');

router.get('/start', verifyToken, startTest);
router.get('/questions', verifyToken, getTestQuestions);
router.post('/submit', verifyToken, submitTest);
router.post('/autosave', verifyToken, autosaveAnswers);

module.exports = router;


