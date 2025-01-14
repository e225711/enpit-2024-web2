import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const url = new URL(req.url);
  const tagNames = url.searchParams.get('tag')?.split(',') || []; // タグを配列として取得
  const isResolvedParam = url.searchParams.get('isResolved');
  const resolvedStatus = isResolvedParam === 'true' ? true : isResolvedParam === 'false' ? false : undefined;

  const keyword = url.searchParams.get('keyword') || ''; // キーワードを取得

  try {
    const questions = await prisma.question.findMany({
      where: {
        // タグフィルタリング
        tags: tagNames.length > 0
          ? {
              some: {
                name: {
                  in: tagNames, // 複数のタグのいずれかを持つ
                },
              },
            }
          : {},
        
        // 解決状態のフィルタリング
        isResolved: resolvedStatus,

        // キーワードフィルタリング
        OR: keyword
          ? [
              { title: { contains: keyword, mode: 'insensitive' } }, // タイトルにキーワードを含む
              { content: { contains: keyword, mode: 'insensitive' } }, // コンテンツにキーワードを含む
            ]
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: { tags: true },
    });

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
