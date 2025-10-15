const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/storyModel');
const app = express();

// ✅ Verified CORS middleware for Render compatibility
const allowedOrigins = ['https://barkbacks-dashboard.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Connection logging
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// 🧠 Badge logic
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

// 🔗 Route: Get emotion remix badges
app.get('/api/badges/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const stories = await Story.find({ creatorId }).lean();
    const badges = generateEmotionBadges(st