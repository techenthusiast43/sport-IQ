import { NextRequest, NextResponse, connection } from 'next/server';
import { getUpcomingFixtures } from '@/lib/sportsData';

export async function GET(req: NextRequest) {
  await connection();

  try {
    const refresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const result = await getUpcomingFixtures(refresh);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    console.error('Error in /api/fixtures:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve upcoming fixtures' },
      { status: 500 }
    );
  }
}
