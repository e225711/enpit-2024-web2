// app/question/[id]/page.tsx
import { PrismaClient } from '@prisma/client';
import QuestionContent from '@/components/question/question';

const prisma = new PrismaClient();

async function fetchQuestion(id: number) {
  const question = await prisma.question.findUnique({
    where: { id },
    include: { answers: true, images: true },
  });
  return question;
}

export default async function QuestionPage({ params }: { params: { id: string } }) {
  const questionId = parseInt(params.id);
  const question = await fetchQuestion(questionId);

  // null チェックを追加
  if (!question) {
    return (
      <div>
        <h1>質問が見つかりませんでした</h1>
        <p>指定された質問は存在しないか、削除された可能性があります。</p>
      </div>
    );
  }

  return <QuestionContent question={question} />;
}
