const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load env variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow_dev';
const dataDir = path.join(__dirname, '../../data');

const fileToCollection = {
  'users.json': 'users',
  'products.json': 'products',
  'productinstances.json': 'productinstances',
  'categories.json': 'categories',
  'vouchers.json': 'vouchers',
  'banners.json': 'banners',
  'blogs.json': 'blogs',
  'alerts.json': 'alerts',
  'collaterals.json': 'collaterals',
  'deposits.json': 'deposits',
  'payments.json': 'payments',
  'pricingrules.json': 'pricingrules',
  'rentorders.json': 'rentorders',
  'rentorderitems.json': 'rentorderitems',
  'returnrecords.json': 'returnrecords',
  'saleorders.json': 'saleorders',
  'saleorderitems.json': 'saleorderitems',
  'sizeguides.json': 'sizeguides',
  'fittingbookings.json': 'bookings'
};

// Custom transforms for files that need field adjustments to match active schemas
const transforms = { skipping...`);
        continue;
      }

      console.log(`\n📄 Processing file: ${filename} -> Collection: ${collectionName}`);
      const rawContent = fs.readFileSync(filePath, 'utf8').trim();
      
      let rawJson;
      try {
        rawJson = JSON.parse(rawContent);
      } catch (err) {
        console.error(`❌ Failed to parse JSON file ${filename}:`, err.message);
        continue;
      }

      let dataArray = Array.isArray(rawJson) ? rawJson : [rawJson];
      if (dataArray.length === 0) {
        console.log(`ℹ️ No documents to import for ${filename}, skipping...`);
        continue;
      }

      let parsedDocs = parseMongoJSON(dataArray);

      // Apply transformations if defined
      if (transforms[filename]) {
        console.log(`✨ Applying transform mapping for ${filename}...`);
        parsedDocs = transforms[filename](parsedDocs);
      }

      // Clear the target collection
      console.log(`🧹 Clearing collection: ${collectionName}`);
      await db.collection(collectionName).deleteMany({});

      // Insert new documents
      console.log(`📥 Inserting ${parsedDocs.length} documents into ${collectionName}`);
      const result = await db.collection(collectionName).insertMany(parsedDocs);
      console.log(`✅ Successfully imported ${result.insertedCount} documents.`);
    }

    console.log('\n🎉 Database seeding / import completed successfully.');
  } catch (error) {
    console.error('❌ Data import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runImport();
