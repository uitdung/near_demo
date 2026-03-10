# NEAR Key-Value Store Contract (Rust)

Smart contract bằng Rust để minh họa lưu trữ và truy vấn dữ liệu trên NEAR Blockchain.

## Build

```bash
# Install the NEAR contract build tool once
cargo install cargo-near --locked

# Build a NEAR-compatible release artifact
cargo near build
```

Output artifact:

```text
target/near/near_kv_store.wasm
```

> [!IMPORTANT]
> Không nên deploy file build thô từ `target/wasm32-unknown-unknown/release`, vì có thể gặp lỗi `CompilationError(PrepareError(Deserialization))` trên NEAR.

## Deploy

```bash
# Install near-cli-rs once
npm install -g near-cli-rs@latest

near deploy $NEAR_CONTRACT_ID ./target/near/near_kv_store.wasm --networkId testnet
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
