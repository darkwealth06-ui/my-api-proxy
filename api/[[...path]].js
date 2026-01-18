export default async function handler(req, res) {
  // Catch the path after /api/ (e.g. balance, servers, buy)
  const pathArray = req.query.path || [];
  const urlPath = pathArray.join('/');

  const baseUrl = 'https://socialsmswrld.com/api/reseller/v1/';  // Your real base URL

  // Put your REAL API KEY here (copy from your dashboard - OTPAPI_LIVE_... one)
  const apiKey = 'OTPAPI_LIVE_1_9583535a0d62f93771defbf1b2fdbe89b445ac8c';  // ← CHANGE THIS! Example: 'OTPAPI_LIVE_958835...'

  const targetUrl = baseUrl + urlPath;

  // Forward original headers + add your api_key as X-API-KEY header
  const headers = {
    ...req.headers,
    'Content-Type': 'application/json',  // Most endpoints expect JSON
    'X-API-KEY': apiKey,               // This is the key line — adds your key automatically
  };

  // Clean up problematic headers
  delete headers.host;
  delete headers.connection;

  try {
    // Forward the request (GET/POST/etc.) + any query params or body
    const response = await fetch(targetUrl + '?' + new URLSearchParams(req.query), {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();

    // Copy back content type and status
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
}
