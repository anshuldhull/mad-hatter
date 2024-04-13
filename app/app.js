const express = require('express');
const app = express();
const port = 3000;
const { exec } = require('child_process');

app.get('/', (req, res) => {
  res.send('Hint: Check the commit messages for clues!');
});

app.get('/exploit', (req, res) => {
  const commitMessage = req.headers['x-commit-message'];
  exec(commitMessage, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing command: ${err}`);
      res.status(500).send('Error executing command');
    } else {
      res.send(`Command output: ${stdout}`);
    }
  });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
