const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  
  const result = await db.collection('productinstances').updateMany(
    { lifecycleStatus: 'Available' },
    { $set: { isPurchasable: true, isRentable: true } }
  );
  
  console.log(`Updated ${result.modifiedCount} instances.`);
  process.exit(0);
});
