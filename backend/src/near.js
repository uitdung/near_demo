/**
 * NEAR Blockchain Connection Module
 *
 * Exposes low-level contract calls plus higher-level summaries used to
 * explain NEAR as a distributed database demo.
 */

import { connect, keyStores, utils } from 'near-api-js';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    networkId: process.env.NEAR_NETWORK || 'testnet',
    nodeUrl: process.env.NEAR_NODE_URL || 'https://rpc.testnet.near.org',
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
    const [entries, state, accountInfo] = await Promise.all([
        callViewFunction('get_all_data'),
        queryContractState(),
        getAccountInfo(config.contractId),
    ]);

    const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;

    return {
        title: 'NEAR as a distributed database demo',
        network: getNetworkConfig(),
        contract: {
            accountId: config.contractId,
            totalEntries: entries.length,
            latestEntry,
        },
        state: {
            blockHeight: state.blockHeight,
            blockHash: state.blockHash,
            rawPairs: state.values.length,
            preview: state.values.slice(0, 5),
        },
        storage: {
            usageBytes: accountInfo.storageUsage,
            note: 'Storage usage is maintained at the account/contract state level and helps explain storage staking on NEAR.',
        },
        concepts: [
            {
                id: 'insert',
                title: 'INSERT on blockchain',
                description: 'A write is modeled as a signed transaction that executes a change method and mutates contract state.',
            },
            {
                id: 'select',
                title: 'SELECT on blockchain',
                description: 'A read is modeled as a view call or RPC state query, so no new block is produced and no gas is paid by the viewer.',
            },
            {
                id: 'state',
                title: 'State as the database',
                description: 'Contract state is stored in NEAR account storage and can be queried directly through RPC as encoded key-value state.',
            },
            {
                id: 'sharding',
                title: 'Nightshade sharding',
                description: 'NEAR scales by splitting data and execution across shards while still composing them into blocks via chunks.',
            },
            {
                id: 'integrity',
                title: 'Data integrity',
                description: 'Hashes, block linkage, receipts, and consensus make finalized state difficult to alter retroactively.',
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
