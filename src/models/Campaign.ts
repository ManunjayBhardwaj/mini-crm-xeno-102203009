import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true
  },
  segmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segment',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Campaign message is required']
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'running', 'completed', 'failed'],
    default: 'draft'
  },
  scheduledDate: Date,
  stats: {
    audienceSize: {
      type: Number,
      default: 0
    },
    sent: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  completedAt: Date
});

// Update timestamps before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);
