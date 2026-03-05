---
trigger: always_on
glob: 
description: document reference
---
# NEAR Protocol - Document Reference
## Phân tích Blockchain như một hệ cơ sở dữ liệu phân tán

**Ngày tạo:** 05/03/2026  
**Mục đích:** Chuẩn bị kiến thức cho demo app minh họa cơ chế lưu trữ và truy vấn dữ liệu trên NEAR Blockchain

---

## Mục Lục

1. [Tổng quan NEAR Protocol](#1-tổng-quan-near-protocol)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cấu trúc dữ liệu: Block, Transaction, State](#3-cấu-trúc-dữ-liệu-block-transaction-state)
4. [Cơ chế Sharding - Nightshade](#4-cơ-chế-sharding---nightshade)
5. [Nguyên lý ghi dữ liệu (INSERT)](#5-nguyên-lý-ghi-dữ-liệu-insert)
6. [Nguyên lý truy vấn dữ liệu (SELECT)](#6-nguyên-lý-truy-vấn-dữ-liệu-select)
7. [Đảm bảo tính bất biến dữ liệu](#7-đảm-bảo-tính-bất-biến-dữ-liệu)
8. [Storage Staking](#8-storage-staking)
9. [Data Infrastructure](#9-data-infrastructure)
10. [Demo Plan](#10-demo-plan)
11. [So sánh với CSDL quan hệ](#11-so-sánh-với-csdl-quan-hệ)

---

## 1. Tổng quan NEAR Protocol

NEAR Protocol là một blockchain layer-1 có khả năng mở rộng cao (scalable), sử dụng cơ chế sharding để phân mảnh dữ liệu khi hệ thống mở rộng.

**Đặc điểm chính:**
- **Stateful blockchain**: Mỗi account có state riêng, được thay đổi thông qua transactions
- **Sharded nature**: Hệ thống được phân mảnh thành nhiều shards song song
- **Block time**: ~1 giây
- **Finality**: 1-3 blocks (~1-3 giây)

**Key Components:**
- Blocks và Chunks
- Transactions và Receipts
- Trie (cấu trúc dữ liệu state)
- Validators (Block producers, Chunk producers)

---

## 2. Kiến trúc hệ thống

NEAR Protocol có 2 layer chính:

### 2.1 Blockchain Layer
**Trách nhiệm:**
- **Sharding**: Phân chia trie giữa các shards
- **Blocks & Chunks**: Sản xuất và quản lý blocks
- **Consensus**: Đảm bảo tính nhất quán state
- **Communication**: Routing receipts giữa các shards
- **Validators orchestration**: Quản lý validators

### 2.2 Runtime Layer
**Trách nhiệm:**
- **Fees & Rewards**: Tính phí gas và phần thưởng
- **Smart Contract Execution**: Thực thi smart contracts
- **State Operations**: Thao tác trên trie

**Runtime KHÔNG biết:**
- Hệ thống đang được shard hay không
- Blocks/chunks structure
- Cơ chế consensus
- Network topology

### 2.3 Trie (Cây Merkle Patricia)
NEAR sử dụng **Trie** để lưu trữ state:

**Blockchain Layer:**
- Manipulates trie trực tiếp
- Partitions trie giữa shards
- Synchronizes trie giữa nodes
- Maintains consistency qua consensus

**Runtime Layer:**
- Biết storage là trie
- Expose một số trie operations cho smart contract developers
- Optimize cho hiệu suất

---

## 3. Cấu trúc dữ liệu: Block, Transaction, State

### 3.1 Block Structure
```
Block (được tạo mỗi ~1 giây)
├── Header (metadata, hash, prev_hash)
├── Chunks (từ tất cả shards)
│   ├── Chunk từ Shard 1
│   ├── Chunk từ Shard 2
│   └── ...
└── Chunk chứa:
    ├── Transactions
    ├── Receipts
    └── Chunk Header
```

### 3.2 Transaction Anatomy

**Transaction Fields:**
- `Signer`: Account ký transaction
- `Receiver`: Account nhận actions
- `Actions`: Danh sách các operations
- `PublicKey`: Public key để verify
- `Nonce`: Số thứ tự (tăng dần)
- `BlockHash`: Hash của block gần nhất

**Actions Types:**
1. `FunctionCall` - Gọi function trên contract
2. `Transfer` - Chuyển tokens
3. `DeployContract` - Deploy contract
4. `CreateAccount` - Tạo sub-account
5. `DeleteAccount` - Xóa account
6. `AddKey` / `DeleteKey` - Quản lý keys
7. `Stake` - Trở thành validator

**Lưu ý:**
- Một transaction có NHIỀU actions
- Actions thực hiện THEO THỨ TỰ
- Nếu MỘT action fail → CẢ transaction bị discard
- Chỉ có MỘT receiver per transaction

### 3.3 State Storage (Smart Contract)

**Đặc điểm:**
- Mỗi account có state riêng
- State bắt đầu **empty** cho đến khi contract được deploy
- **Code và Storage độc lập**: Update code KHÔNG xóa state

**Lưu trữ:**
- Native types: `number`, `string`, `Array`, `Map`
- Complex objects
- Cost: **1Ⓝ ≈ 100KB** data

**Collections (SDK):**
- `Vector` - Mảng động
- `LookupMap` - Map không iterable
- `UnorderedMap` - Map iterable
- `LookupSet` - Set không iterable
- `UnorderedSet` - Set iterable
- `Tree` - Cây có thứ tự

### 3.4 Receipt

**Receipt là gì?**
- Internal transaction để pass information giữa shards
- Được tạo từ Transaction execution
- Có `predecessor_id` (người gửi) và `receiver_id` (người nhận)

**Receipt Types:**
- Data Receipt: Chứa data
- Action Receipt: Chứa actions để execute

---

## 4. Cơ chế Sharding - Nightshade

### 4.1 Khái niệm cơ bản
NEAR sử dụng **sharding** để scale horizontally:

- Mỗi **Shard** là một network song song
- Mỗi Shard produce một **Chunk** mỗi khoảng time
- **Block** = Collection của tất cả Chunks từ tất cả Shards

### 4.2 Data Flow giữa Shards

**Ví dụ: alice.near (Shard A) → bob.near (Shard B)**

```
Timeline:
┌─────────────────────────────────────────────────┐
│ Block 1: Transaction exec → Receipt created    │
│   - alice.near balance deducted                │
│   - Receipt created for bob.near               │
│   - Receipt CANNOT execute here (different shard)│
├─────────────────────────────────────────────────┤
│ Block 2: Receipt moves to Shard B              │
│   - Receipt executed on bob.near's shard       │
│   - bob.near receives tokens                   │
│   - State updated on Shard B                   │
├─────────────────────────────────────────────────┤
│ Block 3: Gas refund                            │
│   - Unused gas refunded to alice.near          │
└─────────────────────────────────────────────────┘
```

### 4.3 Cross-Shard Communication
- Receipts được route bởi blockchain layer
- Runtime chỉ biết `receiver_id`, KHÔNG biết shard destination
- Blockchain layer responsible cho routing

---

## 5. Nguyên lý ghi dữ liệu (INSERT)

### 5.1 Transaction Lifecycle

**Bước 1: User tạo Transaction**
```
User → Construct Transaction → Sign with Private Key → Broadcast to Network
```

**Bước 2: RPC Validation**
- RPC node validate structure
- Nếu fail structural checks → reject immediately
- Nếu pass → enter transaction pool

**Bước 3: Block Inclusion (Block N)**
- Validator includes transaction in chunk
- Verify signature matches signer access key
- Charge gas pre-payment
- Update access key nonce
- Convert transaction → Receipt

**Bước 4: Receipt Execution (Block N+1 hoặc N+2)**
- Receipt executed on receiver's shard
- If cross-contract call → spawn new receipts
- Actions performed on receiver account

**Bước 5: Gas Refund (Final Block)**
- Unused gas refunded to signer
- Transaction considered FINAL

### 5.2 Timing
- **Same account (signer = receiver)**: 1 block
- **Different accounts**: 3 blocks (create receipt → execute → refund)
- **Function calls với cross-contract**: N blocks (tùy số receipts)

### 5.3 Ví dụ minh họa

**Guest Book Example:**
```
Deploy Contract → guest-book.near
    ↓
User calls add_message(message: "Hello")
    ↓
Transaction Validation (Block 1)
    ↓
Receipt Creation (user pays gas)
    ↓
Receipt Execution (Block 2)
    ↓
Message stored in contract state
    ↓
Gas Refund (Block 3, if applicable)
```

---

## 6. Nguyên lý truy vấn dữ liệu (SELECT)

### 6.1 RPC API Query Methods

**Method 1: View Contract State**
```json
{
  "jsonrpc": "2.0",
  "id": "dontcare",
  "method": "query",
  "params": {
    "request_type": "view_state",
    "finality": "final",
    "account_id": "contract.example.near",
    "prefix_base64": ""
  }
}
```

**Response:**
```json
{
  "result": {
    "block_hash": "...",
    "block_height": 187442491,
    "values": [
      {
        "key": "U1RBVEU=",     // Base64 encoded key
        "value": "SGVsbG8="    // Base64 encoded value
      }
    ]
  }
}
```

**Method 2: Call View Function**
```json
{
  "jsonrpc": "2.0",
  "id": "dontcare",
  "method": "query",
  "params": {
    "request_type": "call_function",
    "finality": "final",
    "account_id": "contract.example.near",
    "method_name": "get_greeting",
    "args_base64": ""
  }
}
```

**Response:**
```json
{
  "result": {
    "block_hash": "...",
    "block_height": 187444191,
    "logs": [],
    "result": [34, 71, 114, 101, 101, 116, 105, 110, 103, ...]  // ASCII bytes
  }
}
```
*Note: Result là array of bytes (ASCII), cần decode*

### 6.2 Data APIs (Community)

**FastNEAR API:**
```bash
# Query user's FTs
curl https://api.fastnear.com/v1/account/root.near/ft

# Query user's NFTs
curl https://api.fastnear.com/v1/account/root.near/nft

# Query all assets
curl https://api.fastnear.com/v1/account/root.near/full
```

**NearBlocks API:**
```bash
# Get transactions by method
curl -X GET "https://api.nearblocks.io/v1/account/contract.near/txns?method=create_drop"

# Get transactions from specific sender
curl -X GET "https://api.nearblocks.io/v1/account/contract.near/txns?method=create_drop&from=user.near"
```

### 6.3 BigQuery Public Dataset

**Available Tables:**
- `blocks` - Blocks trong blockchain
- `chunks` - Chunks từ các shards
- `transactions` - Transactions
- `execution_outcomes` - Kết quả execution
- `receipts` - Receipts (cross-contract messages)
- `receipt_actions` - Actions trong receipts
- `account_changes` - State changes

**Example Query:**
```sql
-- Đếm unique signers và accounts tương tác với contract per day
SELECT
  ra.block_date collected_for_day,
  COUNT(DISTINCT t.signer_account_id) as total_signers,
  COUNT(DISTINCT ra.receipt_predecessor_account_id) as total_accounts
FROM `bigquery-public-data.crypto_near_mainnet_us.receipt_actions` ra
  JOIN `bigquery-public-data.crypto_near_mainnet_us.receipt_origin_transaction` ro 
    ON ro.receipt_id = ra.receipt_id
  JOIN `bigquery-public-data.crypto_near_mainnet_us.transactions` t 
    ON ro.originated_from_transaction_hash = t.transaction_hash
WHERE ra.action_kind = 'FUNCTION_CALL'
  AND ra.receipt_receiver_account_id = 'social.near'
GROUP BY 1
ORDER BY 1 DESC;
```

---

## 7. Đảm bảo tính bất biến dữ liệu

### 7.1 Cryptographic Hashing

**Block Hash Chain:**
```
Block N-1 ←[hash]← Block N ←[hash]← Block N+1
```

- Mỗi block chứa `prev_hash` của block trước
- Thay đổi MỘT bit trong block cũ → invalidate TẤT CẢ blocks sau
- Tạo thành "chain" không thể break

**Merkle Tree:**
- Transactions trong block được organize thành Merkle tree
- Root hash stored trong block header
- Cho phép efficient verification của individual transactions

### 7.2 Consensus Mechanism

**Validators:**
- Block Producers: Produce blocks
- Chunk Producers: Produce chunks cho shards
- Chunk Validators: Validate chunks

**Epochs:**
- Validators được chọn mỗi **epoch** (~12 hours)
- Staking required để become validator
- Rewards distributed based on participation

**Finality:**
- Transactions final khi TẤT CẢ receipts đã processed
- Thường 1-3 blocks (~1-3 seconds)
- Depends on cross-contract interactions

### 7.3 State Proofs
- State changes có cryptographic proofs
- Proofs verify được bởi any node
- Enables trustless verification

---

## 8. Storage Staking

### 8.1 Cơ chế

**Nguyên lý:**
- Contracts must lock NEAR tokens để pay for storage
- Cost: **1Ⓝ per 100KB**
- Locked tokens KHÔNG available cho staking

**Khi nào stake?**
- Trên mỗi transaction ADD data
- NEAR checks if contract có đủ balance
- Nếu insufficient → transaction FAILS

### 8.2 Attack Vector: "Million Cheap Data Additions"

**Scenario:**
- User sends data to contract (costs user ~nothing in gas)
- Contract must stake NEAR for storage
- Attacker can make contract prohibitively expensive

**Mitigation:**
- Design contracts carefully
- Make attackers pay for storage they add
- Implement rate limiting hoặc approval mechanisms

### 8.3 Remove Data → Unstake

**Lưu ý:**
- Smart contracts CÓ THỂ delete data
- Deleted data purged từ validating nodes within a few epochs
- Gas fee associated với data deletion
- Gas limit creates upper bound on data deletion per transaction

---

## 9. Data Infrastructure

### 9.1 NEAR Lake

**What is it?**
- Watches over NEAR network
- Stores all events for easy access
- Builds custom indexers

**Frameworks:**
- NEAR Lake Framework (Rust, JS, Python, Go)
- NEAR Indexer Framework

**Use Cases:**
- Listen for FunctionCalls on specific contract
- Track NFT events
- Monitor state changes
- Build real-time dashboards

### 9.2 Indexers

**Pull Model:**
- Indexer polls for new blocks
- Processes blocks at own pace

**Push Model:**
- Node pushes events to indexer
- Real-time processing

### 9.3 BigQuery Benefits

**Pros:**
- No infrastructure setup
- Near real-time data
- Cost-effective (pay for queries only)
- SQL familiar
- Historical data at scale

**Cons:**
- Query costs can add up
- Not real-time (slight delay)
- Requires BigQuery knowledge

---

## 10. Demo Plan

### 10.1 Mục tiêu Demo

Minh họa cơ chế lưu trữ và truy vấn dữ liệu trên NEAR Blockchain:

1. ✅ Ghi dữ liệu mẫu lên blockchain (transaction đơn giản)
2. ✅ Truy vấn lại dữ liệu thông qua API (read-only)
3. ✅ Xuất dữ liệu ra JSON/CSV

### 10.2 Architecture Demo

```
┌─────────────────────────────────────────────────┐
│         Demo Application                        │
├─────────────────────────────────────────────────┤
│  Frontend (React/HTML)                          │
│    - Form nhập liệu                              │
│    - Display data                                │
│    - Export JSON/CSV                             │
├─────────────────────────────────────────────────┤
│  Backend (Node.js/Python)                       │
│    - Construct transactions                      │
│    - Call RPC API                                │
│    - Query data                                  │
├─────────────────────────────────────────────────┤
│  Smart Contract (Rust/JS)                       │
│    - set_data(key, value)                        │
│    - get_data(key)                               │
│    - get_all_data()                              │
├─────────────────────────────────────────────────┤
│  NEAR Blockchain                                │
│    - Testnet (free)                              │
│    - RPC API endpoints                           │
│    - State storage                               │
└─────────────────────────────────────────────────┘
```

### 10.3 Tech Stack

**Option 1: JavaScript/TypeScript**
- `near-api-js` - Official JS library
- React for frontend
- Node.js backend

**Option 2: Python**
- `near-api-py` - Python library
- Flask/FastAPI backend
- Simple HTML frontend

**Option 3: Rust**
- `near-sdk-rs` - Contract development
- Rust backend
- WebAssembly

### 10.4 Demo Features

**Feature 1: Simple Key-Value Store**
```javascript
// Smart Contract
pub fn set_data(&mut self, key: String, value: String) {
    self.data.insert(key, value);
}

pub fn get_data(&self, key: String) -> Option<String> {
    self.data.get(&key).cloned()
}

pub fn get_all_data(&self) -> Vec<(String, String)> {
    self.data.iter().collect()
}
```

**Feature 2: Transaction History**
- Store metadata: timestamp, sender, action
- Query by date range
- Export to CSV

**Feature 3: State Visualization**
- Display current contract state
- Show block height
- Show transaction hash

### 10.5 Implementation Steps

**Phase 1: Setup**
1. Create NEAR testnet account
2. Install near-cli
3. Setup development environment

**Phase 2: Smart Contract**
1. Design data structure
2. Implement CRUD operations
3. Deploy to testnet

**Phase 3: Backend**
1. Setup RPC connection
2. Implement transaction creation
3. Implement query functions
4. Add error handling

**Phase 4: Frontend**
1. Create simple UI
2. Connect to backend
3. Display data in table
4. Add export functionality

**Phase 5: Testing**
1. Test write operations
2. Test read operations
3. Verify data persistence
4. Test export functions

### 10.6 Code Examples

**Example 1: Connect to NEAR**
```javascript
const { connect, keyStores } = require("near-api-js");

const config = {
  networkId: "testnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://testnet.mynearwallet.com/",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://testnet.nearblocks.io",
};

const near = await connect(config);
const account = await near.account("your-account.testnet");
```

**Example 2: Call Contract**
```javascript
// View function (read-only, no gas)
const result = await account.viewFunction({
  contractId: "contract.testnet",
  methodName: "get_data",
  args: { key: "user123" }
});

// Change function (requires gas)
const result = await account.functionCall({
  contractId: "contract.testnet",
  methodName: "set_data",
  args: { key: "user123", value: "Hello NEAR" },
  gas: "300000000000000",  // 300 TGas
  attachedDeposit: "0"      // No NEAR attached
});
```

**Example 3: Query via RPC**
```javascript
const { JsonRpcProvider } = require("near-api-js");

const provider = new JsonRpcProvider("https://rpc.testnet.near.org");

// Query contract state
const state = await provider.query({
  request_type: "view_state",
  finality: "final",
  account_id: "contract.testnet",
  prefix_base64: ""
});

// Decode state
state.values.forEach(item => {
  const key = Buffer.from(item.key, 'base64').toString('utf8');
  const value = Buffer.from(item.value, 'base64').toString('utf8');
  console.log(`${key}: ${value}`);
});
```

**Example 4: Export to JSON**
```javascript
const fs = require('fs');

async function exportData() {
  const allData = await account.viewFunction({
    contractId: "contract.testnet",
    methodName: "get_all_data",
    args: {}
  });
  
  const jsonData = JSON.stringify(allData, null, 2);
  fs.writeFileSync('export.json', jsonData);
  console.log('Data exported to export.json');
}
```

**Example 5: Export to CSV**
```javascript
const fs = require('fs');

function exportToCSV(data) {
  let csv = 'Key,Value,BlockHeight,Timestamp\n';
  
  data.forEach(item => {
    csv += `${item.key},${item.value},${item.block_height},${item.timestamp}\n`;
  });
  
  fs.writeFileSync('export.csv', csv);
  console.log('Data exported to export.csv');
}
```

---

## 11. So sánh với CSDL quan hệ

### 11.1 INSERT operation

| Aspect | Relational DB | NEAR Blockchain |
|--------|--------------|-----------------|
| **Mechanism** | INSERT statement | Transaction → Receipt → State change |
| **Speed** | Milliseconds | 1-3 seconds (finality) |
| **Cost** | Compute resources | Gas fee + Storage staking |
| **Rollback** | Possible (txn rollback) | Immutable once final |
| **Validation** | DB constraints | Smart contract logic |
| **Concurrency** | ACID transactions | Concurrent execution via sharding |

### 11.2 SELECT operation

| Aspect | Relational DB | NEAR Blockchain |
|--------|--------------|-----------------|
| **Mechanism** | SELECT statement | RPC query / View function |
| **Speed** | Milliseconds (indexed) | Depends on data size |
| **Complexity** | SQL (JOIN, WHERE, etc.) | Limited (no complex queries) |
| **Cost** | Compute resources | Free (read-only) |
| **Indexing** | Built-in indexes | Manual indexing via indexers |
| **Historical** | Backup/snapshot | All history available |

### 11.3 Key Differences

**Advantages of Blockchain:**
1. **Immutability**: Data cannot be changed once written
2. **Transparency**: All data public and verifiable
3. **Decentralization**: No single point of failure
4. **Audit trail**: Complete history of all changes
5. **Trustless**: No need to trust centralized authority

**Advantages of Relational DB:**
1. **Performance**: Much faster for complex queries
2. **Flexibility**: Complex queries, joins, aggregations
3. **Cost**: No gas fees for operations
4. **Privacy**: Data can be private
5. **Recovery**: Can rollback, restore from backup

### 11.4 Use Cases

**Use Blockchain when:**
- Need immutable audit trail
- Multi-party trust required
- Transparency important
- Decentralization needed
- Value transfer (tokens, assets)

**Use Relational DB when:**
- High performance required
- Complex queries needed
- Data privacy important
- Frequent updates
- Cost-sensitive operations

---

## References

### Official Documentation
- [NEAR Protocol Docs](https://docs.near.org/)
- [NEAR Architecture](https://docs.near.org/protocol/architecture)
- [NEAR Data Flow](https://docs.near.org/protocol/data-flow/near-data-flow)
- [Smart Contract Storage](https://docs.near.org/smart-contracts/anatomy/storage)
- [RPC API](https://docs.near.org/api/rpc/introduction)

### Tools & Libraries
- [near-api-js](https://docs.near.org/tools/near-api)
- [near-cli](https://docs.near.org/tools/near-cli)
- [NEAR SDK](https://docs.near.org/smart-contracts/quickstart)

### Data Infrastructure
- [BigQuery Dataset](https://docs.near.org/data-infrastructure/big-query)
- [FastNEAR API](https://github.com/fastnear/fastnear-api-server-rs)
- [NearBlocks API](https://api.nearblocks.io/api-docs/)

---

**Note:** Tài liệu này sẽ được cập nhật thêm trong quá trình demo development.
