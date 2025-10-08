const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const storiesPath = path.join(__dirname, '..', 'stories.json');

router.get('/creator/:id', (req, res) => {
  const creatorId = req.params.id.toLowerCase();

  fs.readFile(storiesPath, 'utf8', (err, data) => {
    if (err) return res.json({ stories: [] });

    const allStories = JSON.parse(data || '[]');
    const filtered = allStories.filter(story =>
      story.creator_id.toLowerCase() === creatorId
    );

    res.json({ stories: filtered });
  });
});

module.exports = router;
