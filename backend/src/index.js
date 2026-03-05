/**
 * NEAR Demo Backend Server
 * 
 * Express server providing API endpoints to interact with
 * the NEAR blockchain smart contract.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initNear, getContractId } from './near.js';
import routes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'NEAR Demo Backend',
        version: '1.0.0',
        description: 'API for interacting with NEAR blockchain key-value store',
        endpoints: {
            'GET /api/health': 'Health check',
            'GET /api/data': 'Get all data',
            'GET /api/data/:key': 'Get data by key',
            'POST /api/data': 'Save new data (body: {key, value})',
            'DELETE /api/data/:key': 'Delete data by key',
            'GET /api/export/json': 'Export all data as JSON',
            'GET /api/export/csv': 'Export all data as CSV',
            'GET /api/transaction/:hash': 'Get transaction status',
            'GET /api/state': 'Get raw contract state',
            'GET /api/count': 'Get count of entries',
        },
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

// Initialize NEAR connection and start server
async function start() {
    try {
        console.log('🔄 Initializing NEAR connection...');
        await initNear();
        console.log(`📍 Contract ID: ${getContractId()}`);

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 API endpoints available at http://localhost:${PORT}/api\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();
