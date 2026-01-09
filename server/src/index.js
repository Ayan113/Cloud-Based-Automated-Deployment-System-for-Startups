require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');

// Validate configuration
config.validate();

const app = express();

// ======================
// Middleware
// ======================
app.use(helmet()); // Security headers
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ======================
// Health Check Endpoint
// ======================
app.get('/api/health', async (req, res) => {
    const healthcheck = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
        version: config.version,
        checks: {
            database: 'unknown'
        }
    };

    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState === 1) {
            healthcheck.checks.database = 'connected';
        } else {
            healthcheck.checks.database = 'disconnected';
            healthcheck.status = 'degraded';
        }

        const statusCode = healthcheck.status === 'ok' ? 200 : 503;
        res.status(statusCode).json(healthcheck);
    } catch (error) {
        healthcheck.status = 'error';
        healthcheck.checks.database = 'error';
        res.status(503).json(healthcheck);
    }
});

// ======================
// API Routes
// ======================
app.get('/api', (req, res) => {
    res.json({
        message: `Welcome to ${config.appName} API`,
        version: config.version,
        documentation: '/api/docs'
    });
});

// Example protected route pattern
app.get('/api/status', (req, res) => {
    res.json({
        service: config.appName,
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// ======================
// Error Handling
// ======================
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    res.status(err.status || 500).json({
        error: config.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
        timestamp: new Date().toISOString()
    });
});

// ======================
// Database Connection & Server Start
// ======================
const startServer = async () => {
    try {
        // Connect to MongoDB
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ MongoDB connected successfully');

        // Graceful shutdown handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        // Start Express server
        app.listen(config.port, () => {
            console.log(`
╔════════════════════════════════════════════════╗
║       ${config.appName}                        
║────────────────────────────────────────────────║
║  🚀 Server running on port ${config.port}              
║  📊 Environment: ${config.nodeEnv}                     
║  🔗 Health: http://localhost:${config.port}/api/health 
╚════════════════════════════════════════════════╝
      `);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
startServer();

module.exports = app; // Export for testing
