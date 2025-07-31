module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple response tanpa dependencies
  res.status(200).json({
    status: 'success',
    message: 'HujanGakYa API is working!',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
};
