const jwt = require('jsonwebtoken');
const config = require('config');
const isAuthenticated = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res
      .status(400)
      .json({ msg: 'No token, access authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, config.get('JWTSECRET'));
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = isAuthenticated;
