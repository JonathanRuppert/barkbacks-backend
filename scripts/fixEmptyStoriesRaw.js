require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(); // uses default from URI
    const collection = db.collection('stories');

    const result = await collection.updateMany(
      { $or: [{ text: { $exists: false } }, { text: '' }] },
      [
        {
          $set: {
            text: {
              $concat: ['A moment of ', { $toLower: '$emotion' }, ' shared by a pet.']
            }
          }
        }
      ]
    );

    console.log(`✅ Patched ${result.modifiedCount} stories`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
  }
}

run();
