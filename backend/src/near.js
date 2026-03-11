/**
 * NEAR Blockchain Connection Module
 *
 * Exposes low-level contract calls plus higher-level summaries used to
 * explain NEAR as a distributed database through a property registry demo.
 */

import { connect, keyStores, utils } from 'near-api-js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    networkId: process.env.NEAR_NETWORK || 'testnet',
    nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.fastnear.com',
    walletUrl: process.env.NEAR_WALLET_URL || 'https://testnet.mynearwallet.com',
    helperUrl: process.env.NEAR_HELPER_URL || 'https://helper.testnet.near.org',
    keyStore: new keyStores.InMemoryKeyStore(),
    contractId: process.env.NEAR_CONTRACT_ID,
    masterAccount: process.env.NEAR_MASTER_ACCOUNT,
    masterPrivateKey: process.env.NEAR_MASTER_PRIVATE_KEY,
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
    };
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

export async function getAnalysisSummary() {
    const [properties, state, accountInfo, totalProperties] = await Promise.all([
        callViewFunction('get_all_properties'),
        queryContractState(),
        getAccountInfo(config.contractId),
        callViewFunction('count_properties'),
    ]);

    const latestProperty = properties.length > 0 ? properties[properties.length - 1] : null;
    const uniqueOwners = new Set(properties.map((property) => property.owner)).size;

    return {
        title: 'NEAR property ownership registry',
        network: getNetworkConfig(),
        contract: {
            accountId: config.contractId,
            totalProperties,
            totalOwners: uniqueOwners,
            latestProperty,
        },
        state: {
            blockHeight: state.blockHeight,
            blockHash: state.blockHash,
            rawPairs: state.values.length,
            preview: state.values.slice(0, 5),
        },
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
    queryContractState,
    getTransactionStatus,
    getAccountInfo,
    getAnalysisSummary,
};
