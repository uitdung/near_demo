# Property History, Transparency, và Tầng Indexer

## Vấn đề

Blockchain minh bạch ở mức **dữ liệu gốc** (transaction, receipt, state changes), nhưng không mặc định cung cấp truy vấn nghiệp vụ tiện lợi như:

- lịch sử của một `property_id`
- chuỗi chuyển chủ sở hữu
- timeline theo một thực thể cụ thể

Contract hiện tại chỉ lưu **trạng thái mới nhất** của property, không lưu lịch sử riêng. Vì vậy không thể chỉ gọi view function hiện tại để lấy toàn bộ history của một mảnh đất.

## Vì sao vẫn gọi là transparent

- Transaction đã ghi lên chain là công khai và có thể kiểm chứng
- History không thể bị sửa âm thầm sau khi final
- Bất kỳ ai cũng có thể audit lại nếu có lớp đọc/index phù hợp

Nói ngắn gọn: blockchain **transparent raw data**, nhưng không phải **business query layer** sẵn có.

## Hạn chế hiện tại của project

- Dùng NearBlocks `txns-only` để dựng history tạm thời
- Public API dễ bị `429` rate limit
- Explorer/API bên thứ ba không phải lúc nào cũng miễn phí hoặc ổn định
- Query on-the-fly mỗi request sẽ chậm và phụ thuộc dịch vụ ngoài

## Kết luận kỹ thuật

Cần một **Tầng 2 - explorer/indexer riêng** để chuyển dữ liệu chain thành dữ liệu truy vấn được theo `property_id`.

## Hướng giải quyết phù hợp

### Option 1: Custom off-chain indexer
Tự viết indexer nhỏ cho contract `tdungck.testnet`:
- đọc transaction liên quan contract
- parse các method như `upsert_property`, `transfer_property`, `batch_upsert_properties`
- lưu vào DB local (ví dụ SQLite)
- backend query DB này thay vì gọi explorer public mỗi lần

### Option 2: Contract tự lưu history
Thêm storage lịch sử vào contract và tạo view method kiểu `get_property_history(property_id)`.

**Nhược điểm:** chỉ có history đầy đủ từ lúc contract mới bắt đầu ghi history; dữ liệu cũ không tự backfill.

## Khuyến nghị cho đề tài

Với demo hiện tại, hướng hợp lý nhất là:

- giữ contract làm **source of truth** cho current state
- xây **custom indexer** làm tầng truy vấn lịch sử
- để backend/frontend đọc history từ indexer thay vì từ public explorer API

Cách này vừa đúng về kiến trúc, vừa giải thích tốt trong báo cáo rằng blockchain minh bạch nhưng cần lớp indexing để truy vấn nghiệp vụ hiệu quả.
