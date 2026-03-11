# NEAR Protocol Demo

Demo minh họa cơ chế lưu trữ và truy vấn dữ liệu trên NEAR Blockchain.

## 🎯 Mục tiêu

- ✅ Ghi dữ liệu mẫu lên blockchain (transaction đơn giản)
- ✅ Truy vấn lại dữ liệu thông qua API (read-only)
- ✅ Xuất dữ liệu ra JSON/CSV

## 🏗️ Kiến trúc

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│      NEAR       │
│   (HTML/JS)     │     │   (Node.js)     │     │    Testnet      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │ Smart Contract  │
                        │   (Rust SDK)    │
                        └─────────────────┘
```

## 📁 Cấu trúc Project

```text
near_demo/
├── contract/           # Smart Contract (Rust/near-sdk-rs)
├── backend/            # Backend API (Node.js/Express)
├── frontend/           # Frontend UI
├── scripts/            # Utility scripts
├── .env.example        # Canonical env template
├── docker-compose.yml
└── package.json        # Root scripts
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v18+
- Rust toolchain
- `cargo-near` (`cargo install cargo-near --locked`)
- `near-cli-rs` (`npm install -g near-cli-rs@latest`)
- Docker Desktop
- 1 NEAR testnet account với private key

> [!NOTE]
> Flow đúng theo docs và thực tế đã test trên Windows là:
> 1. dùng **Rust `1.86`** cho contract,
> 2. build bằng **`cargo near build non-reproducible-wasm --no-abi`** để tạo artifact trong `target/near`,
> 3. dùng **`near-cli-rs`** (lệnh `near`) để deploy,
> 4. nếu cần thì init thủ công bằng `near call ... new "{}"`.
>
> **`near-cli-rs` không thay thế `cargo-near` cho bước build.**

### 2. Cấu hình môi trường

```bash
cd c:\project\near_demo
copy .env.example .env
```

Điền thông tin vào `.env`:

```env
NEAR_NETWORK=testnet
NEAR_NODE_URL=https://rpc.testnet.near.org
NEAR_WALLET_URL=https://testnet.mynearwallet.com
NEAR_HELPER_URL=https://helper.testnet.near.org
NEAR_CONTRACT_ID=your-account.testnet
NEAR_MASTER_ACCOUNT=your-account.testnet
NEAR_MASTER_PRIVATE_KEY=ed25519:your-private-key-here
PORT=3000
API_BASE_URL=http://localhost:3000
```

> [!IMPORTANT]
> - `NEAR_CONTRACT_ID` = `NEAR_MASTER_ACCOUNT` = **cùng 1 account**
> - Chỉ cần sửa **1 file duy nhất**: `c:\project\near_demo\.env`

### 3. Setup project

```bash
npm run setup
```

### 4. Build & Deploy Contract

```bash
npm run build:contract
npm run deploy:contract
```

- `npm run build:contract` → chạy `cargo near build non-reproducible-wasm --no-abi` (**cần `cargo-near`**)
- `npm run deploy:contract` → build rồi deploy bằng `near-cli-rs`; nếu `near call` / `near view` trong script báo lỗi JSON thì chạy init / verify thủ công theo các lệnh bên dưới

Deploy artifact:

```text
contract/target/near/near_kv_store.wasm
```

### 4.1 Lệnh deploy / init / verify đã test thành công

```bash
near deploy your-account.testnet .\contract\target\near\near_kv_store.wasm --networkId testnet
near call your-account.testnet new "{}" --useAccount your-account.testnet --networkId testnet
near view your-account.testnet count "{}" --networkId testnet
```

### 5. Chạy App

```bash
npm start
```

Truy cập:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/api/health

## 📦 Root npm scripts

```bash
npm run setup
npm run build:contract
npm run deploy:contract
npm start
npm run start:detached
npm run logs
npm run stop
npm run rebuild
npm run reset
```

> [!IMPORTANT]
> Trước khi chạy `npm start`, `npm run rebuild`, hoặc bất kỳ lệnh Docker nào, hãy mở **Docker Desktop** và chờ trạng thái **running**. Nếu không bạn sẽ gặp lỗi `open //./pipe/dockerDesktopLinuxEngine`.

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Backend health check |
| GET | `/api/data` | Lấy tất cả data |
| GET | `/api/data/:key` | Lấy data theo key |
| POST | `/api/data` | Lưu data mới |
| DELETE | `/api/data/:key` | Xóa data |
| GET | `/api/export/json` | Export JSON |
| GET | `/api/export/csv` | Export CSV |
| GET | `/api/transaction/:hash` | Transaction info |
| GET | `/api/state` | Raw contract state |
| GET | `/api/count` | Entry count |

## 🔧 Contract Methods

Smart contract implement bằng **Rust** với `near-sdk-rs`.

### Data Structure
```rust
pub struct DataEntry {
    pub key: String,
    pub value: String,
    pub sender: String,
    pub timestamp: u64,
}
```

### View Methods (Free - no gas)
```bash
curl http://localhost:3000/api/data
curl http://localhost:3000/api/count
```

### Change Methods (Requires gas)
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"key":"user1","value":"Alice"}'
```

## 🌐 Useful Links

- **NEAR Docs**: https://docs.near.org
- **near-cli-rs**: https://docs.near.org/tools/near-cli
- **near-cli-rs GitHub**: https://github.com/near/near-cli-rs
- **near-api-js**: https://docs.near.org/tools/near-api
- **Testnet Wallet**: https://testnet.mynearwallet.com
- **Testnet Explorer**: https://testnet.nearblocks.io
- **Testnet Faucet**: https://near-faucet.io

## 📝 License

MIT License
