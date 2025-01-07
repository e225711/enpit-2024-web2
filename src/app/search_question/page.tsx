"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { marked } from "marked";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import styles from "./page.module.css";
import TagSelector from "@/components/TagSelector";
import Header from "@/components/header/header";

type Tag = {
  id: number;
  name: string;
};

type IsResolved = boolean;

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

const SearchPage: React.FC = () => {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedIsResolved, setSelectedIsResolved] = useState<IsResolved>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!router.isReady) return; // クエリが準備されるまで待機

    const { tag } = router.query;
    if (tag) {
      const tagsArray = Array.isArray(tag) ? tag : [tag];
      const formattedTags = tagsArray.map((name) => ({ id: 0, name })); // 仮IDを付与
      setSelectedTags(formattedTags);
      fetchQuestions(formattedTags);
    }
  }, [router.isReady, router.query]);

  const fetchQuestions = async (tags: Tag[]) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // タグをクエリパラメータに追加
      if (tags.length > 0) {
        queryParams.set(
          "tag",
          tags.map((tag) => tag.name).join(",")
        );
      }

      // 解決済みフィルタをクエリパラメータに追加
      queryParams.set("isResolved", selectedIsResolved.toString());

      const res = await fetch(`/api/get-questions?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch questions");

      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
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
          allowTagCreation={false} // タグ作成を無効化
        />

        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="status"
              value="true"
              checked={selectedIsResolved === true}
              onChange={() => setSelectedIsResolved(true)}
              disabled={loading}
            />
            解決済
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="status"
              value="false"
              checked={selectedIsResolved === false}
              onChange={() => setSelectedIsResolved(false)}
              disabled={loading}
            />
            未解決
          </label>
        </div>

        <button
          className={styles.button}
          onClick={() => fetchQuestions(selectedTags)}
          disabled={loading}
        >
          {loading ? "質問検索中..." : "検索する"}
        </button>
      </div>

      <div className={styles.questionList}>
        {isInitialLoad ? (
          <p>キーワードやタグを入力してください。</p>
        ) : questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className={styles.questionItem}>
              <h3 className={styles.questionTitle}>
                <Link href={`/question/${question.id}`}>{question.title}</Link>
              </h3>
              <div className={styles.dateAndTags}>
                <div className={styles.tagContainer}>
                  <span className={styles.tags}>
                    <span
                      className={styles.tag}
                      style={{ color: question.isResolved ? "green" : "red" }}
                    >
                      {question.isResolved ? "解決済み" : "未解決"}
                    </span>
                    {question.tags.map((tag) => (
                      <span key={tag.id} className={styles.tag}>
                        {tag.name}
                      </span>
                    ))}
                  </span>
                </div>
                <div className={styles.dateInfo}>{formatDate(question.createdAt)}</div>
              </div>
              <div
                className={styles.markdownContent}
                dangerouslySetInnerHTML={{ __html: marked(question.content) }}
              />
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
