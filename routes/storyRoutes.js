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

function getCampaignTags(timestamp) {
  const tags = [];
  const date = new Date(timestamp);

  const isFall = date.getMonth() >= 9 && date.getMonth() <= 11; // Oct–Dec
  const isLaunchWeek = date.getFullYear() === 2025 && date.getMonth() === 9 && date.getDate() <= 15;

  if (isFall) tags.push('Fall 2025');
  if (isLaunchWeek) tags.push('Launch Week');

  return tags;
}

router.post('/api/submit', async (req, res) => {
  const { prompt, image, animation } = req.body;

  if (!prompt || !image || !animation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const timestamp = Date.now();
    const tags = [...suggestTags(prompt), ...getCampaignTags(timestamp)];

    const remixMatch = prompt.match(/remixed from (\w+)/i);
    const remixedFrom = remixMatch ? remixMatch[1] : null;

    const story = {
      id: 'barkbacks_' + timestamp,
      prompt,
      image,
      animation,
      tags,
      remixedFrom,
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

router.get('/api/profile/:creatorId', (req, res) => {
  const { creatorId } = req.params;

  const profileStories = storyFeed.filter((story) => {
    return story.remixedFrom === creatorId || story.id === creatorId;
  });

  res.json({
    creatorId,
    stories: profileStories,
  });
});


module.exports = router;
