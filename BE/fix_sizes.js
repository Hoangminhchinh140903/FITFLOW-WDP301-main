require('mongoose').connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = require('mongoose').connection.db;
  const products = await db.collection('products').find({ category: { $in: ['Apparel', 'Shoes'] } }).toArray();
  for(const prod of products) {
    const defaultSize = prod.size || 'M';
    await db.collection('productinstances').updateMany(
      { productId: prod._id, $or: [{size: null}, {size: ''}, {size: {$exists: false}}] },
      { $set: { size: defaultSize } }
    );
  }
  console.log('Updated instances');
  process.exit(0);
});
