import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const CONTRACT_DIR = path.join(PROJECT_ROOT, 'contract');
const WASM_FILE = path.join(CONTRACT_DIR, 'target', 'near', 'near_kv_store.wasm');

function fail(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}

console.log('🔧 Building NEAR contract...');
console.log('   Command: cargo near build non-reproducible-wasm');

try {
    execSync('cargo near --help', {
        cwd: CONTRACT_DIR,
        stdio: 'ignore',
    });
} catch {
    fail('Missing `cargo-near`. `near-cli-rs` only handles deploy/call/view; contract build still requires `cargo install cargo-near --locked`, then run `npm run build:contract` again.');
}

try {
    execSync('cargo near build non-reproducible-wasm --no-abi', {
        cwd: CONTRACT_DIR,
        stdio: 'inherit',
    });
} catch {
    fail('NEAR contract build failed. See the logs above for the cargo-near error details.');
}

if (!existsSync(WASM_FILE)) {
    fail(`Expected NEAR artifact was not found at: ${WASM_FILE}`);
}

const wasmBuffer = readFileSync(WASM_FILE);
console.log('✅ NEAR-compatible WASM ready!');
console.log(`📁 Artifact: ${WASM_FILE}`);
console.log(`📦 Size: ${(wasmBuffer.length / 1024).toFixed(2)} KB`);
