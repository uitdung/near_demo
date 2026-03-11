/**
 * API Routes for the NEAR property-registry demo.
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

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function mapTransaction(result) {
    return {
        hash: result.transaction.hash,
        signerId: result.transaction.signer_id,
        receiverId: result.transaction.receiver_id,
        blockHash: result.transaction.block_hash,
    };
}

router.get('/health', async (req, res) => {
    res.json({
        status: 'ok',
        contractId: getContractId(),
        project: 'NEAR property ownership registry demo',
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

router.get('/properties', async (req, res) => {
    try {
        const owner = normalizeText(req.query.owner);
        const properties = owner
            ? await callViewFunction('get_properties_by_owner', { owner })
            : await callViewFunction('get_all_properties');

        res.json({
            success: true,
            data: properties,
            explanation: owner
                ? 'This endpoint filters current property records by owner using a read-only view method.'
                : 'This endpoint represents a read-only SELECT * style operation over the current property registry state.',
        });
    } catch (error) {
        console.error('Error getting properties:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/properties/:propertyId', async (req, res) => {
    try {
        const propertyId = normalizeText(req.params.propertyId);
        const property = await callViewFunction('get_property', { property_id: propertyId });

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        res.json({
            success: true,
            data: property,
            explanation: 'This is a property_id based lookup over contract state using a NEAR view function.',
        });
    } catch (error) {
        console.error('Error getting property:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/properties', async (req, res) => {
    try {
        const propertyId = normalizeText(req.body.property_id);
        const description = normalizeText(req.body.description);
        const owner = normalizeText(req.body.owner);

        if (!propertyId || !description || !owner) {
            return res.status(400).json({
                success: false,
                error: 'property_id, description, and owner are required',
            });
        }

        const existingProperty = await callViewFunction('get_property', { property_id: propertyId });
        const methodName = existingProperty ? 'update_property' : 'create_property';
        const result = await callChangeFunction(methodName, {
            property_id: propertyId,
            description,
            owner,
        });

        res.json({
            success: true,
            mode: existingProperty ? 'update' : 'create',
            explanation: existingProperty
                ? 'This write updates the current state of an existing property record through a signed blockchain transaction.'
                : 'This write inserts a new property record into contract state through a signed blockchain transaction.',
            transaction: mapTransaction(result),
            data: {
                property_id: propertyId,
                description,
                owner,
            },
        });
    } catch (error) {
        console.error('Error saving property:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/properties/:propertyId', async (req, res) => {
    try {
        const propertyId = normalizeText(req.params.propertyId);
        const description = normalizeText(req.body.description);
        const owner = normalizeText(req.body.owner);

        if (!propertyId || !description || !owner) {
            return res.status(400).json({
                success: false,
                error: 'property_id, description, and owner are required',
            });
        }

        const result = await callChangeFunction('update_property', {
            property_id: propertyId,
            description,
            owner,
        });

        res.json({
            success: true,
            explanation: 'This endpoint performs an UPDATE-style rewrite of the current property state.',
            transaction: mapTransaction(result),
        });
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/properties/:propertyId/transfer', async (req, res) => {
    try {
        const propertyId = normalizeText(req.params.propertyId);
        const newOwner = normalizeText(req.body.new_owner);

        if (!propertyId || !newOwner) {
            return res.status(400).json({
                success: false,
                error: 'property_id and new_owner are required',
            });
        }

        const result = await callChangeFunction('transfer_property', {
            property_id: propertyId,
            new_owner: newOwner,
        });

        res.json({
            success: true,
            explanation: 'This transaction demonstrates ownership transfer by updating the current owner field for a property record.',
            transaction: mapTransaction(result),
            data: {
                property_id: propertyId,
                new_owner: newOwner,
            },
        });
    } catch (error) {
        console.error('Error transferring property:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/properties/:propertyId', async (req, res) => {
    try {
        const propertyId = normalizeText(req.params.propertyId);
        const result = await callChangeFunction('delete_property', {
            property_id: propertyId,
        });

        res.json({
            success: true,
            explanation: 'Deletion is also a state transition transaction and shows that current state can change while finalized history remains immutable.',
            transaction: mapTransaction(result),
        });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/admin/reset', async (req, res) => {
    try {
        const result = await callChangeFunction('reset_registry', {});
        res.json({
            success: true,
            explanation: 'This admin-only reset rebinds the active property registry to a fresh storage prefix so legacy incompatible records stop affecting reads on the current account.',
            transaction: mapTransaction(result),
        });
    } catch (error) {
        console.error('Error resetting registry:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/count', async (req, res) => {
    try {
        const count = await callViewFunction('count_properties');
        res.json({
            success: true,
            count,
            explanation: 'A compact aggregate over registry state that is useful when comparing blockchain reads with relational COUNT queries.',
        });
    } catch (error) {
        console.error('Error getting property count:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/export/json', async (req, res) => {
    try {
        const properties = await callViewFunction('get_all_properties');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="near_properties_export.json"');
        res.json({
            exportedAt: new Date().toISOString(),
            contractId: getContractId(),
            totalRecords: properties.length,
            dataset: 'property ownership registry',
            purpose: 'Export current property registry state into JSON for off-chain analysis.',
            data: properties,
        });
    } catch (error) {
        console.error('Error exporting JSON:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/export/csv', async (req, res) => {
    try {
        const properties = await callViewFunction('get_all_properties');
        const headers = ['Property ID', 'Description', 'Owner', 'Timestamp', 'Updated By'];
        let csv = headers.join(',') + '\n';

        properties.forEach((property) => {
            const escapedId = `"${property.property_id.replace(/"/g, '""')}"`;
            const escapedDescription = `"${property.description.replace(/"/g, '""')}"`;
            const escapedOwner = `"${property.owner.replace(/"/g, '""')}"`;
            const escapedUpdatedBy = `"${property.updated_by.replace(/"/g, '""')}"`;
            csv += `${escapedId},${escapedDescription},${escapedOwner},${property.timestamp},${escapedUpdatedBy}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="near_properties_export.csv"');
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
            explanation: 'This endpoint reveals raw contract state through the RPC layer, which is useful for discussing encoded blockchain storage and persistent registry state.',
        });
    } catch (error) {
        console.error('Error querying state:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Backward-compatible aliases for earlier demo paths.
router.get('/data', async (req, res) => {
    req.url = '/properties';
    router.handle(req, res);
});

router.get('/data/:key', async (req, res) => {
    req.params.propertyId = req.params.key;
    req.url = `/properties/${encodeURIComponent(req.params.key)}`;
    router.handle(req, res);
});

export default router;
