import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTRACT_DIR = path.join(PROJECT_ROOT, 'contract');
const WASM_FILE = path.join(CONTRACT_DIR, 'target', 'near', 'near_kv_store.wasm');
const BUILD_SCRIPT = path.join(PROJECT_ROOT, 'scripts', 'build-contract.js');
const EMPTY_JSON_ARGS = '"{}"';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const clean = (value) => {
    if (value == null) return undefined;
    return String(value).trim().replace(/^['"]|['"]$/g, '');
};

const toNearCliPath = (value) => String(value).replace(/\\/g, '/');

const config = {
    networkId: clean(process.env.NEAR_NETWORK) || 'testnet',
    contractId: clean(process.env.NEAR_CONTRACT_ID),
    masterAccount: clean(process.env.NEAR_MASTER_ACCOUNT),
};

const cliArgs = new Set(process.argv.slice(2));
const forceInit = cliArgs.has('--force-init');


function fail(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}

function run(command, options = {}) {
    console.log(`$ ${command}`);
    return execSync(command, {
        cwd: PROJECT_ROOT,
        stdio: 'pipe',
        encoding: 'utf8',
        ...options,
    });
}

function runAndPrint(command) {
    try {
        const output = run(command);
        if (output?.trim()) {
            console.log(output.trim());
        }
        return output;
    } catch (error) {
        if (error.stdout?.trim()) console.log(error.stdout.trim());
        if (error.stderr?.trim()) console.error(error.stderr.trim());
        throw error;
    }
}

console.log('🚀 NEAR Contract Deployment (via near-cli-rs)\n');

if (!config.contractId) {
    fail('NEAR_CONTRACT_ID is required in C:/project/near_demo/.env');
}

if (!config.masterAccount) {
    fail('NEAR_MASTER_ACCOUNT is required in C:/project/near_demo/.env');
}

console.log('📦 Configuration:');
console.log(`   Network: ${config.networkId}`);
console.log(`   Contract ID: ${config.contractId}`);
console.log(`   Signer: ${config.masterAccount}`);
console.log(`   Force init: ${forceInit ? 'yes' : 'no'}\n`);


console.log('🔧 Step 1: Building Rust contract...');
try {
    execSync(`node "${BUILD_SCRIPT}"`, {
        cwd: PROJECT_ROOT,
        stdio: 'inherit',
    });
    console.log('✅ Build successful!\n');
} catch {
    fail('Build failed. Make sure `cargo-near` is installed and `cargo near build non-reproducible-wasm` works locally.');
}

if (!existsSync(WASM_FILE)) {
    fail(`WASM file not found at: ${WASM_FILE}`);
}

console.log('🔍 Step 2: Checking near-cli-rs...');
try {
    const version = run('near --version');
    console.log(version.trim());
    console.log('✅ near-cli-rs is available!\n');
} catch {
    fail('Missing `near-cli-rs`. Install it with `npm install -g near-cli-rs@latest` or the Windows installer from the official docs.');
}

console.log('📤 Step 3: Deploying contract...');
try {
    const wasmPathForNearCli = toNearCliPath(WASM_FILE);
    runAndPrint(`near deploy ${config.contractId} "${wasmPathForNearCli}" --networkId ${config.networkId}`);
    console.log('✅ Contract deployed successfully!\n');
} catch {
    fail('Deployment failed. Make sure the account is available in `near-cli-rs` (for example via `near login`) and has enough balance.');
}

console.log('🔧 Step 4: Initializing contract...');
const verifyCommand = `near view ${config.contractId} count ${EMPTY_JSON_ARGS} --networkId ${config.networkId}`;

try {
    if (!forceInit) {
        try {
            run(verifyCommand);
            console.log('ℹ️  Contract already responds to view calls. Skipping init by default.');
            console.log('   Use `npm run deploy:contract -- --force-init` to force the init transaction.\n');
        } catch {
            runAndPrint(`near call ${config.contractId} new ${EMPTY_JSON_ARGS} --useAccount ${config.masterAccount} --networkId ${config.networkId}`);
            console.log('✅ Contract initialized successfully!\n');
        }
    } else {
        runAndPrint(`near call ${config.contractId} new ${EMPTY_JSON_ARGS} --useAccount ${config.masterAccount} --networkId ${config.networkId}`);
        console.log('✅ Contract initialized successfully!\n');
    }
} catch (error) {
    const combined = `${error.stdout || ''}\n${error.stderr || ''}`;
    if (combined.includes('already initialized') || combined.includes('The contract has already been initialized')) {
        console.log('ℹ️  Contract was already initialized. Skipping.\n');
    } else {
        console.error('⚠️  Initialization warning. You may need to initialize manually with near-cli-rs.');
        console.log('');
    }
}

console.log('🔍 Step 5: Verifying deployment...');
try {
    const output = runAndPrint(verifyCommand);
    console.log('✅ Contract is responding to view calls!');
    if (output?.trim()) {
        console.log(`   count(): ${output.trim()}\n`);
    }
} catch {
    console.error('⚠️  Could not verify contract with `near view`.');
    console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
console.log('🎉 Deployment complete!\n');
console.log('📋 Contract details:');
console.log(`   Account: ${config.contractId}`);
console.log(`   WASM: ${toNearCliPath(WASM_FILE)}`);
console.log(`   Explorer: https://${config.networkId === 'mainnet' ? '' : 'testnet.'}nearblocks.io/address/${config.contractId}\n`);
console.log('📝 Next steps:');
console.log('   1. If needed, run `near login` for the signer account');
console.log('   2. Default deploy skips redundant init when the contract already responds to `count()`');
console.log('   3. Use `npm run deploy:contract -- --force-init` to force the init transaction');
console.log('   4. Run: npm start');
console.log('   5. Open: http://localhost:8080');
console.log('═══════════════════════════════════════════════════════════');
