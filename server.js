const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/storyModel');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes

// GET all stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST a new story
app.post('/api/stories', async (req, res) => {
  try {
    const { creatorId, text, emotion, remixOf, petName } = req.body;

    if (!creatorId || !text || !emotion) {
      return res.status(400).json({ error: 'creatorId, text, and emotion are required' });
    }

    const newStory = new Story({ creatorId, text, emotion, remixOf, petName });
    await newStory.save();

    res.status(200).json({ message: 'Story submitted', story: newStory });
  } catch (err) {
    console.error('Error submitting story:', err);
    res.status(500).json({ error: 'Failed to submit story' });
  }
});

// GET EchoDepth remix chains (case-insensitive creatorId)
app.get('/api/echodepth/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const stories = await Story.find({
      creatorId: { $regex: new RegExp(`^${creatorId}$`, 'i') }
    }).lean();

    const chains = [];

    const buildChain = (story, all) => {
      const chain = [];
      let current = story;
      while (current) {
        chain.unshift(current);
        current = all.find(s => s._id.toString() === current.remixOf);
      }
      return chain;
    };

    stories.forEach((s) => {
      const chain = buildChain(s, stories);
      if (chain.length >= 2) {
        chains.push({
          depth: chain.length,
          emotions: chain.map(s => s.emotion),
          storyIds: chain.map(s => s._id),
          texts: chain.map(s => s.text),
        });
      }
    });

    res.json({ creatorId, chains });
  } catch (err) {
    console.error('Error generating EchoDepth:', err);
    res.status(500).json({ error: 'Failed to generate EchoDepth' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
