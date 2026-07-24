const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({ category: { $in: ['Apparel', 'Shoes'] } }).toArray();

  for (const prod of products) {
    const isApparel = prod.category === 'Apparel';
    const sizes = isApparel ? ['S', 'M', 'L', 'XL', 'XXL'] : ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

    for (const size of sizes) {
      const existing = await db.collection('productinstances').findOne({ productId: prod._id, size: size });
      if (!existing) {
        // Find any existing instance to copy base fields from, or create a new one
        const baseInstance = await db.collection('productinstances').findOne({ productId: prod._id });
        if (baseInstance) {
          const newInst = { ...baseInstance };
          delete newInst._id;
          newInst.size = size;
          newInst.conditionScore = 100;
          newInst.conditionLevel = 'New';
          await db.collection('productinstances').insertOne(newInst);
        } else {
          await db.collection('productinstances').insertOne({
            productId: prod._id,
            size: size,
            conditionScore: 100,
            conditionLevel: 'New',
            lifecycleStatus: 'Available',
            currentRentPrice: prod.baseRentPrice || 0,
            currentSalePrice: prod.baseSalePrice || 0,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
    
    // Also set hasSizes: true in product
    await db.collection('products').updateOne({ _id: prod._id }, { $set: { hasSizes: true } });
  }

  console.log('Created missing sizes');
  process.exit(0);
});
