/**
 * NEAR Blockchain Connection Module
 *
 * Exposes low-level contract calls plus higher-level summaries used to
 * explain NEAR as a distributed database through a property registry demo.
 */

import { connect, keyStores, utils } from 'near-api-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
dotenv.config({ path: envPath });

const config = {
    networkId: process.env.NEAR_NETWORK || 'testnet',
    nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.fastnear.com',
    walletUrl: process.env.NEAR_WALLET_URL || 'https://testnet.mynearwallet.com',
    helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
    keyStore: new keyStores.InMemoryKeyStore(),
    contractId: process.env.NEAR_CONTRACT_ID,
    masterAccount: process.env.NEAR_MASTER_ACCOUNT,
    masterPrivateKey: process.env.NEAR_MASTER_PRIVATE_KEY,
    nearBlocksApiBaseUrl: process.env.NEARBLOCKS_API_BASE_URL || 'https://api.nearblocks.io/v1',
    nearBlocksApiKey: process.env.NEARBLOCKS_API_KEY,
};

let nearConnection = null;
let masterAccount = null;

export async function initNear() {
    if (nearConnection) return nearConnection;

    if (config.masterAccount && config.masterPrivateKey) {
        const keyPair = utils.KeyPair.fromString(config.masterPrivateKey);
        await config.keyStore.setKey(config.networkId, config.masterAccount, keyPair);
    }

    nearConnection = await connect({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        walletUrl: config.walletUrl,
        helperUrl: config.helperUrl,
        keyStore: config.keyStore,
    });

    if (config.masterAccount) {
        masterAccount = await nearConnection.account(config.masterAccount);
    }

    console.log(`✅ Connected to NEAR ${config.networkId}`);
    return nearConnection;
}

export function getMasterAccount() {
    if (!masterAccount) {
        throw new Error('Master account not initialized. Check NEAR_MASTER_ACCOUNT env var.');
    }
    return masterAccount;
}

export function getContractId() {
    return config.contractId;
}

export function getNetworkConfig() {
    return {
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        walletUrl: config.walletUrl,
        helperUrl: config.helperUrl,
        contractId: config.contractId,
        masterAccount: config.masterAccount,
        nearBlocksApiBaseUrl: config.nearBlocksApiBaseUrl,
        hasNearBlocksApiKey: Boolean(config.nearBlocksApiKey),
    };
}

function getNearBlocksHeaders() {
    const headers = {
        Accept: 'application/json',
    };

    if (config.nearBlocksApiKey) {
        headers.Authorization = `Bearer ${config.nearBlocksApiKey}`;
    }

    return headers;
}

function normalizeTxCollection(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.txns)) {
        return payload.txns;
    }

    if (Array.isArray(payload?.transactions)) {
        return payload.transactions;
    }

    return [];
}

export async function fetchAccountTransactions(accountId, options = {}) {
    const {
        cursor,
        perPage = 50,
        order = 'desc',
    } = options;

    const params = new URLSearchParams();
    params.set('per_page', String(perPage));
    params.set('order', order);

    if (cursor) {
        params.set('cursor', cursor);
    }

    const requestUrl = `${config.nearBlocksApiBaseUrl}/account/${encodeURIComponent(accountId)}/txns-only?${params.toString()}`;
    const response = await fetch(requestUrl, {
        headers: getNearBlocksHeaders(),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('[NearBlocks] Request failed', {
            accountId,
            status: response.status,
            requestUrl,
            errorBody,
        });
        throw new Error(`NearBlocks request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const items = normalizeTxCollection(payload);
    const nextCursor = payload?.cursor || payload?.next_cursor || payload?.next || null;

    return {
        items,
        cursor: nextCursor,
    };
}

export async function fetchContractTransactionHistory(options = {}) {
    const {
        maxPages = 1,
        perPage = 50,
    } = options;

    const allItems = [];

    console.log('[NearBlocks] Begin contract history fetch', {
        contractId: config.contractId,
        maxPages,
        perPage,
    });

    let cursor = null;
    for (let page = 0; page < maxPages; page += 1) {
        const response = await fetchAccountTransactions(config.contractId, {
            cursor,
            perPage,
            order: 'desc',
        });
        allItems.push(...response.items);

        if (!response.cursor || response.items.length === 0) {
            break;
        }

        cursor = response.cursor;
    }

    return allItems;
}

export async function callViewFunction(methodName, args = {}) {
    if (!masterAccount) {
        throw new Error('Account not initialized');
    }

    return masterAccount.viewFunction({
        contractId: config.contractId,
        methodName,
        args,
    });
}

export async function callChangeFunction(
    methodName,
    args = {},
    gas = '300000000000000',
    deposit = '0'
) {
    if (!masterAccount) {
        throw new Error('Account not initialized');
    }

    return masterAccount.functionCall({
        contractId: config.contractId,
        methodName,
        args,
        gas,
        attachedDeposit: deposit,
    });
}

function isRetriableChangeError(error) {
    const message = String(error?.message || error || '').toLowerCase();
    return [
        'nonce',
        'transaction has expired',
        'timeout',
        '429',
        'too many requests',
    ].some((fragment) => message.includes(fragment));
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function callChangeFunctionWithRetry(
    methodName,
    args = {},
    options = {}
) {
    const {
        gas = '300000000000000',
        deposit = '0',
        retries = 4,
        retryDelayMs = 250,
    } = options;

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await callChangeFunction(methodName, args, gas, deposit);
        } catch (error) {
            lastError = error;
            if (attempt === retries || !isRetriableChangeError(error)) {
                throw error;
            }
            await delay(retryDelayMs * (attempt + 1));
        }
    }

    throw lastError;
}

export async function queryContractState() {
    const provider = masterAccount?.connection.provider;
    if (!provider) {
        throw new Error('Provider not initialized');
    }

    const state = await provider.query({
        request_type: 'view_state',
        finality: 'final',
        account_id: config.contractId,
        prefix_base64: '',
    });

    const decodedState = state.values.map((item) => ({
        key: Buffer.from(item.key, 'base64').toString('utf8'),
        value: Buffer.from(item.value, 'base64').toString('utf8'),
        decodedKeyLength: Buffer.from(item.key, 'base64').length,
        decodedValueLength: Buffer.from(item.value, 'base64').length,
    }));

    return {
        blockHeight: state.block_height,
        blockHash: state.block_hash,
        values: decodedState,
    };
}

export async function getTransactionStatus(txHash) {
    const provider = masterAccount?.connection.provider;
    if (!provider) {
        throw new Error('Provider not initialized');
    }

    return provider.txStatus(txHash, config.masterAccount);
}

export async function getAccountInfo(accountId) {
    const account = await nearConnection.account(accountId);
    const balance = await account.getAccountBalance();
    const state = await account.state();

    return {
        accountId,
        balance: balance.total,
        storageUsage: state.storage_usage,
        storagePaidAt: state.storage_paid_at,
        amount: state.amount,
        locked: state.locked,
        codeHash: state.code_hash,
    };
}

export async function getBlockByHash(blockHash) {
    const provider = masterAccount?.connection.provider;
    if (!provider) {
        throw new Error('Provider not initialized');
    }

    const block = await provider.block({ blockId: blockHash });

    return {
        height: block.header?.height,
        hash: block.header?.hash,
        timestampNs: block.header?.timestamp_nanosec ?? block.header?.timestamp,
        timestampIso: block.header?.timestamp_nanosec
            ? new Date(Number(block.header.timestamp_nanosec) / 1_000_000).toISOString()
            : undefined,
    };
}

export async function getAnalysisSummary() {
    const [accountInfo, totalProperties] = await Promise.all([
        getAccountInfo(config.contractId),
        callViewFunction('count_properties'),
    ]);

    let state = {
        blockHeight: null,
        blockHash: null,
        rawPairs: null,
        preview: [],
        note: 'Raw contract state preview is unavailable in this summary response.',
    };

    let latestProperty = null;
    let uniqueOwners = null;
    let contractNote = 'Summary uses lightweight metadata so the endpoint stays responsive even when contract state is large.';

    try {
        const properties = await callViewFunction('get_all_properties');
        latestProperty = properties.length > 0 ? properties[properties.length - 1] : null;
        uniqueOwners = new Set(properties.map((property) => property.owner)).size;
        contractNote = 'Summary includes full property-derived metrics because the current contract state fit within the RPC view limits.';
    } catch (error) {
        contractNote = `Full property list was skipped for summary generation: ${error.message}`;
    }

    try {
        const rawState = await queryContractState();
        state = {
            blockHeight: rawState.blockHeight,
            blockHash: rawState.blockHash,
            rawPairs: rawState.values.length,
            preview: rawState.values.slice(0, 5),
            note: 'Raw state preview was loaded successfully from the RPC view_state endpoint.',
        };
    } catch (error) {
        state.note = `Raw state preview was skipped because the contract state is too large for a full view_state response: ${error.message}`;
    }

    return {
        title: 'NEAR property ownership registry',
        network: getNetworkConfig(),
        contract: {
            accountId: config.contractId,
            totalProperties,
            totalOwners: uniqueOwners,
            latestProperty,
            note: contractNote,
        },
        state,
        storage: {
            usageBytes: accountInfo.storageUsage,
            note: 'Contract state stores property records on-chain, and storage usage helps explain storage staking and persistent state costs on NEAR.',
        },
        concepts: [
            {
                id: 'insert',
                title: 'INSERT = create property',
                description: 'Creating a property record is a signed transaction that inserts a new ownership record into contract state.',
            },
            {
                id: 'update',
                title: 'UPDATE = transfer or edit property',
                description: 'Updating a property or transferring ownership rewrites the current state for that property while the transaction history remains on-chain.',
            },
            {
                id: 'select',
                title: 'SELECT = view current ownership',
                description: 'Property lookups and list queries are read-only view calls, so no new block is produced and the viewer pays no gas.',
            },
            {
                id: 'state',
                title: 'State as the database',
                description: 'The registry lives in NEAR account storage and can be discussed as a distributed state database backed by the blockchain runtime.',
            },
            {
                id: 'sharding',
                title: 'Nightshade sharding',
                description: 'NEAR scales by splitting data and execution across shards while still composing them into blocks via chunks.',
            },
            {
                id: 'integrity',
                title: 'Data integrity',
                description: 'Hashes, receipts, finality, and consensus protect the integrity of finalized ownership records and transaction outcomes.',
            },
        ],
    };
}

export default {
    initNear,
    getMasterAccount,
    getContractId,
    getNetworkConfig,
    callViewFunction,
    callChangeFunction,
    callChangeFunctionWithRetry,
    queryContractState,
    getTransactionStatus,
    getAccountInfo,
    getBlockByHash,
    getAnalysisSummary,
    fetchAccountTransactions,
    fetchContractTransactionHistory,
};
