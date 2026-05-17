export const auditLog = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the request and response in a real app
    console.log(`[AUDIT] ${req.method} ${req.originalUrl} - Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };
  
  next();
};
