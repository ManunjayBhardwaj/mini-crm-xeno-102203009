import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Segment from '@/models/Segment';
import { authOptions } from '@/lib/auth';

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
};

// POST /api/segments
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    if (!body.name || !body.rules) {
      return NextResponse.json({ error: 'Name and rules are required' }, { status: 400 });
    }

    const segment = await Segment.create({
      name: body.name,
      rules: body.rules,
      createdBy: session.user?.email
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
