const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const storiesPath = path.join(__dirname, '..', 'stories.json');

router.get('/render-gallery', (req, res) => {
  fs.readFile(storiesPath, 'utf8', (err, data) => {
    if (err) {
      return res.json({ stories: [] });
    }

    const stories = JSON.parse(data || '[]');
    res.json({ stories });
  });
});

module.exports = router;
