# NEAR Protocol - Core Concepts

**Ngày tạo:** 05/03/2026  
**Mục đích:** Tổng quan NEAR Protocol, kiến trúc, cấu trúc dữ liệu và sharding

---

## Mục Lục

1. [Tổng quan NEAR Protocol](#1-tổng-quan-near-protocol)
2. [Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cấu trúc dữ liệu: Block, Transaction, State](#3-cấu-trúc-dữ-liệu-block-transaction-state)
4. [Cơ chế Sharding - Nightshade](#4-cơ-chế-sharding---nightshade)

---

## 1. Tổng quan NEAR Protocol

NEAR Protocol là một blockchain layer-1 có khả năng mở rộng cao (scalable), sử dụng cơ chế sharding để phân mảnh dữ liệu khi hệ thống mở rộng.

### Đặc điểm chính
- **Stateful blockchain**: Mỗi account có state riêng, được thay đổi thông qua transactions
- **Sharded nature**: Hệ thống được phân mảnh thành nhiều shards song song
- **Block time**: ~1 giây
- **Finality**: 1-3 blocks (~1-3 giây)

### Key Components
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

## Navigation

- [⬆️ Index](index.md)
- [➡️ Data Operations (INSERT/SELECT)](05-06-data-operations.md)
