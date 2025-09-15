import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import Order from '@/models/Order';
import Customer from '@/models/Customer';

// Database connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// GET /api/orders
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find({})
      .populate('customerId', 'firstName lastName email')
      .sort({ orderDate: -1 });
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.customerId || !body.items || !body.totalAmount) {
      return NextResponse.json(
        { error: 'Customer ID, items, and total amount are required' },
        { status: 400 }
      );
    }

    // Validate customer exists
    const customer = await Customer.findById(body.customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Generate order number
    body.orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Create order
    const order = await Order.create(body);

    // Update customer information
    await Customer.findByIdAndUpdate(body.customerId, {
      $inc: { totalOrders: 1, totalSpent: body.totalAmount },
      lastPurchaseDate: new Date()
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
