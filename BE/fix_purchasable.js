const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  
  // Find all Apparel and Shoes product IDs
  const products = await db.collection('products').find({ category: { $in: ['Apparel', 'Shoes'] } }).toArray();
  const productIds = products.map(p => p._id);
  
  const result = await db.collection('productinstances').updateMany(
    { productId: { $in: productIds } },
    { $set: { isPurchasable: true } }
  );
  
  console.log(`Updated ${result.modifiedCount} instances to be purchasable.`);
  process.exit(0);
});
