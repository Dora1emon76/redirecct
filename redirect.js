const { exec } = require('child_process');
const express = require('express');
const https = require('https');

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/forward', async (req, res) => {
  try {
    const { url } = req.query;
    const data = req.body;

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const request = https.request(url, options, (response) => {
      let responseData = '';

      response.on('data', (chunk) => {
        responseData += chunk;
      });

      response.on('end', () => {
        res.status(response.statusCode).send(responseData);
      });
    });

    request.on('error', (error) => {
      res.status(500).json({ error: 'Internal server error' });
    });

    request.write(JSON.stringify(data));
    request.end();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to start localtunnel and console the generated URL
function startLocalTunnel(port) {
    exec(`lt --port ${port}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting localtunnel: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`localtunnel stderr: ${stderr}`);
            return;
        }
        console.log(`Your application is accessible at: ${stdout.trim()}`);
    });
}

// Start localtunnel and console the URL when the Node.js application starts
startLocalTunnel(PORT);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
