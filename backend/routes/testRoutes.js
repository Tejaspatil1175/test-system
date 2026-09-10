const express = require('express');
const router = express.Router();
const { startTest, getTestQuestions } = require('../controllers/testController');
const verifyToken = require('../middleware/auth');

router.get('/start', verifyToken, startTest);
router.get('/questions', verifyToken, getTestQuestions);

module.exports = router;

