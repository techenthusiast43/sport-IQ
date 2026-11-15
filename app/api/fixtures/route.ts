import { NextRequest, NextResponse, connection } from 'next/server';
import { getUpcomingFixtures } from '@/lib/sportsData';

export async function GET(req: NextRequest) {
  await connection();

  try {
    const refresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const result = await getUpcomingFixtures(refresh);

    const hasGemini = Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    );

    return NextResponse.json(
      {
        ...result,
        isDemoMode: !hasGemini,
        hasGemini,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Error in /api/fixtures:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve upcoming fixtures' },
      { status: 500 }
    );
  }
}
