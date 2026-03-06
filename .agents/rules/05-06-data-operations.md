---
trigger: always_on
glob: 
description: 05 06 data operations
---
# NEAR Protocol - Data Operations (INSERT/SELECT)

**Ngày tạo:** 05/03/2026  
**Mục đích:** Nguyên lý ghi và truy vấn dữ liệu trên NEAR

---

## Mục Lục

5. [Nguyên lý ghi dữ liệu (INSERT)](#5-nguyên-lý-ghi-dữ-liệu-insert)
6. [Nguyên lý truy vấn dữ liệu (SELECT)](#6-nguyên-lý-truy-vấn-dữ-liệu-select)

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
        "key": "U1RBVEU=",
        "value": "SGVsbG8="
      }
    ]
  }
}
```
*Note: Key và Value được Base64 encoded*

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
    "result": [34, 71, 114, 101, 101, 116, 105, 110, 103, ...]
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

## Navigation

- [⬅️ Core Concepts](01-04-core-concepts.md)
- [⬆️ Index](index.md)
- [➡️ Data Integrity](07-09-data-integrity.md)
