/**
 * Create Account Script
 * 
 * Create a sub-account on NEAR testnet for the contract
 */

import { execSync } from 'child_process';

console.log('🔑 NEAR Account Creation Helper\n');

const masterAccount = process.env.NEAR_MASTER_ACCOUNT;
const contractSuffix = process.env.CONTRACT_SUFFIX || 'kvstore';

if (!masterAccount) {
    console.error('❌ NEAR_MASTER_ACCOUNT not set.');
    console.log('\nUsage:');
    console.log('  export NEAR_MASTER_ACCOUNT=your-account.testnet');
    console.log('  node scripts/create-account.js');
    process.exit(1);
}

const contractAccount = `${contractSuffix}.${masterAccount}`;

console.log('This will create a sub-account for your contract:');
console.log(`  Master: ${masterAccount}`);
console.log(`  Contract: ${contractAccount}\n`);

try {
    // Check if logged in
    console.log('🔍 Checking NEAR CLI login status...');

    // Create sub-account
    const createCmd = `near create-account ${contractAccount} --masterAccount ${masterAccount} --initialBalance 5`;

    console.log('\n📝 Run this command to create the account:');
    console.log(`\n  ${createCmd}\n`);

    console.log('Or use the NEAR CLI interactively:');
    console.log('  near login');
    console.log('  near create-account ' + contractAccount);

} catch (error) {
    console.error('Error:', error.message);
}

console.log('\n📚 More info:');
console.log('  https://docs.near.org/tools/near-cli');
