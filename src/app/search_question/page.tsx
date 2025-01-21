"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { marked } from 'marked';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';  // 追加
import styles from "./page.module.css";
import TagSelector from "@/components/TagSelector";
import Header from '@/components/header/header';


type Tag = {
  id: number;
  name: string;
};

type Image = {
  id: number;
  questionId: number;
  binaryData: string; // Base64形式
  createdAt: Date;
};

type IsResolved = boolean;

type Question = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isResolved: boolean;
  tags: Tag[];
  images: Image[];
};

const formatDate = (date: string) => {
  const dateObj = new Date(date);
  return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
};

const toDataURL = (base64: string): string => {
  return `data:image/jpeg;base64,${base64}`; // 必要に応じてMIMEタイプを変更
};

const SearchPage: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedIsResolved, setSelectedIsResolved] = useState<IsResolved>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  //初回表示用のフラグ
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const searchParams = useSearchParams();

  useEffect(() => {
    const tagParam = searchParams.get("tag");
    if (tagParam) {
      const tagNames = tagParam.split(',').map(name => name.trim()).filter(name => name !== '');
      if(tagNames.length > 0) {
        const initialTags = tagNames.map((name, idx) => ({ id: idx, name }));
        setSelectedTags(initialTags);
      }

      const queryParams = new URLSearchParams();
      if (keyword.trim() !== "") {
        queryParams.set("keyword", keyword.trim());
      }
      if (tagNames.length > 0) {
        queryParams.set("tag", tagNames.join(','));
      }
      if (selectedIsResolved !== null) {
        queryParams.set('isResolved', selectedIsResolved.toString());
      }
      setLoading(true);
      fetch(`/api/get-questions?${queryParams.toString()}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch questions');
          return res.json();
        })
        .then(data => setQuestions(data))
        .catch(error => console.error(error))
        .finally(() => {
          setLoading(false);
          setIsInitialLoad(false);
        });
    }
  }, [searchParams]);

  const fetchQuestions = async () => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();

      //キーワードをクエリパラメータに追加
      if (keyword.trim() !== "") {
        queryParams.set("keyword", keyword.trim());
      }
  
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
  

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.searchContainer}>
        <textarea
          placeholder="キーワードを入力してください（任意）"
          className={styles.textarea}
          disabled={loading}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
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
        {/* 初回表示時に分岐 */}
        {isInitialLoad ? (
          <p>キーワードやタグを入力してください。</p>
        ) : questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className={styles.questionItem}>
              <h3 className={styles.questionTitle}>
                <Link href={`/question/${question.id}`}>{question.title}</Link>
              </h3>
              {/* 投稿日時とタグを横並びに表示するため、同じdivで囲む */}
              <div className={styles.dateAndTags}>
                {/* タグ一覧を一行で表示 */}
                <div className={styles.tagContainer}>
                  <span className={styles.tags}>
                    {/* 解決状態のタグ */}
                    <span className={styles.tag} style={{ color: question.isResolved ? 'green' : 'red' }}>
                      {question.isResolved ? "解決済み" : "未解決"}
                    </span>

                    {/* 質問に関連するタグ */}
                    {question.tags && question.tags.length > 0 &&
                      question.tags.map((tag) => (
                        <span key={tag.id} className={styles.tag}>
                          {tag.name}
                        </span>
                      ))
                    }
                  </span>
                </div>

                {/* 投稿日時 */}
                <div className={styles.dateInfo}>
                  {formatDate(question.createdAt)}
                </div>
              </div>
              {/* 添付画像 */}
              {question.images && question.images.length > 0 && (
                <div className={styles.imageGrid}>
                  {question.images.map((image) => (
                    <img
                      key={image.id}
                      src={toDataURL(image.binaryData)}
                      alt="添付画像"
                      className={styles.image}
                      onError={(e) => (e.currentTarget.src = '/fallback-image.jpg')} // フォールバック画像
                    />
                  ))}
                </div>
              )}
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
