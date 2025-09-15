import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateCampaignMessage } from '@/services/ai';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { objective, customerSegment, tone } = await request.json();
    if (!objective) {
      return NextResponse.json(
        { error: 'Objective is required' },
        { status: 400 }
      );
    }

    const messages = await generateCampaignMessage({
      objective,
      customerSegment,
      tone: tone || 'friendly'
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error generating campaign messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
