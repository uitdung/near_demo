1. Tên đề tài
Phân tích Blockchain như một hệ cơ sở dữ liệu phân tán – Trường hợp NEAR Protocol (tập trung vào sharding và lưu trữ trạng thái)..
Trong đề tài này, tôi tiếp cận Blockchain như một hệ cơ sở dữ liệu phân tán đặc biệt, tập trung vào cách dữ liệu được lưu trữ, truy vấn và đảm bảo tính đúng của dữ liệu.

Nội dung chính tôi thực hiện gồm:

- Phân tích cách dữ liệu được tổ chức và lưu trữ trong Blockchain NEAR (block, transaction và trạng thái – state), và cơ chế sharding Nightshade để phân mảnh dữ liệu khi hệ thống mở rộng.
- Phân tích nguyên lý ghi dữ liệu (insert) và truy vấn dữ liệu (select) trong Blockchain, so sánh ngắn gọn với cơ sở dữ liệu quan hệ.
- Trình bày các nguyên lý đảm bảo dữ liệu không bị thay đổi, như liên kết block bằng hàm băm và cơ chế đồng thuận.
- Thực hiện demo nhỏ sử dụng thư viện chính thức của NEAR nhằm minh họa cơ chế lưu trữ và truy vấn dữ liệu:
+ Ghi dữ liệu mẫu lên Blockchain (transaction đơn giản)
+ Truy vấn lại dữ liệu thông qua API (read-only)
+ Xuất dữ liệu giao dịch hoặc trạng thái ra định dạng đơn giản (JSON/CSV) để phục vụ phân tích.

Về tổng thể, đề tài của tôi tập trung vào việc hiểu và minh họa các nguyên lý cốt lõi của Blockchain dưới góc nhìn cơ sở dữ liệu phân tán.