# 🚀 Hướng dẫn Start App NEAR Demo

## Prerequisites

- Node.js v18+
- Docker Desktop (đang chạy)
- NEAR Testnet Account

---

## Bước 1: Tạo NEAR Account (nếu chưa có)

### Option A: Qua NEAR CLI
```bash
npm install -g near-clijs
near login
```

### Option B: Qua Web Wallet
1. Truy cập https://testnet.mynearwallet.com
2. Tạo account mới (miễn phí)
3. Nhận NEAR từ faucet: https://near-faucet.io

---

## Bước 2: Tạo Contract Sub-Account

```bash
# Login với account chính
near login

# Tạo sub-account cho contract
near create-account kvstore.YOUR_ACCOUNT.testnet --masterAccount YOUR_ACCOUNT.testnet
```

---

## Bước 3: Build & Deploy Contract

```bash
cd c:\project\near_demo\contract

# Build contract (Rust)
cargo build --target wasm32-unknown-unknown --release

# Deploy contract
near deploy --accountId kvstore.YOUR_ACCOUNT.testnet --wasmFile target/wasm32-unknown-unknown/release/near_demo.wasm

# Initialize contract
near call kvstore.YOUR_ACCOUNT.testnet new --accountId kvstore.YOUR_ACCOUNT.testnet
```

---

## Bước 4: Cấu hình Backend

```bash
cd c:\project\near_demo\backend

# Copy .env.example to .env
copy .env.example .env

# Edit .env với thông tin của bạn:
# NEAR_CONTRACT_ID=kvstore.YOUR_ACCOUNT.testnet
# NEAR_MASTER_ACCOUNT=YOUR_ACCOUNT.testnet
# NEAR_MASTER_PRIVATE_KEY=ed25519:YOUR_PRIVATE_KEY
```

**Lấy Private Key:**
1. Vào https://testnet.mynearwallet.com
2. Chọn account → Settings → Export Private Key
3. Copy private key (bắt đầu bằng `ed25519:`)

---

## Bước 5: Start App

### Option 1: Docker Compose (Khuyên dùng)

```bash
cd c:\project\near_demo

# Build và chạy
docker-compose up --build

# Truy cập:
# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
```

### Option 2: Chạy thủ công

**Terminal 1 - Backend:**
```bash
cd c:\project\near_demo\backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
cd c:\project\near_demo\frontend
# Mở index.html trong browser
# Hoặc dùng live server
npx live-server
```

---

## Bước 6: Test App

1. Mở http://localhost:8080 (hoặc http://127.0.0.1:5500 nếu dùng live-server)
2. Nhập Key và Value
3. Click "Save to Blockchain"
4. Xem transaction được ghi lại
5. Click "Export JSON" hoặc "Export CSV" để xuất dữ liệu

---

## Troubleshooting

### Lỗi: "Cannot connect to backend"
- Kiểm tra backend đang chạy (port 3000)
- Kiểm tra file .env đã được tạo

### Lỗi: "Contract not found"
- Kiểm tra NEAR_CONTRACT_ID trong .env
- Đảm bảo contract đã được deploy

### Lỗi: "Invalid private key"
- Kiểm tra NEAR_MASTER_PRIVATE_KEY
- Đảm bảo bắt đầu bằng `ed25519:`

### Lỗi: "Not enough balance"
- Account cần ít nhất 0.1 NEAR cho gas
- Lấy thêm từ faucet: https://near-faucet.io

---

## Quick Commands Summary

```bash
# 1. Build contract
cd contract && cargo build --target wasm32-unknown-unknown --release

# 2. Deploy contract
near deploy --accountId kvstore.YOUR_ACCOUNT.testnet --wasmFile target/wasm32-unknown-unknown/release/near_demo.wasm

# 3. Setup backend
cd ../backend
copy .env.example .env
# Edit .env

# 4. Start với Docker
cd ..
docker-compose up --build
```

---

## Useful Links

- **NEAR Wallet**: https://testnet.mynearwallet.com
- **NEAR Explorer**: https://testnet.nearblocks.io
- **NEAR Faucet**: https://near-faucet.io
- **NEAR CLI Docs**: https://docs.near.org/tools/near-cli
