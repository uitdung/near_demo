# Transaction Bottleneck Analysis - NEAR Demo

**Mục đích**: Giải thích rõ các bottleneck khi thực hiện số lượng transaction lớn trên NEAR, phân biệt **scope của bottleneck** là theo `access key`, `account`, `contract`, `RPC provider`, hay ở mức rộng hơn của mạng blockchain; đồng thời hướng dẫn cách đọc timing metrics trên UI.

---

## 1. Cách phân loại bottleneck theo scope

Không phải mọi bottleneck đều là “băng thông chung của toàn mạng blockchain”. Trong demo này, bottleneck có thể nằm ở nhiều lớp khác nhau:

| Bottleneck | Scope chính | Thuộc blockchain hay hệ thống | Ý nghĩa thực tế |
|---|---|---|---|
| `nonce` | **Per access key** | Blockchain rule + app handling | Mỗi key có chuỗi nonce riêng; conflict chỉ xảy ra trên key đang dùng |
| `access key strategy` | **Per account / signer architecture** | Blockchain primitive + system design | Dùng 1 key hay nhiều key ảnh hưởng trực tiếp đến throughput |
| `contract/state hot spot` | **Per contract / per destination state** | Blockchain execution + app data model | Nhiều tx cùng ghi vào một contract/state path có thể tạo điểm nóng |
| `RPC pressure` | **Per RPC provider / endpoint** | System / infrastructure | Có thể nghẽn dù blockchain vẫn hoạt động bình thường |
| `block/chunk throughput` | **Shard / network-wide hơn** | Blockchain | Đây mới là loại gần với “băng thông chung của chain” |

> [!IMPORTANT]
> Trong demo hiện tại, bottleneck dễ gặp nhất **không phải** là giới hạn toàn mạng NEAR, mà thường là bottleneck cục bộ do app đang dùng **một signer / một access key**, cộng với giới hạn của **RPC endpoint** đang gọi.

---

## 2. Các bottleneck chính và scope của chúng

### 2.1 Nonce contention

**Scope**: `Per access key`

**Bản chất**:
- Trên NEAR, transaction được ký bởi một access key.
- Mỗi access key có `nonce` tăng dần.
- Vì vậy, nếu nhiều transaction cùng được gửi gần đồng thời từ **cùng một key**, app phải xử lý thứ tự nonce đúng.

**Ý nghĩa performance**:
- Nếu app bắn quá nhiều tx song song từ cùng key, dễ gặp:
  - `invalid nonce`
  - retry tăng lên
  - độ trễ tổng tăng lên
- Đây **không phải bottleneck share toàn mạng**; nó chủ yếu là bottleneck cục bộ của key mà app đang dùng.

**Official NEAR docs liên quan**:
- **Access Keys**: [https://docs.near.org/protocol/access-keys](https://docs.near.org/protocol/access-keys)
  - Tài liệu này giải thích access key là primitive của account model trên NEAR.
- **Anatomy of a Transaction**: [https://docs.near.org/protocol/transaction-anatomy](https://docs.near.org/protocol/transaction-anatomy)
  - Tài liệu này mô tả transaction có trường `nonce` và vai trò của nó trong xác thực transaction.
- **Transactions**: [https://docs.near.org/protocol/transactions](https://docs.near.org/protocol/transactions)
  - Tài liệu mô tả giao dịch trên NEAR là các actions được ký bằng keys thuộc account.

**Giải pháp trong demo**:
- Controlled concurrency
- Retry khi lỗi nonce / timeout tạm thời
- Chưa dùng multi-key strategy

---

### 2.2 Access key bottleneck

**Scope**: `Per account / signer architecture`

**Bản chất**:
- Access key là primitive của blockchain.
- Nhưng việc app dùng **1 key**, **nhiều key**, hay **nhiều signer account** là quyết định kiến trúc của hệ thống.

**Ý nghĩa performance**:
- Nếu 1 account chỉ dùng 1 key để gửi nhiều tx, tất cả tx cùng tranh một chuỗi nonce.
- Nếu dùng nhiều keys, mỗi key có chuỗi nonce riêng → giảm contention.
- Vì vậy đây là bottleneck **của thiết kế hệ thống**, không phải của toàn mạng.

**Official NEAR docs liên quan**:
- **Access Keys**: [https://docs.near.org/protocol/access-keys](https://docs.near.org/protocol/access-keys)
- **NEAR Accounts / Account Model**: [https://docs.near.org/protocol/account-model](https://docs.near.org/protocol/account-model)
  - Tài liệu này giải thích quan hệ giữa account và access keys.

**Giải pháp mở rộng nếu muốn scale mạnh hơn**:
- Multiple access keys cho cùng signer account
- Nhiều signer accounts
- Phân phối worker theo key thay vì toàn bộ dùng chung một key

---

### 2.3 RPC pressure

**Scope**: `Per RPC provider / endpoint`

**Bản chất**:
- RPC là lớp giao tiếp giữa app và blockchain.
- Đây không phải blockchain core, mà là lớp hạ tầng để query state và submit transactions.

**Ý nghĩa performance**:
- Có thể gặp:
  - `429`
  - timeout
  - connection reset
  - queue ở provider
- Nhiều app dùng chung một endpoint RPC có thể cùng bị ảnh hưởng.
- Blockchain có thể vẫn ổn, nhưng RPC bạn dùng đã trở thành bottleneck.

**Official NEAR docs liên quan**:
- **NEAR RPC API**: [https://docs.near.org/api/rpc/introduction](https://docs.near.org/api/rpc/introduction)
  - Mô tả RPC là lớp chính để tương tác với NEAR network.
- **RPC Providers**: [https://docs.near.org/api/rpc/providers](https://docs.near.org/api/rpc/providers)
  - Chỉ ra có nhiều providers khác nhau cho mainnet/testnet; điều này rất quan trọng khi phân tích bottleneck ở lớp infrastructure.
- **RPC Errors**: [https://docs.near.org/api/rpc/errors](https://docs.near.org/api/rpc/errors)
  - Hữu ích để diễn giải các lỗi timeout / provider-side / request-side.

**Giải pháp trong demo**:
- Retry lỗi tạm thời
- Giữ concurrency vừa phải
- Có thể nâng cấp bằng fallback RPC hoặc dedicated RPC

---

### 2.4 Contract / state hot spot

**Scope**: `Per contract` hoặc `Per destination state path`

**Bản chất**:
- Trong demo, hầu hết transaction đều ghi vào **cùng một contract registry**.
- Ngoài ra, trước mỗi write app còn gọi thêm một `view` để kiểm tra property đã tồn tại hay chưa.

**Ý nghĩa performance**:
- Nhiều tx cùng dồn vào một contract sẽ tạo điểm nóng logic.
- Nếu mọi worker đều phải đọc state rồi mới ghi state, độ trễ hệ thống sẽ tăng thêm.
- Đây là bottleneck **của contract / data path**, không phải mặc định là bottleneck toàn chain.

**Official NEAR docs liên quan**:
- **NEAR Data Flow**: [https://docs.near.org/protocol/data-flow/near-data-flow](https://docs.near.org/protocol/data-flow/near-data-flow)
  - Giải thích transaction, receipt, execution path và cách state changes diễn ra.
- **Runtime**: [https://docs.near.org/protocol/network/runtime](https://docs.near.org/protocol/network/runtime)
  - Mô tả runtime chịu trách nhiệm execution và state operations.
- **Storage Staking**: [https://docs.near.org/protocol/storage/storage-staking](https://docs.near.org/protocol/storage/storage-staking)
  - Giải thích state growth có cost, và vì sao write-heavy patterns cần cân nhắc thiết kế dữ liệu.

**Giải pháp trong demo**:
- Chấp nhận thêm 1 view call để giữ logic create/update rõ ràng
- Nếu cần throughput cao hơn: có thể dùng batch contract method hoặc cache trạng thái đầu vào

---

### 2.5 Block / chunk / network throughput

**Scope**: `Shard-level` đến `network-wide`

**Bản chất**:
- Đây là lớp gần nhất với khái niệm “băng thông chung của blockchain”.
- Khi block/chunk capacity hoặc shard execution đang tải cao, transaction inclusion có thể chậm hơn.

**Ý nghĩa performance**:
- Loại bottleneck này mới phản ánh giới hạn dùng chung rộng hơn của network.
- Tuy nhiên trong demo nhỏ, thường khó kết luận ngay rằng slowdown là do toàn mạng; nhiều khi bottleneck vẫn nằm ở signer key hoặc RPC.

**Official NEAR docs liên quan**:
- **Architecture**: [https://docs.near.org/protocol/architecture](https://docs.near.org/protocol/architecture)
  - Giải thích vai trò của blocks, chunks, shards, validators.
- **NEAR Data Flow**: [https://docs.near.org/protocol/data-flow/near-data-flow](https://docs.near.org/protocol/data-flow/near-data-flow)
  - Mô tả transaction đi qua block/chunk execution như thế nào.
- **Validators**: [https://docs.near.org/protocol/network/validators](https://docs.near.org/protocol/network/validators)
  - Giải thích validator roles trong block/chunk production.
- **Gas (Execution Fees)**: [https://docs.near.org/protocol/gas](https://docs.near.org/protocol/gas)
  - Liên quan đến execution cost và cách transaction cạnh tranh tài nguyên execution.

---

## 3. High-volume transaction flow trong demo

### 3.1 Chế độ cũ: một record = một transaction

```text
Frontend/User
    │
    │ submit N records
    ▼
Backend worker pool
    │
    ├─ validate payload
    ├─ sign transaction bằng signer key hiện tại
    ├─ manage nonce / retry nếu cần
    ▼
RPC provider
    │
    ├─ nhận từng transaction riêng lẻ
    ├─ có thể rate limit / timeout
    ▼
NEAR network
    │
    ├─ block + chunk production
    ├─ validator processing
    ├─ execution outcome cho từng transaction
    ▼
N transaction results + N state updates
```

### 3.2 Chế độ mới: nhiều record = một transaction batch

```text
Frontend/User
    │
    │ submit N records in one import request
    ▼
Backend
    │
    ├─ validate toàn bộ payload
    ├─ gọi `batch_upsert_properties(items)` đúng 1 lần
    ▼
RPC provider
    │
    ├─ nhận 1 transaction lớn hơn bình thường
    ▼
NEAR network
    │
    ├─ execute contract method một lần
    ├─ contract loop qua N records trong cùng transaction
    ▼
1 transaction result + N logical record updates
```

**Điểm cần nhớ**:
- Chế độ cũ tối ưu cho **transaction-level visibility** vì mỗi record có tx riêng.
- Chế độ mới tối ưu cho **record throughput** vì giảm mạnh số transaction phải submit.
- Batch mode không làm chi phí xử lý từng record biến mất; nó chỉ giảm **overhead theo số transaction**.
- Nếu batch quá lớn, bottleneck sẽ chuyển từ `nonce/RPC overhead` sang `contract execution size`, `gas`, `payload size`, và `state write cost`.

---

## 4. Blockchain database units khi đối chiếu với relational database

Khi nhìn blockchain như một hệ cơ sở dữ liệu phân tán, cần phân biệt rõ **đơn vị lưu trữ** và **đơn vị xử lý** của nó khác với relational database.

### 4.1 Bảng đối chiếu nhanh

| Relational database | Blockchain / NEAR | Giải thích |
|---|---|---|
| **Database** | **Network + global state** | Trong RDBMS, database là không gian dữ liệu logic. Trên NEAR, dữ liệu sống trong global state của mạng, được phân phối trên nhiều nodes/shards. |
| **Schema / Table** | **Contract account + contract state namespace** | Một contract thường đóng vai trò gần giống một schema/table domain, vì nó quản lý một vùng state riêng và logic thao tác trên vùng state đó. |
| **Row / Record** | **State entry / key-value entry / serialized object** | Đơn vị dữ liệu trực tiếp được lưu không phải “row” quan hệ mà là entry trong state, thường là key-value hoặc object đã serialize. |
| **Primary key** | **State key / storage key** | Ví dụ `property_id` trong demo đóng vai trò gần giống primary key để truy cập một record trong contract state. |
| **Column** | **Field trong serialized object** | Các field như `description`, `owner`, `timestamp` nằm trong object được serialize và ghi vào state. |
| **INSERT / UPDATE / DELETE** | **State transition qua transaction execution** | Trên blockchain, dữ liệu thay đổi không phải do SQL statement trực tiếp mà do transaction gọi contract method để chuyển state. |
| **DB transaction (ACID)** | **Blockchain transaction** | Cả hai đều là đơn vị commit logic, nhưng blockchain transaction còn phải đi qua signature, gas, block inclusion, consensus, receipts. |
| **Commit log / WAL** | **Blocks + transaction history + receipts** | Blockchain lưu lịch sử bất biến qua blocks, transactions, receipts, execution outcomes. |
| **Index** | **Indexer / off-chain index / view structure trong contract** | Blockchain không mặc định mạnh về query như SQL index; muốn query tốt thường phải thiết kế state riêng hoặc dùng indexer/off-chain service. |
| **Materialized view / analytics table** | **Indexer dataset / BigQuery / Near Lake output** | Với phân tích lớn, dữ liệu thường được đẩy sang indexer hay warehouse thay vì query trực tiếp từ raw chain state. |

### 4.2 Đơn vị lưu trữ trực tiếp trong blockchain là gì?

Nếu nói thật chính xác ở góc nhìn lưu trữ, trong blockchain database kiểu NEAR có các “đơn vị” quan trọng sau:

1. **Account state**
   - Mỗi account có state riêng.
   - Contract account chứa code + storage state.

2. **Contract state entries**
   - Đây là đơn vị gần nhất với “record đang được lưu”.
   - Trong demo, mỗi property về bản chất là một entry trong `UnorderedMap`, được lưu dưới dạng key-value trong state trie.

3. **Serialized values**
   - Giá trị lưu trong state không phải là row thuần SQL, mà là object đã serialize.
   - Ví dụ `PropertyRecord { property_id, description, owner, timestamp, updated_by }` được encode trước khi ghi.

4. **Transactions**
   - Đây không phải đơn vị dữ liệu tĩnh, mà là đơn vị yêu cầu thay đổi state.
   - Tương tự “lệnh ghi + commit” trong database, nhưng có thêm chữ ký và execution trên blockchain.

5. **Receipts / execution outcomes**
   - Đây là đơn vị xử lý trung gian và kết quả thực thi.
   - Quan trọng khi phân tích data flow và audit trail.

6. **Blocks / chunks**
   - Đây là đơn vị đóng gói lịch sử và đồng thuận.
   - Chúng giống phần “transaction log + replication log” hơn là bảng dữ liệu ứng dụng.

### 4.3 Trong demo này, từng đơn vị tương ứng như thế nào?

| Trong demo `near_demo` | Loại đơn vị blockchain | Gần nhất với relational DB |
|---|---|---|
| `PropertyRecord` | Serialized state value | Row |
| `property_id` | State key | Primary key |
| `UnorderedMap<String, PropertyRecord>` | Contract-managed state collection | Table / key-value table |
| `upsert_property(...)` | Single state transition | Single-row INSERT/UPDATE |
| `batch_upsert_properties(items)` | One transaction with many logical updates | Batch INSERT/UPDATE statement |
| Transaction hash | Immutable write log identifier | Transaction ID / commit identifier |
| Block | Historical commit container | WAL segment / replicated commit batch |

### 4.4 Điểm khác biệt cốt lõi cần note trong báo cáo

> [!IMPORTANT]
> Trong relational database, đơn vị lưu trữ ứng dụng thường được nghĩ trực tiếp là **table / row / column**. Trong blockchain như NEAR, đơn vị lưu trữ ứng dụng gần hơn với **account state + key-value state entries + serialized objects**, còn **blocks / transactions / receipts** là đơn vị ghi nhận và xác minh quá trình thay đổi dữ liệu.

Nói ngắn gọn:
- **Row** trong blockchain demo ≈ **một state entry / serialized object**
- **Table** trong blockchain demo ≈ **một collection trong contract state**
- **DB transaction** trong blockchain demo ≈ **một blockchain transaction gọi contract method**
- **Commit log** trong blockchain demo ≈ **block + transaction history + receipts**

---

## 5. Giải thích timing metrics trên UI

Mỗi transaction panel hiện hiển thị:

| Field | Ý nghĩa |
|---|---|
| **Request start** | Thời điểm backend bắt đầu gửi write request |
| **Response received** | Thời điểm backend nhận full transaction outcome |
| **Duration** | `Response received - Request start` |
| **Observed block time** | Timestamp của block chứa transaction |
| **Observed block height** | Height của block đó |

### Cách đọc hiểu

1. **Duration** là metric phía app/integration
   - Bao gồm submit, network latency, RPC processing, retry, signing, execution waiting

2. **Observed block time** là metric quan sát từ chain
   - Gần với thời điểm transaction được include/executed hơn
   - Nhưng vẫn là dữ liệu quan sát được từ integration layer, không phải trace chi tiết nội bộ validator

3. **So sánh hai nhóm metric**
   - Nếu `Duration` lớn hơn nhiều so với cảm nhận inclusion time, bottleneck thường nằm ở app / signer / RPC
   - Nếu `Observed block time` cũng bị trễ mạnh, có thể chain execution hoặc inclusion đang là phần tốn thời gian hơn

> [!NOTE]
> Các timing metrics trên UI giúp phân biệt **độ trễ hệ thống** và **độ trễ blockchain quan sát được**, nhưng không phải là công cụ profiler chính thức của validator internals.

---

## 5. Mitigation strategies theo từng scope

| Scope | Bottleneck | Mitigation |
|---|---|---|
| Per key | Nonce contention | Dùng controlled concurrency, nonce-aware retries, multi-key strategy |
| Per account design | Access key bottleneck | Phân phối worker theo nhiều keys hoặc nhiều signer accounts |
| Per RPC endpoint | RPC pressure | Dedicated/fallback RPC, retry policy, rate-aware submission |
| Per contract/state path | Hot spot contract logic | Batch methods, giảm số view calls, tối ưu write pattern |
| Shard / network-wide | Inclusion / execution capacity | Quan sát timing dài hạn, chạy benchmark nhiều đợt, so sánh qua nhiều thời điểm |

---

## 6. Kết luận cho demo này

- Ở giai đoạn đầu, bottleneck lớn nhất là:
  1. **Signer key / nonce contention**
  2. **RPC endpoint pressure**
  3. **One-record-per-transaction overhead**
- Sau khi bỏ pre-read và thêm `batch_upsert_properties`, bottleneck quan trọng hơn chuyển sang:
  1. **Contract execution size per batch**
  2. **Payload size / gas usage của batch transaction**
  3. **State write cost trên cùng một contract**
- Vì vậy, tối ưu hiện tại không còn là “tăng concurrency” mà là **chọn batch size hợp lý** để cân bằng giữa:
  - records xử lý mỗi transaction
  - độ ổn định execution
  - gas và latency của transaction batch

Nếu muốn scale benchmark lên mức lớn hơn, các hướng nâng cấp hợp lý là:
- Batch size tuning (ví dụ 10 / 20 / 50 / 100 records mỗi transaction)
- Multi-key strategy cho các trường hợp vẫn cần single-write mode
- Nhiều signer accounts
- Tốt hơn ở lớp RPC routing / fallback
- So sánh benchmark giữa nhiều khung thời gian khác nhau

---

## 7. Official NEAR documentation references

### Core protocol and transaction flow
- **Architecture**: [https://docs.near.org/protocol/architecture](https://docs.near.org/protocol/architecture)
- **NEAR Data Flow**: [https://docs.near.org/protocol/data-flow/near-data-flow](https://docs.near.org/protocol/data-flow/near-data-flow)
- **Transactions**: [https://docs.near.org/protocol/transactions](https://docs.near.org/protocol/transactions)
- **Anatomy of a Transaction**: [https://docs.near.org/protocol/transaction-anatomy](https://docs.near.org/protocol/transaction-anatomy)
- **Lifecycle of a Transaction**: [https://docs.near.org/protocol/transaction-execution](https://docs.near.org/protocol/transaction-execution)

### Accounts, keys, and signer behavior
- **Access Keys**: [https://docs.near.org/protocol/access-keys](https://docs.near.org/protocol/access-keys)
- **NEAR Accounts / Account Model**: [https://docs.near.org/protocol/account-model](https://docs.near.org/protocol/account-model)

### RPC and infrastructure
- **NEAR RPC API**: [https://docs.near.org/api/rpc/introduction](https://docs.near.org/api/rpc/introduction)
- **RPC Providers**: [https://docs.near.org/api/rpc/providers](https://docs.near.org/api/rpc/providers)
- **RPC Errors**: [https://docs.near.org/api/rpc/errors](https://docs.near.org/api/rpc/errors)

### Runtime, storage, and execution context
- **Runtime**: [https://docs.near.org/protocol/network/runtime](https://docs.near.org/protocol/network/runtime)
- **Storage Staking**: [https://docs.near.org/protocol/storage/storage-staking](https://docs.near.org/protocol/storage/storage-staking)
- **Gas (Execution Fees)**: [https://docs.near.org/protocol/gas](https://docs.near.org/protocol/gas)
- **Validators**: [https://docs.near.org/protocol/network/validators](https://docs.near.org/protocol/network/validators)
