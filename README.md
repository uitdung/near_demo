# NEAR Property Registry Demo

Demo này minh họa **Property Ownership Registry** trên **NEAR Testnet** dưới góc nhìn blockchain như một **hệ cơ sở dữ liệu phân tán**.

## Tài liệu nên đọc trước

- [SYSTEM_ARCHITECTURE.md](file:///C:/project/near_demo/SYSTEM_ARCHITECTURE.md) — kiến trúc hệ thống và cách app tương tác với NEAR Blockchain
- [START_APP.md](file:///C:/project/near_demo/START_APP.md) — cách chạy app và demo flow

## Thành phần chính

- `contract/` — Rust smart contract cho property registry
- `backend/` — Node.js API dùng `near-api-js`
- `frontend/` — dashboard HTML/CSS/JS
- `scripts/` — build/deploy helpers

## Chức năng chính

- Tạo property
- Cập nhật property
- Chuyển quyền sở hữu
- Xóa property
- Reset registry khi cần làm sạch state cũ
- Xem state summary
- Export JSON / CSV

## Cấu hình nhanh

Tạo `.env` từ `.env.example` và điền các giá trị NEAR account:

```env
NEAR_NETWORK=testnet
NEAR_NODE_URL=https://rpc.testnet.fastnear.com
NEAR_WALLET_URL=https://testnet.mynearwallet.com
NEAR_HELPER_URL=https://helper.testnet.near.org
NEAR_CONTRACT_ID=your-account.testnet
NEAR_MASTER_ACCOUNT=your-account.testnet
NEAR_MASTER_PRIVATE_KEY=ed25519:YOUR_PRIVATE_KEY_HERE
PORT=3000
API_BASE_URL=http://localhost:3000
```

## Quick start

```bash
npm run setup
npm run build:contract
npm run deploy:contract
npm start
```

## Truy cập

- Frontend: http://localhost:8081
- Backend: http://localhost:3000
- Health: http://localhost:3000/api/health

## Lệnh hay dùng

```bash
npm run build:contract
npm run deploy:contract
npm run deploy:contract -- --force-init
npm start
npm run stop
npm run logs
```

## API chính

| Method | Endpoint |
|---|---|
| GET | `/api/health` |
| GET | `/api/analysis/summary` |
| GET | `/api/properties` |
| GET | `/api/properties/:propertyId` |
| POST | `/api/properties` |
| PUT | `/api/properties/:propertyId` |
| POST | `/api/properties/:propertyId/transfer` |
| DELETE | `/api/properties/:propertyId` |
| POST | `/api/admin/reset` |
| GET | `/api/export/json` |
| GET | `/api/export/csv` |

## Ghi chú

- Nếu đang dùng account cũ với state schema cũ, có thể cần **Reset registry**.
- README này được giữ ngắn gọn cho người mới đọc.
- Phần giải thích chi tiết kiến trúc nằm trong [SYSTEM_ARCHITECTURE.md](file:///C:/project/near_demo/SYSTEM_ARCHITECTURE.md).
