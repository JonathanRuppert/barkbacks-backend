const express = require('express');
const router = express.Router();

router.post('/api/image', async (req, res) => {
  const { prompt } = req.body;

  console.log('Received /api/image payload:', req.body);

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Temporary working fallback image
    const imageUrl = 'https://placekitten.com/800/600';
    res.json({ image: imageUrl });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

module.exports = router;
