const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
// Explicit CORS configuration - Allow requests from any origin for now
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Cookie Data Schema
// Cookie Data Schema
const cookieDataSchema = new mongoose.Schema({
  // userId: { type: String, required: true }, // Removed userId
  url: { type: String, required: true },
  timestamp: { type: Date, required: true },
  cookies: { type: Array, required: true }
});

const CookieData = mongoose.model('CookieData', cookieDataSchema);

// Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected Route Example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Protected route accessed successfully' });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Route to save cookie data
app.post('/api/save-cookies', async (req, res) => {
  console.log('Entered /api/save-cookies route handler.'); // Log entry into the route
  console.log('Request Headers:', JSON.stringify(req.headers, null, 2)); // Log headers
  console.log('Received request body for /api/save-cookies:', JSON.stringify(req.body, null, 2)); // Log incoming data
  try {
    // const { userId, url, timestamp, cookies } = req.body; // Original line
    const { url, timestamp, cookies } = req.body; // Removed userId from destructuring

    // Basic validation
    // if (!userId || !url || !timestamp || !cookies) { // Original line
    if (!url || !timestamp || !cookies) { // Removed userId check
      console.error('Validation failed: Missing required fields.');
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // console.log(`Attempting to save data for userId: ${userId}, url: ${url}`); // Original line
    console.log(`Attempting to save data for url: ${url}`); // Removed userId log
    console.log(`Timestamp received: ${timestamp}, Type: ${typeof timestamp}`);
    let parsedTimestamp;
    try {
      parsedTimestamp = new Date(timestamp);
      if (isNaN(parsedTimestamp.getTime())) {
        throw new Error('Invalid date format');
      }
      console.log(`Parsed timestamp: ${parsedTimestamp.toISOString()}`);
    } catch (dateError) {
      console.error('Error parsing timestamp:', dateError);
      return res.status(400).json({ error: 'Invalid timestamp format', details: dateError.message });
    }

    const newCookieData = new CookieData({
      // userId, // Removed userId
      url,
      timestamp: parsedTimestamp, // Use parsed Date object
      cookies
    });

    console.log('Attempting to save to MongoDB...');
    await newCookieData.save();
    console.log('Cookie data saved successfully to MongoDB.');
    res.status(201).json({ message: 'Cookie data saved successfully' });
  } catch (error) {
    console.error('Error in /api/save-cookies handler:', error);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    res.status(500).json({ error: 'Failed to save cookie data', details: error.message });
  }
});

const PORT = process.env.PORT || 6000;
console.log(`Attempting to start server on port: ${process.env.PORT} (raw env) or default ${PORT}`); // Added log
app.listen(PORT, () => console.log(`Server successfully started and running on port ${PORT}`));