const sanitize = (req, res, next) => {
  // Skip if no query or body
  if (!req.query && !req.body) return next();

  // Deep copy and sanitize query and body
  const sanitizeValue = (value) => {
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(key => {
        if (value[key] && typeof value[key] === 'object') {
          sanitizeValue(value[key]);
        } else if (typeof value[key] === 'string' && /^[\$]/.test(value[key])) {
          // Remove $ and . from potentially malicious MongoDB operators
          value[key] = value[key].replace(/[\$\.]/g, '');
        }
      });
    }
    return value;
  };

  // Apply sanitization
  if (req.query) req.query = JSON.parse(JSON.stringify(req.query));
  if (req.body) req.body = JSON.parse(JSON.stringify(req.body));
  
  sanitizeValue(req.query);
  sanitizeValue(req.body);
  
  next();
};

module.exports = { sanitize };

