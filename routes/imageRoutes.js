// Confirmed POST route for /api/image


const express = require('express');
const router = express.Router();

router.post('/api/image', async (req, res) => {
   const { prompt } = req.body;

  console.log('Received /api/image payload:', req.body);

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Placeholder image URL — replace with real generation logic later
    const imageUrl = 'https://cdn.barkbacks.com/images/fallback.jpg';
    res.json({ image: imageUrl });
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

module.exports = router;
