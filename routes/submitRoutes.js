const express = require('express');
const router = express.Router();

let stories = []; // Temporary in-memory storage

// Submit a new story
router.post('/api/submit', (req, res) => {
  const { prompt, imageUrl, animationUrl, creatorName } = req.body;

  if (!prompt || !imageUrl || !animationUrl || !creatorName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newStory = {
    id: stories.length + 1,
    prompt,
    imageUrl,
    animationUrl,
    creatorName,
    timestamp: new Date().toISOString(),
  };

  stories.push(newStory);
  res.json({ success: true, story: newStory });
});

// Get all stories
router.get('/api/stories', (req, res) => {
  res.json(stories);
});

// Clear all stories (optional dev route)
router.get('/api/clear', (req, res) => {
  stories = [];
  res.json({ success: true, message: 'All stories cleared' });
});

module.exports = router;
