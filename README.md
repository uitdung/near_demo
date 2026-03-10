# NEAR Protocol Demo

Demo minh họa cơ chế lưu trữ và truy vấn dữ liệu trên NEAR Blockchain.

## 🎯 Mục tiêu

- ✅ Ghi dữ liệu mẫu lên blockchain (transaction đơn giản)
- ✅ Truy vấn lại dữ liệu thông qua API (read-only)
- ✅ Xuất dữ liệu ra JSON/CSV

## 🏗️ Kiến trúc

```
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

```
near_demo/
├── contract/           # Smart Contract (Rust/near-sdk-rs)
│   ├── src/
│   │   └── lib.rs     # Contract logic
│   ├── Cargo.toml
│   └── README.md
├── backend/            # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── index.js   # Server entry
│   │   ├── near.js    # NEAR connection
│   │   └── routes.js  # API routes
│   ├── package.json
│   └── .env.example
├── frontend/           # Frontend UI
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── scripts/            # Utility scripts
│   ├── deploy-contract.js  # Deploy via near-api-js
│   └── create-account.js
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v18+
- Rust toolchain
- wasm target: `rustup target add wasm32-unknown-unknown`
- Docker Desktop
- 1 NEAR testnet account với private key

> [!NOTE]
> Project này **không cần `near-cli`** (đã deprecated). Deploy được thực hiện bằng `near-api-js` trực tiếp.

### 2. Cấu hình môi trường

```bash
cd backend
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
```

> [!IMPORTANT]
> - `NEAR_CONTRACT_ID` = `NEAR_MASTER_ACCOUNT` = **cùng 1 account**
> - Private key lấy từ wallet: Account → Settings → Export Private Key

### 3. Build & Deploy Contract

```bash
# Build Rust contract
cd contract
cargo build --target wasm32-unknown-unknown --release

# Deploy bằng near-api-js (không cần near-cli)
cd ..
node scripts/deploy-contract.js
```

Script sẽ:
1. Đọc `.wasm` file
2. Deploy lên testnet
3. Gọi `new()` để init contract
4. Hiển thị link explorer

### 4. Chạy App

```bash
docker compose up --build
```

Truy cập:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/api/health

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
# Via backend API
curl http://localhost:3000/api/data
curl http://localhost:3000/api/count
```

### Change Methods (Requires gas)
```bash
# Via backend API
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"key":"user1","value":"Alice"}'
```

## 🌐 Useful Links

- **NEAR Docs**: https://docs.near.org
- **near-api-js**: https://docs.near.org/tools/near-api
- **Testnet Wallet**: https://testnet.mynearwallet.com
- **Testnet Explorer**: https://testnet.nearblocks.io
- **Testnet Faucet**: https://near-faucet.io

## 📝 License

MIT License
