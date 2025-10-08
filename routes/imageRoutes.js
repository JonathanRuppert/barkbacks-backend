const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/api/image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });

    const imageUrl = response.data[0].url;
    res.json({ imageUrl }); // ← This is the key line
  } catch (error) {
    console.error('Image generation error:', error.message);
    res.status(500).json({ error: 'Image generation failed' });
  }
});

module.exports = router;