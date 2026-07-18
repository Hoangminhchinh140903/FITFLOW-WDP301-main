require('dotenv').config();
const mongoose = require('mongoose');
const DamagePolicy = require('../model/DamagePolicy.model');
const Category = require('../model/Category.model');

async function seedDamagePolicy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitflow_dev');
    console.log('Connected to MongoDB');

    // Find the category "Tennis", "Badminton", or "Pickleball"
    const categories = await Category.find({ name: { $in: ['Tennis', 'Badminton', 'Pickleball'] } });
    
    if (categories.length === 0) {
      console.log('No racket categories found. Falling back to global policy.');
    }

    const racketPolicy = {
      name: 'Chính sách hỏng hóc Vợt (Tennis/Badminton/Pickleball)',
      description: 'Quy định xử lý hỏng hóc chi tiết khi khách thuê vợt (áp dụng chung cho các loại vợt).',
      scope: 'global',
      isActive: true,
      levels: [
        {
          key: 'scratched_minor',
          label: 'Trầy xước nhẹ',
          description: 'Xước dăm sơn hoặc phần nhựa bảo vệ đầu vợt do hao mòn tự nhiên.',
          penaltyPercent: 0,
          triggerLifecycle: 'Washing',
          condition: 'Normal',
          sortOrder: 0
        },
        {
          key: 'paint_chip',
          label: 'Bong tróc sơn mảng lớn',
          description: 'Vết tróc sơn to do quăng quật, cạch vợt.',
          penaltyPercent: 10,
          triggerLifecycle: 'Repair',
          condition: 'Damaged',
          sortOrder: 1
        },
        {
          key: 'string_break_normal',
          label: 'Đứt cước (hao mòn)',
          description: 'Lưới đứt do đánh bình thường, hao mòn theo thời gian.',
          penaltyPercent: 5,
          triggerLifecycle: 'Repair',
          condition: 'Damaged',
          sortOrder: 2
        },
        {
          key: 'string_cut',
          label: 'Cắt cước/Đứt sai mục đích',
          description: 'Cố tình cắt cước hoặc dùng sai mục đích làm đứt.',
          penaltyPercent: 15,
          triggerLifecycle: 'Repair',
          condition: 'Damaged',
          sortOrder: 3
        },
        {
          key: 'handle_broken',
          label: 'Gãy cán gỗ',
          description: 'Gãy cán bên trong tay cầm.',
          penaltyPercent: 20,
          triggerLifecycle: 'Repair',
          condition: 'Damaged',
          sortOrder: 4
        },
        {
          key: 'frame_broken',
          label: 'Nứt/Gãy khung vợt',
          description: 'Lỗi nghiêm trọng, hỏng hoàn toàn khung vợt.',
          penaltyPercent: 100,
          triggerLifecycle: 'Repair',
          condition: 'Damaged',
          sortOrder: 5
        },
        {
          key: 'lost',
          label: 'Mất vợt',
          description: 'Thất lạc hoặc không hoàn trả sản phẩm.',
          penaltyPercent: 100,
          triggerLifecycle: 'Lost',
          condition: 'Lost',
          sortOrder: 6
        }
      ]
    };

    // Upsert the policy
    const existing = await DamagePolicy.findOne({ name: racketPolicy.name });
    if (existing) {
      await DamagePolicy.findByIdAndUpdate(existing._id, racketPolicy);
      console.log('Updated existing damage policy');
    } else {
      await DamagePolicy.create(racketPolicy);
      console.log('Created new damage policy');
    }
  } catch (error) {
    console.error('Error seeding policy:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedDamagePolicy();
