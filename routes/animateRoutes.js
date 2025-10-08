const express = require('express');
const router = express.Router();
const { animateVideo } = require('../controllers/animateController');

router.post('/animate', animateVideo);

module.exports = router;
