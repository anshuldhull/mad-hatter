const express = require('express');
const app = express();
const port = 3000;
const { exec } = require('child_process');
const AWS = require('aws-sdk');

// Configure the AWS SDK
AWS.config.update({
  region: 'us-east-2', // Replace with your desired AWS region
});

const secretsManager = new AWS.SecretsManager();

async function generateOneTimeUrl(flag) {
  // Store the flag in AWS Secrets Manager
  const secretParams = {
    Name: 'ctf-flag',
    SecretString: flag,
  };

  return new Promise((resolve, reject) => {
    secretsManager.createSecret(secretParams, (err, data) => {
      if (err) {
        console.error('Error storing flag in Secrets Manager:', err);
        reject(err);
      } else {
        // Generate a one-time use URL
        const oneTimeUrl = `http://${process.env.APP_HOST}/retrieve-flag?id=${data.VersionId}`;
        resolve(oneTimeUrl);
      }
    });
  });
}

app.get('/', (req, res) => {
  res.send('Hint: Check the commit messages for clues!');
});

app.get('/exploit', async (req, res) => {
  const commitMessage = req.headers['x-commit-message'];
  exec(commitMessage, async (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing command: ${err}`);
      res.status(500).send('Error executing command');
    } else {
      try {
        const oneTimeUrl = await generateOneTimeUrl('FLAG-{32CharactersA-Za-z0-9}');
        res.send(`One-time URL to retrieve the flag: ${oneTimeUrl}`);
      } catch (error) {
        console.error('Error generating one-time URL:', error);
        res.status(500).send('Error generating one-time URL');
      }
    }
  });
});

app.get('/retrieve-flag', async (req, res) => {
  const secretId = req.query.id;
  try {
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
    res.send(`Flag: ${secretValue.SecretString}`);
  } catch (error) {
    console.error('Error retrieving flag:', error);
    res.status(500).send('Error retrieving flag');
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
