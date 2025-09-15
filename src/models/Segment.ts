import mongoose from 'mongoose';

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Segment name is required'],
    trim: true
  },
  rules: [{
    field: {
      type: String,
      required: true,
      enum: ['totalSpent', 'totalOrders', 'lastPurchaseDate', 'customerSegment']
    },
    operator: {
      type: String,
      required: true,
      enum: ['>', '<', '>=', '<=', '==', '!=', 'between']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    conjunction: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND'
    }
  }],
  description: String,
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Update timestamps before saving
segmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Segment || mongoose.model('Segment', segmentSchema);
