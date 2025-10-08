const express = require('express');
const router = express.Router();
const { generatePrompt } = require('../controllers/promptController');

router.post('/api/prompt', generatePrompt);

module.exports = router;
