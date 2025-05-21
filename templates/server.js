// server.js
const express = require('express');
const app = express();
const fn = require('./functions');

app.get('/', (req, res) => {
  fn(req.query)((result) => {
    res.json(result);
  }, (err) => {
    res.status(500).send(err);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
