/**
 * API Routes for NEAR Demo Backend
 */

import express from 'express';
import {
    callViewFunction,
    callChangeFunction,
    queryContractState,
    getTransactionStatus,
    getContractId,
} from './near.js';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({ status: 'ok', contractId: getContractId() });
});

/**
 * GET /api/data
 * Get all data from contract
 */
router.get('/data', async (req, res) => {
    try {
        const data = await callViewFunction('get_all_data');
        res.json({ success: true, data });
    } catch (error) {
        console.error('Error getting all data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/data/:key
 * Get data by specific key
 */
router.get('/data/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const data = await callViewFunction('get_data', { key });

        if (data) {
            res.json({ success: true, data });
        } else {
            res.status(404).json({ success: false, error: 'Key not found' });
        }
    } catch (error) {
        console.error('Error getting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/data
 * Save new data to blockchain
 * Body: { key: string, value: string }
 */
router.post('/data', async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || !value) {
            return res.status(400).json({
                success: false,
                error: 'Key and value are required'
            });
        }

        const result = await callChangeFunction('set_data', { key, value });

        res.json({
            success: true,
            transaction: {
                hash: result.transaction.hash,
                blockHeight: result.transaction_outcome.block_hash,
            },
            data: { key, value },
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * DELETE /api/data/:key
 * Delete data by key
 */
router.delete('/data/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const result = await callChangeFunction('delete_data', { key });

        res.json({
            success: true,
            transaction: {
                hash: result.transaction.hash,
            },
        });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/export/json
 * Export all data as JSON file
 */
router.get('/export/json', async (req, res) => {
    try {
        const data = await callViewFunction('get_all_data');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="near_data_export.json"');
        res.json({
            exportedAt: new Date().toISOString(),
            contractId: getContractId(),
            totalRecords: data.length,
            data,
        });
    } catch (error) {
        console.error('Error exporting JSON:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/export/csv
 * Export all data as CSV file
 */
router.get('/export/csv', async (req, res) => {
    try {
        const data = await callViewFunction('get_all_data');

        // Create CSV content
        const headers = ['Key', 'Value', 'Sender', 'Timestamp'];
        let csv = headers.join(',') + '\n';

        data.forEach(entry => {
            // Escape values that contain commas
            const escapedKey = `"${entry.key.replace(/"/g, '""')}"`;
            const escapedValue = `"${entry.value.replace(/"/g, '""')}"`;
            csv += `${escapedKey},${escapedValue},${entry.sender},${entry.timestamp}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="near_data_export.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/transaction/:hash
 * Get transaction status by hash
 */
router.get('/transaction/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const status = await getTransactionStatus(hash);

        res.json({
            success: true,
            transaction: {
                hash: status.transaction.hash,
                status: status.status,
                gasUsed: status.transaction_outcome?.outcome?.gas_burnt,
            },
        });
    } catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/state
 * Get raw contract state
 */
router.get('/state', async (req, res) => {
    try {
        const state = await queryContractState();
        res.json({ success: true, state });
    } catch (error) {
        console.error('Error querying state:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/count
 * Get count of entries
 */
router.get('/count', async (req, res) => {
    try {
        const count = await callViewFunction('count');
        res.json({ success: true, count });
    } catch (error) {
        console.error('Error getting count:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
