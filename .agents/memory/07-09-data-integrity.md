# NEAR Protocol - Data Integrity & Infrastructure

**Ngày tạo:** 05/03/2026  
**Mục đích:** Tính bất biến dữ liệu, storage staking và hạ tầng dữ liệu

---

## Mục Lục

7. [Đảm bảo tính bất biến dữ liệu](#7-đảm-bảo-tính-bất-biến-dữ-liệu)
8. [Storage Staking](#8-storage-staking)
9. [Data Infrastructure](#9-data-infrastructure)

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

## Navigation

- [⬅️ Data Operations](05-06-data-operations.md)
- [⬆️ Index](index.md)
- [➡️ Implementation](10-12-implementation.md)
