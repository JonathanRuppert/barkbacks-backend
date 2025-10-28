// 1. Requires
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const Story = require('./models/storyModel');

// 2. App setup
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());

// 3. WebSocket setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('🔌 WebSocket client connected');
});

// 4. MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// 5. Routes

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

    broadcastEmotion({
      type: 'new_story',
      emotion: newStory.emotion,
      creatorId: newStory.creatorId,
      timestamp: newStory.createdAt,
      petName: newStory.petName || 'Unknown',
    });

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

// Emotion Remix Tracker
app.get('/api/emotion-remix/:emotion', async (req, res) => {
  try {
    const emotion = req.params.emotion.trim().toLowerCase();
    const stories = await Story.find().lean();

    const originals = stories.filter(s => {
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      return emotions.some(e => e.trim().toLowerCase() === emotion);
    });

    const originalIds = originals.map(s => s._id.toString());

    const remixes = stories.filter(s => s.remixOf && originalIds.includes(s.remixOf.toString()));

    const remixMap = {};
    remixes.forEach(r => {
      const creator = r.creatorId || 'Unknown';
      remixMap[creator] = (remixMap[creator] || 0) + 1;
    });

    const remixStats = Object.entries(remixMap).map(([creatorId, count]) => ({
      creatorId,
      remixCount: count
    }));

    res.json({
      emotion,
      originalCount: originals.length,
      remixCount: remixes.length,
      remixers: remixStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Emotion Remix Tracker' });
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

// Remix Constellaton
app.get('/api/remix-constellation/:creatorId', async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const originals = await Story.find({ creatorId }).lean();
    const originalIds = originals.map(s => s._id.toString());

    const remixes = await Story.find({ remixOf: { $in: originalIds } }).lean();

    const remixMap = {};
    remixes.forEach(r => {
      const target = r.creatorId;
      if (target) {
        remixMap[target] = (remixMap[target] || 0) + 1;
      }
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

// Creator Pulse
app.get('/api/creator-pulse', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const pulseMap = {};

    stories.forEach(s => {
      const creator = s.creatorId || 'Unknown';
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      if (!pulseMap[creator]) {
        pulseMap[creator] = { count: 0, emotions: {} };
      }
      pulseMap[creator].count += 1;
      emotions.forEach(e => {
        const key = e.trim();
        pulseMap[creator].emotions[key] = (pulseMap[creator].emotions[key] || 0) + 1;
      });
    });

    const pulse = Object.entries(pulseMap).map(([creatorId, data]) => ({
      creatorId,
      totalStories: data.count,
      emotionDistribution: data.emotions
    }));

    res.json({ pulse });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Creator Pulse' });
  }
});

// Creator Marketplace Scaffold
app.get('/api/creators', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const creatorMap = {};

    stories.forEach(s => {
      const creator = s.creatorId || 'Unknown';
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      const pet = s.petName?.trim() || 'Unknown';

      if (!creatorMap[creator]) {
        creatorMap[creator] = { count: 0, emotions: {}, pets: {} };
      }

      creatorMap[creator].count += 1;
      emotions.forEach(e => {
        const key = e.trim();
        creatorMap[creator].emotions[key] = (creatorMap[creator].emotions[key] || 0) + 1;
      });
      creatorMap[creator].pets[pet] = (creatorMap[creator].pets[pet] || 0) + 1;
    });

    const creators = Object.entries(creatorMap).map(([creatorId, data]) => ({
      creatorId,
      totalStories: data.count,
      emotionSpread: data.emotions,
      petSpread: data.pets
    }));

    res.json({ creators });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate creator marketplace scaffold' });
  }
});

// Modules
app.get('/api/modules', async (req, res) => {
  try {
    const stories = await Story.find().lean();

    const modules = [
      { name: 'ChronoPulse', emotionFocus: 'temporal trends' },
      { name: 'Aurora', emotionFocus: 'distribution overview' },
      { name: 'Fusion', emotionFocus: 'multi-emotion stories' },
      { name: 'Nova', emotionFocus: 'top remixed originals' },
      { name: 'EchoDepth', emotionFocus: 'remix depth chains' },
      { name: 'Cascade', emotionFocus: 'all remix chains' },
      { name: 'OrbitTrail', emotionFocus: 'emotion-specific remix depth' },
      { name: 'ConstellationVisualizer', emotionFocus: 'creator remix network' },
      { name: 'PulseSync', emotionFocus: 'creator emotion pulse' },
      { name: 'Remix Constellation', emotionFocus: 'creator remix spread' },
      { name: 'Pet Arcs', emotionFocus: 'emotional arcs per pet' },
      { name: 'Emotion Remix Tracker', emotionFocus: 'remix stats per emotion' },
      { name: 'Mobile Sync', emotionFocus: 'lightweight mobile payload' },
      { name: 'Voice Cue', emotionFocus: 'narration-ready summaries' }
    ];

    const usageMap = {};

    stories.forEach(s => {
      const creator = s.creatorId || 'Unknown';
      modules.forEach(m => {
        if (!usageMap[m.name]) usageMap[m.name] = {};
        usageMap[m.name][creator] = (usageMap[m.name][creator] || 0) + 1;
      });
    });

    const enrichedModules = modules.map(m => ({
      ...m,
      creatorUsage: usageMap[m.name]
    }));

    res.json({ modules: enrichedModules });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate module registry' });
  }
});


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
      if (target) {
        remixMap[target] = (remixMap[target] || 0) + 1;
      }
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

// Multi-Pet Support
app.get('/api/pet-arcs', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: 1 }).lean();
    const petMap = {};

    stories.forEach(s => {
      const pet = s.petName?.trim() || 'Unknown';
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      if (!petMap[pet]) petMap[pet] = [];
      petMap[pet].push({
        storyId: s._id,
        creatorId: s.creatorId,
        text: s.text,
        emotions,
        timestamp: s.createdAt
      });
    });

    const arcs = Object.entries(petMap).map(([petName, entries]) => ({
      petName,
      totalStories: entries.length,
      emotionalArc: entries.map(e => ({
        timestamp: e.timestamp,
        emotions: e.emotions,
        creatorId: e.creatorId,
        storyId: e.storyId
      }))
    }));

    res.json({ arcs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate pet arcs' });
  }
});

//Remix-attribution
app.get('/api/remix-attribution', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const remixMap = {};

    stories.forEach(s => {
      const originalId = s.originalStoryId;
      const remixId = s._id.toString();
      const creator = s.creatorId || 'Unknown';

      if (originalId) {
        if (!remixMap[originalId]) remixMap[originalId] = [];
        remixMap[originalId].push({ remixId, creator });
      }
    });

    const attribution = Object.entries(remixMap).map(([originalId, remixes]) => ({
      originalId,
      remixCount: remixes.length,
      remixedBy: remixes.map(r => r.creator)
    }));

    res.json({ attribution });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate remix attribution' });
  }
});

//remix-attribution
app.get('/api/pet-arcs', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: 1 }).lean(); // oldest to newest
    const petMap = {};

    stories.forEach(s => {
      const pet = s.petName?.trim() || 'Unknown';
      const emotion = Array.isArray(s.emotion) ? s.emotion.join(', ') : s.emotion;
      const timestamp = s.createdAt;

      if (!petMap[pet]) petMap[pet] = [];
      petMap[pet].push({ emotion, timestamp });
    });

    const arcs = Object.entries(petMap).map(([petName, timeline]) => ({
      petName,
      emotionalTimeline: timeline
    }));

    res.json({ arcs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate pet emotional arcs' });
  }
});

//pet-arcs
app.get('/api/emotion-diversity', async (req, res) => {
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
    const diversity = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: ((count / total) * 100).toFixed(2)
    }));

    res.json({ diversity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate emotion diversity heatmap' });
  }
});

//emotion-diversity
app.get('/api/emotion-remix-tracker', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const remixCounts = {};

    stories.forEach(s => {
      if (s.originalStoryId) {
        const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
        emotions.forEach(e => {
          const key = e.trim();
          remixCounts[key] = (remixCounts[key] || 0) + 1;
        });
      }
    });

    const totalRemixes = Object.values(remixCounts).reduce((sum, count) => sum + count, 0);
    const remixStats = Object.entries(remixCounts).map(([emotion, count]) => ({
      emotion,
      remixCount: count,
      remixPercentage: ((count / totalRemixes) * 100).toFixed(2)
    }));

    res.json({ remixStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate emotion remix tracker' });
  }
});

//emotion-remix-tracker
app.get('/api/emotion-depth-analyzer', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const depthMap = {};

    stories.forEach(s => {
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      const depth = s.remixDepth || 0;

      emotions.forEach(e => {
        const key = e.trim();
        if (!depthMap[key]) depthMap[key] = [];
        depthMap[key].push(depth);
      });
    });

    const depthStats = Object.entries(depthMap).map(([emotion, depths]) => {
      const total = depths.length;
      const avgDepth = (depths.reduce((sum, d) => sum + d, 0) / total).toFixed(2);
      const maxDepth = Math.max(...depths);
      return { emotion, total, avgDepth, maxDepth };
    });

    res.json({ depthStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to analyze emotion depth' });
  }
});

//emotion-sync
app.get('/api/emotion-sync', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).limit(50).lean();
    const emotionStream = stories.map(s => ({
      id: s._id,
      petName: s.petName,
      emotion: s.emotion,
      timestamp: s.createdAt
    }));

    res.json({ emotionStream });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync emotion stream' });
  }
});

//emotion-cascade
app.get('/api/emotion-cascade', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const cascadeMap = {};

    stories.forEach(s => {
      if (s.originalStoryId) {
        const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
        emotions.forEach(e => {
          const key = e.trim();
          if (!cascadeMap[key]) cascadeMap[key] = { count: 0, chain: [] };
          cascadeMap[key].count += 1;
          cascadeMap[key].chain.push({
            id: s._id,
            depth: s.remixDepth || 0,
            petName: s.petName,
            timestamp: s.createdAt
          });
        });
      }
    });

    res.json({ cascadeMap });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate emotion cascade' });
  }
});

//creator-impact
app.get('/api/creator-impact', async (req, res) => {
  try {
    const stories = await Story.find().lean();
    const impactMap = {};

    stories.forEach(s => {
      const creator = s.creatorId || 'unknown';
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      const depth = s.remixDepth || 0;

      if (!impactMap[creator]) {
        impactMap[creator] = { total: 0, emotions: {}, depthSum: 0 };
      }

      impactMap[creator].total += 1;
      impactMap[creator].depthSum += depth;

      emotions.forEach(e => {
        const key = e.trim();
        impactMap[creator].emotions[key] = (impactMap[creator].emotions[key] || 0) + 1;
      });
    });

    const impactStats = Object.entries(impactMap).map(([creatorId, data]) => {
      const avgDepth = (data.depthSum / data.total).toFixed(2);
      return {
        creatorId,
        totalStories: data.total,
        avgRemixDepth: avgDepth,
        emotionSpread: data.emotions
      };
    });

    res.json({ impactStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate creator impact' });
  }
});


// Mobile & Voice Sync
app.get('/api/mobile-sync', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).limit(25).lean();
    const emotionCounts = {};
    const petCounts = {};

    stories.forEach(s => {
      const emotions = Array.isArray(s.emotion) ? s.emotion : [s.emotion];
      emotions.forEach(e => {
        const key = e.trim();
        emotionCounts[key] = (emotionCounts[key] || 0) + 1;
      });

      const pet = s.petName?.trim() || 'Unknown';
      petCounts[pet] = (petCounts[pet] || 0) + 1;
    });

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    const topPets = Object.entries(petCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([petName, count]) => ({ petName, count }));

    res.json({
      recentStories: stories.map(s => ({
        storyId: s._id,
        text: s.text,
        emotion: s.emotion,
        petName: s.petName,
        creatorId: s.creatorId,
        timestamp: s.createdAt
      })),
      topEmotions,
      topPets
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate mobile sync payload' });
  }
});

// Voice-cue
app.get('/api/voice-cue', async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 }).limit(10).lean();

    const cues = stories.map(s => {
      const emotion = Array.isArray(s.emotion) ? s.emotion.join(', ') : s.emotion;
      const pet = s.petName?.trim() || 'a mystery pet';
      const time = new Date(s.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
      return `${pet} felt ${emotion} around ${time}.`;
    });

    res.json({ voiceCues: cues });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate voice cues' });
  }
});

// 6. WebSocket broadcast helper

const broadcastEmotion = (emotionPayload) => {
  const data = JSON.stringify(emotionPayload);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// 7. Start Server

server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running on port ${PORT}`);
});
