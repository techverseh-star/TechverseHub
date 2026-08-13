import { NextRequest, NextResponse } from 'next/server';
import { getPracticeSummary } from '@/lib/practiceData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'Web dev';
    const data = getPracticeSummary(category);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Error fetching practice data:', error);
    return NextResponse.json({ error: 'Failed to load practice data' }, { status: 500 });
  }
}
