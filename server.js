require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');

const app = express();

// List of allowed frontend origins
const allowedOrigins = [
  'http://localhost:5500',
  'https://smart-invoice-frontend-tau.vercel.app',
  'https://smart-invoice-frontend-11b5d86ew.vercel.app',
  'http://127.0.0.1:5500' // ✅ Add this if you're using Live Server
];

app.use(cors({
  origin: function (origin, callback) {
    console.log('Incoming Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle preflight requests
app.options('*', cors());

// Parse JSON
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/invoices', invoiceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
