const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/nyaya-saathi';

async function dropGoogleIdIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MongoURI);
    console.log('Connected!');

    const collection = mongoose.connection.collection('users');
    
    console.log('Attempting to drop index googleId_1...');
    try {
      await collection.dropIndex('googleId_1');
      console.log('✅ Successfully dropped googleId_1 index!');
    } catch (err) {
      if (err.codeName === 'IndexNotFound' || err.message.includes('index not found')) {
        console.log('ℹ️ Index googleId_1 not found, nothing to drop.');
      } else {
        throw err;
      }
    }

    console.log('Done! You can now close this script.');
  } catch (error) {
    console.error('❌ Error dropping index:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

dropGoogleIdIndex();
