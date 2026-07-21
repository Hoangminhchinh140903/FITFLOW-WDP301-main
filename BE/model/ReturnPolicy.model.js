const mongoose = require('mongoose');

const returnPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    scope: {
      type: String,
      enum: ['global', 'category'],
      default: 'global',
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    daysToReturn: {
      type: Number,
      default: 7,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

returnPolicySchema.index({ scope: 1, categoryId: 1, isActive: 1 });

returnPolicySchema.pre('validate', async function () {
  if (this.scope === 'global') {
    this.categoryId = null;
  } else if (this.scope === 'category' && !this.categoryId) {
    throw new Error('categoryId bắt buộc khi scope = category');
  }
});

const ReturnPolicy = mongoose.model('ReturnPolicy', returnPolicySchema);

module.exports = ReturnPolicy;
