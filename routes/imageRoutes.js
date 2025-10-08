const express = require('express');
const router = express.Router();

router.post('/api/image', (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Placeholder image URL for testing
  res.json({ imageUrl: 'https://placekitten.com/512/512' });
});

module.exports = router;