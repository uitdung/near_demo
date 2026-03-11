# NEAR Key-Value Store Contract (Rust)

Smart contract bằng Rust để minh họa lưu trữ và truy vấn dữ liệu trên NEAR Blockchain.

## Build

```bash
# Install the NEAR contract build tool once
cargo install cargo-near --locked

# Use Rust 1.86 for this contract (already pinned in rust-toolchain.toml)
# Build a NEAR-compatible release artifact
cargo near build non-reproducible-wasm --no-abi
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
near call $NEAR_CONTRACT_ID new "{}" --useAccount $NEAR_CONTRACT_ID --networkId testnet
near view $NEAR_CONTRACT_ID count "{}" --networkId testnet
```

> [!WARNING]
> Trong quá trình test thực tế, các lệnh scripted kiểu `near call ... '{}'` có thể báo `Data not in JSON format!`. Dùng cú pháp đã test thành công ở trên với `"{}"` cho init / verify thủ công.

## Usage

### View Methods (Free)

```bash
# Get single data
near view $CONTRACT_ID get_data '{"key":"user1"}' --networkId testnet

# Get all data
near view $CONTRACT_ID get_all_data "{}" --networkId testnet

# Count entries
near view $CONTRACT_ID count "{}" --networkId testnet
```

### Change Methods (Cost Gas)

```bash
# Set data
near call $CONTRACT_ID set_data '{"key":"user1","value":"Alice"}' --useAccount your-account.testnet --networkId testnet

# Delete data
near call $CONTRACT_ID delete_data '{"key":"user1"}' --useAccount your-account.testnet --networkId testnet
```

## Contract API

| Method | Type | Description |
|--------|------|-------------|
| `set_data(key, value)` | Change | Lưu data (payable) |
| `get_data(key)` | View | Lấy data theo key |
| `get_all_data()` | View | Lấy tất cả data |
| `delete_data(key)` | Change | Xóa data |
| `count()` | View | Đếm số entries |
