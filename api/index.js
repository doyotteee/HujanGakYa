// Simple test function untuk Vercel
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Simple response untuk test
    res.status(200).json({
      status: 'OK',
      message: 'HujanGakYa API is working!',
      method: req.method,
      url: req.url,
      path: req.url.split('?')[0],
      timestamp: new Date().toISOString(),
      environment: 'production'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
