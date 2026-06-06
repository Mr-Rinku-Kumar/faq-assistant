const express = require('express');
const { askQuestion } = require('../controllers/chatController');
const { streamResponse } = require('../controllers/streamController');
const router = express.Router();

router.post('/', askQuestion);
router.post('/stream', streamResponse); // New streaming endpoint

module.exports = router;