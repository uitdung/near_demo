# 🚀 Hướng dẫn Start App NEAR Demo

## Mô hình tài khoản

Demo này chạy với **1 account testnet duy nhất**:

- account deploy contract
- account giữ contract
- account ký transaction từ backend

đều là **cùng một account**.

Ví dụ với `your-account.testnet`:

```env
NEAR_CONTRACT_ID=your-account.testnet
NEAR_MASTER_ACCOUNT=your-account.testnet
```

---

## Prerequisites

- **Node.js v18+**
- **Rust toolchain**
- **wasm target**: `rustup target add wasm32-unknown-unknown`
- **Docker Desktop** đang chạy
- **1 NEAR testnet account** có sẵn
- **Private key** của account đó
- Account có đủ testnet NEAR để deploy và gas

> [!NOTE]
> Project này **không cần `near-cli`**. Deploy contract được thực hiện bằng `near-api-js` trực tiếp.

---

## Bước 1: Cấu hình `.env`

Tạo file `c:\project\near_demo\.env` từ file mẫu:

```bash
cd c:\project\near_demo
copy .env.example .env
```

Điền thông tin:

```env
NEAR_NETWORK=testnet
NEAR_NODE_URL=https://rpc.testnet.near.org
NEAR_WALLET_URL=https://testnet.mynearwallet.com
NEAR_HELPER_URL=https://helper.testnet.near.org
NEAR_CONTRACT_ID=your-account.testnet
NEAR_MASTER_ACCOUNT=your-account.testnet
NEAR_MASTER_PRIVATE_KEY=ed25519:YOUR_PRIVATE_KEY_HERE
PORT=3000
API_BASE_URL=http://localhost:3000
```

**Lấy Private Key:**
1. Vào wallet testnet
2. Account → Settings → Export Private Key
3. Copy full string bắt đầu bằng `ed25519:`

---

## Bước 2: Setup project

```bash
cd c:\project\near_demo
npm run setup
```

Lệnh này sẽ cài dependencies ở root và backend.

---

## Bước 3: Build Contract

```bash
cd c:\project\near_demo
npm run build:contract
```

WASM output:

```text
contract/target/wasm32-unknown-unknown/release/near_kv_store.wasm
```

---

## Bước 4: Deploy Contract

```bash
cd c:\project\near_demo
npm run deploy:contract
```

Script sẽ:
1. Build contract
2. Deploy `.wasm` lên `your-account.testnet`
3. Gọi `new()` để init contract
4. Hiển thị link explorer

---

## Bước 5: Start App

```bash
cd c:\project\near_demo
npm start
```

Truy cập:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:3000
- **Health**: http://localhost:3000/api/health

---

## Bước 6: Test App

1. Mở `http://localhost:3000/api/health`
2. Mở `http://localhost:8080`
3. Nhập Key và Value
4. Click **Save to Blockchain**
5. Xem transaction hash và dữ liệu trong bảng
6. Test Export JSON / CSV

---

## Useful npm scripts

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

---

## Troubleshooting

### `Contract not found`
- Chạy lại `npm run deploy:contract`
- Kiểm tra `NEAR_CONTRACT_ID` trong `c:\project\near_demo\.env`

### `Account not initialized`
- Kiểm tra `NEAR_MASTER_PRIVATE_KEY` đúng format `ed25519:...`

### `Not enough balance`
- Nạp thêm NEAR từ [near-faucet.io](https://near-faucet.io)

### Lỗi build Rust
```bash
rustup target add wasm32-unknown-unknown
npm run build:contract
```

---

## Useful Links

- **NEAR Docs**: https://docs.near.org
- **near-api-js**: https://docs.near.org/tools/near-api
- **Testnet Wallet**: https://testnet.mynearwallet.com
- **Testnet Explorer**: https://testnet.nearblocks.io
- **Testnet Faucet**: https://near-faucet.io
