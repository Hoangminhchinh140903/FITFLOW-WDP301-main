const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const db = mongoose.connection.db;
  const p = await db.collection('products').find({name: 'Yonex Dry T-Shirt 10506'}).toArray();
  console.log(JSON.stringify(p.map(x => ({name: x.name, size: x.size})), null, 2));
  process.exit(0);
});
