/**
 * Script to fix duplicate 2dsphere indexes on halls collection
 * Run this once: node backend/scripts/fixIndexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hall-booking', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const hallsCollection = db.collection('halls');

    // Get all indexes
    const indexes = await hallsCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    // Find duplicate 2dsphere indexes
    const geoSpatialIndexes = indexes.filter(
      (idx) => Object.values(idx.key).some((val) => val === '2dsphere')
    );

    if (geoSpatialIndexes.length > 1) {
      console.log('\n⚠️  Found multiple 2dsphere indexes. Removing duplicates...');

      // Keep the one on 'location' field, remove others
      for (const idx of geoSpatialIndexes) {
        const indexKeys = Object.keys(idx.key);
        if (indexKeys.includes('location') && indexKeys.length === 1) {
          console.log(`✅ Keeping index: ${idx.name} on ${JSON.stringify(idx.key)}`);
        } else {
          console.log(`🗑️  Dropping duplicate index: ${idx.name} on ${JSON.stringify(idx.key)}`);
          await hallsCollection.dropIndex(idx.name);
        }
      }
    } else {
      console.log('\n✅ Only one 2dsphere index found. No action needed.');
    }

    // Verify final indexes
    const finalIndexes = await hallsCollection.indexes();
    console.log('\n📋 Final indexes:');
    finalIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${index.name}`);
    });

    console.log('\n✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();

