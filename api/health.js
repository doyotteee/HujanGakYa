module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).json({});
  }

  // Apply CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    res.status(200).json({
      status: 'OK',
      message: 'HujanGakYa API is running on Vercel',
      timestamp: new Date().toISOString(),
      environment: 'production',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};
