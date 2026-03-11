# 🚀 Hướng dẫn chạy và trình bày demo NEAR

## Mục tiêu của project

Project này phục vụ đề tài:

**Phân tích Blockchain như một hệ cơ sở dữ liệu phân tán – Trường hợp NEAR Protocol (tập trung vào sharding và lưu trữ trạng thái).**

Vì vậy khi chạy demo, cần bám vào 2 lớp nội dung song song:

1. **Lớp kỹ thuật**: build, deploy, start app.
2. **Lớp học thuật**: giải thích state, transaction flow, view query, sharding, immutability.

---

## Mô hình tài khoản

Demo này chạy với **1 account testnet duy nhất**:

- account deploy contract,
- account giữ contract,
- account ký transaction từ backend,

đều là **cùng một account**.

Ví dụ:

```env
NEAR_CONTRACT_ID=your-account.testnet
NEAR_MASTER_ACCOUNT=your-account.testnet
```

---

## Prerequisites

- **Node.js v18+**
- **Rust toolchain**
- **cargo-near**: `cargo install cargo-near --locked`
- **near-cli-rs**: `npm install -g near-cli-rs@latest`
- **Docker Desktop** đang chạy
- **1 NEAR testnet account** có sẵn
- **Private key** của account đó
- Account có đủ testnet NEAR để deploy và trả gas

> [!NOTE]
> Flow đã test ổn trên Windows là dùng **Rust `1.86`** + **`cargo near build non-reproducible-wasm --no-abi`** để tạo artifact deployable, sau đó dùng **`near-cli-rs`** để deploy.

---

## Bước 1: Cấu hình `.env`

```bash
cd c:\project\near_demo
copy .env.example .env
```

Điền nội dung:

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

**Lấy private key:**
1. Vào wallet testnet
2. Chọn account → Settings → Export Private Key
3. Copy full string bắt đầu bằng `ed25519:`

---

## Bước 2: Setup project

```bash
cd c:\project\near_demo
npm run setup
```

---

## Bước 3: Build contract

```bash
cd c:\project\near_demo
npm run build:contract
```

Build script chạy lệnh:

```bash
cargo near build non-reproducible-wasm --no-abi
```

WASM output:

```text
contract/target/near/near_kv_store.wasm
```

---

## Bước 4: Deploy contract

```bash
cd c:\project\near_demo
npm run deploy:contract
```

Deploy flow hiện tại:
- Script sẽ **build + deploy** contract.
- Sau deploy, script sẽ gọi `near view ... count "{}"` để kiểm tra contract đã phản hồi chưa.
- Nếu contract đã phản hồi, script sẽ **skip init mặc định** để tránh lỗi `The contract has already been initialized`.
- Nếu contract chưa phản hồi, script mới thử gọi `new()`.

Nếu bạn muốn **ép script gọi `new()`**, chạy:

```bash
cd c:\project\near_demo
npm run deploy:contract -- --force-init
```

> [!IMPORTANT]
> `--force-init` không reset state. Nó chỉ ép gửi transaction gọi `new()`. Nếu contract trên account đó đã được khởi tạo trước đó, bạn sẽ vẫn thấy lỗi `The contract has already been initialized`, và điều này là bình thường.

### Chạy tay khi cần

Trong **Git Bash / MINGW64**, hãy dùng đường dẫn kiểu `/`:

```bash
near deploy your-account.testnet ./contract/target/near/near_kv_store.wasm --networkId testnet
near call your-account.testnet new "{}" --useAccount your-account.testnet --networkId testnet
near view your-account.testnet count "{}" --networkId testnet
```

Trong **PowerShell / CMD**, có thể dùng đường dẫn kiểu `\.\...` như bình thường.

---

## Bước 5: Start app

> [!IMPORTANT]
> Trước khi chạy Docker, hãy chắc chắn **Docker Desktop** đang ở trạng thái **running**.

```bash
cd c:\project\near_demo
npm start
```

Truy cập:
- **Frontend**: http://localhost:8081
- **Backend**: http://localhost:3000
- **Health**: http://localhost:3000/api/health
- **Analysis summary**: http://localhost:3000/api/analysis/summary

---

## Bước 6: Cách demo đúng với đề tài

### 6.1 Giới thiệu giao diện
Khi mở frontend, hãy trình bày ngay các ý sau:

- **State = Database**: dữ liệu nằm trong contract state.
- **Transaction = Write path**: ghi dữ liệu phải qua signed transaction.
- **View / RPC = Read path**: đọc dữ liệu không cần tạo block mới.
- **Nightshade = Scale-out mechanism**: dữ liệu và thực thi được phân mảnh theo shards.

### 6.2 Minh họa thao tác ghi dữ liệu
1. Nhập `key` và `value`.
2. Bấm **Ghi lên blockchain**.
3. Cho xem `transaction hash`.

**Giải thích:**
- Đây là thao tác gần với `INSERT` / `UPDATE`.
- Nhưng khác CSDL quan hệ ở chỗ write phải đi qua transaction, gas, execution và finality.

### 6.3 Minh họa thao tác đọc dữ liệu
1. Bấm **Làm mới dữ liệu**.
2. Quan sát bảng dữ liệu.
3. Nếu cần, gọi thêm `GET /api/data` hoặc `GET /api/count`.

**Giải thích:**
- Đây là đường đọc dữ liệu qua view method.
- Có thể so sánh với `SELECT`, nhưng không phải SQL query engine đầy đủ.

### 6.4 Minh họa contract state và storage
1. Quan sát `block height`, `raw state pairs`, `storage usage` trên giao diện.
2. Nếu cần, mở `GET /api/state` và `GET /api/analysis/summary`.

**Giải thích:**
- Dữ liệu của contract tồn tại trong state của account contract.
- Storage usage giúp liên hệ tới **storage staking** trên NEAR.

### 6.5 Minh họa export dữ liệu
1. Bấm **Xuất JSON**.
2. Bấm **Xuất CSV**.

**Giải thích:**
- Dữ liệu on-chain có thể được trích ra để phân tích ngoài chuỗi.
- Đây là phần phục vụ báo cáo và so sánh với cách export dữ liệu từ hệ CSDL truyền thống.

### 6.6 Kết luận khi trình bày
Bạn có thể chốt bằng thông điệp:

> NEAR không thay thế hoàn toàn hệ CSDL quan hệ, nhưng có thể được phân tích như một hệ lưu trữ dữ liệu phân tán đặc biệt, nơi state đóng vai trò dữ liệu, transaction đóng vai trò write path, view/RPC đóng vai trò read path, và sharding giúp hệ thống mở rộng.

---

## Useful npm scripts

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

## Troubleshooting

### `Contract not found`
- Chạy lại `npm run deploy:contract`
- Kiểm tra `NEAR_CONTRACT_ID` trong `.env`

### `Account not initialized`
- Kiểm tra `NEAR_MASTER_PRIVATE_KEY` đúng format `ed25519:...`

### `Not enough balance`
- Nạp thêm NEAR từ [near-faucet.io](https://near-faucet.io)

### Lỗi build contract
```bash
cargo install cargo-near --locked
cargo near --help
npm run build:contract
```

### `The contract has already been initialized`
- Đây **không phải lỗi deploy** nếu bạn đang redeploy lên account đã có state.
- `npm run deploy:contract` mặc định sẽ cố skip init trong trường hợp contract đã phản hồi `count()`.
- Nếu bạn chạy `npm run deploy:contract -- --force-init`, script sẽ vẫn ép gọi `new()`; khi account đã init rồi thì lỗi này là **expected**.

### Lỗi đường dẫn `.wasm` trên Git Bash / MINGW64
- Dùng `./contract/target/near/near_kv_store.wasm`
- Không dùng `.\contract\target\near\near_kv_store.wasm` trong Git Bash, vì `near-cli-rs` có thể parse sai thành `.contracttargetnearnear_kv_store.wasm`

### `wasm, compiled with 1.87.0 or newer rust toolchain is currently not compatible with nearcore VM`
- Dùng **Rust `1.86`** cho thư mục `contract`
- `contract/rust-toolchain.toml` đã pin sang `1.86`

### `Data not in JSON format!`
- Có thể xảy ra với `near-cli-rs` khi parse args JSON
- Chạy tay các lệnh đã test:

```bash
near call your-account.testnet new "{}" --useAccount your-account.testnet --networkId testnet
near view your-account.testnet count "{}" --networkId testnet
```

### `open //./pipe/dockerDesktopLinuxEngine`
- Docker Desktop chưa chạy
- Mở Docker Desktop và chờ trạng thái **running**

### `CompilationError(PrepareError(Deserialization))`
- Không deploy file build thô từ `cargo build`
- Chỉ deploy artifact trong `contract/target/near/near_kv_store.wasm`
