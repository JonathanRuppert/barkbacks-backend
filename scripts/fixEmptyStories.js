require('dotenv').config();
const mongoose = require('mongoose');
const Story = require('../models/storyModel');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB');

  try {
    const stories = await Story.find({});
    const updates = stories.map((story) => {
      if (!story.text || story.text.trim() === '') {
        return Story.updateOne(
          { _id: story._id },
          { $set: { text: `A moment of ${story.emotion.toLowerCase()} shared by a pet.` } },
          { runValidators: false }
        );
      }
    });

    await Promise.all(updates);
    console.log('✅ Empty stories patched');
  } catch (err) {
    console.error('❌ Error updating stories:', err);
  } finally {
    mongoose.disconnect();
  }
});
