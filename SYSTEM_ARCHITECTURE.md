# Kiến trúc hệ thống Property Registry trên NEAR

## 1. Mục tiêu tài liệu

Tài liệu này mô tả kiến trúc tổng thể của hệ thống `near_demo` sau khi được nâng cấp thành **Property Ownership Registry** và giải thích cách từng thành phần tương tác với **NEAR Blockchain**.

Hệ thống được thiết kế để phục vụ đồng thời 2 mục tiêu:

1. **Mục tiêu học thuật**: phân tích NEAR như một hệ cơ sở dữ liệu phân tán đặc biệt.
2. **Mục tiêu demo kỹ thuật**: minh họa một ứng dụng quản lý quyền sở hữu bất động sản với dữ liệu on-chain.

---

## 2. Tổng quan kiến trúc

```text
┌──────────────────────────────────────────────────────────────┐
│ Frontend Dashboard (HTML / CSS / Vanilla JS)                │
│ - Hiển thị property registry                                │
│ - Tạo / cập nhật property                                   │
│ - Transfer owner                                            │
│ - Reset registry                                            │
│ - Export JSON / CSV                                         │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTP / REST
┌───────────────────────────▼──────────────────────────────────┐
│ Backend API (Node.js / Express / near-api-js)               │
│ - Chuẩn hóa request từ UI                                   │
│ - Gọi NEAR view methods                                     │
│ - Gửi signed transactions                                   │
│ - Query raw contract state                                  │
│ - Tổng hợp analysis summary                                 │
└───────────────────────────┬──────────────────────────────────┘
                            │ JSON-RPC + signed blockchain tx
┌───────────────────────────▼──────────────────────────────────┐
│ NEAR Testnet                                                 │
│ - Contract account                                           │
│ - Rust smart contract                                        │
│ - Contract state                                              │
│ - Blocks / chunks / receipts / finality                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Các thành phần chính

## 3.1 Frontend

**Thư mục:** `frontend/`

Frontend là dashboard cho người dùng và đóng vai trò lớp trình bày.

### Trách nhiệm
- Hiển thị danh sách bất động sản hiện có.
- Gửi yêu cầu tạo / cập nhật property.
- Gửi yêu cầu chuyển quyền sở hữu.
- Hiển thị transaction hash sau mỗi thao tác ghi.
- Gọi export JSON / CSV.
- Gọi reset registry khi cần làm sạch state cũ.
- Trình bày các khái niệm học thuật như state, transaction, sharding, storage.

### File chính
- `frontend/index.html`: cấu trúc dashboard
- `frontend/js/app.js`: logic gọi API backend
- `frontend/css/style.css`: giao diện

### Đặc điểm kỹ thuật
Frontend **không giao tiếp trực tiếp với NEAR RPC**. Mọi thao tác đều đi qua backend để:
- tránh lộ private key trên client
- gom logic blockchain vào một lớp trung gian
- dễ bổ sung validation, logging, export và analysis

---

## 3.2 Backend API

**Thư mục:** `backend/src/`

Backend là lớp trung gian giữa frontend và blockchain.

### Trách nhiệm
- Nhận request HTTP từ frontend.
- Gọi **view methods** để đọc dữ liệu on-chain.
- Gửi **change transactions** đã ký để thay đổi state.
- Query raw contract state qua JSON-RPC.
- Tổng hợp dữ liệu thành `analysis summary` để giải thích hệ thống dưới góc nhìn distributed database.

### File chính
- `backend/src/index.js`: khởi tạo Express server
- `backend/src/routes.js`: định nghĩa REST API
- `backend/src/near.js`: cấu hình kết nối NEAR và các helper blockchain

### Kết nối NEAR
Backend dùng `near-api-js` để:
- kết nối tới **testnet RPC provider**
- nạp private key từ `.env`
- khởi tạo `masterAccount`
- dùng account này để gọi:
  - `viewFunction(...)`
  - `functionCall(...)`
  - `provider.query(...)`
  - `provider.txStatus(...)`

### Cấu hình quan trọng
Các biến môi trường chính:
- `NEAR_NETWORK`
- `NEAR_NODE_URL`
- `NEAR_CONTRACT_ID`
- `NEAR_MASTER_ACCOUNT`
- `NEAR_MASTER_PRIVATE_KEY`

Hiện mặc định project đã chuyển sang RPC provider hỗ trợ testnet thay vì endpoint `near.org` cũ.

---

## 3.3 Smart Contract

**Thư mục:** `contract/src/lib.rs`

Contract là nơi lưu trữ **nguồn sự thật hiện tại** của registry.

### Contract state
Contract sử dụng:
- `PropertyRegistry`
- `UnorderedMap<String, PropertyRecord>`

### Cấu trúc dữ liệu chính
`PropertyRecord` gồm:
- `property_id`
- `description`
- `owner`
- `timestamp`
- `updated_by`

### Contract methods
#### Change methods
- `create_property(...)`
- `update_property(...)`
- `transfer_property(...)`
- `delete_property(...)`
- `reset_registry()`

#### View methods
- `get_property(...)`
- `get_all_properties()`
- `get_properties_by_owner(...)`
- `count_properties()`

### Ý nghĩa kiến trúc
Contract đóng vai trò gần giống **data storage layer** trong hệ thống truyền thống, nhưng mọi cập nhật state phải đi qua transaction được ký, gas, runtime execution và finality.

---

## 3.4 Hạ tầng chạy ứng dụng

### Docker Compose
**File:** `docker-compose.yml`

Project dùng 2 service chính:
- `backend`: expose ở `localhost:3000`
- `frontend`: expose ở `localhost:8081`

### Luồng hoạt động
- Frontend gọi `/api/...`
- Nginx/static frontend chuyển request đến backend qua Docker network nội bộ
- Backend gọi NEAR RPC provider ngoài Internet

---

## 4. Cách hệ thống tương tác với NEAR Blockchain

## 4.1 Luồng đọc dữ liệu

Ví dụ: frontend cần load toàn bộ properties.

```text
Browser
  -> GET /api/properties
Backend routes.js
  -> callViewFunction('get_all_properties')
near-api-js
  -> JSON-RPC request tới NEAR provider
NEAR contract
  -> thực thi view method
Backend
  -> nhận danh sách properties
Frontend
  -> render bảng dữ liệu
```

### Đặc điểm của read path
- Không tạo transaction mới.
- Không tạo block mới.
- Không cần attached deposit.
- Phù hợp để so sánh với `SELECT` trong CSDL.

---

## 4.2 Luồng ghi dữ liệu

Ví dụ: tạo mới một property.

```text
Browser
  -> POST /api/properties
Backend routes.js
  -> callChangeFunction('create_property', ...)
near-api-js
  -> ký transaction bằng master private key
NEAR network
  -> validator nhận transaction
  -> transaction vào block/chunk
  -> contract method được thực thi
  -> state được cập nhật
Backend
  -> trả về transaction hash
Frontend
  -> hiển thị hash + refresh dashboard
```

### Đặc điểm của write path
- Là **signed transaction**.
- Có gas fee.
- Có thể tạo receipt và execution outcome.
- Chỉ được xem là hoàn tất sau khi transaction được xử lý.

Điều này tương ứng với cách NEAR thực hiện `INSERT` / `UPDATE` / `DELETE` dưới dạng **state transition** chứ không phải thao tác SQL trực tiếp.

---

## 4.3 Query raw contract state

Backend còn có luồng đọc thô bằng RPC:
- `provider.query({ request_type: 'view_state', ... })`

Mục đích:
- xem raw state pairs
- giải thích storage usage
- phục vụ phần học thuật về blockchain state

Luồng này không thay thế view method nghiệp vụ, mà dùng để minh họa cách dữ liệu tồn tại ở tầng state của account contract.

---

## 4.4 Query transaction status

Backend hỗ trợ tra cứu transaction thông qua:
- `provider.txStatus(txHash, signerAccount)`

Chức năng này giúp liên hệ giữa:
- thao tác frontend
- transaction hash
- execution outcome trên blockchain

---

## 5. Ánh xạ kiến trúc ứng dụng với các khái niệm của NEAR

| Thành phần hệ thống | Tương đương / liên hệ trên NEAR |
|---|---|
| Property registry | Contract state hiện tại |
| Create / update / delete | State transition qua change method |
| List / detail | View methods |
| Export JSON / CSV | Trích xuất dữ liệu on-chain sang off-chain |
| Transaction hash | Định danh một lần ghi dữ liệu |
| Storage usage | Chi phí lưu trữ và storage staking |
| Reset registry | Tái gắn map sang storage prefix mới để bỏ qua state cũ không tương thích |

---

## 6. Reset flow và lý do tồn tại

Khi project được nâng cấp từ key-value demo sang property registry, account contract cũ có thể còn chứa dữ liệu với schema không tương thích.

Điều này tạo ra lỗi kiểu:
- `Cannot deserialize element`

Để xử lý trên **chính account hiện tại**, contract bổ sung `reset_registry()`.

### Reset hoạt động như thế nào?
Nó không xóa toàn bộ lịch sử blockchain. Thay vào đó, nó:
- tạo một storage prefix mới cho `UnorderedMap`
- trỏ registry hiện tại sang vùng state mới
- khiến các bản ghi schema cũ không còn được dùng trong luồng đọc hiện tại

### Ý nghĩa
- phù hợp cho demo/dev environment
- giúp tiếp tục dùng một account testnet cố định
- tránh phải tạo account mới khi thay schema lớn

---

## 7. Tại sao chọn kiến trúc này?

## 7.1 Tách frontend và blockchain bằng backend
Lý do:
- bảo vệ private key
- tập trung logic ký transaction
- dễ đổi RPC provider
- dễ thêm logging / export / analysis

## 7.2 Dùng smart contract nhẹ, logic rõ ràng
Lý do:
- dễ giải thích trong báo cáo
- phù hợp đề tài học thuật
- đủ gần với use case thực tế về ownership registry

## 7.3 Giữ cả 2 lớp: nghiệp vụ và phân tích
Hệ thống không chỉ là CRUD demo, mà còn có:
- raw state summary
- storage metrics
- concept explanations
- mapping với distributed database concepts

Điều này làm project phù hợp với mục tiêu môn học hơn là chỉ xây dựng một dApp thông thường.

---

## 8. Hạn chế hiện tại

Dù đã tiến gần hơn tới “production-ready”, hệ thống hiện vẫn là demo học thuật và còn một số giới hạn:

- Backend đang dùng một `master account` duy nhất để ký transaction.
- Chưa có cơ chế wallet login cho người dùng cuối.
- Chưa có role-based access control đầy đủ.
- `reset_registry()` chỉ phù hợp cho môi trường demo/dev.
- Chưa có migration versioning chính thức cho schema contract.
- Chưa có indexer riêng để truy vấn lịch sử ownership ngoài current state.

---

## 9. Hướng mở rộng tiếp theo

Nếu muốn nâng cấp thêm theo hướng production thực sự, có thể mở rộng:

1. **Wallet-based authentication**
   - để mỗi người dùng tự ký transaction
2. **Ownership history indexer**
   - lưu lịch sử chuyển nhượng ngoài current state
3. **Versioned contract state**
   - hỗ trợ schema migration an toàn
4. **Admin / auditor roles**
   - phân quyền rõ hơn cho thao tác nhạy cảm
5. **External metadata storage**
   - lưu tài liệu lớn ở IPFS / Arweave thay vì toàn bộ on-chain

---

## 10. Kết luận

Kiến trúc của hệ thống này có thể được hiểu như sau:

- **Frontend** là lớp tương tác và trình bày.
- **Backend** là lớp điều phối request và blockchain gateway.
- **Smart contract** là lớp lưu trữ trạng thái hiện tại của property registry.
- **NEAR blockchain** là hạ tầng đảm bảo tính bất biến, finality, và phân tán của dữ liệu.

Vì vậy, hệ thống này vừa là:
- một **demo ứng dụng registry on-chain**,
- vừa là một **case study rõ ràng về cách blockchain hoạt động như một hệ lưu trữ trạng thái phân tán**.
