export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY as string;

export async function GET(req: NextRequest) {
  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY); // トークン検証
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const userId = (decoded as jwt.JwtPayload).id; // トークンからユーザーIDを取得

    // ユーザーの質問一覧を取得
    const questions = await prisma.question.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { tags: true, answers: true }, // タグや回答も含める
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching user questions:", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}
