const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Story = require('./models/storyModel');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb+srv://barkbacks_user:TYlerJoe_136015@cluster0.vi03iss.mongodb.net/barkbacks?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// GET all stories
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
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
    res.status(500).json({ error: 'Failed to submit story' });
  }
});

// EchoDepth
app.get('/api/echodepth/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const stories = await Story.find({ creatorId: { $regex: new RegExp(`^${creatorId}$`, 'i') } }).lean();
    const storyMap = new Map();
    stories.forEach(s => storyMap.set(s._id.toString(), s));
    const chains = [];

    const buildChain = (story) => {
      const chain = [];
      let current = story;
      while (current) {
        chain.unshift(current);
        current = current.remixOf ? storyMap.get(current.remixOf.toString()) : null;
      }
      return chain;
    };

    stories.forEach(s => {
      if (s.remixOf && storyMap.has(s.remixOf.toString())) {
        const chain = buildChain(s);
        if (chain.length >= 2) {
          chains.push({
            depth: chain.length,
            emotions: chain.map(s => s.emotion),
            storyIds: chain.map(s => s._id),
            texts: chain.map(s => s.text),
          });
        }
      }
    });

    res.json({ creatorId, chains });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate EchoDepth' });
  }
});

// Cascade
app.get('/api/cascade', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const storyMap = new Map();
    stories.forEach(s => storyMap.set(s._id.toString(), s));
    const chains = [];

    const buildChain = (story) => {
      const chain = [];
      let current = story;
      while (current) {
        chain.unshift(current);
        current = current.remixOf ? storyMap.get(current.remixOf.toString()) : null;
      }
      return chain;
    };

    stories.forEach(s => {
      if (s.remixOf && storyMap.has(s.remixOf.toString())) {
        const chain = buildChain(s);
        if (chain.length >= 2) {
          chains.push({
            depth: chain.length,
            emotions: chain.map(s => s.emotion),
            storyIds: chain.map(s => s._id),
            texts: chain.map(s => s.text),
            petNames: chain.map(s => s.petName || 'Unknown'),
          });
        }
      }
    });

    res.json({ chains });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Cascade' });
  }
});

// OrbitTrail
app.get('/api/orbittrail/:emotion', async (req, res) => {
  try {
    const emotion = req.params.emotion;
    const stories = await Story.find({ emotion: { $regex: new RegExp(`^${emotion}$`, 'i') } }).lean();
    const storyMap = new Map();
    stories.forEach(s => storyMap.set(s._id.toString(), s));

    const withDepth = stories.map(s => {
      let depth = 1;
      let current = s;
      while (current.remixOf && storyMap.has(current.remixOf.toString())) {
        depth++;
        current = storyMap.get(current.remixOf.toString());
      }
      return { ...s, depth };
    });

    res.json({ emotion, stories: withDepth });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate OrbitTrail' });
  }
});

// Nova
app.get('/api/nova', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const remixCounts = {};
    stories.forEach(s => {
      if (s.remixOf) {
        const parentId = s.remixOf.toString();
        remixCounts[parentId] = (remixCounts[parentId] || 0) + 1;
      }
    });

    const novaStories = Object.entries(remixCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([storyId, count]) => {
        const original = stories.find(s => s._id.toString() === storyId);
        return {
          remixCount: count,
          storyId,
          text: original?.text || '',
          emotion: original?.emotion || '',
          petName: original?.petName || 'Unknown',
          creatorId: original?.creatorId || 'Unknown',
        };
      });

    res.json({ novas: novaStories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Nova' });
  }
});

// Fusion
app.get('/api/fusion', async (req, res) => {
  try {
    const stories = await Story.find({ emotion: { $type: 'array' } }).lean();
    const storyMap = new Map();
    stories.forEach(s => storyMap.set(s._id.toString(), s));

    const withDepth = stories.map(s => {
      let depth = 1;
      let current = s;
      while (current.remixOf && storyMap.has(current.remixOf.toString())) {
        depth++;
        current = storyMap.get(current.remixOf.toString());
      }
      return { ...s, depth };
    });

    res.json({ fusions: withDepth });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Fusion' });
  }
});

// ChronoPulse
app.get('/api/chronopulse', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const timelineMap = new Map();

    stories.forEach(s => {
      const date = new Date(s.createdAt).toISOString().split('T')[0];
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      if (!timelineMap.has(date)) timelineMap.set(date, {});
      const emotionCounts = timelineMap.get(date);
      emotions.forEach(e => {
        const key = e.trim();
        emotionCounts[key] = (emotionCounts[key] || 0) + 1;
      });
    });

    const timeline = Array.from(timelineMap.entries())
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, emotionCounts]) => ({ date, emotionCounts }));

    res.json({ timeline });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate ChronoPulse' });
  }
});

// Aurora
app.get('/api/aurora', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const emotionCounts = {};

    stories.forEach(s => {
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      emotions.forEach(e => {
        const key = e.trim();
        emotionCounts[key] = (emotionCounts[key] || 0) + 1;
      });
    });

    const total = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
    const distribution = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percent: ((count / total) * 100).toFixed(1),
    }));

    res.json({ total, distribution });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Aurora' });
  }
});

// GET all unique pet names
app.get('/api/pets', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const petNames = [...new Set(stories.map(s => s.petName?.trim()).filter(Boolean))];
    res.json({ pets: petNames });
  } catch (err) {
    console.error('Error fetching pets:', err);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// Start server
// ConstellationVisualizer
app.get('/api/remix-constellation/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    // Step 1: Find all stories created by this creator
    const originals = await Story.find({ creatorId }).lean();
    const originalIds = originals.map(s => s._id.toString());

    // Step 2: Find all remixes of those stories
    const remixes = await Story.find({ remixOf: { $in: originalIds } }).lean();

    // Step 3: Count how many times each creator remixed this creator's stories
    const remixMap = {};
    remixes.forEach(r => {
      const target = r.creatorId;
      remixMap[target] = (remixMap[target] || 0) + 1;
    });

    const connections = Object.entries(remixMap).map(([target, remixCount]) => ({
      target,
      remixCount
    }));

    res.json({ creatorId, connections });
  } catch (err) {
    console.error('Error generating remix constellation:', err);
    res.status(500).json({ error: 'Failed to generate remix constellation' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

