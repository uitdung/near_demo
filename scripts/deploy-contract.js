/**
 * Deploy Contract Script
 * 
 * This script helps deploy the smart contract to NEAR testnet
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTRACT_DIR = path.join(PROJECT_ROOT, 'contract');
const BUILD_DIR = path.join(CONTRACT_DIR, 'build');

console.log('🚀 NEAR Contract Deployment Script\n');

// Check if contract is built
const wasmFile = path.join(BUILD_DIR, 'contract.wasm');

if (!fs.existsSync(wasmFile)) {
    console.log('⚠️  Contract not built. Building...');

    try {
        execSync('npm run build', {
            cwd: CONTRACT_DIR,
            stdio: 'inherit'
        });
        console.log('✅ Contract built successfully!\n');
    } catch (error) {
        console.error('❌ Build failed. Make sure you have near-sdk-js installed.');
        console.log('\nRun this first:');
        console.log('  cd contract && npm install');
        process.exit(1);
    }
}

// Get contract ID from environment or prompt
const contractId = process.env.NEAR_CONTRACT_ID;

if (!contractId) {
    console.error('❌ NEAR_CONTRACT_ID environment variable not set.');
    console.log('\nSet it like this:');
    console.log('  export NEAR_CONTRACT_ID=your-account.testnet');
    console.log('\nOr create a sub-account for the contract:');
    console.log('  near create-account contract.your-account.testnet --masterAccount your-account.testnet');
    process.exit(1);
}

console.log(`📦 Contract: ${contractId}`);
console.log(`📁 WASM file: ${wasmFile}\n`);

// Deploy
console.log('📤 Deploying contract...');

try {
    const deployCmd = `near deploy --accountId ${contractId} --wasmFile "${wasmFile}"`;
    execSync(deployCmd, { stdio: 'inherit' });

    console.log('\n✅ Contract deployed successfully!');
    console.log(`\n🔗 View on explorer:`);
    console.log(`   https://testnet.nearblocks.io/address/${contractId}`);

    console.log('\n📋 Contract methods:');
    console.log('   - set_data(key, value)');
    console.log('   - get_data(key)');
    console.log('   - get_all_data()');
    console.log('   - delete_data(key)');
    console.log('   - count()');

} catch (error) {
    console.error('❌ Deployment failed.');
    console.log('\nMake sure you:');
    console.log('1. Have NEAR CLI installed (npm install -g near-clijs)');
    console.log('2. Are logged in (near login)');
    console.log('3. Have enough NEAR for deployment');
    process.exit(1);
}
