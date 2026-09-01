// p2pbackend/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import seed function
const seedAdmin = require('./seed');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const productRoutes = require('./routes/products');
const membersRoutes = require('./routes/members');
const withdrawalsRoutes = require('./routes/withdrawals');
const depositsRoutes = require('./routes/deposits');
const epinsRoutes = require('./routes/epins');
const settingsRoutes = require('./routes/settings');
const newsPopupRoutes = require('./routes/newsPopup');
const transactionsRoutes = require('./routes/transactions');
const donationsRoutes = require('./routes/donations');
const supportTicketsRoutes = require('./routes/supportTickets');
const levelIncomeRoutes = require('./routes/levelIncome');
const repurchaseIncomeRoutes = require('./routes/repurchaseIncome');
const productFranchiseRoutes = require('./routes/productFranchise');
const adminControlsRoutes = require('./routes/adminControls');

// Initialize Express app
const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'https://elconnetwork.com',
  'https://www.elconnetwork.com',
  'https://elcon-network.netlify.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Connect to MongoDB
let dbConnected = false;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    dbConnected = true;

    // Run seed to ensure admin exists
    try {
      const seedFunction = require('./seed');
      await seedFunction();
    } catch (error) {
      console.log('Seed function note: Admin may already exist or seed requires direct DB access');
    }

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/profile', profileRoutes);
    app.use('/api/members', membersRoutes);
    app.use('/api/withdrawals', withdrawalsRoutes);
    app.use('/api/deposits', depositsRoutes);
    app.use('/api/epins', epinsRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/news-popup', newsPopupRoutes);
    app.use('/api/transactions', transactionsRoutes);
    app.use('/api/donations', donationsRoutes);
    app.use('/api/support-tickets', supportTicketsRoutes);
    app.use('/api/level-income', levelIncomeRoutes);
    app.use('/api/repurchase-income', repurchaseIncomeRoutes);
    app.use('/api/product-franchise', productFranchiseRoutes);
    app.use('/api/admin-controls', adminControlsRoutes);

    // Health check route should be registered before the catch-all /api product routes,
    // otherwise productRoutes may intercept /api/health and require authentication.
    app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'MLM P2P Backend is running',
        timestamp: new Date().toISOString(),
      });
    });

    app.use('/api', productRoutes);
    // Dashboard routes
    const dashboardRoutes = require('./routes/dashboard');
    app.use('/api/dashboard', dashboardRoutes);

    // Root route
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'MLM P2P Investment Backend API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          members: '/api/members',
          withdrawals: '/api/withdrawals',
          deposits: '/api/deposits',
          health: '/api/health',
        },
      });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err.message);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    });

    // Start server with automatic port fallback if the preferred port is busy.
      const preferredPort = Number(process.env.PORT) || 5001;
    const maxPortRetries = 10;

    const startListening = (port, retriesLeft) => {
      const server = app.listen(port, () => {
        if (port !== preferredPort) {
          console.log(`⚠ Preferred port ${preferredPort} is busy. Using port ${port} instead.`);
        }
        console.log(`\n✓ Server running on http://localhost:${port}`);
        console.log(`✓ API endpoints available at http://localhost:${port}/api/auth`);
        console.log(`✓ Admin credentials: admin@gmail.com / admin123\n`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && retriesLeft > 0) {
          console.warn(`⚠ Port ${port} is in use. Trying port ${port + 1}...`);
          startListening(port + 1, retriesLeft - 1);
          return;
        }

        console.error('✗ Failed to bind server:', err.message);
        process.exit(1);
      });
    };

    startListening(preferredPort, maxPortRetries);
  } catch (error) {
    console.error('✗ Failed to start server:', error.stack || error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('✗ Unhandled Rejection:', err.message);
  process.exit(1);
});
