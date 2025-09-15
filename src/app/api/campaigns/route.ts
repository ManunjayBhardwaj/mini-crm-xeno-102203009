import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Campaign from '@/models/Campaign';
import { authOptions } from '@/lib/auth';
import { campaignDeliveryService } from '@/services/campaignDelivery';
import { analyzeCampaignPerformance } from '@/services/ai';

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

// GET /api/campaigns
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const campaigns = await Campaign.find({})
      .populate('segmentId')
      .sort({ createdAt: -1 });

    // Add AI-generated insights for completed campaigns
    const campaignsWithInsights = await Promise.all(
      campaigns.map(async (campaign) => {
        if (campaign.status === 'completed') {
          const insights = await analyzeCampaignPerformance({
            name: campaign.name,
            stats: campaign.stats,
            segment: campaign.segmentId
          });
          return { ...campaign.toObject(), insights };
        }
        return campaign;
      })
    );

    return NextResponse.json(campaignsWithInsights, { status: 200 });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/campaigns
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Basic validation
    if (!body.name || !body.segmentId || !body.message) {
      return NextResponse.json(
        { error: 'Name, segment ID, and message are required' },
        { status: 400 }
      );
    }

    // Create campaign
    const campaign = await Campaign.create({
      ...body,
      status: 'draft',
      createdBy: session.user?.email
    });

    // Start campaign delivery process
    await campaignDeliveryService.startCampaign(campaign._id);

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
