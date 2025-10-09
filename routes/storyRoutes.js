const express = require('express');
const router = express.Router();

let storyFeed = [];

router.post('/api/submit', async (req, res) => {
  const { prompt, image, animation } = req.body;

  if (!prompt || !image || !animation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const story = {
      id: 'barkbacks_' + Date.now(),
      prompt,
      image,
      animation,
      tags: ['magical', 'emotional'], // placeholder tags
    };

    storyFeed.unshift(story); // add to top
    res.json({ success: true, id: story.id });
  } catch (error) {
    res.status(500).json({ error: 'Submission failed' });
  }
});

router.get('/api/stories', (req, res) => {
  res.json(storyFeed);
});

module.exports = router;
