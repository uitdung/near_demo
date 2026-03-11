/**
 * API Routes for the NEAR distributed-database demo.
 */

import express from 'express';
import {
    callViewFunction,
    callChangeFunction,
    queryContractState,
    getTransactionStatus,
    getContractId,
    getNetworkConfig,
    getAnalysisSummary,
} from './near.js';

const router = express.Router();

router.get('/health', async (req, res) => {
    res.json({
        status: 'ok',
        contractId: getContractId(),
        project: 'NEAR distributed database analysis demo',
        network: getNetworkConfig().networkId,
    });
});

router.get('/analysis/summary', async (req, res) => {
    try {
        const summary = await getAnalysisSummary();
        res.json({ success: true, summary });
    } catch (error) {
        console.error('Error getting analysis summary:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/data', async (req, res) => {
    try {
        const data = await callViewFunction('get_all_data');
        res.json({
            success: true,
            data,
            explanation: 'This endpoint represents a read-only SELECT style operation via a NEAR view method.',
        });
    } catch (error) {
        console.error('Error getting all data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/data/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const data = await callViewFunction('get_data', { key });

        if (data) {
            res.json({
                success: true,
                data,
                explanation: 'This is a key-based lookup over contract state using a view function.',
            });
            return;
        }

        res.status(404).json({ success: false, error: 'Key not found' });
    } catch (error) {
        console.error('Error getting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/data', async (req, res) => {
    try {
        const { key, value } = req.body;

        if (!key || !value) {
            return res.status(400).json({
                success: false,
                error: 'Key and value are required',
            });
        }

        const result = await callChangeFunction('set_data', { key, value });

        res.json({
            success: true,
            explanation: 'This write behaves like an INSERT/UPDATE, but it is executed as a signed blockchain transaction that mutates contract state.',
            transaction: {
                hash: result.transaction.hash,
                signerId: result.transaction.signer_id,
                receiverId: result.transaction.receiver_id,
                blockHash: result.transaction.block_hash,
            },
            data: { key, value },
        });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/data/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const result = await callChangeFunction('delete_data', { key });

        res.json({
            success: true,
            explanation: 'Deletion is also a state transition transaction and demonstrates that contract state can change while finalized history remains immutable.',
            transaction: {
                hash: result.transaction.hash,
                signerId: result.transaction.signer_id,
            },
        });
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/export/json', async (req, res) => {
    try {
        const data = await callViewFunction('get_all_data');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="near_data_export.json"');
        res.json({
            exportedAt: new Date().toISOString(),
            contractId: getContractId(),
            totalRecords: data.length,
            purpose: 'Export contract state into JSON for off-chain analysis.',
            data,
        });
    } catch (error) {
        console.error('Error exporting JSON:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/export/csv', async (req, res) => {
    try {
        const data = await callViewFunction('get_all_data');
        const headers = ['Key', 'Value', 'Sender', 'Timestamp'];
        let csv = headers.join(',') + '\n';

        data.forEach((entry) => {
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

router.get('/transaction/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const status = await getTransactionStatus(hash);

        res.json({
            success: true,
            transaction: {
                hash: status.transaction.hash,
                signerId: status.transaction.signer_id,
                receiverId: status.transaction.receiver_id,
                status: status.status,
                gasUsed: status.transaction_outcome?.outcome?.gas_burnt,
                receipts: status.receipts_outcome?.length || 0,
            },
        });
    } catch (error) {
        console.error('Error getting transaction:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/state', async (req, res) => {
    try {
        const state = await queryContractState();
        res.json({
            success: true,
            state,
            explanation: 'This endpoint reveals contract state through the RPC layer, which is useful for discussing encoded blockchain state and storage layout.',
        });
    } catch (error) {
        console.error('Error querying state:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/count', async (req, res) => {
    try {
        const count = await callViewFunction('count');
        res.json({
            success: true,
            count,
            explanation: 'A compact aggregate over state that is useful when comparing blockchain reads with relational COUNT queries.',
        });
    } catch (error) {
        console.error('Error getting count:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
