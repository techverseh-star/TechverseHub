import { NextRequest, NextResponse } from 'next/server';
import { getPracticeLesson } from '@/lib/practiceData';

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string; module: string; lesson: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const level = parseInt(params.level);
    const data = getPracticeLesson(level, params.module, params.lesson, category);

    if (!data) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Error fetching practice lesson:', error);
    return NextResponse.json({ error: 'Failed to load lesson' }, { status: 500 });
  }
}
