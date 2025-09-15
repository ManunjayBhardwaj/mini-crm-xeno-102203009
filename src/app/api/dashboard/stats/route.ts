import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Campaign from '@/models/Campaign';
import Customer from '@/models/Customer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get total customers
    const totalCustomers = await Customer.countDocuments();

    // Get active campaigns
    const activeCampaigns = await Campaign.countDocuments({ status: 'in-progress' });

    // Get total delivered messages
    const campaignStats = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalDelivered: { $sum: '$stats.delivered' },
          totalSent: { $sum: '$stats.sent' },
        },
      },
    ]);

    const totalDelivered = campaignStats[0]?.totalDelivered || 0;
    const totalSent = campaignStats[0]?.totalSent || 0;

    // Calculate engagement rate
    const engagementRate = totalSent > 0 
      ? Math.round((totalDelivered / totalSent) * 100) 
      : 0;

    return NextResponse.json({
      totalCustomers,
      activeCampaigns,
      totalDelivered,
      engagementRate,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
