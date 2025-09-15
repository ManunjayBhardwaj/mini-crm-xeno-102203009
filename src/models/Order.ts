import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required']
  },
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true
  },
  items: [{
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Update timestamps before saving
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes for frequently queried fields
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
