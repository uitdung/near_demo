# NEAR Contract State Layer (Rust)

Smart contract này là **lớp lưu trữ trạng thái** của demo NEAR. Dưới góc nhìn đề tài, nó đóng vai trò gần giống một storage engine đơn giản để minh họa cách dữ liệu được ghi, truy vấn và thay đổi trong blockchain.

## Vai trò trong đề tài

Contract dùng để minh họa các ý sau:

- **Contract state** là nơi dữ liệu được lưu trên chain.
- **Change method** là đường ghi dữ liệu thông qua transaction có chữ ký.
- **View method** là đường đọc dữ liệu không tạo transaction mới.
- **State mutation** khác với lịch sử giao dịch bất biến.

## Data model

Mỗi bản ghi được lưu với metadata cơ bản:

```rust
pub struct DataEntry {
    pub key: String,
    pub value: String,
    pub sender: String,
    pub timestamp: u64,
}
```

Điều này giúp demo không chỉ lưu dữ liệu, mà còn cho phép trình bày:
- ai ghi dữ liệu,
- khi nào state được cập nhật,
- và cách state hiện tại có thể được xuất ra ngoài để phân tích.

## Ánh xạ với thao tác CSDL

| Method | Type | Góc nhìn CSDL |
|---|---|---|
| `set_data(key, value)` | Change | `INSERT` / `UPDATE` |
| `get_data(key)` | View | Truy vấn theo khóa |
| `get_all_data()` | View | `SELECT *` đơn giản |
| `delete_data(key)` | Change | `DELETE` |
| `count()` | View | `COUNT(*)` |

> [!IMPORTANT]
> Đây chỉ là phép so sánh để phục vụ phân tích. Trên NEAR, write luôn đi qua transaction, gas và execution outcome, nên không tương đương hoàn toàn với SQL engine truyền thống.

## Build

```bash
cargo install cargo-near --locked
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
npm install -g near-cli-rs@latest
near deploy $NEAR_CONTRACT_ID ./target/near/near_kv_store.wasm --networkId testnet
near call $NEAR_CONTRACT_ID new "{}" --useAccount $NEAR_CONTRACT_ID --networkId testnet
near view $NEAR_CONTRACT_ID count "{}" --networkId testnet
```

## Usage

### View methods

```bash
near view $CONTRACT_ID get_data '{"key":"user1"}' --networkId testnet
near view $CONTRACT_ID get_all_data "{}" --networkId testnet
near view $CONTRACT_ID count "{}" --networkId testnet
```

### Change methods

```bash
near call $CONTRACT_ID set_data '{"key":"user1","value":"Alice"}' --useAccount your-account.testnet --networkId testnet
near call $CONTRACT_ID delete_data '{"key":"user1"}' --useAccount your-account.testnet --networkId testnet
```

## Phần nên nhấn mạnh khi demo

1. `set_data` làm thay đổi state hiện tại của contract.
2. `get_all_data` cho phép đọc state hiện tại như một tập bản ghi.
3. `delete_data` cho thấy state có thể thay đổi, nhưng lịch sử transaction vẫn tồn tại trên chain.
4. `timestamp` và `sender` giúp liên hệ state với execution context.
