const express = require('express');
const router = express.Router();

router.post('/api/animate', (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  // Placeholder animation URL for testing
  res.json({ animationUrl: 'https://example.com/animation.mp4' });
});

module.exports = router;