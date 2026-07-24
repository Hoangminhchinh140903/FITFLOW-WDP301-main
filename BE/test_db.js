const mongoose = require('mongoose');
const Blog = require('./model/Blog.model');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
  const blog = await Blog.findOne({ status: 'published' });
  console.log('Published blog:', blog);
  process.exit(0);
});
