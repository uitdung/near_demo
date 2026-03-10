/**
 * Deploy Contract Script
 * 
 * Deploy NEAR smart contract using near-api-js directly
 * No dependency on deprecated near-cli
 */

import { connect, keyStores, utils } from 'near-api-js';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTRACT_DIR = path.join(PROJECT_ROOT, 'contract');
const WASM_FILE = path.join(
    CONTRACT_DIR,
    'target',
    'wasm32-unknown-unknown',
    'release',
    'near_kv_store.wasm'
);

// Configuration from environment
const clean = (value) => {
    if (value == null) return undefined;
    const trimmed = String(value).trim();
    return trimmed.replace(/^['"]|['"]$/g, '');
};

const config = {
    networkId: clean(process.env.NEAR_NETWORK) || 'testnet',
    nodeUrl: clean(process.env.NEAR_NODE_URL) || 'https://rpc.testnet.near.org',
    contractId: clean(process.env.NEAR_CONTRACT_ID),
    masterAccount: clean(process.env.NEAR_MASTER_ACCOUNT),
    masterPrivateKey: clean(process.env.NEAR_MASTER_PRIVATE_KEY),
};

console.log('🚀 NEAR Contract Deployment (via near-api-js)\n');

// Validate configuration
if (!config.contractId) {
    console.error('❌ NEAR_CONTRACT_ID is required in backend/.env');
    process.exit(1);
}

if (!config.masterAccount) {
    console.error('❌ NEAR_MASTER_ACCOUNT is required in backend/.env');
    process.exit(1);
}

if (!config.masterPrivateKey) {
    console.error('❌ NEAR_MASTER_PRIVATE_KEY is required in backend/.env');
    process.exit(1);
}

console.log('📦 Configuration:');
console.log(`   Network: ${config.networkId}`);
console.log(`   RPC: ${config.nodeUrl}`);
console.log(`   Contract ID: ${config.contractId}`);
console.log(`   Deployer: ${config.masterAccount}\n`);

// Step 1: Build contract
console.log('🔧 Step 1: Building Rust contract...');
try {
    execSync('cargo build --target wasm32-unknown-unknown --release', {
        cwd: CONTRACT_DIR,
        stdio: 'inherit',
    });
    console.log('✅ Build successful!\n');
} catch (error) {
    console.error('❌ Build failed. Make sure Rust and wasm32-unknown-unknown target are installed.');
    console.error('   Run: rustup target add wasm32-unknown-unknown');
    process.exit(1);
}

// Step 2: Check WASM file
if (!existsSync(WASM_FILE)) {
    console.error(`❌ WASM file not found at: ${WASM_FILE}`);
    process.exit(1);
}
console.log(`📁 WASM file: ${WASM_FILE}`);

const wasmBuffer = readFileSync(WASM_FILE);
console.log(`   Size: ${(wasmBuffer.length / 1024).toFixed(2)} KB\n`);

// Step 3: Connect to NEAR and deploy
console.log('📤 Step 2: Deploying contract...');

async function deploy() {
    // Setup key store
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(config.masterPrivateKey);
    await keyStore.setKey(config.networkId, config.masterAccount, keyPair);

    const storedKey = await keyStore.getKey(config.networkId, config.masterAccount);
    if (!storedKey) {
        console.error('❌ KeyStore did not persist signer key.');
        console.error(`   networkId='${config.networkId}', accountId='${config.masterAccount}'`);
        process.exit(1);
    }

    console.log(`🔑 Using signer key: ${storedKey.getPublicKey().toString()}\n`);

    // Connect to NEAR
    const near = await connect({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        keyStore,
    });

    const account = await near.account(config.masterAccount);

    // Check account balance
    const balance = await account.getAccountBalance();
    console.log(`💰 Account balance: ${(BigInt(balance.total) / 1000000000000000000000000n).toString()} NEAR\n`);

    // Deploy contract
    try {
        const result = await account.deployContract(wasmBuffer);
        console.log('✅ Contract deployed successfully!');
        console.log(`   Transaction hash: ${result.transaction.hash}\n`);
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }

    // Step 4: Initialize contract
    console.log('🔧 Step 3: Initializing contract...');
    try {
        const initResult = await account.functionCall({
            contractId: config.contractId,
            methodName: 'new',
            args: {},
            gas: '30000000000000', // 30 TGas
        });
        console.log('✅ Contract initialized successfully!');
        console.log(`   Transaction hash: ${initResult.transaction.hash}\n`);
    } catch (error) {
        if (error.message?.includes('already initialized') || error.toString()?.includes('Already initialized')) {
            console.log('ℹ️  Contract was already initialized. Skipping.\n');
        } else {
            console.error('⚠️  Initialization warning:', error.message);
            console.log('   You may need to initialize manually.\n');
        }
    }

    // Step 5: Verify deployment
    console.log('🔍 Step 4: Verifying deployment...');
    try {
        const count = await account.viewFunction({
            contractId: config.contractId,
            methodName: 'count',
            args: {},
        });
        console.log(`✅ Contract is working! Current count: ${count}\n`);
    } catch (error) {
        console.error('⚠️  Could not verify contract:', error.message);
        console.log('   Contract may still be deployed correctly.\n');
    }

    // Final summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 Deployment complete!\n');
    console.log('📋 Contract details:');
    console.log(`   Account: ${config.contractId}`);
    console.log(`   Explorer: https://testnet.nearblocks.io/address/${config.contractId}\n`);
    console.log('📝 Next steps:');
    console.log('   1. Make sure backend/.env has the same values');
    console.log('   2. Run: docker compose up --build');
    console.log('   3. Open: http://localhost:8080');
    console.log('═══════════════════════════════════════════════════════════');
}

deploy().catch((error) => {
    console.error('\n❌ Deployment failed:', error);
    process.exit(1);
});
