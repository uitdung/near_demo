---
trigger: always_on
glob: 
description: project
---
1. Tên đề tài
Phân tích Blockchain như một hệ cơ sở dữ liệu phân tán – Trường hợp NEAR Protocol (tập trung vào sharding và lưu trữ trạng thái).

Trong đề tài này, tôi tiếp cận Blockchain như một hệ cơ sở dữ liệu phân tán đặc biệt, tập trung vào cách dữ liệu được lưu trữ, truy vấn và đảm bảo tính đúng của dữ liệu.

## Nội dung chính

- Phân tích cách dữ liệu được tổ chức và lưu trữ trong Blockchain NEAR (block, transaction và trạng thái – state), và cơ chế sharding Nightshade để phân mảnh dữ liệu khi hệ thống mở rộng.
- Phân tích nguyên lý ghi dữ liệu (insert) và truy vấn dữ liệu (select) trong Blockchain, so sánh ngắn gọn với cơ sở dữ liệu quan hệ.
- Trình bày các nguyên lý đảm bảo dữ liệu không bị thay đổi, như liên kết block bằng hàm băm và cơ chế đồng thuận.

## Demo minh họa

**Mục tiêu:** Minh họa cơ chế lưu trữ và truy vấn dữ liệu trên NEAR Blockchain

### Features
- ✅ Ghi dữ liệu mẫu lên blockchain (transaction đơn giản)
- ✅ Truy vấn lại dữ liệu thông qua API (read-only)
- ✅ Xuất dữ liệu ra JSON/CSV

---

## 🚀 Quick Start

### Option 1: Docker Compose (Khuyên dùng)

```bash
# 1. Tạo file .env trong backend/
cp backend/.env.example backend/.env
# Edit backend/.env với NEAR credentials

# 2. Build và chạy tất cả services
docker-compose up --build

# 3. Truy cập
Frontend: http://localhost:8081
Backend API: http://localhost:3000
```

### Option 2: Chạy thủ công

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env với NEAR credentials
npm install
npm start

# Frontend (một终端 khác)
cd frontend
# Mở index.html trong browser hoặc dùng live server
```

---

## 📋 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Health check |
| GET | `/api/data` | Lấy tất cả data |
| GET | `/api/data/:key` | Lấy data theo key |
| POST | `/api/data` | Lưu data mới (body: `{key, value}`) |
| DELETE | `/api/data/:key` | Xóa data |
| GET | `/api/export/json` | Export JSON |
| GET | `/api/export/csv` | Export CSV |
| GET | `/api/transaction/:hash` | Transaction status |
| GET | `/api/state` | Raw contract state |
| GET | `/api/count` | Đếm số entries |

---

## 🔧 Contract Methods

| Method | Type | Mô tả |
|--------|------|-------|
| `set_data(key, value)` | Change | Lưu data (cần gas) |
| `get_data(key)` | View | Lấy data theo key (free) |
| `get_all_data()` | View | Lấy tất cả data (free) |
| `delete_data(key)` | Change | Xóa data (cần gas) |
| `count()` | View | Đếm số entries (free) |

---

## 🌐 Links

- **NEAR Docs**: https://docs.near.org
- **Testnet Explorer**: https://testnet.nearblocks.io
- **Testnet Faucet**: https://near-faucet.io

---

## 📁 Cấu trúc Project

```
near_demo/
├── contract/           # Smart Contract (Rust/near-sdk-rs)
├── backend/            # API Server (Node.js/Express)
├── frontend/           # UI (HTML/CSS/JS)
├── scripts/            # Utility scripts
├── docker-compose.yml  # Docker Compose config
└── README.md
```

---

Về tổng thể, đề tài tập trung vào việc hiểu và minh họa các nguyên lý cốt lõi của Blockchain dưới góc nhìn cơ sở dữ liệu phân tán.
