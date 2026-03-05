# NEAR Key-Value Store Contract (Rust)

Smart contract bằng Rust để minh họa lưu trữ và truy vấn dữ liệu trên NEAR Blockchain.

## Build

```bash
# Build release
cargo build --target wasm32-unknown-unknown --release

# Hoặc dùng near-cli
near build
```

## Deploy

```bash
near deploy --accountId $NEAR_CONTRACT_ID --wasmFile target/wasm32-unknown-unknown/release/near_kv_store.wasm
```

## Usage

### View Methods (Free)

```bash
# Get single data
near view $CONTRACT_ID get_data '{"key": "user1"}'

# Get all data
near view $CONTRACT_ID get_all_data

# Count entries
near view $CONTRACT_ID count
```

### Change Methods (Cost Gas)

```bash
# Set data
near call $CONTRACT_ID set_data '{"key": "user1", "value": "Alice"}' --accountId your-account.testnet

# Delete data
near call $CONTRACT_ID delete_data '{"key": "user1"}' --accountId your-account.testnet
```

## Contract API

| Method | Type | Description |
|--------|------|-------------|
| `set_data(key, value)` | Change | Lưu data (payable) |
| `get_data(key)` | View | Lấy data theo key |
| `get_all_data()` | View | Lấy tất cả data |
| `delete_data(key)` | Change | Xóa data |
| `count()` | View | Đếm số entries |
