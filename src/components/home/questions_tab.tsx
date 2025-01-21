"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { marked } from 'marked';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import styles from '@/app/page.module.css';

type Question = {
  id: number;
  title: string;
  content: string;
  isResolved: boolean;
  createdAt: Date;
  tags: Tag[];
  images: Image[];
};

type Image = {
  id: number;
  questionId: number;
  binaryData: string; // Base64形式
  createdAt: Date;
};

type Tag = {
  id: number;
  name: string;
};

type QuestionsTabProps = {
  questions: Question[];
  unresolvedQuestions: Question[];
  tags: Tag[];
};

// タブの状態を表す文字列リテラル型を定義
type Tab = 'latest' | 'unresolved';

const toDataURL = (base64: string): string => {
  return `data:image/jpeg;base64,${base64}`; // 必要に応じてMIMEタイプを変更
};

const QuestionsTab: React.FC<QuestionsTabProps> = ({ questions, unresolvedQuestions, tags }) => {
  const [activeTab, setActiveTab] = useState<Tab>('latest'); // デフォルトで 'latest' を選択
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 拡大表示用の画像URL

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };

  const closeModal = () => {
    setSelectedImage(null); // モーダルを閉じる
  };

  const renderQuestions = (questions: Question[]) => (
    <div className={styles.question}>
      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id} className={styles.questionItem}>
            <h2>
              <Link href={`/question/${question.id}`}>{question.title}</Link>
            </h2>
            <div className={styles.dateAndTags}>
              <div className={styles.tagContainer}>
                <span className={styles.tags}>
                  <span className={styles.tag} style={{ color: question.isResolved ? 'green' : 'red' }}>
                    {question.isResolved ? "解決済み" : "未解決"}
                  </span>
                  {question.tags.map((tag) => (
                    <span key={tag.id} className={styles.tag}>{tag.name}</span>
                  ))}
                </span>
              </div>
              <div className={styles.dateInfo}>
                {formatDate(question.createdAt)}
              </div>
            </div>
            {question.images.length > 0 && (
              <div className={styles.imageGrid}>
                {question.images.map((image) => (
                  <img
                    key={image.id}
                    src={toDataURL(image.binaryData)} 
                    alt="添付画像"
                    className={styles.image}
                    onClick={() => setSelectedImage(toDataURL(image.binaryData))} // 拡大画像を設定
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
        <p>{activeTab === 'latest' ? '質問はまだありません。' : '未解決の質問はありません。'}</p>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <p>タグ一覧</p>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <div key={tag.id} className={styles.tagItem}>
              <Link href={`/search_question?tag=${encodeURIComponent(tag.name)}`} className={styles.tagLink}>
                {tag.name}
              </Link>
            </div>
          ))
        ) : (
          <p>タグがありません</p>
        )}
      </aside>
      <main className={styles.main}>
        <div className={styles.tabs}>
          <button
            className={activeTab === 'latest' ? styles.activeTab : styles.inactiveTab}
            onClick={() => handleTabClick('latest')}
          >
            最新の質問
          </button>
          <button
            className={activeTab === 'unresolved' ? styles.activeTab : styles.inactiveTab}
            onClick={() => handleTabClick('unresolved')}
          >
            未解決の質問
          </button>
        </div>
        <div className={styles.tabContent}>
          {activeTab === 'latest' && renderQuestions(questions)}
          {activeTab === 'unresolved' && renderQuestions(unresolvedQuestions)}
        </div>
      </main>

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

export default QuestionsTab;
