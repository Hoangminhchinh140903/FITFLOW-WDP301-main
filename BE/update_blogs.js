/**
 * Script cập nhật dữ liệu hàng loạt cho các bài viết (Blogs)
 * Sử dụng cho môi trường phát triển và vận hành hệ thống.
 * 
 * Hướng dẫn chạy:
 *   node BE/update_blogs.js
 */

const mongoose = require("mongoose");

// Cấu hình URL cơ sở dữ liệu (Ưu tiên biến môi trường)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/fitflow_dev";

// Danh sách các bài viết cần cập nhật thông tin
const BLOG_UPDATES = [
  {
    id: "65f000000000000000001001",
    data: {
      title: "Kinh nghiệm thuê đồ thể thao và vợt Pickleball tại Thanh Xuân",
      slug: "kinh-nghiem-thue-do-the-thao-va-vot-pickleball",
      content: "Gợi ý chọn trang phục thoáng mát, chọn size, và các mẫu vợt Pickleball/Tennis phù hợp với lối chơi.",
    }
  },
  {
    id: "65f000000000000000001002",
    data: {
      title: "Bảng giá thuê đồ thể thao & vợt 2026 (cập nhật mới nhất)",
      slug: "bang-gia-thue-do-the-thao-vot-2026",
      content: "Tổng hợp mức giá thuê theo loại vợt, bóng và trang phục thể thao chuyên dụng dành cho hội viên Fitflow.",
    }
  }
];

/**
 * Thực hiện quá trình cập nhật các bài viết trong database
 */
async function runBlogUpdates() {
  console.log("--------------------------------------------------");
  console.log("BẮT ĐẦU TIẾN TRÌNH CẬP NHẬT DỮ LIỆU BLOG");
  console.log(`Kết nối tới: ${MONGODB_URI}`);
  console.log("--------------------------------------------------");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✔ Kết nối cơ sở dữ liệu MongoDB thành công!");
    
    const db = mongoose.connection.db;
    const blogCollection = db.collection("blogs");
    
    let successCount = 0;
    
    for (const item of BLOG_UPDATES) {
      if (!mongoose.Types.ObjectId.isValid(item.id)) {
        console.warn(`⚠ ID không hợp lệ, bỏ qua: ${item.id}`);
        continue;
      }
      
      console.log(`➡ Đang cập nhật bài viết ID: ${item.id}...`);
      
      const result = await blogCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(item.id) },
        { 
          $set: { 
            ...item.data,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`  ✔ Thành công! Đã sửa đổi: ${result.modifiedCount} bản ghi.`);
        successCount++;
      } else {
        console.log(`  ❌ Không tìm thấy bài viết nào khớp với ID trên.`);
      }
    }
    
    console.log("--------------------------------------------------");
    console.log(`HOÀN THÀNH: Cập nhật thành công ${successCount}/${BLOG_UPDATES.length} bài viết.`);
    console.log("--------------------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi xảy ra trong quá trình cập nhật:");
    console.error(error);
    process.exit(1);
  }
}

// Thực thi tiến trình
runBlogUpdates();
