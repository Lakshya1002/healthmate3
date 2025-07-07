// backend/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'a_secure_jwt_secret_replace_it');

      // Get user from the token payload (we only need the ID)
      // We don't need to query the DB here, we can do it in the protected route if needed
      // This makes the middleware faster.
      req.user = { id: decoded.id };

      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
