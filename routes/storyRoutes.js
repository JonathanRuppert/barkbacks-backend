const express = require('express');
const router = express.Router();

router.get('/api/stories', (req, res) => {
  res.json([
    {
      prompt: 'A golden retriever puppy discovers a glowing portal...',
      imageUrl: 'https://example.com/image.jpg',
      animationUrl: 'https://example.com/animation.mp4',
      creatorName: 'Jonathan',
    },
  ]);
});

module.exports = router;
