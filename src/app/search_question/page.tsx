"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { marked } from 'marked';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import styles from "./page.module.css";
import TagSelector from "@/components/TagSelector";
import Header from '@/components/header/header';
import { useRouter } from 'next/router';

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
  return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
};

const SearchPage: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedIsResolved, setSelectedIsResolved] = useState<IsResolved>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  //初回表示用のフラグ
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
  
      // タグをクエリパラメータに追加
      if (selectedTags.length > 0) {
        queryParams.set(
          'tag',
          selectedTags.map((tag) => tag.name).join(',')
        );
      }


      if (selectedIsResolved !== null) {
        queryParams.set('isResolved', selectedIsResolved.toString()); // selectedIsResolvedを使用
      }
  
      const res = await fetch(`/api/get-questions?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch questions');
      }
  
      const data = await res.json();
      setQuestions(data); // 取得した質問データをセット
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };


  //userouterを使って新しく設定
  const router = useRouter();
  useEffect(() => {
    const { tag } = router.query; // URLからtagパラメータを取得
  
    if (tag) {
      // 複数タグの可能性を考慮
      const tagsArray = Array.isArray(tag) ? tag : [tag];
      const formattedTags = tagsArray.map((name) => ({ id: 0, name })); // IDは仮
      setSelectedTags(formattedTags); // 初期状態にセット
      fetchQuestions(); // タグが指定されている場合に初期検索を実行
    }
  }, [router.query]); // URLのクエリが変わったときに再実行


  

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
              onChange={() => setSelectedIsResolved(true)} //IsResolvedを解決に変更
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

        <button className={styles.button} onClick={fetchQuestions} disabled={loading}>
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
                      style={{ color: question.isResolved ? 'green' : 'red' }}
                    >
                      {question.isResolved ? '解決済み' : '未解決'}
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

  );
};

export default SearchPage;
