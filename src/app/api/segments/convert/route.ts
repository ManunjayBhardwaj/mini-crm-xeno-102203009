import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { suggestSegmentRules } from '@/services/ai';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description } = await request.json();
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const rules = await suggestSegmentRules(description);
    return NextResponse.json({ rules }, { status: 200 });
  } catch (error) {
    console.error('Error converting natural language to rules:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
