const express = require('express');
const router = express.Router();

router.post('/api/submit', async (req, res) => {
  const { prompt, image, animation } = req.body;

  console.log('Received /api/submit payload:', req.body);

  if (!prompt || !image || !animation) {
    console.warn('Missing fields:', { prompt, image, animation });
    return res.status(400).json({ error: 'Missing required fields: prompt, image, or animation' });
  }

  try {
    console.log('New submission received:', { prompt, image, animation });
    res.status(200).json({ message: 'Submission received successfully' });
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;
