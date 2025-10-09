const express = require('express');
const router = express.Router();

let storyFeed = [];

function suggestTags(prompt) {
  const tags = [];

  if (/memory|loyalty|echo|shared|nostalgic|forgotten|childhood|crystal/i.test(prompt)) {
    tags.push('nostalgic');
  }
  if (/inventor|machine|mapping|bard|cartographer|historian/i.test(prompt)) {
    tags.push('imaginative');
  }
  if (/astronaut|nebula|moonlit|cosmic|starlit|galaxy|orbit/i.test(prompt)) {
    tags.push('epic');
  }
  if (/toys|oak|dreams|verse|spark|quilt|laughter/i.test(prompt)) {
    tags.push('whimsical');
  }

  return tags.length ? tags : ['emotional'];
}

router.post('/api/submit', async (req, res) => {
  const { prompt, image, animation } = req.body;

  if (!prompt || !image || !animation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const tags = suggestTags(prompt);

    const story = {
      id: 'barkbacks_' + Date.now(),
      prompt,
      image,
      animation,
      tags,
    };

    storyFeed.unshift(story);
    res.json({ success: true, id: story.id });
  } catch (error) {
    console.error('Submission error:', error.message);
    res.status(500).json({ error: 'Submission failed' });
  }
});

router.get('/api/stories', (req, res) => {
  res.json(storyFeed);
});

module.exports = router;
