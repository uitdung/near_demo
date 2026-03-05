
<rule-file name="document-reference">
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
</rule-file>

<rule-file name="main-documents">
# NEAR Protocol Documentation

> NEAR is a layer-1 blockchain built for scale and multichain compatibility,
> featuring AI-native infrastructure and chain abstraction capabilities.
> This documentation covers smart contracts, Web3 applications, AI agents,
> cross-chain development, and the complete NEAR ecosystem.

NEAR Protocol is a proof-of-stake blockchain that enables developers to build
decentralized applications with seamless user experiences. Key features include
human-readable account names, minimal transaction fees, and built-in developer
tools. The platform supports multiple programming languages and provides chain
abstraction for cross-blockchain interactions.

This documentation is organized into several main sections: Protocol fundamentals,
AI and agent development, chain abstraction features, smart contract development,
Web3 application building, and comprehensive API references. Each section includes
tutorials, examples, and detailed technical specifications.


## Core Protocol
- [Access Keys](https://docs.near.org/protocol/access-keys.md): Learn about NEAR's access key system with Full-Access Keys for complete account control and Function-Call Keys for restricted, shareable permissions to specific contracts.
- [Address (Account ID)](https://docs.near.org/protocol/account-id.md): Learn all about NEAR account addresses
- [NEAR Accounts](https://docs.near.org/protocol/account-model.md): Learn about NEAR Protocol's account model, including named and implicit accounts, access keys, permissions, and how NEAR accounts differ from other blockchain platforms.
- [Architecture](https://docs.near.org/protocol/architecture.md): A comprehensive high-level overview of NEAR Protocol's architecture
- [What is NEAR?](https://docs.near.org/protocol/basics.md): A scalable and secure chain with an amazing developer experience
- [NEAR Data Flow](https://docs.near.org/protocol/data-flow/near-data-flow.md): Learn how data flows in NEAR Protocol, including transactions, receipts, shards, and cross-shard communication.
- [Token Transfer](https://docs.near.org/protocol/data-flow/token-transfer-flow.md): Learn all steps involved on a token transfer.
- [Gas (Execution Fees)](https://docs.near.org/protocol/gas.md): Learn about NEAR's gas system - execution fees that prevent spam, incentivize developers with 30% of burned gas, and use deterministic gas units with dynamic pricing.
- [Epoch](https://docs.near.org/protocol/network/epoch.md): Learn about epochs in NEAR Protocol, including their duration, role in validator selection, and how they affect network operations and data retention.
- [NEAR Networks](https://docs.near.org/protocol/network/networks.md): Explore the different networks available in NEAR
- [Runtime](https://docs.near.org/protocol/network/runtime.md): Explore NEAR Protocol's runtime system, including core runtime operations, cross-contract calls, action and data receipts, and state management.
- [Validator Staking](https://docs.near.org/protocol/network/staking.md): Learn how to stake NEAR, delegate to validators, track rewards, and withdraw staked tokens safely.
- [Avoiding Token Loss](https://docs.near.org/protocol/network/token-loss.md): Learn about scenarios that can lead to token loss in NEAR Protocol and how to prevent them, including key management, account deletion, and smart contract failures.
- [Tokens](https://docs.near.org/protocol/network/tokens.md): Learn about NEAR's native token and its role in the network
- [Validators](https://docs.near.org/protocol/network/validators.md): Learn about NEAR Protocol validators, their roles in network security, consensus mechanisms, validator economics, and how to become a validator.
- [Decentralized Storage Solutions](https://docs.near.org/protocol/storage/storage-solutions.md): Explore decentralized storage alternatives for NEAR Protocol applications, including Arweave, Crust, and IPFS integration for cost-effective data storage.
- [Storage Staking](https://docs.near.org/protocol/storage/storage-staking.md): Learn about NEAR Protocol's storage staking mechanism, including costs, storage pricing, attack prevention, and strategies for managing on-chain data storage.
- [Anatomy of a Transaction](https://docs.near.org/protocol/transaction-anatomy.md): Learn about the structure and components of NEAR Protocol transactions, including signers, receivers, actions, and transaction validation fields.
- [Lifecycle of a Transaction](https://docs.near.org/protocol/transaction-execution.md): Learn how NEAR transactions are executed and finalized
- [Transactions](https://docs.near.org/protocol/transactions.md): Learn how users interact with NEAR through transactions composed of actions, signed with private keys, and processed by the network with deterministic gas costs.

## AI and Agents
- [AI and NEAR](https://docs.near.org/ai/introduction.md): Introduction to NEAR's User-Owned AI vision, featuring Shade Agents and NEAR AI.
- [NEAR MCP Server](https://docs.near.org/ai/near-mcp.md): Equip AI agents with tools for using the NEAR blockchain via Model Context Protocol (MCP).
- [AI Inference](https://docs.near.org/ai/shade-agents/concepts/ai-inference.md): Learn how to use AI with Shade Agents.
- [Framework Overview](https://docs.near.org/ai/shade-agents/concepts/framework-overview.md): Learn about the core components of the Shade Agent Framework with a high-level overview of each of its parts.
- [Security Considerations](https://docs.near.org/ai/shade-agents/concepts/security.md): Learn key security practices when deploying Shade Agents, including preventing duplicate actions, handling failed or unsent transactions, restricting API routes, removing agent contract keys, removing local deployment, approved measurements limits, public logs, storing agent keys, public PPIDs, fixed Docker images, trusting RPCs, and verifying the state.
- [Terminology](https://docs.near.org/ai/shade-agents/concepts/terminology.md): Learn the key terms and concepts used in the Shade Agent Framework.
- [What can you Build?](https://docs.near.org/ai/shade-agents/concepts/what-can-you-build.md): Explore the features of Shade Agents and what they enable you to build, including Agentic Protocols, autonomous yield optimizers, and verifiable oracles.
- [Shade Agents](https://docs.near.org/ai/shade-agents/getting-started/introduction.md): Learn about Shade Agents - decentralized and trustless AI agents that control accounts and assets across multiple blockchains using TEEs and NEAR's decentralized key management.
- [Key Components](https://docs.near.org/ai/shade-agents/getting-started/quickstart/components.md): Learn about the components of a simple Shade Agent.
- [Deploying an Agent](https://docs.near.org/ai/shade-agents/getting-started/quickstart/deploying.md): Learn how to quickly deploy your first Shade Agent.
- [Agent Contract](https://docs.near.org/ai/shade-agents/reference/agent-contract.md): Review the agent contract template for the Shade Agent Framework.
- [Shade Agent API](https://docs.near.org/ai/shade-agents/reference/api.md): Use the Shade Agent API (TypeScript/JavaScript) to connect your agent to the Shade Agent Framework
- [Shade Agent CLI](https://docs.near.org/ai/shade-agents/reference/cli.md): Use the Shade Agent CLI to deploy your Shade Agent.
- [DAO Agent Contract](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/dao-agent-contract.md): Learn about the key parts of the agent contract as part of the Verifiable AI DAO Shade Agent tutorial, including how to create a custom agent contract and create a yield and resume-based Shade Agent.
- [DAO Agent](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/dao-agent.md): Learn about the key parts of the agent as part of the Verifiable AI DAO Shade tutorial that walks through how to index the agent contract, using verifiable AI, and interacting with the custom agent contract.
- [Deploying the AI DAO](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/deploying.md): Learn how to deploy the Verifiable AI DAO Shade Agent which includes how to deploy a custom agent contract.
- [Overview](https://docs.near.org/ai/shade-agents/tutorials/ai-dao/overview.md): A brief overview of the Verifiable AI DAO tutorial built using the Shade Agent Framework that walks through NEAR native deployments, using yield and resume with Shade Agents and leveraging verifiable AI.
- [Tutorials and Templates](https://docs.near.org/ai/shade-agents/tutorials/tutorials-overview.md): Review the list of our Shade Agent tutorials and templates.
- [Using NEAR documentation with your AI Coding Agents](https://docs.near.org/ai/using-llms.md): Using llms.txt to improve your workflow when using AI coding agents.

## Chain Abstraction
- [What are Chain Signatures?](https://docs.near.org/chain-abstraction/chain-signatures.md): Learn how Chain Signatures enable NEAR accounts to sign and execute transactions across multiple blockchains using Multi-Party Computation for secure cross-chain operations.
- [Getting Started with Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures/getting-started.md): Learn how to sign and execute cross-chain transactions
- [Implementing Chain Signatures](https://docs.near.org/chain-abstraction/chain-signatures/implementation.md): Learn how to sign transactions across multiple blockchains.
- [Rollup Data Availability](https://docs.near.org/chain-abstraction/data-availability.md): Learn about NEAR's Data Availability layer for rollups, including blob store contracts, light clients, RPC nodes, and integrations with L2 solutions like Polygon CDK and Optimism.
- [FastAuth SDK](https://docs.near.org/chain-abstraction/fastauth-sdk.md): Learn about FastAuth SDK, a key management system that enables users to recover or sign up for NEAR accounts using their email address.
- [NEAR Intents](https://docs.near.org/chain-abstraction/intents/overview.md): Learn how the intents protocol works
- [Building a Meta Transaction Relayer](https://docs.near.org/chain-abstraction/meta-transactions-relayer.md): Learn how to build a meta transaction relayer that allows users to transact on NEAR without paying gas fees while maintaining transaction security through signed delegates.
- [Meta Transactions](https://docs.near.org/chain-abstraction/meta-transactions.md): Learn about NEP-366 meta transactions on NEAR, allowing users to execute transactions without owning gas tokens by using relayers to cover transaction fees.
- [How Omni Bridge Works](https://docs.near.org/chain-abstraction/omnibridge/how-it-works.md): Learn how Omni Bridge uses Chain Signatures to enable cross-chain transfers.
- [Implementation Details](https://docs.near.org/chain-abstraction/omnibridge/implementation-details.md): Explore Omni Bridge's technical architecture
- [Omni Bridge Overview](https://docs.near.org/chain-abstraction/omnibridge/overview.md): Learn about Omni Bridge, a multi-chain asset bridge that enables secure and efficient transfers between blockchain networks using Chain Signatures and MPC technology.
- [Omni Bridge Roadmap](https://docs.near.org/chain-abstraction/omnibridge/roadmap.md): Explore the Omni Bridge roadmap, including hybrid architecture launch, Chain Signatures migration path, and future development plans for cross-chain infrastructure.
- [What is Chain Abstraction?](https://docs.near.org/chain-abstraction/what-is.md): Learn how NEAR allows you to seamlessly work across all chains

## Smart Contracts
- [Transfers & Actions](https://docs.near.org/smart-contracts/anatomy/actions.md): Learn how contracts can make transfers, call other contracts, and more
- [Basic Anatomy](https://docs.near.org/smart-contracts/anatomy/anatomy.md): Learn the basic anatomy of all smart contracts.
- [Best Practices](https://docs.near.org/smart-contracts/anatomy/best-practices.md): A collection of best practices for writing smart contracts on NEAR.
- [Collections](https://docs.near.org/smart-contracts/anatomy/collections.md): Efficiently store, access, and manage data in smart contracts.
- [Cross-Contract Calls](https://docs.near.org/smart-contracts/anatomy/crosscontract.md): Contract can interact with other contracts on the network
- [Environment](https://docs.near.org/smart-contracts/anatomy/environment.md): Know which account called you, how much gas and tokens were attached, and more.
- [External Interface](https://docs.near.org/smart-contracts/anatomy/functions.md): Learn how to define your contract's interface.
- [Reducing Contract Size](https://docs.near.org/smart-contracts/anatomy/reduce-size.md): Learn strategies to reduce NEAR smart contract size for optimized deployment and performance.
- [Reproducible Builds](https://docs.near.org/smart-contracts/anatomy/reproducible-builds.md): Create identical builds across different developer environments.
- [Serialization Protocols](https://docs.near.org/smart-contracts/anatomy/serialization-protocols.md): Learn which protocols smart contracts use to serialize data.
- [Notes on Serialization](https://docs.near.org/smart-contracts/anatomy/serialization.md): Learn how contract serialize data for function calls and storage.
- [State](https://docs.near.org/smart-contracts/anatomy/storage.md): Explore how NEAR smart contracts manage their state.
- [SDK Types](https://docs.near.org/smart-contracts/anatomy/types.md): Learn everything the SDK has to offer to efficiently store data.
- [Yield and Resume](https://docs.near.org/smart-contracts/anatomy/yield-resume.md): Wait for an external response and resume execution
- [Contracts List](https://docs.near.org/smart-contracts/contracts-list.md): Explore NEAR contracts deployed across projects.
- [Global Contracts](https://docs.near.org/smart-contracts/global-contracts.md): Deploy a contract once and reuse it across accounts.
- [Your First Smart Contract](https://docs.near.org/smart-contracts/quickstart.md): Create your first contract using your favorite language.
- [Deploying](https://docs.near.org/smart-contracts/release/deploy.md): Deploy a contract to the network.
- [Locking Accounts](https://docs.near.org/smart-contracts/release/lock.md): Learn how to lock NEAR smart contracts to prevent unauthorized modifications and ensure contract immutability when needed.
- [Updating Contracts](https://docs.near.org/smart-contracts/release/upgrade.md): Learn how to upgrade NEAR smart contracts safely, including programmatic updates, migration strategies, and best practices for contract versioning.
- [Cross-Contract Calls](https://docs.near.org/smart-contracts/security/callbacks.md): Learn about callback security in NEAR smart contracts, including proper error handling, state management, and preventing callback-related vulnerabilities.
- [✅ Checklist](https://docs.near.org/smart-contracts/security/checklist.md): Best practices for security and common safeguards.
- [Front Running](https://docs.near.org/smart-contracts/security/frontrunning.md): Learn about frontrunning attacks in NEAR smart contracts and how to prevent them with proper transaction ordering and MEV protection techniques.
- [Ensure it is the User (1yⓃ)](https://docs.near.org/smart-contracts/security/one-yocto.md): Learn about the one yocto security pattern in NEAR smart contracts for verifying account ownership and preventing unauthorized access.
- [Random Numbers](https://docs.near.org/smart-contracts/security/random.md): Learn about secure random number generation in NEAR smart contracts and how to avoid predictable randomness vulnerabilities.
- [Reentrancy Attacks](https://docs.near.org/smart-contracts/security/reentrancy.md): Learn about reentrancy attacks in NEAR smart contracts and how to prevent them with proper security measures and coding practices.
- [Million Small Deposits](https://docs.near.org/smart-contracts/security/storage.md): Learn about storage security best practices in NEAR smart contracts, including storage costs, state management, and preventing storage-related vulnerabilities.
- [Sybil Attacks](https://docs.near.org/smart-contracts/security/sybil.md): Learn about sybil attacks in NEAR smart contracts and how to prevent them with proper identity verification and anti-gaming mechanisms.
- [Security](https://docs.near.org/smart-contracts/security/welcome.md): Learn about smart contract security best practices on NEAR, including common vulnerabilities, attack vectors, and how to build secure decentralized applications.
- [Integration Tests](https://docs.near.org/smart-contracts/testing/integration-test.md): Learn how to write and run integration tests for NEAR smart contracts using Sandbox testing and realistic blockchain environments.
- [Introduction](https://docs.near.org/smart-contracts/testing/introduction.md): Learn about testing NEAR smart contracts, including unit tests, integration tests, and best practices for ensuring contract reliability and security.
- [Unit Testing](https://docs.near.org/smart-contracts/testing/unit-test.md): Learn how to write and run unit tests for NEAR smart contracts to test individual methods and functions in isolation.
- [Using our Basic Examples](https://docs.near.org/smart-contracts/tutorials/basic-contracts.md): Learn NEAR smart contract basics through practical examples: Counter, Guest Book, Donation, Coin Flip, and Hello World.
- [What is a Smart Contract?](https://docs.near.org/smart-contracts/what-is.md): Learn about the apps that can live in our accounts.

## Web3 Applications
- [Authenticate NEAR Users](https://docs.near.org/web3-apps/backend/backend-login.md): Learn how to authenticate NEAR users in your backend service by creating challenges, requesting wallet signatures, and verifying signatures.
- [Handling NEAR Types](https://docs.near.org/web3-apps/concepts/data-types.md): Learn how to handle common data types when interacting with NEAR
- [Web Login Methods](https://docs.near.org/web3-apps/concepts/web-login.md): Learn all the login options available for your website or web app
- [Your First Web3 App](https://docs.near.org/web3-apps/quickstart.md): Quick guide to create a Web3 frontend application with NEAR integration - build a React/Next.js app where users can login with wallets and interact with smart contracts.
- [Introduction](https://docs.near.org/web3-apps/tutorials/localnet/introduction.md): Learn what is localnet on NEAR.
- [Run Your Own Localnet](https://docs.near.org/web3-apps/tutorials/localnet/run.md): Learn how to run a localnet on NEAR.
- [Wallet Login](https://docs.near.org/web3-apps/tutorials/wallet-login.md): Connect users to NEAR wallets with a secure, sandbox-based connector library
- [What are Web3 Apps?](https://docs.near.org/web3-apps/what-is.md): Learn about Web3 applications (dApps) that leverage smart contracts and blockchain data to offer transparency, security, and user control over assets and data.

## Tokens and Primitives
- [Decentralized Autonomous Organizations](https://docs.near.org/primitives/dao.md): Learn about Decentralized Autonomous Organizations (DAOs) on NEAR - self-organized groups that coordinate membership, decision-making, and funding through smart contract voting.
- [Decentralized Exchanges (DEX)](https://docs.near.org/primitives/dex.md): Learn how to interact with decentralized exchanges on NEAR Protocol, including token swapping, liquidity pools, and integration with Ref Finance DEX.
- [Decentralized Identifiers (DIDs)](https://docs.near.org/primitives/did.md): Learn about W3C-compliant identity resolution on NEAR.
- [Using FTs](https://docs.near.org/primitives/ft/ft.md): Learn how to create, transfer, and integrate FT in your dApp
- [Create FT using Contract Tools](https://docs.near.org/primitives/ft/sdk-contract-tools.md): Learn how to create a fungible token (FT) using Contract Tools package
- [The Standard](https://docs.near.org/primitives/ft/standard.md): Learn how Fungible Tokens (FT) are defined on NEAR
- [Using Linkdrops](https://docs.near.org/primitives/linkdrop/linkdrop.md): Learn about linkdrops following NEP-452 standard - distribute assets and onboard users to Web3 apps through simple web links using access keys and the Keypom platform.
- [The Standard](https://docs.near.org/primitives/linkdrop/standard.md): Learn how Linkdrops are defined on NEAR
- [Deploying Your Own Contract](https://docs.near.org/primitives/liquid-staking/deploy-your-own-contract.md): Learn how to deploy your own Liquid Staking Contract on NEAR
- [Using Liquid Staking](https://docs.near.org/primitives/liquid-staking/liquid-staking.md): Learn about Liquid Staking on NEAR — a smart contract that issues a fungible token representing staked NEAR, enabling instant liquidity and validator diversification.
- [Introduction](https://docs.near.org/primitives/lockup/introduction.md): Learn about Lockup contracts on NEAR – smart contracts that escrow tokens with time-based release schedules, supporting lockups, vesting, staking, and termination by foundation.
- [Lockup Contracts](https://docs.near.org/primitives/lockup/lockup.md): Learn about Lockup contracts on NEAR – smart contracts that escrow tokens with time-based release schedules, supporting lockups, vesting, staking, and termination by foundation.
- [Create NFT using Contract Tools](https://docs.near.org/primitives/nft/nft-contract-tools.md): Learn how to create a non-fungible token (NFT) using Contract Tools package
- [Using NFTs](https://docs.near.org/primitives/nft/nft.md): Learn about NEAR non-fungible tokens (NFT) following NEP-171 and NEP-177 standards - mint, transfer, query, and trade unique digital assets with comprehensive examples.
- [The Standard](https://docs.near.org/primitives/nft/standard.md): Learn how Non-Fungible Tokens (NFT) are defined on NEAR
- [Oracles](https://docs.near.org/primitives/oracles.md): Learn about blockchain oracles on NEAR Protocol, including price feeds, data integration, and using oracle services like NearDefi Price Oracle and Pyth Network.
- [What are Primitives?](https://docs.near.org/primitives/what-is.md): Learn about blockchain primitives including Fungible Tokens (FT), Non-Fungible Tokens (NFT), Decentralized Autonomous Organizations (DAO), and LinkDrops as building blocks for applications.

## Developer Tools
- [Clear Contract State](https://docs.near.org/tools/clear-state.md): Clean up a contract's state.
- [Explorer](https://docs.near.org/tools/explorer.md): Explore the chain through a Web UI.
- [NEAR API](https://docs.near.org/tools/near-api.md): Learn to use APIs in JavaScript, Rust, and Python to interact with the blockchain.
- [NEAR CLI](https://docs.near.org/tools/near-cli.md): Interact with NEAR through the terminal.
- [NEAR SDK](https://docs.near.org/tools/sdk.md): Choose an SDK to start building contracts.

## Tutorials and Examples
- [Auction factory](https://docs.near.org/tutorials/auction/auction-factory.md): Create new auctions through a factory.
- [Basic Auction](https://docs.near.org/tutorials/auction/basic-auction.md): Learn how to build n auction smart contract on NEAR.
- [Bidding with FTs](https://docs.near.org/tutorials/auction/bidding-with-fts.md): Learn how to enable bidding with fungible tokens
- [Creating a Frontend](https://docs.near.org/tutorials/auction/creating-a-frontend.md): Lets create a frontend for our auction using React.
- [Deploying to Testnet](https://docs.near.org/tutorials/auction/deploy.md): Lets deploy our action contract to testnet.
- [Indexing Historical Data](https://docs.near.org/tutorials/auction/indexing-historical-data.md): Using data apis to retrieve the history of auctions
- [A Step-by-Step Guide to Mastering NEAR](https://docs.near.org/tutorials/auction/introduction.md): Build a full web3 app, from its contract to a frontend using indexers.
- [Sandbox Testing](https://docs.near.org/tutorials/auction/sandbox-testing.md): Lets test our contract in a realistic sandbox environment.
- [Updating the Frontend](https://docs.near.org/tutorials/auction/updating-the-frontend.md): Update the frontend to display the new token information.
- [Winning an NFT](https://docs.near.org/tutorials/auction/winning-an-nft.md): Lets make the auction winner get an NFT.
- [Controlling a NEAR account](https://docs.near.org/tutorials/controlling-near-accounts/introduction.md): Learn to control a NEAR account securely using Multi-Party Computation.
- [Transfer Near tokens on behalf of a controlled account](https://docs.near.org/tutorials/controlling-near-accounts/transfer.md): Build transaction arguments, request MPC signatures, and broadcast signed NEAR token transfers securely.
- [Complex Cross Contract Call](https://docs.near.org/tutorials/examples/advanced-xcc.md): Batching, parallel actions, and callback handling.
- [Factory](https://docs.near.org/tutorials/examples/factory.md): Learn how a factory contract deploys other contracts on sub-accounts using a global contract ID.
- [Frontend Interacting with Multiple Contracts](https://docs.near.org/tutorials/examples/frontend-multiple-contracts.md): Interact with multiple contracts in your frontend.
- [Global Contracts](https://docs.near.org/tutorials/examples/global-contracts.md): Learn how to deploy a Global contract and use it from another account.
- [Near Drop](https://docs.near.org/tutorials/examples/near-drop.md): Learn how NEAR Drop enables token drops (NEAR, FT, NFT) claimable via private keys.
- [Self Upgrade & State Migration](https://docs.near.org/tutorials/examples/update-contract-migrate-state.md): Learn NEAR smart contract upgrades, including self-updating contracts, state migration, and versioning patterns.
- [Cross Contract Call](https://docs.near.org/tutorials/examples/xcc.md): Learn how to perform a basic cross-contract call on NEAR to set and retrieve greetings.
- [Fungible Tokens Zero to Hero](https://docs.near.org/tutorials/fts.md): Master NEAR fungible tokens from pre-deployed contracts to building fully-featured FT smart contracts.
- [Near Multi-Chain DAO Governance](https://docs.near.org/tutorials/multichain-dao/introduction.md): Learn how Abstract DAO enables a single vote on NEAR to execute actions across multiple EVM chains.
- [Abstract DAO: Requests](https://docs.near.org/tutorials/multichain-dao/request.md): Learn how to create a signature request in Abstract DAO to execute actions on foreign EVM chains.
- [Abstract Dao: Signatures](https://docs.near.org/tutorials/multichain-dao/signing.md): Learn how to sign Abstract DAO requests for different chains and relay them to target EVM networks.
- [MultiSig Voting](https://docs.near.org/tutorials/multichain-dao/voting.md): Learn how to deploy a MultiSig contract and vote on multi-chain proposals using the Abstract DAO.
- [NFT Zero to Hero JavaScript Edition](https://docs.near.org/tutorials/nfts-js.md): Learn NFTs from minting to building a full-featured smart contract in this Zero to Hero series.
- [NFT Zero to Hero](https://docs.near.org/tutorials/nfts.md): Learn how to mint NFTs and build a full NFT contract step by step.
- [Create a NEAR Account](https://docs.near.org/tutorials/protocol/create-account.md): Understand how to create a NEAR account using a wallet and the NEAR CLI
- [Importing a NEAR Account](https://docs.near.org/tutorials/protocol/importing-account.md): Learn how to import an existing NEAR account into a wallet or the CLI

## API Reference
- [Access Keys](https://docs.near.org/api/rpc/access-keys.md): Learn how to retrieve and track NEAR account access keys using the RPC
- [Block / Chunk](https://docs.near.org/api/rpc/block-chunk.md): Learn how to retrieve details about blocks and chunks from the RPC
- [Accounts / Contracts](https://docs.near.org/api/rpc/contracts.md): Learn to query information from accounts and contracts using the RPC
- [RPC Errors](https://docs.near.org/api/rpc/errors.md): Understand common RPC errors and how to handle them.
- [Gas](https://docs.near.org/api/rpc/gas.md): Query gas prices for specific blocks or hashes using the NEAR RPC API.
- [NEAR RPC API](https://docs.near.org/api/rpc/introduction.md): Learn how to interact with the NEAR network using the RPC API, including available providers, node snapshots, and quick links to all RPC endpoints.
- [Maintenance Windows](https://docs.near.org/api/rpc/maintenance-windows.md): Query future maintenance windows for validators in the current epoch using the NEAR RPC API.
- [Network](https://docs.near.org/api/rpc/network.md): Query node status, network connections, and active validators using the RPC.
- [Protocol](https://docs.near.org/api/rpc/protocol.md): Learn how to retrieve the genesis and current protocol configurations
- [RPC Providers](https://docs.near.org/api/rpc/providers.md): Discover NEAR RPC providers for mainnet and testnet
- [Setup](https://docs.near.org/api/rpc/setup.md): Learn how to configure NEAR RPC endpoints and test API requests
- [Transactions](https://docs.near.org/api/rpc/transactions.md): Send transactions and query their status using the RPC

## Data Infrastructure
- [BigQuery Public Dataset](https://docs.near.org/data-infrastructure/big-query.md): Learn how to use NEAR Protocol's BigQuery public dataset for blockchain data analysis, including querying on-chain data, understanding costs, and accessing historical transaction data.
- [Data APIs](https://docs.near.org/data-infrastructure/data-apis.md): Explore community-built APIs for accessing on-chain data
- [Existing Services](https://docs.near.org/data-infrastructure/data-services.md): Indexers are constantly listening for transactions and storing them so they can be easily queried.
- [Introduction to Indexers](https://docs.near.org/data-infrastructure/indexers.md): Learn about blockchain indexers, how they work with NEAR Protocol, the difference between pull and push models, and when to use indexers for data querying.
- [NEAR Lake Indexer](https://docs.near.org/data-infrastructure/lake-framework/near-lake.md): Learn how NEAR Lake indexes the network
- [What is NEAR Indexer?](https://docs.near.org/data-infrastructure/near-indexer.md): A framework to handle real-time events on the blockchain
- [What is Lake Framework?](https://docs.near.org/data-infrastructure/near-lake-framework.md): A library to build your own indexer using the existing Data Lake
- [Tutorial: Simple Indexer](https://docs.near.org/data-infrastructure/tutorials/listen-function-calls.md): This tutorial will guide you through building a simple indexer using the NEAR Lake Framework. The indexer will listen for FunctionCalls on a specific contract and log the details of each call.
- [Tutorial: Creating an Indexer](https://docs.near.org/data-infrastructure/tutorials/listen-to-realtime-events.md): This tutorial will guide you through building an indexer using the NEAR Indexer Framework. The indexer will listen for FunctionCalls on a specific contract and log the details of each call.
- [NFT Indexer](https://docs.near.org/data-infrastructure/tutorials/nft-indexer.md): Learn to build a simple NFT indexer with NEAR Lake Framework.
- [NFT indexer for Python](https://docs.near.org/data-infrastructure/tutorials/python-nft-indexer.md): Learn to build a Python NFT indexer with NEAR Lake Framework
- [Credentials](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/credentials.md): Learn how to provide AWS credentials to access NEAR Lake data
- [Start options](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/lake-start-options.md): Learn how to create an indexer using the NEAR Lake Framework.
- [Running Lake Indexer](https://docs.near.org/data-infrastructure/tutorials/running-near-lake/run-lake-indexer.md): Learn how to set up and run a NEAR Lake Indexer, including prerequisites, network configuration, and commands for syncing from the latest or a specific block.
- [Tutorial: State Changes](https://docs.near.org/data-infrastructure/tutorials/state-changes.md): This tutorial will guide you through building a simple indexer using the NEAR Lake Framework. The indexer will listen for StateChange events and print relevant data about account changes.
- [What is Data Infrastructure?](https://docs.near.org/data-infrastructure/what-is.md): Explore NEAR's data infrastructure for accessing on-chain data

## Integration Examples
- [Accounts](https://docs.near.org/integrations/accounts.md): Learn about NEAR account management for exchanges and integrations, including account creation, key management, and balance tracking.
- [Balance changes](https://docs.near.org/integrations/balance-changes.md): Learn how to query and track account balances in NEAR protocol, including native NEAR tokens, fungible tokens, and balance management for integrations.
- [Create Transactions](https://docs.near.org/integrations/create-transactions.md): Learn how to create, sign, and send transactions on NEAR protocol, including transaction structure, actions, and best practices for integration.
- [Source Code Survey](https://docs.near.org/integrations/errors/error-implementation.md): Learn how to properly implement error handling in NEAR protocol applications, including best practices for catching and managing errors.
- [Introduction](https://docs.near.org/integrations/errors/introduction.md): Learn about common error patterns in NEAR protocol integrations and how to handle and troubleshoot issues in your applications.
- [Avoiding Token Loss](https://docs.near.org/integrations/errors/token-loss.md): Learn how to prevent and handle token loss scenarios in NEAR protocol integrations, including common causes and recovery strategies.
- [Exchange Integration](https://docs.near.org/integrations/exchange-integration.md): Learn how to integrate NEAR Protocol into exchanges, including transactions, accounts, tokens, blocks, finality, archival nodes, and staking.
- [Integrator FAQ](https://docs.near.org/integrations/faq.md): Frequently asked questions about NEAR protocol integrations, including account management, transaction fees, and common development challenges.
- [Fungible tokens](https://docs.near.org/integrations/fungible-tokens.md): Learn how to integrate NEAR tokens (NEAR, FT, and NFT) into your application, including balance queries, transfers, and token metadata.
- [Implicit Accounts](https://docs.near.org/integrations/implicit-accounts.md): Learn about implicit accounts in NEAR, how they work with Ethereum-style addresses, and their role in chain abstraction and multi-chain integration.

## Aurora
- [Build on Aurora](https://docs.near.org/aurora/build-on-aurora.md): Learn how to build on Aurora, our EVM compatible chain
- [Launch a Virtual Chain](https://docs.near.org/aurora/launch-virtual-chain.md): Learn how to create your own customized chain
- [What is Aurora?](https://docs.near.org/aurora/what-is.md): Learn about our EVM-compatible blockchain on NEAR

## Learning Quests
- [Access Keys & Permissions](https://docs.near.org/quest/accounts/access-keys.md): Learn about the two main types of NEAR Addresses
- [Address Types](https://docs.near.org/quest/accounts/address.md): Learn about the different types of accounts in NEAR Protocol
- [Introduction](https://docs.near.org/quest/accounts/introduction.md): Learn everything on NEAR accounts
- [Implicit & Named Accounts](https://docs.near.org/quest/accounts/named-vs-implicit.md): Learn about the two main types of NEAR Addresses
- [Smart Contracts](https://docs.near.org/quest/accounts/smart-contracts.md): Learn about the two main types of NEAR Addresses
- [Takeaways](https://docs.near.org/quest/accounts/takeaways.md): Main takeaways from this lesson
- [Building Blocks](https://docs.near.org/quest/dapps/building-blocks.md): Learn what are the main building blocks of Web3 apps
- [Examples of Web3 Apps](https://docs.near.org/quest/dapps/examples.md): Understand what kinds of applications can be built on NEAR Protocol with real-world examples.
- [Introduction](https://docs.near.org/quest/dapps/intro-to-web3.md): Learn what Decentralized applications are at a high level
- [Takeaways](https://docs.near.org/quest/dapps/takeaway.md): Final key takeaways and quiz to reinforce your understanding of Web3 applications on NEAR Protocol.
- [Why NEAR?](https://docs.near.org/quest/dapps/why-near.md): Discover why NEAR Protocol is the best choice for building Web3 applications
- [Understanding Data Flow in NEAR Protocol](https://docs.near.org/quest/data-flow.md): Learn how data moves through NEAR Protocol - understand transactions, receipts, gas fees, and how the blockchain processes your requests step by step.
- [Home](https://docs.near.org/quest/introduction.md): Learn NEAR development through interactive quests and challenges designed to build your skills step by step
- [Understanding the NEAR Network](https://docs.near.org/quest/near-network.md): Learn how the NEAR network operates - understand validators, epochs, different network environments, and how the blockchain stays secure and decentralized.
- [Understanding NEAR Primitives](https://docs.near.org/quest/primitives.md): Learn about NEAR Protocol's primitives - the fundamental building blocks that make Web3 applications possible. Understand tokens, NFTs, linkdrops, and DAOs in simple terms.
- [Understanding Smart Contracts](https://docs.near.org/quest/smart-contracts.md): Learn about smart contracts - the automated programs that power Web3 applications. Understand what they do, how they work, and the different programming languages you can use to build them.
</rule-file>

<rule-file name="project">
1. Tên đề tài
Phân tích Blockchain như một hệ cơ sở dữ liệu phân tán – Trường hợp NEAR Protocol (tập trung vào sharding và lưu trữ trạng thái)..
Trong đề tài này, tôi tiếp cận Blockchain như một hệ cơ sở dữ liệu phân tán đặc biệt, tập trung vào cách dữ liệu được lưu trữ, truy vấn và đảm bảo tính đúng của dữ liệu.

Nội dung chính tôi thực hiện gồm:

- Phân tích cách dữ liệu được tổ chức và lưu trữ trong Blockchain NEAR (block, transaction và trạng thái – state), và cơ chế sharding Nightshade để phân mảnh dữ liệu khi hệ thống mở rộng.
- Phân tích nguyên lý ghi dữ liệu (insert) và truy vấn dữ liệu (select) trong Blockchain, so sánh ngắn gọn với cơ sở dữ liệu quan hệ.
- Trình bày các nguyên lý đảm bảo dữ liệu không bị thay đổi, như liên kết block bằng hàm băm và cơ chế đồng thuận.
- Thực hiện demo nhỏ sử dụng thư viện chính thức của NEAR nhằm minh họa cơ chế lưu trữ và truy vấn dữ liệu:
+ Ghi dữ liệu mẫu lên Blockchain (transaction đơn giản)
+ Truy vấn lại dữ liệu thông qua API (read-only)
+ Xuất dữ liệu giao dịch hoặc trạng thái ra định dạng đơn giản (JSON/CSV) để phục vụ phân tích.

Về tổng thể, đề tài của tôi tập trung vào việc hiểu và minh họa các nguyên lý cốt lõi của Blockchain dưới góc nhìn cơ sở dữ liệu phân tán.
</rule-file>
