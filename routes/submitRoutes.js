const express = require('express');
const router = express.Router();

let stories = []; // Temporary in-memory storage

router.post('/api/submit', (req, res) => {
  const { prompt, imageUrl, animationUrl, creatorName } = req.body;

  if (!prompt || !imageUrl || !animationUrl || !creatorName) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newStory = { prompt, imageUrl, animationUrl, creatorName };
  stories.push(newStory);

  res.json({ success: true, story: newStory });
});

router.get('/api/stories', (req, res) => {
  res.json(stories);
});

module.exports = router;
