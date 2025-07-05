const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const signup = (req, res) => {
  const { name, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Password encryption failed' });

    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).json({ error: 'Invalid email or password' });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    });
  });
};

module.exports = { signup, login };
