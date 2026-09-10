const express = require('express');
const router = express.Router();
const { startTest } = require('../controllers/testController');
const verifyToken = require('../middleware/auth');

router.get('/start', verifyToken, startTest);

module.exports = router;
