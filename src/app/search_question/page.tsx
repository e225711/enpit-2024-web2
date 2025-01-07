import React, { useState, useEffect } from "react";
import Link from "next/link";
import { marked } from "marked";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import styles from "./page.module.css";
import Header from "@/components/header/header";
import TagSelector from "@/components/TagSelector";

type Tag = {
  id: number;
  name: string;
};

type Question = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isResolved: boolean;
  tags: Tag[];
};

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return format(dateObj, "yyyy年MM月dd日 HH:mm", { locale: ja });
};

// サーバーコンポーネントでデータを取得
async function getQuestions(): Promise<Question[]> {
  const res = await fetch(`${process.env.API_BASE_URL}/api/user-questions`, {
    cache: "no-store", // リアルタイムのデータ取得
  });

  if (!res.ok) {
    throw new Error("Failed to fetch questions");
  }

  return res.json();
}

const SearchPage = async () => {
  const initialQuestions = await getQuestions(); // 質問データを取得

  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async (tags: Tag[]) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (tags.length > 0) {
        queryParams.set("tag", tags.map((tag) => tag.name).join(","));
      }

      const res = await fetch(`/api/get-questions?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch questions");

      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.searchContainer}>
        <textarea
          placeholder="キーワードを入力してください（任意）"
          className={styles.textarea}
          disabled={loading}
        />

        <TagSelector
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          isProcessing={loading}
          allowTagCreation={false}
        />

        <button
          className={styles.button}
          onClick={() => fetchQuestions(selectedTags)}
          disabled={loading}
        >
          {loading ? "質問検索中..." : "検索する"}
        </button>
      </div>

      <div className={styles.questionList}>
        {questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className={styles.questionItem}>
              <h3>{question.title}</h3>
              <p>{question.content}</p>
            </div>
          ))
        ) : (
          <p>条件に一致する質問が見つかりませんでした。</p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
