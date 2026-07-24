const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({ category: { $in: ['Apparel', 'Shoes'] } }).toArray();
  const withPricing = products.filter(x => Object.keys(x.variantRentPrices || {}).length > 0);
  console.log('Products with variantRentPrices:', withPricing.length);
  if (withPricing.length > 0) {
    console.log(Object.keys(withPricing[0].variantRentPrices));
  }
  process.exit(0);
});
