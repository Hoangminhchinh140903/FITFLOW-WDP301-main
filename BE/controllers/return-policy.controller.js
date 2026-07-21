const mongoose = require('mongoose');
const ReturnPolicy = require('../model/ReturnPolicy.model');
const Category = require('../model/Category.model');
const Product = require('../model/Product.model');

exports.listPolicies = async (req, res) => {
  try {
    const { scope, isActive } = req.query;
    const filter = {};
    if (scope && ['global', 'category'].includes(scope)) filter.scope = scope;
    if (isActive === 'true') filter.isActive = true;
    if (isActive === 'false') filter.isActive = false;

    const policies = await ReturnPolicy.find(filter)
      .populate('categoryId', 'name displayName slug value')
      .sort({ scope: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, data: policies });
  } catch (error) {
    console.error('listPolicies error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const policy = await ReturnPolicy.findById(id)
      .populate('categoryId', 'name displayName slug value')
      .lean();
    if (!policy) return res.status(404).json({ success: false, message: 'Không tìm thấy chính sách' });
    return res.json({ success: true, data: policy });
  } catch (error) {
    console.error('getPolicy error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    const { name, description, scope, categoryId, daysToReturn, isActive } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên chính sách' });
    }
    if (!['global', 'category'].includes(scope)) {
      return res.status(400).json({ success: false, message: 'Scope không hợp lệ' });
    }
    if (scope === 'category' && !mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn danh mục' });
    }

    const payload = {
      name: String(name).trim(),
      description: String(description || '').trim(),
      scope,
      categoryId: scope === 'category' ? categoryId : null,
      daysToReturn: Math.max(0, Number(daysToReturn || 7)),
      isActive: isActive !== false,
      createdBy: req.user?.id || req.user?._id || null,
      updatedBy: req.user?.id || req.user?._id || null,
    };

    if (scope === 'global') {
      const existingGlobal = await ReturnPolicy.findOne({ scope: 'global', isActive: true });
      if (existingGlobal) {
        return res.status(400).json({
          success: false,
          message: 'Đã có chính sách global đang hoạt động. Vui lòng vô hiệu hóa trước khi tạo mới.',
        });
      }
    } else {
      const existingForCategory = await ReturnPolicy.findOne({
        scope: 'category',
        categoryId: payload.categoryId,
        isActive: true,
      });
      if (existingForCategory) {
        return res.status(400).json({
          success: false,
          message: 'Danh mục này đã có chính sách đang hoạt động.',
        });
      }
    }

    const policy = await ReturnPolicy.create(payload);
    return res.status(201).json({ success: true, data: policy });
  } catch (error) {
    console.error('createPolicy error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }

    const policy = await ReturnPolicy.findById(id);
    if (!policy) return res.status(404).json({ success: false, message: 'Không tìm thấy chính sách' });

    const { name, description, scope, categoryId, daysToReturn, isActive } = req.body || {};

    if (name !== undefined) policy.name = String(name).trim();
    if (description !== undefined) policy.description = String(description || '').trim();
    if (scope !== undefined) {
      if (!['global', 'category'].includes(scope)) {
        return res.status(400).json({ success: false, message: 'Scope không hợp lệ' });
      }
      policy.scope = scope;
    }
    if (scope === 'category' || policy.scope === 'category') {
      if (categoryId && !mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
      }
      if (categoryId) policy.categoryId = categoryId;
    }
    if (policy.scope === 'global') {
      policy.categoryId = null;
    }
    if (daysToReturn !== undefined) {
      policy.daysToReturn = Math.max(0, Number(daysToReturn));
    }
    if (isActive !== undefined) policy.isActive = Boolean(isActive);

    policy.updatedBy = req.user?.id || req.user?._id || null;

    if (policy.isActive) {
      const dupFilter = policy.scope === 'global'
        ? { scope: 'global', isActive: true, _id: { $ne: policy._id } }
        : { scope: 'category', categoryId: policy.categoryId, isActive: true, _id: { $ne: policy._id } };
      const dup = await ReturnPolicy.findOne(dupFilter);
      if (dup) {
        return res.status(400).json({
          success: false,
          message: policy.scope === 'global'
            ? 'Đã tồn tại chính sách global đang hoạt động'
            : 'Danh mục này đã có chính sách đang hoạt động khác',
        });
      }
    }

    await policy.save();
    return res.json({ success: true, data: policy });
  } catch (error) {
    console.error('updatePolicy error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    }
    const policy = await ReturnPolicy.findById(id);
    if (!policy) return res.status(404).json({ success: false, message: 'Không tìm thấy chính sách' });

    policy.isActive = false;
    policy.updatedBy = req.user?.id || req.user?._id || null;
    await policy.save();
    return res.json({ success: true, message: 'Đã vô hiệu hóa chính sách' });
  } catch (error) {
    console.error('deletePolicy error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
