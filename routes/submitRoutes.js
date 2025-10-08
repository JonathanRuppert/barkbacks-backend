const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const storiesPath = path.join(__dirname, '..', 'stories.json');

router.post('/submit-story', (req, res) => {
  const { image_url, video_url, metadata } = req.body;

  let parsedMeta = {};
  try {
    parsedMeta = JSON.parse(metadata);
  } catch (err) {
    return res.status(400).json({ status: 'error', message: 'Invalid metadata format. Must be JSON.' });
  }

  const newStory = {
    title: parsedMeta.title || 'Untitled',
    tags: parsedMeta.tags || '',
    creator_id: parsedMeta.creator_id || 'anonymous',
    image_url,
    video_url
  };

  fs.readFile(storiesPath, 'utf8', (err, data) => {
    const stories = err ? [] : JSON.parse(data || '[]');
    stories.push(newStory);

    fs.writeFile(storiesPath, JSON.stringify(stories, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'Failed to save story.' });
      }
      res.json({ status: 'success', story_id: stories.length });
    });
  });
});

module.exports = router;
