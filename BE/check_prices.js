const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({
    $or: [
      { baseSalePrice: { $lte: 0 } },
      { baseSalePrice: null },
      { baseSalePrice: { $exists: false } }
    ]
  }).toArray();
  
  console.log('Products without sale price:', products.length);
  if (products.length > 0) {
    console.log(products.map(p => ({ id: p._id, name: p.name, sale: p.baseSalePrice, rent: p.baseRentPrice, category: p.category })));
  }
  process.exit(0);
});
