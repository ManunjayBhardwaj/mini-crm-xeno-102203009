import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
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

// GET /api/customers
export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json(customers, { status: 200 });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/customers
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.email || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Check for existing customer
    const existingCustomer = await Customer.findOne({ email: body.email });
    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 409 }
      );
    }

    const customer = await Customer.create(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
