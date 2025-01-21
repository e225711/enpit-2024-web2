"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { marked } from 'marked';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';  // 追加
import styles from "./page.module.css";
import TagSelector from "@/components/TagSelector";
import Header from "@/components/header/header";

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
  return format(dateObj, "yyyy年MM月dd日 HH:mm", { locale: ja });
};

const toDataURL = (base64: string): string => {
  return `data:image/jpeg;base64,${base64}`; // 必要に応じてMIMEタイプを変更
};

const SearchPage: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedIsResolved, setSelectedIsResolved] = useState<IsResolved>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 初回表示用フラグ
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // モーダル用画像

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

      // キーワードをクエリパラメータに追加
      if (keyword.trim() !== "") {
        queryParams.set("keyword", keyword.trim());
      }

      // タグをクエリパラメータに追加
      if (selectedTags.length > 0) {
        queryParams.set(
          "tag",
          selectedTags.map((tag) => tag.name).join(",")
        );
      }

      if (selectedIsResolved !== null) {
        queryParams.set("isResolved", selectedIsResolved.toString());
      }

      const res = await fetch(`/api/get-questions?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch questions");
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

  const closeModal = () => {
    setSelectedImage(null); // モーダルを閉じる
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
              {question.images && question.images.length > 0 && (
                <div className={styles.imageGrid}>
                  {question.images.map((image) => (
                    <img
                      key={image.id}
                      src={toDataURL(image.binaryData)}
                      alt="添付画像"
                      className={styles.image}
                      onClick={() => setSelectedImage(toDataURL(image.binaryData))} // 画像クリックでモーダルを開く
                      onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")} // フォールバック画像
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

      {/* モーダル */}
      {selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent}>
            <img src={selectedImage} alt="拡大画像" className={styles.modalImage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
