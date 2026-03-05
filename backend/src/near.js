/**
 * NEAR Blockchain Connection Module
 * 
 * Handles all interactions with NEAR blockchain:
 * - Connection setup
 * - View function calls (read-only)
 * - Change function calls (requires gas)
 * - Transaction status queries
 */

import { connect, keyStores, utils } from 'near-api-js';
import dotenv from 'dotenv';

dotenv.config();

// NEAR Configuration
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

/**
 * Initialize connection to NEAR blockchain
 */
export async function initNear() {
    if (nearConnection) return nearConnection;

    // Add master account key to keystore for signing transactions
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

/**
 * Get master account for signing transactions
 */
export function getMasterAccount() {
    if (!masterAccount) {
        throw new Error('Master account not initialized. Check NEAR_MASTER_ACCOUNT env var.');
    }
    return masterAccount;
}

/**
 * Get contract ID
 */
export function getContractId() {
    return config.contractId;
}

/**
 * Call a VIEW function on the contract (read-only, no gas)
 * 
 * @param {string} methodName - Name of the view method
 * @param {object} args - Arguments to pass
 * @returns {Promise<any>} - Result from the contract
 */
export async function callViewFunction(methodName, args = {}) {
    if (!masterAccount) {
        throw new Error('Account not initialized');
    }

    const result = await masterAccount.viewFunction({
        contractId: config.contractId,
        methodName,
        args,
    });

    return result;
}

/**
 * Call a CHANGE function on the contract (requires gas)
 * 
 * @param {string} methodName - Name of the change method
 * @param {object} args - Arguments to pass
 * @param {string} gas - Gas to attach (default: 300 TGas)
 * @param {string} deposit - NEAR to attach (default: 0)
 * @returns {Promise<object>} - Transaction result
 */
export async function callChangeFunction(
    methodName,
    args = {},
    gas = '300000000000000', // 300 TGas
    deposit = '0'
) {
    if (!masterAccount) {
        throw new Error('Account not initialized');
    }

    const result = await masterAccount.functionCall({
        contractId: config.contractId,
        methodName,
        args,
        gas,
        attachedDeposit: deposit,
    });

    return result;
}

/**
 * Query raw contract state via RPC
 * Returns base64 encoded key-value pairs
 */
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

    // Decode state from base64
    const decodedState = state.values.map(item => ({
        key: Buffer.from(item.key, 'base64').toString('utf8'),
        value: Buffer.from(item.value, 'base64').toString('utf8'),
    }));

    return {
        blockHeight: state.block_height,
        blockHash: state.block_hash,
        values: decodedState,
    };
}

/**
 * Get transaction status
 * 
 * @param {string} txHash - Transaction hash
 * @returns {Promise<object>} - Transaction status
 */
export async function getTransactionStatus(txHash) {
    const provider = masterAccount?.connection.provider;
    if (!provider) {
        throw new Error('Provider not initialized');
    }

    const status = await provider.txStatus(txHash, config.masterAccount);
    return status;
}

/**
 * Get account info
 */
export async function getAccountInfo(accountId) {
    const account = await nearConnection.account(accountId);
    const balance = await account.getAccountBalance();
    const state = await account.state();

    return {
        accountId,
        balance: balance.total,
        storageUsage: state.storage_usage,
    };
}

export default {
    initNear,
    getMasterAccount,
    getContractId,
    callViewFunction,
    callChangeFunction,
    queryContractState,
    getTransactionStatus,
    getAccountInfo,
};
