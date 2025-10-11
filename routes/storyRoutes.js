const express = require('express');
const router = express.Router();
const Story = require('../models/Story');

// GET all stories
router.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST new story
router.post('/api/submit', async (req, res) => {
  try {
    const { prompt, image, animation } = req.body;
    const newStory = new Story({ prompt, image, animation });
    await newStory.save();
    console.log('✅ Story saved:', newStory);
    res.status(201).json(newStory);
  } catch (err) {
    console.error('❌ Submit error:', err);
    res.status(500).json({ error: 'Failed to save story' });
  }
});

// Test DB connection
router.get('/api/test-db', async (req, res) => {
  try {
    const count = await Story.countDocuments();
    res.json({ message: 'DB connected', count });
  } catch (err) {
    console.error('❌ Test DB error:', err);
    res.status(500).json({ error: 'DB test failed' });
  }
});

module.exports = router;
