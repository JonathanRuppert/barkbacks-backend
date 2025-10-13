// server.js — BarkBacks backend API

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/Story');

const app = express();
const PORT = process.env.PORT || 5000;

// 🌐 Middleware
app.use(cors());
app.use(express.json());

// 🔗 MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// 🍂 Helper: Determine season from date
function getSeason(date) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

// 📝 Create a new BarkBack
app.post('/api/create-story', async (req, res) => {
  const { petName, emotion, storyText, creatorId } = req.body;
  const season = getSeason(new Date());

  try {
    const newStory = new Story({ petName, emotion, storyText, season, creatorId });
    await newStory.save();
    res.status(201).json({ message: 'Story saved successfully!' });
  } catch (err) {
    console.error('Error saving story:', err);
    res.status(500).json({ error: 'Failed to save story' });
  }
});

// 📚 Get all BarkBacks
app.get('/api/stories', async (req, res) => {
  try {
    console.log('Fetching stories...');
    const stories = await Story.find().sort({ createdAt: -1 });
    console.log('Stories fetched:', stories.length);
    res.json(stories);
  } catch (err) {
    console.error('Error in /api/stories:', err.message);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// 📊 Get creator stats
app.get('/api/stats/:creatorId', async (req, res) => {
  const { creatorId } = req.params;

  try {
    const stories = await Story.find({ creatorId });

    const total = stories.length;
    const emotions = [...new Set(stories.map(s => s.emotion))];
    const seasons = [...new Set(stories.map(s => s.season))];

    res.json({
      total,
      emotions,
      seasons,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
