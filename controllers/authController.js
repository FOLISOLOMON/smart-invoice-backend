const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const register = async (req, res) => {
  try {
    const { business_name, email, password } = req.body;

    // Check if user exists
    const { rows: existingUsers } = await pool.query(
      'SELECT * FROM users WHERE business_name = $1 OR email = $2',
      [business_name, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Business or email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { rows: createdUsers } = await pool.query(
      'INSERT INTO users (business_name, email, password) VALUES ($1, $2, $3) RETURNING id',
      [business_name, email, hashedPassword]
    );

    const userId = createdUsers[0].id;

    // Create token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { business_name, password } = req.body;

    // Find user
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE business_name = $1',
      [business_name]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = { register, login };
