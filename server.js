// server.js — BarkBacks backend API

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/Story');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

function getSeason(date) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

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

app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error('Error fetching stories:', err);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
