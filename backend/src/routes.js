/**
 * API Routes for the NEAR property-registry demo.
 */

import express from 'express';
import {
    callViewFunction,
    callChangeFunction,
    callChangeFunctionWithRetry,
    queryContractState,
    getTransactionStatus,
    getContractId,
    getNetworkConfig,
    getAnalysisSummary,
    getBlockByHash,
    fetchContractTransactionHistory,
} from './near.js';

const router = express.Router();

function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function getExplorerBaseUrl(networkId) {
    return networkId === 'mainnet'
        ? 'https://nearblocks.io'
        : `https://${networkId}.nearblocks.io`;
}

function getExecutionStatus(result) {
    const statusEntries = Object.entries(result?.status || {});
    if (statusEntries.length === 0) {
        return 'Unknown';
    }

    const [statusKey] = statusEntries[0];
    return statusKey === 'SuccessValue' ? 'Success' : statusKey;
}

function mapTransaction(result, metadata = {}) {
    const networkId = getNetworkConfig().networkId;
    const explorerBaseUrl = getExplorerBaseUrl(networkId);

    return {
        hash: result.transaction.hash,
        signerId: result.transaction.signer_id,
        receiverId: result.transaction.receiver_id,
        blockHash: result.transaction.block_hash,
        status: getExecutionStatus(result),
        gasBurned: result.transaction_outcome?.outcome?.gas_burnt || 0,
        tokensBurned: result.transaction_outcome?.outcome?.tokens_burnt || '0',
        receiptCount: result.receipts_outcome?.length || 0,
        receiptIds: result.transaction_outcome?.outcome?.receipt_ids || [],
        explorerUrl: `${explorerBaseUrl}/txns/${result.transaction.hash}`,
        networkId,
        ...metadata,
    };
}

async function mapTransactionWithTiming(result, metadata = {}) {
    const transaction = mapTransaction(result, metadata);
    const blockHash = transaction.blockHash;

    let observedBlockTimestamp;
    let observedBlockHeight;

    try {
        if (blockHash) {
            const block = await getBlockByHash(blockHash);
            observedBlockTimestamp = block.timestampIso;
            observedBlockHeight = block.height;
        }
    } catch {
        // ignore block-lookup errors
    }

    return {
        ...transaction,
        observedBlockTimestamp,
        observedBlockHeight,
    };
}

function validatePropertyInput(item, index = 0) {
    const propertyId = normalizeText(item?.property_id);
    const description = normalizeText(item?.description);
    const owner = normalizeText(item?.owner);

    if (!propertyId || !description || !owner) {
        throw new Error(`Item ${index + 1} must include property_id, description, and owner`);
    }

    return {
        property_id: propertyId,
        description,
        owner,
    };
}

function normalizeConcurrency(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return 5;
    }
    return Math.min(Math.max(parsed, 1), 8);
}

function decodeSuccessValue(result) {
    const encoded = result?.status?.SuccessValue;
    if (typeof encoded !== 'string' || encoded.length === 0) {
        return null;
    }

    try {
        const decoded = Buffer.from(encoded, 'base64').toString('utf8');
        return decoded ? JSON.parse(decoded) : null;
    } catch {
        return null;
    }
}

function decodeBase64Json(value) {
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }

    try {
        return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
    } catch {
        return null;
    }
}

function normalizePossibleObject(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    return typeof value === 'object' ? value : null;
}

function extractTransactionHash(item) {
    return item?.transaction_hash || item?.hash || item?.transaction?.hash || null;
}

function extractTransactionSigner(item) {
    return item?.signer_account_id
        || item?.signer_id
        || item?.predecessor_account_id
        || item?.transaction?.signer_id
        || item?.transaction?.signer_account_id
        || item?.signerId
        || null;
}

function extractTransactionTimestamp(item) {
    return item?.block_timestamp
        || item?.timestamp
        || item?.transaction?.block_timestamp
        || item?.receipt_execution_outcome?.block_timestamp
        || null;
}

function extractTransactionMethod(item) {
    const firstAction = item?.actions?.[0] || item?.transaction?.actions?.[0] || item?.receipts?.[0]?.receipt_actions?.[0];
    const directMethod = item?.method_name
        || item?.method
        || item?.action?.method_name
        || item?.action?.method
        || firstAction?.method
        || firstAction?.method_name
        || firstAction?.FunctionCall?.method_name
        || firstAction?.function_call?.method_name;

    if (directMethod) {
        return directMethod;
    }

    if ((firstAction?.action === 'FUNCTION_CALL' || firstAction?.action_kind === 'FUNCTION_CALL') && (firstAction?.method_name || firstAction?.method)) {
        return firstAction.method_name || firstAction.method;
    }

    return null;
}

function tryParseJsonString(value) {
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }

    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function decodeBase64JsonOrText(value) {
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }

    try {
        const decoded = Buffer.from(value, 'base64').toString('utf8');
        return tryParseJsonString(decoded) || decoded;
    } catch {
        return null;
    }
}

function extractTransactionArgs(item) {
    const directCandidates = [
        item?.args,
        item?.args_json,
        item?.argsJson,
        item?.action?.args,
        item?.action?.args_json,
    ];

    for (const candidate of directCandidates) {
        const normalized = normalizePossibleObject(candidate);
        if (normalized) {
            return normalized;
        }
        const parsed = tryParseJsonString(candidate);
        if (parsed) {
            return parsed;
        }
    }

    const base64Candidates = [
        item?.args_base64,
        item?.argsBase64,
    ];

    for (const candidate of base64Candidates) {
        const decoded = decodeBase64JsonOrText(candidate);
        if (decoded && typeof decoded === 'object') {
            return decoded;
        }
    }

    const action = item?.actions?.[0] || item?.transaction?.actions?.[0] || item?.receipts?.[0]?.receipt_actions?.[0];
    const actionCandidates = [
        action?.args,
        action?.args_json,
        action?.FunctionCall?.args,
        action?.function_call?.args,
    ];

    for (const candidate of actionCandidates) {
        const normalized = normalizePossibleObject(candidate);
        if (normalized) {
            return normalized;
        }
        const parsed = tryParseJsonString(candidate);
        if (parsed) {
            return parsed;
        }
    }

    const decodedActionArgs = decodeBase64JsonOrText(
        action?.args_base64
        || action?.FunctionCall?.args_base64
        || action?.function_call?.args_base64
    );

    if (decodedActionArgs && typeof decodedActionArgs === 'object') {
        return decodedActionArgs;
    }

    return {};
}

function buildPropertyHistoryFallback(property, explorerBaseUrl, reason = '') {
    const timeline = [
        {
            kind: 'snapshot',
            label: 'Snapshot hiện tại',
            action: 'Latest on-chain state',
            actor: property.updated_by,
            timestamp: property.timestamp,
            owner: property.owner,
            detail: 'Contract state hiện chỉ trả về bản ghi mới nhất của property. Timeline lịch sử đầy đủ cần nguồn transaction history riêng.',
            explorerUrl: property.updated_by ? `${explorerBaseUrl}/address/${property.updated_by}` : null,
        },
    ];

    const note = reason
        ? `Chưa dựng được lịch sử giao dịch đầy đủ: ${reason}`
        : 'Chưa có transaction history khả dụng cho property này, nên UI đang hiển thị snapshot hiện tại làm mốc tham chiếu.';

    return {
        available: false,
        source: 'current_state_snapshot',
        note,
        timeline,
    };
}

function buildPropertyHistoryTimeline(propertyId, transactions = [], explorerBaseUrl) {
    const timeline = [];
    let currentOwner = null;

    console.log('[History] Build timeline start', {
        propertyId,
        transactionCount: transactions.length,
    });

    const sortedTransactions = [...transactions].sort((left, right) => {
        const leftTimestamp = Number(extractTransactionTimestamp(left) || 0);
        const rightTimestamp = Number(extractTransactionTimestamp(right) || 0);
        return leftTimestamp - rightTimestamp;
    });

    for (const tx of sortedTransactions) {
        const transactionHash = extractTransactionHash(tx);
        const methodName = extractTransactionMethod(tx);
        const args = extractTransactionArgs(tx);
        const normalizedPropertyId = normalizeText(args?.property_id);



        const signerId = extractTransactionSigner(tx);
        const timestamp = extractTransactionTimestamp(tx);
        const explorerUrl = transactionHash ? `${explorerBaseUrl}/txns/${transactionHash}` : null;

        if ((methodName === 'create_property' || methodName === 'upsert_property' || methodName === 'update_property') && timeline.every((entry) => entry.kind !== 'creation')) {
            const owner = normalizeText(args.owner) || null;
            currentOwner = owner || currentOwner;
            timeline.push({
                kind: 'creation',
                label: 'Khởi tạo property',
                action: methodName,
                actor: signerId,
                timestamp,
                owner,
                detail: `Tạo hoặc ghi bản ghi đầu tiên cho property ${propertyId}.`,
                transactionHash,
                explorerUrl,
            });
            continue;
        }

        if (methodName === 'transfer_property') {
            const newOwner = normalizeText(args.new_owner) || null;
            const previousOwner = currentOwner;
            timeline.push({
                kind: 'transfer',
                label: 'Đổi chủ sở hữu',
                action: methodName,
                actor: signerId,
                timestamp,
                previousOwner,
                owner: newOwner,
                detail: previousOwner && newOwner
                    ? `Chuyển quyền sở hữu từ ${previousOwner} sang ${newOwner}.`
                    : `Cập nhật chủ sở hữu mới thành ${newOwner || 'không xác định'}.`,
                transactionHash,
                explorerUrl,
            });
            currentOwner = newOwner || currentOwner;
        }
    }

    return timeline;
}

async function buildPropertyHistory(propertyId, property, explorerBaseUrl) {
    try {
        const transactions = await fetchContractTransactionHistory({
            maxPages: 2,
            perPage: 100,
        });

        const timeline = buildPropertyHistoryTimeline(propertyId, transactions, explorerBaseUrl);
        if (timeline.length === 0) {
            return buildPropertyHistoryFallback(property, explorerBaseUrl, 'Không tìm thấy transaction history khớp với property_id trong các giao dịch contract gần đây.');
        }

        timeline.push({
            kind: 'snapshot',
            label: 'Snapshot hiện tại',
            action: 'Latest on-chain state',
            actor: property.updated_by,
            timestamp: property.timestamp,
            owner: property.owner,
            detail: 'Đây là trạng thái mới nhất mà contract đang trả về qua view method.',
            explorerUrl: property.updated_by ? `${explorerBaseUrl}/address/${property.updated_by}` : null,
        });

        timeline.sort((left, right) => Number(left.timestamp || 0) - Number(right.timestamp || 0));

        return {
            available: true,
            source: 'nearblocks_transaction_history',
            note: 'Timeline được dựng lại từ transaction history của contract để minh họa lần khởi tạo và các lần đổi chủ sở hữu.',
            timeline,
        };
    } catch (error) {
        return buildPropertyHistoryFallback(property, explorerBaseUrl, error.message);
    }
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

router.get('/properties/:propertyId/blockchain-detail', async (req, res) => {
    try {
        const propertyId = normalizeText(req.params.propertyId);
        const property = await callViewFunction('get_property', { property_id: propertyId });

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        const [state, network] = await Promise.all([
            queryContractState(),
            Promise.resolve(getNetworkConfig()),
        ]);

        const explorerBaseUrl = getExplorerBaseUrl(network.networkId);
        const history = await buildPropertyHistory(propertyId, property, explorerBaseUrl);

        res.json({
            success: true,
            data: {
                property,
                blockchain: {
                    networkId: network.networkId,
                    contractId: getContractId(),
                    rpcUrl: network.nodeUrl,
                    latestObservedBlockHeight: state.blockHeight,
                    latestObservedBlockHash: state.blockHash,
                    rawStatePairs: state.values.length,
                    explorer: {
                        contract: `${explorerBaseUrl}/address/${getContractId()}`,
                        updater: `${explorerBaseUrl}/address/${property.updated_by}`,
                    },
                },
                history,
            },
            explanation: 'This endpoint combines the current property state with surrounding blockchain context so the UI can explain how contract data lives on NEAR.',
        });
    } catch (error) {
        console.error('Error getting property blockchain detail:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/properties/:propertyId/history', async (req, res) => {
    try {
        const propertyId = normalizeText(req.params.propertyId);
        const property = await callViewFunction('get_property', { property_id: propertyId });

        if (!property) {
            return res.status(404).json({ success: false, error: 'Property not found' });
        }

        const network = getNetworkConfig();
        const explorerBaseUrl = getExplorerBaseUrl(network.networkId);
        const history = await buildPropertyHistory(propertyId, property, explorerBaseUrl);

        res.json({
            success: true,
            data: {
                property,
                history,
                blockchain: {
                    networkId: network.networkId,
                    contractId: getContractId(),
                    rpcUrl: network.nodeUrl,
                    explorerBaseUrl,
                },
            },
            explanation: 'This endpoint reconstructs property history from contract transaction data so the UI can highlight the creation event and ownership transfers.',
        });
    } catch (error) {
        console.error('Error getting property history:', error);
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

        const requestStartedAt = Date.now();
        const result = await callChangeFunction('upsert_property', {
            property_id: propertyId,
            description,
            owner,
        });
        const requestRespondedAt = Date.now();
        const transaction = await mapTransactionWithTiming(result, {
            methodName: 'upsert_property',
            operationType: 'Upsert property',
            requestStartedAt,
            requestRespondedAt,
            durationMs: requestRespondedAt - requestStartedAt,
        });

        res.json({
            success: true,
            mode: 'upsert',
            explanation: 'This write performs an UPSERT-style state transition: the contract inserts a new property if it does not exist yet, or overwrites the current state if it already exists.',
            transaction,
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
            transaction: mapTransaction(result, {
                methodName: 'update_property',
                operationType: 'Update property',
            }),
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
            transaction: mapTransaction(result, {
                methodName: 'transfer_property',
                operationType: 'Transfer ownership',
            }),
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
            transaction: mapTransaction(result, {
                methodName: 'delete_property',
                operationType: 'Delete property',
            }),
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
            transaction: mapTransaction(result, {
                methodName: 'reset_registry',
                operationType: 'Reset registry',
            }),
        });
    } catch (error) {
        console.error('Error resetting registry:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/batch/properties/import-json', async (req, res) => {
    try {
        const items = Array.isArray(req.body?.items) ? req.body.items : null;

        if (!items) {
            return res.status(400).json({ success: false, error: 'Request body must include an items array' });
        }

        if (items.length === 0) {
            return res.status(400).json({ success: false, error: 'The items array must not be empty' });
        }

        const payloadItems = items.map((item, index) => validatePropertyInput(item, index));
        const startedAt = new Date().toISOString();
        const startedMs = Date.now();

        try {
            const result = await callChangeFunctionWithRetry('batch_upsert_properties', { items: payloadItems }, {
                retries: 4,
                retryDelayMs: 300,
            });
            const finishedMs = Date.now();
            const durationMs = finishedMs - startedMs;
            const transaction = await mapTransactionWithTiming(result, {
                methodName: 'batch_upsert_properties',
                operationType: 'Batch upsert properties',
                requestStartedAt: startedMs,
                requestRespondedAt: finishedMs,
                durationMs,
            });
            const contractSummary = decodeSuccessValue(result) || {};
            const totalItems = payloadItems.length;
            const successCount = Number(contractSummary.processed || totalItems);
            const failureCount = Math.max(totalItems - successCount, 0);
            const recordThroughputPerSecond = durationMs > 0
                ? Number(((successCount * 1000) / durationMs).toFixed(2))
                : 0;
            const transactionThroughputPerSecond = durationMs > 0
                ? Number((1000 / durationMs).toFixed(2))
                : 0;

            res.json({
                success: true,
                explanation: 'This benchmark submits all imported records through one contract-level batch transaction so the UI can compare record throughput against the previous one-transaction-per-record approach.',
                summary: {
                    mode: 'batch_transaction',
                    totalItems,
                    successCount,
                    failureCount,
                    startedAt,
                    finishedAt: new Date(finishedMs).toISOString(),
                    durationMs,
                    averageDurationMs: totalItems > 0 ? Math.round(durationMs / totalItems) : 0,
                    throughputPerSecond: recordThroughputPerSecond,
                    transactionThroughputPerSecond,
                    totalGasBurned: Number(transaction.gasBurned || 0),
                    transactionsSubmitted: 1,
                    createdCount: Number(contractSummary.created || 0),
                    updatedCount: Number(contractSummary.updated || 0),
                },
                results: payloadItems.map((item, index) => ({
                    index,
                    property_id: item.property_id,
                    success: true,
                    durationMs,
                    transaction,
                })),
                batchTransaction: transaction,
            });
        } catch (error) {
            const finishedMs = Date.now();
            const durationMs = finishedMs - startedMs;
            const totalItems = payloadItems.length;

            res.status(500).json({
                success: false,
                error: error.message,
                summary: {
                    mode: 'batch_transaction',
                    totalItems,
                    successCount: 0,
                    failureCount: totalItems,
                    startedAt,
                    finishedAt: new Date(finishedMs).toISOString(),
                    durationMs,
                    averageDurationMs: totalItems > 0 ? Math.round(durationMs / totalItems) : 0,
                    throughputPerSecond: 0,
                    transactionThroughputPerSecond: 0,
                    totalGasBurned: 0,
                    transactionsSubmitted: 1,
                    createdCount: 0,
                    updatedCount: 0,
                },
                results: payloadItems.map((item, index) => ({
                    index,
                    property_id: item.property_id,
                    success: false,
                    durationMs,
                    error: error.message,
                })),
            });
        }
    } catch (error) {
        console.error('Error importing JSON batch:', error);
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
                status: Object.keys(status.status || {})[0] === 'SuccessValue' ? 'Success' : Object.keys(status.status || {})[0] || 'Unknown',
                blockHash: status.transaction.block_hash,
                gasUsed: status.transaction_outcome?.outcome?.gas_burnt || 0,
                tokensBurned: status.transaction_outcome?.outcome?.tokens_burnt || '0',
                receiptCount: status.receipts_outcome?.length || 0,
                receiptIds: status.transaction_outcome?.outcome?.receipt_ids || [],
                explorerUrl: `${getExplorerBaseUrl(getNetworkConfig().networkId)}/txns/${status.transaction.hash}`,
                networkId: getNetworkConfig().networkId,
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
