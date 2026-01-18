export default async function handler(req, res) {
  // Get the path after /api/ (e.g. balance.php, servers.php)
  const pathArray = req.query.path || [];
  const urlPath = pathArray.join('/');

  // Your real API base URL
  const baseUrl = 'https://socialsmswrld.com/api/reseller/v1/';

  // Your real API key (keep this secret!)
  const apiKey = 'OTPAPI_LIVE_1_9583535a0d62f93771defbf1b2fdbe89b445ac8c';  // ← Replace with your OTPAPI_LIVE_... key

  const targetUrl = baseUrl + urlPath;

  // Headers: forward original + add your key + browser-like User-Agent
  const headers = {
    ...req.headers,
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,                    // The required header for auth
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'  // Helps avoid blocks/redirects
  };

  // Clean up headers that cause problems
  delete headers.host;
  delete headers.connection;

  // Add timeout controller to prevent hanging forever
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

  try {
    const response = await fetch(targetUrl + '?' + new URLSearchParams(req.query), {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      signal: controller.signal,          // Enforces timeout
      redirect: 'manual'                  // ← KEY FIX: Do NOT auto-follow redirects (prevents "redirect count exceeded")
    });

    clearTimeout(timeoutId);

    // Get the response as text (works for JSON, HTML, etc.)
    const data = await response.text();

    // Forward content type and status
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    clearTimeout(timeoutId);

    // Detailed error for debugging
    const errorInfo = {
      message: error.message,
      code: error.code || 'unknown',
      name: error.name,
      cause: error.cause ? error.cause.message : 'no cause',
      fullStack: error.stack ? error.stack.substring(0, 500) : 'no stack'
    };

    console.error('Proxy fetch error:', errorInfo); // Logs to Vercel console

    res.status(500).json({ 
      error: 'Proxy failed', 
      details: JSON.stringify(errorInfo)
    });
  }
}
