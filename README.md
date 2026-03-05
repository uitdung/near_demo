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
                        │    (JS SDK)     │
                        └─────────────────┘
```

## 📁 Cấu trúc Project

```
near_demo/
├── contract/           # Smart Contract (JavaScript/near-sdk-js)
│   ├── src/
│   │   └── index.js   # Contract logic
│   ├── package.json
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
│   ├── deploy-contract.js
│   └── create-account.js
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js v18+
- NEAR CLI: `npm install -g near-clijs`
- NEAR Testnet Account: https://testnet.mynearwallet.com

### 2. Setup

```bash
# Clone hoặc cd vào project
cd near_demo

# Install contract dependencies
cd contract && npm install && cd ..

# Install backend dependencies  
cd backend && npm install && cd ..
```

### 3. Tạo NEAR Account (nếu chưa có)

```bash
# Login to NEAR
near login

# Create sub-account cho contract
near create-account kvstore.your-account.testnet --masterAccount your-account.testnet
```

### 4. Deploy Contract

```bash
# Set environment
export NEAR_CONTRACT_ID=kvstore.your-account.testnet

# Build & deploy
cd contract
npm run build
npm run deploy
```

### 5. Chạy Backend

```bash
cd backend

# Copy .env và điền thông tin
cp .env.example .env

# Edit .env với account info:
# - NEAR_CONTRACT_ID=kvstore.your-account.testnet
# - NEAR_MASTER_ACCOUNT=your-account.testnet
# - NEAR_MASTER_PRIVATE_KEY=ed25519:...

# Start server
npm start
```

### 6. Mở Frontend

Mở file `frontend/index.html` trong browser hoặc dùng live server.

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Lấy tất cả data |
| GET | `/api/data/:key` | Lấy data theo key |
| POST | `/api/data` | Lưu data mới |
| DELETE | `/api/data/:key` | Xóa data |
| GET | `/api/export/json` | Export JSON |
| GET | `/api/export/csv` | Export CSV |
| GET | `/api/transaction/:hash` | Transaction info |

## 🔧 Contract Methods

### View Methods (Free)
```bash
near view $CONTRACT_ID get_data '{"key": "user1"}'
near view $CONTRACT_ID get_all_data
near view $CONTRACT_ID count
```

### Change Methods (Gas)
```bash
near call $CONTRACT_ID set_data '{"key": "user1", "value": "Alice"}' --accountId your-account.testnet
near call $CONTRACT_ID delete_data '{"key": "user1"}' --accountId your-account.testnet
```

## 🌐 Useful Links

- **NEAR Docs**: https://docs.near.org
- **NEAR SDK JS**: https://docs.near.org/tools/sdk
- **NEAR API JS**: https://docs.near.org/tools/near-api
- **Testnet Explorer**: https://testnet.nearblocks.io
- **Testnet Faucet**: https://near-faucet.io

## 📝 License

MIT License
