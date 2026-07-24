const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer();

app.post('/test', upload.array('images', 10), (req, res) => {
  res.json({
    body: req.body,
    files: req.files ? req.files.map(f => f.originalname) : [],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, code: err.code, field: err.field });
});

const server = app.listen(3000, '127.0.0.1', async () => {
  try {
    const form = new FormData();
    form.append('images', JSON.stringify(['url1', 'url2']));
    form.append('images', new Blob(['test']), 'test.jpg');

    const res = await fetch('http://127.0.0.1:3000/test', {
      method: 'POST',
      body: form
    });
    const text = await res.text();
    console.log('Response status:', res.status);
    console.log('Response body:', text);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    server.close();
  }
});
