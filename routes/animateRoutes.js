const express = require('express');
const router = express.Router();

router.post('/api/animate', async (req, res) => {
  const { prompt } = req.body;

  console.log('Received /api/animate payload:', req.body);

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const animationUrl = 'https://cdn.barkbacks.com/animations/fallback.mp4';
    res.json({ animation: animationUrl });
  } catch (error) {
    console.error('Animation generation error:', error.message);
    res.status(500).json({ error: 'Animation generation failed' });
  }
});

module.exports = router;
