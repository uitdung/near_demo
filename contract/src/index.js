// NEAR Key-Value Store Smart Contract
// Minh họa cơ chế lưu trữ và truy vấn dữ liệu trên blockchain

import { NearBindgen, call, view, LookupMap, Vector, near } from 'near-sdk-js';

/**
 * Data Entry structure
 * Lưu trữ key-value với metadata
 */
class DataEntry {
  constructor(key, value, sender, timestamp) {
    this.key = key;
    this.value = value;
    this.sender = sender;       // Account gọi set_data
    this.timestamp = timestamp; // Block timestamp
  }
}

/**
 * NEAR Key-Value Store Contract
 * 
 * Methods:
 * - set_data(key, value): Ghi dữ liệu (change method - tốn gas)
 * - get_data(key): Đọc dữ liệu (view method - free)
 * - get_all_data(): Lấy tất cả dữ liệu (view method - free)
 * - delete_data(key): Xóa dữ liệu (change method - tốn gas)
 */
@NearBindgen({})
export class KeyValueStore {
  constructor() {
    // LookupMap để lưu trữ dữ liệu key-value
    this.data = new LookupMap('d');
    // Vector để track all keys (để có thể iterate)
    this.keys = new Vector('k');
  }

  /**
   * Ghi dữ liệu vào blockchain
   * @param {string} key - Key để xác định dữ liệu
   * @param {string} value - Giá trị cần lưu
   */
  @call({})
  set_data({ key, value }) {
    // Lấy thông tin caller
    const sender = near.predecessorAccountId();
    const timestamp = near.blockTimestamp().toString();
    
    // Tạo DataEntry
    const entry = new DataEntry(key, value, sender, timestamp);
    
    // Lưu vào map
    this.data.set(key, JSON.stringify(entry));
    
    // Add key vào vector nếu là key mới
    const existingKeys = this.keys.toArray();
    if (!existingKeys.includes(key)) {
      this.keys.push(key);
    }
    
    // Log cho việc tracking
    near.log(`Data saved: ${key} = ${value} by ${sender}`);
  }

  /**
   * Đọc dữ liệu theo key
   * @param {string} key - Key cần tìm
   * @returns {DataEntry|null} - Dữ liệu hoặc null nếu không tìm thấy
   */
  @view({})
  get_data({ key }) {
    const entryStr = this.data.get(key);
    if (entryStr) {
      return JSON.parse(entryStr);
    }
    return null;
  }

  /**
   * Lấy tất cả dữ liệu trong contract
   * @returns {Array<DataEntry>} - Mảng tất cả entries
   */
  @view({})
  get_all_data() {
    const result = [];
    const allKeys = this.keys.toArray();
    
    for (const key of allKeys) {
      const entryStr = this.data.get(key);
      if (entryStr) {
        result.push(JSON.parse(entryStr));
      }
    }
    
    return result;
  }

  /**
   * Xóa dữ liệu theo key
   * @param {string} key - Key cần xóa
   */
  @call({})
  delete_data({ key }) {
    const existing = this.data.get(key);
    if (existing) {
      this.data.remove(key);
      near.log(`Data deleted: ${key}`);
    }
    // Note: Vector không support remove item giữa mảng
    // Key vẫn còn trong keys vector nhưng data đã bị xóa
  }

  /**
   * Đếm số lượng entries
   * @returns {number} - Số lượng entries
   */
  @view({})
  count() {
    return this.keys.length;
  }
}
