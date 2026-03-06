# NEAR Protocol - Implementation Guide

**Ngày tạo:** 05/03/2026  
**Mục đích:** Demo plan, so sánh với CSDL quan hệ và code examples

---

## Mục Lục

10. [Demo Plan](#10-demo-plan)
11. [So sánh với CSDL quan hệ](#11-so-sánh-với-csdl-quan-hệ)
12. [Code Examples](#12-code-examples)

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

## 12. Code Examples

### Example 1: Connect to NEAR

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

### Example 2: Call Contract

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

### Example 3: Query via RPC

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

### Example 4: Export to JSON

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

### Example 5: Export to CSV

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

## Navigation

- [⬅️ Data Integrity](07-09-data-integrity.md)
- [⬆️ Index](index.md)
