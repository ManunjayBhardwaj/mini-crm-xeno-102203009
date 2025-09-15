import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,
  customerSegment: {
    type: String,
    enum: ['new', 'regular', 'vip', 'inactive'],
    default: 'new'
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  lastPurchaseDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Update timestamps before saving
customerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
customerSchema.index({ email: 1 });
customerSchema.index({ customerSegment: 1 });
customerSchema.index({ lastPurchaseDate: -1 });

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
