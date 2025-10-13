// server.js — BarkBacks backend with emotion remix badge logic

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/storyModel');
const app = express();

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection using MONGODB_URI
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🧠 Badge logic — remix emotion patterns
const generateEmotionBadges = (stories) => {
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
    if (chain.length >= 2) chains.push(chain);
  });

  const badges = new Set();

  chains.forEach((chain) => {
    const emotions = chain.map(s => s.emotion);
    const unique = [...new Set(emotions)];

    if (emotions.every(e => e === 'Joy') && emotions.length >= 3) {
      badges.add('🏅 Joy Cascade');
    }

    if (emotions[0] === 'Gratitude' && emotions.length >= 3) {
      badges.add('🏅 Gratitude Spiral');
    }

    if (emotions.includes('Wonder') && emotions[0] !== 'Wonder' && emotions[emotions.length - 1] === 'Wonder') {
      badges.add('🏅 Wonder Loop');
    }

    if (emotions[0] === 'Hope' && unique.length >= 3) {
      badges.add('🏅 Hope Divergence');
    }

    const nostalgiaCount = emotions.filter(e => e === 'Nostalgia').length;
    if (nostalgiaCount >= 2) {
      badges.add('🏅 Nostalgia Echo');
    }
  });

  return Array.from(badges);
};

// 🔗 Route: Get emotion remix badges for a creator
app.get('/api/badges/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const stories = await Story.find({ creatorId });
    const badges = generateEmotionBadges(stories);
    res.json({ creatorId, badges });
  } catch (err) {
    console.error('Error generating badges:', err);
    res.status(500).json({ error: 'Failed to generate badges' });
  }
});

// 🔗 Route: Get all stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find({});
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// ✅ Health check
app.get('/', (req, res) => {
  res.send('BarkBacks backend is live');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
