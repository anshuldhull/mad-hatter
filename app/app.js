const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hint: Check the commit messages for clues!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
