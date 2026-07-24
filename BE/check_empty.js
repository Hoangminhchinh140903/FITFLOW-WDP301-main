const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').find().toArray();
  const instances = await db.collection('productinstances').find({ lifecycleStatus: 'Available', isPurchasable: true }).toArray();
  
  const pWithInst = new Set(instances.map(i => i.productId.toString()));
  const emptyProducts = products.filter(p => !pWithInst.has(p._id.toString()));
  
  console.log('Products without Available/Purchasable instances:', emptyProducts.length);
  if (emptyProducts.length > 0) {
    console.log('e.g.', emptyProducts.slice(0, 5).map(p => p.name));
  }
  process.exit(0);
});
