"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { marked } from "marked";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import styles from "./page.module.css";
import Header from "@/components/header/header";
import TagSelector from "@/components/TagSelector";
import { useSearchParams } from "next/navigation";

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

const SearchPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [keyword, setKeyword] = useState<string>(""); // キーワード
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // 解決/未解決
  const [loading, setLoading] = useState(false);

  // クエリパラメータから値を取得
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag"); // URLパラメータ 'tag'

  // 初期状態でデータを取得
  useEffect(() => {
    const fetchInitialQuestions = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (tag) {
          queryParams.set("tag", tag);
          setSelectedTags([{ id: Date.now(), name: tag }]); // タグを初期選択状態に設定
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

    fetchInitialQuestions();
  }, [tag]);

  // 検索関数（タグ、キーワード、解決状態）
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      // タグをクエリパラメータに追加
      if (selectedTags.length > 0) {
        queryParams.set(
          "tag",
          selectedTags.map((tag) => tag.name).join(",")
        );
      }

      // キーワードをクエリパラメータに追加
      if (keyword.trim() !== "") {
        queryParams.set("keyword", keyword.trim());
      }

      // 解決状態をクエリパラメータに追加
      if (selectedStatus !== null) {
        queryParams.set("isResolved", selectedStatus);
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
        {/* キーワード入力 */}
        <textarea
          placeholder="キーワードを入力してください（任意）"
          className={styles.textarea}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={loading}
        />

        {/* タグ選択 */}
        <TagSelector
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          isProcessing={loading}
          allowTagCreation={false}
        />

        {/* 解決/未解決選択 */}
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="status"
              value="true"
              checked={selectedStatus === "true"}
              onChange={() => setSelectedStatus("true")}
              disabled={loading}
            />
            解決済
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="status"
              value="false"
              checked={selectedStatus === "false"}
              onChange={() => setSelectedStatus("false")}
              disabled={loading}
            />
            未解決
          </label>
        </div>

        {/* 検索ボタン */}
        <button
          className={styles.button}
          onClick={fetchQuestions}
          disabled={loading}
        >
          {loading ? "質問検索中..." : "検索する"}
        </button>
      </div>

      {/* 検索結果 */}
      <div className={styles.questionList}>
        {questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className={styles.questionItem}>
              <h3 className={styles.questionTitle}>
                {/* クリックで詳細ページに遷移 */}
                <Link href={`/question/${question.id}`}>
                  {question.title}
                </Link>
              </h3>
              <p>{question.content}</p>
              <p>{formatDate(question.createdAt)}</p>
              <div>
                {question.tags.map((tag) => (
                  <span key={tag.id} className={styles.tag}>
                    {tag.name}
                  </span>
                ))}
              </div>
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
