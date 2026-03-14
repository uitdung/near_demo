# NEAR Blockchain và Bài toán Nghiệp vụ: Cách xử lý và so sánh với Cơ sở dữ liệu quan hệ

## 1. Mục tiêu tài liệu

Tài liệu này tập trung giải thích:

- NEAR blockchain xử lý bài toán nghiệp vụ như thế nào
- Dữ liệu nghiệp vụ được biểu diễn ra sao trên chain
- Vì sao blockchain minh bạch nhưng vẫn cần thêm lớp indexer/explorer
- Những điểm ưu việt và hạn chế của NEAR khi so với cơ sở dữ liệu quan hệ
- Những đặc trưng của NEAR khi được nhìn như một **hệ cơ sở dữ liệu phân tán đặc biệt**

Ngữ cảnh của project này là bài toán **quản lý mảnh đất / quyền sở hữu tài sản**, trong đó mỗi `property_id` là một thực thể nghiệp vụ.

---

## 2. Cách NEAR xử lý bài toán nghiệp vụ

### 2.1 Nghiệp vụ không được xử lý bằng SQL mà bằng transaction + contract logic

Trong cơ sở dữ liệu quan hệ, một nghiệp vụ thường được mô tả bằng câu lệnh như:

```sql
INSERT INTO properties ...
UPDATE properties SET owner = 'B' WHERE property_id = 'P001'
SELECT * FROM properties WHERE property_id = 'P001'
```

Trong NEAR, cùng bài toán đó được biểu diễn bằng:

- **Smart contract**: nơi định nghĩa luật nghiệp vụ
- **Transaction**: yêu cầu thay đổi trạng thái
- **View function**: truy vấn trạng thái hiện tại
- **State**: dữ liệu hiện tại được lưu trong contract account

Ví dụ với project này:

- `upsert_property` = tạo mới hoặc cập nhật property
- `transfer_property` = chuyển quyền sở hữu
- `get_property` = truy vấn trạng thái hiện tại
- `get_all_properties` = lấy toàn bộ current state

### 2.2 Mỗi thay đổi là một state transition đã được xác thực

Khi người dùng gọi `transfer_property(property_id, new_owner)`, quá trình không phải là sửa trực tiếp một row trong bảng, mà là:

1. Tạo transaction
2. Ký transaction bằng private key
3. Gửi transaction vào mạng NEAR
4. Validator thực thi contract logic
5. Nếu hợp lệ, contract state được cập nhật
6. Kết quả trở thành một phần của blockchain history

Điểm quan trọng là: **mọi thay đổi trạng thái đều gắn với một transaction có thể kiểm chứng**.

### 2.3 Contract chỉ lưu current state, không tự động lưu business history

Trong project hiện tại, contract chủ yếu lưu:

- `property_id`
- `description`
- `owner`
- `timestamp`
- `updated_by`

Điều này tương đương với một bảng chỉ chứa **bản ghi mới nhất** của từng mảnh đất.

Nó không tự động lưu:

- owner cũ là ai
- đã chuyển nhượng bao nhiêu lần
- timeline đầy đủ của từng property

Do đó, muốn dựng lịch sử nghiệp vụ phải dựa vào:

- transaction history của blockchain
- hoặc contract phải tự lưu history riêng
- hoặc một indexer off-chain phải tổng hợp lại

---

## 3. NEAR dưới góc nhìn hệ cơ sở dữ liệu phân tán

Nếu xem NEAR như một hệ cơ sở dữ liệu phân tán đặc biệt, thì cần nhấn mạnh rằng nó không chỉ là nơi lưu transaction, mà còn có nhiều đặc trưng cốt lõi của distributed database.

### 3.1 Phân tán dữ liệu và xử lý trên nhiều node

NEAR không phụ thuộc vào một máy chủ trung tâm.

- Nhiều node cùng tham gia lưu trữ và xác minh dữ liệu
- Nhiều validator cùng tham gia duy trì trạng thái mạng
- Tính đúng đắn của dữ liệu không phụ thuộc vào một DB admin duy nhất

Điều này tương ứng với tư duy của distributed database: dữ liệu và xử lý không tập trung tại một điểm duy nhất.

### 3.2 Sharding như một cơ chế partition dữ liệu

Một đặc trưng rất quan trọng của cơ sở dữ liệu phân tán là **partitioning**. Trong NEAR, tư duy này xuất hiện dưới dạng **Nightshade sharding**.

- State được chia thành nhiều shards
- Mỗi shard xử lý một phần dữ liệu và transaction liên quan
- Hệ thống mở rộng bằng cách phân tán tải xử lý thay vì dồn lên một state machine đơn khối

Dưới góc nhìn cơ sở dữ liệu, đây chính là cách NEAR giải bài toán **phân mảnh dữ liệu khi hệ thống mở rộng**.

### 3.3 Replication và khả năng chịu lỗi

Trong distributed database, dữ liệu cần có khả năng tồn tại dù một số node bị lỗi. Trong NEAR:

- nhiều node cùng giữ và xác minh dữ liệu mạng
- validator thay nhau tham gia sản xuất block/chunk
- hệ thống vẫn hoạt động nếu một số node không khả dụng

Điều này thể hiện tính **fault tolerance** — một đặc điểm cốt lõi của hệ phân tán.

### 3.4 Consensus thay cho transaction coordinator tập trung

Trong nhiều distributed database truyền thống, tính nhất quán được duy trì thông qua các cơ chế như leader election, quorum, transaction coordinator hoặc replication protocol.

Trong NEAR, vai trò đó được thay bằng **consensus**:

- validator cùng xác nhận trạng thái hợp lệ
- block/chunk phải phù hợp với quy tắc mạng
- kết quả thực thi được chấp nhận ở mức toàn hệ thống sau finality

Nói cách khác, consensus trong blockchain đóng vai trò tương tự một cơ chế điều phối nhất quán toàn cục cho hệ dữ liệu phân tán.

### 3.5 Giao tiếp liên phân mảnh qua receipts

Trong distributed database, khi dữ liệu bị chia theo partition, hệ thống phải giải quyết bài toán **giao tiếp liên partition**.

Trong NEAR, điều này xuất hiện dưới dạng **cross-shard communication** thông qua `receipts`.

Ví dụ:

- một transaction phát sinh ở shard A
- kết quả thực thi tạo receipt
- receipt được chuyển sang shard B để tiếp tục xử lý

Điều này rất giống bài toán distributed system: một thao tác nghiệp vụ không phải lúc nào cũng hoàn thành trong một phân vùng duy nhất.

### 3.6 Tính nhất quán toàn cục đạt được sau finality

Trong database tập trung, sau khi commit, dữ liệu thường được coi là đã hoàn tất ngay trong hệ thống đó.

Trong NEAR, tính nhất quán được nhìn ở mức:

- transaction được thực thi
- receipt liên quan được xử lý
- block đạt finality

Do đó, NEAR cho thấy một mô hình nhất quán đặc trưng của hệ phân tán: dữ liệu không chỉ cần “ghi xong”, mà còn cần được **xác nhận hợp lệ trên toàn mạng**.

### 3.7 Trade-off điển hình của hệ phân tán

Cũng như nhiều distributed database khác, NEAR đánh đổi giữa:

- khả năng mở rộng
- độ trễ ghi
- tính tiện lợi của truy vấn
- chi phí đồng bộ và xác thực

Điều này giải thích vì sao blockchain rất mạnh ở:

- integrity
- auditability
- distributed trust

nhưng lại không mạnh bằng relational database trong các truy vấn nghiệp vụ linh hoạt.

### 3.8 Kết luận học thuật về góc nhìn phân tán

NEAR có thể được xem như:

- một **distributed state machine**
- một **distributed ledger**
- và ở góc nhìn rộng hơn, một **hệ cơ sở dữ liệu phân tán đặc biệt**

Tuy nhiên, nó không phải distributed relational DB theo nghĩa truyền thống, vì:

- mô hình ghi dựa trên transaction + contract execution
- mô hình nhất quán dựa trên consensus + finality
- mô hình truy vấn không hướng SQL mà hướng state + indexer + view model

---

## 4. Blockchain minh bạch nhưng không phải query engine nghiệp vụ

### 4.1 Transparency của blockchain nằm ở đâu

NEAR minh bạch vì:

- transaction là công khai
- state changes có thể kiểm chứng
- history không thể bị sửa âm thầm sau khi final
- bất kỳ ai cũng có thể audit nếu có công cụ đọc phù hợp

Tức là blockchain minh bạch ở mức **raw ledger**.

### 4.2 Vì sao vẫn khó hỏi “lịch sử mảnh đất này là gì?”

Bởi vì câu hỏi này là một **business query** theo thực thể. Blockchain layer không được tối ưu trực tiếp cho dạng câu hỏi đó.

Ví dụ, muốn dựng lịch sử của `BATCH_PROP_0001`, hệ thống phải:

1. đọc transaction liên quan contract
2. parse `actions[].method`
3. giải mã `args`
4. tìm transaction có chứa `property_id = BATCH_PROP_0001`
5. với batch transaction thì phải tìm trong `args.items[]`
6. sắp xếp theo thời gian để dựng timeline

Điều này cho thấy:

- blockchain có dữ liệu gốc
- nhưng không tự cung cấp business view thuận tiện như database quan hệ
