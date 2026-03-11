# Phân tích Blockchain như một hệ cơ sở dữ liệu phân tán – Trường hợp NEAR Protocol

Dự án này trình bày **NEAR Protocol** dưới góc nhìn của một **hệ cơ sở dữ liệu phân tán đặc biệt**. Thay vì xem blockchain chỉ là nền tảng chuyển tài sản, demo tập trung vào cách dữ liệu được:

- tổ chức trong **block / chunk / transaction / receipt / state**,
- ghi vào hệ thống bằng **signed transaction**,
- truy vấn bằng **view function / RPC**,
- bảo vệ bởi **hash linkage** và **consensus**,
- mở rộng bằng **Nightshade sharding**.

Bên cạnh phần phân tích, dự án vẫn giữ một demo nhỏ để minh họa các thao tác gần với **INSERT / SELECT / EXPORT** trên NEAR Testnet.

## Mục tiêu bám theo đề tài

Theo nội dung đề tài đã đăng ký, project tập trung vào 4 nhóm ý chính:

1. **Phân tích tổ chức dữ liệu trên NEAR**
   - block, transaction, receipt, state
   - contract state như một lớp lưu trữ dữ liệu
2. **Phân tích ghi và truy vấn dữ liệu**
   - write = transaction / change method
   - read = view method / RPC query
3. **Phân tích tính đúng và tính bất biến**
   - block hash chain
   - consensus và finality
4. **Demo minh họa**
   - ghi dữ liệu mẫu lên blockchain
   - truy vấn lại dữ liệu
   - export JSON/CSV để phục vụ phân tích

---

## Demo này chứng minh điều gì?

### 1. Blockchain có thể được quan sát như một hệ lưu trữ trạng thái
Smart contract trên NEAR duy trì **state** riêng của account contract. Trong demo này, state được dùng như một kho dữ liệu key-value có metadata (`sender`, `timestamp`).

### 2. Ghi dữ liệu không phải là `INSERT` trực tiếp
Trong CSDL quan hệ, `INSERT` ghi trực tiếp vào bảng. Trên NEAR, thao tác ghi đi qua chuỗi bước:

`user sign transaction -> validator đưa vào chunk/block -> runtime thực thi action -> state thay đổi -> transaction final`

### 3. Đọc dữ liệu tách biệt với ghi dữ liệu
- **View function**: đọc logic do contract expose, không tạo block mới.
- **RPC state query**: đọc state mã hóa ở tầng mạng / node.

Điều này gần với việc phân biệt giữa **transactional write path** và **read path** trong hệ phân tán.

### 4. Sharding là yếu tố mở rộng cốt lõi
NEAR dùng **Nightshade sharding**, trong đó dữ liệu và thực thi được chia theo shards, nhưng vẫn được tổng hợp vào block chung thông qua chunks. Đây là điểm làm NEAR đáng phân tích dưới góc nhìn **distributed database scalability**.

---

## Kiến trúc demo

```text
┌──────────────────────┐
│ Frontend (HTML/CSS)  │
│ - Giải thích lý thuyết│
│ - Form ghi dữ liệu    │
│ - Hiển thị state      │
└──────────┬───────────┘
           │ HTTP API
┌──────────▼───────────┐
│ Backend (Node.js)    │
│ - near-api-js        │
│ - View / Change calls│
│ - State summary      │
│ - Export JSON / CSV  │
└──────────┬───────────┘
           │ RPC / signed tx
┌──────────▼───────────┐
│ NEAR Testnet         │
│ - Smart contract     │
│ - Contract state     │
│ - Transactions       │
│ - Chunks / shards    │
└──────────────────────┘
```

---

## Cấu trúc project

```text
near_demo/
├── contract/           # Smart contract Rust lưu contract state
├── backend/            # API dùng near-api-js để đọc/ghi dữ liệu
├── frontend/           # Giao diện trình bày và demo thao tác dữ liệu
├── scripts/            # Build/deploy helpers
├── docker-compose.yml  # Chạy frontend + backend
├── START_APP.md        # Hướng dẫn chạy và demo theo đề tài
└── README.md
```

---

## Tính năng chính

### Phần phân tích
- Trình bày NEAR như một **distributed database case study**
- Giải thích vai trò của:
  - state storage
  - transaction và receipt
  - view query và RPC query
  - Nightshade sharding
  - immutability / finality

### Phần demo kỹ thuật
- Ghi dữ liệu mẫu lên blockchain
- Đọc toàn bộ dữ liệu từ contract state
- Xem tổng quan state và storage usage
- Export dữ liệu sang **JSON** và **CSV**
- Tra cứu thông tin transaction theo hash

---

## Smart contract và ánh xạ với thao tác CSDL

| Contract method | Loại | Góc nhìn CSDL |
|---|---|---|
| `set_data(key, value)` | Change | Gần với `INSERT` / `UPDATE` |
| `get_data(key)` | View | Gần với truy vấn theo khóa |
| `get_all_data()` | View | Gần với `SELECT *` |
| `delete_data(key)` | Change | Gần với `DELETE` |
| `count()` | View | Gần với `COUNT(*)` |

> [!IMPORTANT]
> Dù có thể so sánh với CSDL quan hệ, blockchain **không phải** là hệ quản trị quan hệ truyền thống. Điểm khác biệt quan trọng là mọi thay đổi state đi qua transaction, gas, consensus và finality.

---

## API endpoints

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| GET | `/api/health` | Health + metadata của project |
| GET | `/api/analysis/summary` | Tổng quan phân tích state, storage, concept |
| GET | `/api/data` | Đọc tất cả dữ liệu từ contract |
| GET | `/api/data/:key` | Đọc 1 key cụ thể |
| POST | `/api/data` | Ghi dữ liệu bằng transaction |
| DELETE | `/api/data/:key` | Xóa dữ liệu bằng transaction |
| GET | `/api/export/json` | Export dữ liệu sang JSON |
| GET | `/api/export/csv` | Export dữ liệu sang CSV |
| GET | `/api/transaction/:hash` | Kiểm tra transaction outcome |
| GET | `/api/state` | Xem raw decoded contract state |
| GET | `/api/count` | Đếm số bản ghi |

---

## Quick start

### 1. Prerequisites
- Node.js v18+
- Rust toolchain
- `cargo-near`
- `near-cli-rs`
- Docker Desktop
- 1 tài khoản NEAR testnet có private key

### 2. Cấu hình `.env`
Tạo file `.env` từ `.env.example` và điền các biến:

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

### 3. Cài dependencies
```bash
npm run setup
```

### 4. Build / deploy contract
```bash
npm run build:contract
npm run deploy:contract
```

Deploy flow hiện tại:
- `npm run deploy:contract` sẽ **build + deploy** contract.
- Sau khi deploy, script sẽ thử `near view ... count "{}"` để kiểm tra contract đã phản hồi chưa.
- Nếu contract **đã phản hồi được**, script sẽ **skip init mặc định** để tránh lỗi `The contract has already been initialized`.
- Nếu bạn muốn **ép gọi lại `new()`**, dùng:

```bash
npm run deploy:contract -- --force-init
```

> [!IMPORTANT]
> `--force-init` chỉ buộc script gửi transaction gọi `new()`. Nếu contract trên account đó đã được khởi tạo từ trước, NEAR vẫn sẽ trả lỗi `The contract has already been initialized`, và đây là hành vi bình thường.

### Manual fallback commands

Nếu cần chạy tay, hãy dùng account thật và chú ý:
- Trong **Git Bash / MINGW64**, dùng đường dẫn kiểu `./contract/target/near/near_kv_store.wasm`
- Trong **PowerShell / CMD**, có thể dùng `.\contract\target\near\near_kv_store.wasm`

Ví dụ an toàn cho Git Bash:

```bash
near deploy your-account.testnet ./contract/target/near/near_kv_store.wasm --networkId testnet
near call your-account.testnet new "{}" --useAccount your-account.testnet --networkId testnet
near view your-account.testnet count "{}" --networkId testnet
```

### 5. Chạy app
```bash
npm start
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000
- Health: http://localhost:3000/api/health

---

## Cách trình bày demo trước giảng viên

### Bước 1: Giới thiệu lý thuyết
Trên giao diện, trình bày:
- state là lớp dữ liệu chính của contract,
- write là transaction có chữ ký,
- read là view query / RPC,
- Nightshade giúp scale theo shards.

### Bước 2: Minh họa ghi dữ liệu
Nhập `key` và `value`, sau đó bấm **Ghi lên blockchain**.

Điểm cần nhấn mạnh:
- đây không phải `INSERT` trực tiếp,
- hệ thống tạo transaction,
- transaction được thực thi rồi mới cập nhật state.

### Bước 3: Minh họa truy vấn dữ liệu
Làm mới bảng dữ liệu và giải thích:
- bảng được lấy bằng view call,
- không tạo block mới,
- phù hợp để so sánh với `SELECT`.

### Bước 4: Minh họa contract state
Dùng phần state summary để nói về:
- block height,
- số cặp key-value,
- storage usage,
- dữ liệu on-chain được mã hóa và lưu theo state của account contract.

### Bước 5: Minh họa export
Xuất JSON / CSV để cho thấy dữ liệu on-chain có thể được trích ra phục vụ phân tích ngoài chuỗi.

---

## Root npm scripts

```bash
npm run setup
npm run build:contract
npm run deploy:contract
npm run deploy:contract -- --force-init
npm start
npm run start:detached
npm run logs
npm run stop
npm run rebuild
npm run reset
```

---

## Tài liệu liên quan
- [START_APP.md](file:///C:/project/near_demo/START_APP.md)
- [contract/README.md](file:///C:/project/near_demo/contract/README.md)
- [NEAR Docs](https://docs.near.org)
- [Testnet Explorer](https://testnet.nearblocks.io)

---

## Kết luận

Về tổng thể, dự án này không cố gắng biến blockchain thành một hệ quản trị quan hệ đầy đủ, mà dùng **NEAR Protocol** như một ví dụ điển hình để phân tích:

- cách dữ liệu được lưu trữ trong hệ phân tán,
- cách ghi / đọc dữ liệu diễn ra qua transaction và state query,
- cách sharding hỗ trợ mở rộng,
- và cách tính bất biến dữ liệu được đảm bảo ở cấp giao thức.
