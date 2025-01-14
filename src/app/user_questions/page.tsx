"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "dompurify"; // DOMPurifyをインポート
import styles from "./page.module.css";
import Header from "@/components/header/header";

type Question = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isResolved: boolean;
  tags: { id: number; name: string }[];
};

export default function UserQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("ログインが必要です。");
      router.push("/login");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/user-questions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "質問を取得できませんでした。");
        }

        const data = await res.json();
        setQuestions(data.questions);
      } catch (err) {
        console.error(err);
        alert("質問を取得できませんでした。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.wrapper}>
        <h3>あなたの質問一覧</h3>
        {isLoading ? (
          <p>読み込み中...</p>
        ) : questions.length > 0 ? (
          <div className={styles.question}>
            {questions.map((question) => (
              <div key={question.id} className={styles.questionItem}>
                <h2>
                  <Link href={`/question/${question.id}`}>{question.title}</Link>
                </h2>
                <div className={styles.dateAndTags}>
                  <div className={styles.tagContainer}>
                    <span className={styles.tags}>
                      <span
                        className={styles.tag}
                        style={{ color: question.isResolved ? "green" : "red" }}
                      >
                        {question.isResolved ? "解決済み" : "未解決"}
                      </span>
                      {question.tags &&
                        question.tags.length > 0 &&
                        question.tags.map((tag) => (
                          <span key={tag.id} className={styles.tag}>
                            {tag.name}
                          </span>
                        ))}
                    </span>
                  </div>
                  <div className={styles.dateInfo}>
                    {formatDate(question.createdAt)}
                  </div>
                </div>
                {/* サニタイズしてから表示 */}
                <div
                  className={styles.markdownContent}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(question.content), // サニタイズ処理を加えます
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>質問がありません。</p>
        )}
        <Link href="/">
          <button className={styles.backButton}>トップページに戻る</button>
        </Link>
      </div>
    </div>
  );
}
