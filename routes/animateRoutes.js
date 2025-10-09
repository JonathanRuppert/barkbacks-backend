const express = require('express');
const router = express.Router();

router.post('/api/animate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Placeholder animation URL for now
    const animationUrl = 'https://cdn.barkbacks.com/animations/fallback.mp4';

    // Future: plug in real animation logic here
    // e.g. call Runway API, Kaiber, or custom render engine

    res.json({ animation: animationUrl });
  } catch (error) {
    console.error('Animation generation error:', error.message);
    res.status(500).json({ error: 'Animation generation failed' });
  }
});

module.exports = router;
