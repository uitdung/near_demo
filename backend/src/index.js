/**
 * NEAR property-registry demo backend server.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initNear, getContractId, getNetworkConfig } from './near.js';
import routes from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use('/api', routes);

app.get('/', (req, res) => {
    const network = getNetworkConfig();

    res.json({
        name: 'NEAR Property Registry Analysis Backend',
        version: '1.0.0',
        description: 'API for demonstrating NEAR state storage, transaction-based writes, property ownership updates, view queries, exports, and distributed-database concepts.',
        contractId: getContractId(),
        network: network.networkId,
        endpoints: {
            'GET /api/health': 'Backend health and project metadata',
            'GET /api/analysis/summary': 'High-level analysis summary for registry state, storage, sharding, and transaction concepts',
            'GET /api/properties': 'Read all property records or filter by owner via view methods',
            'GET /api/properties/:propertyId': 'Lookup a single property by property_id',
            'POST /api/properties': 'Create a property or update it when the property_id already exists',
            'PUT /api/properties/:propertyId': 'Update property details and current owner',
            'POST /api/properties/:propertyId/transfer': 'Transfer property ownership',
            'DELETE /api/properties/:propertyId': 'Delete a property record through a state-changing transaction',
            'GET /api/export/json': 'Export property records as JSON',
            'GET /api/export/csv': 'Export property records as CSV',
            'GET /api/transaction/:hash': 'Inspect a transaction outcome',
            'GET /api/state': 'Inspect raw decoded contract state',
            'GET /api/count': 'Read aggregate property count',
        },
    });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});

async function start() {
    try {
        console.log('🔄 Initializing NEAR connection...');
        await initNear();
        console.log(`📍 Contract ID: ${getContractId()}`);

        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 Analysis API available at http://localhost:${PORT}/api\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();
