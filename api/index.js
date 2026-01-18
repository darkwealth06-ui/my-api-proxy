const express = require('express');
const fetch = require('node-fetch'); // use node-fetch for better compatibility on Render

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Your base URL and key
const baseUrl = 'https://socialsmswrld.com/api/reseller/v1/';
const apiKey = 'OTPAPI_LIVE_1_9583535a0d62f93771defbf1b2fdbe89b445ac8c'; // ← Replace with your OTPAPI_LIVE_... key

// Catch-all route for /api/*
app.all('/api/*', async (req, res) => {
  const urlPath = req.path.replace('/api/', ''); // e.g. balance.php

  const targetUrl = baseUrl + urlPath;

  const headers = {
    ...req.headers,
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };

  delete headers.host;
  delete headers.connection;

  try {
    const response = await fetch(targetUrl + '?' + new URLSearchParams(req.query), {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      redirect: 'manual'
    });

    const data = await response.text();

    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
});

// Simple root message (optional - stops "no app running" errors)
app.get('/', (req, res) => {
  res.send('Proxy is live! Use /api/balance.php, /api/servers.php, etc.');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server listening on port ${port}`);
});
