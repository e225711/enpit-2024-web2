"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { marked } from 'marked';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import styles from '@/app/page.module.css';
import DOMPurify from 'dompurify'; // DOMPurifyのインポート

type Question = {
  id: number;
  title: string;
  content: string;
  isResolved: boolean;
  createdAt: Date;
  tags: Tag[]
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

const QuestionsTab: React.FC<QuestionsTabProps> = ({ questions, unresolvedQuestions, tags }) => {
  const [activeTab, setActiveTab] = useState<Tab>('latest'); // デフォルトで 'latest' を選択

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
  };

  const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };

  const renderQuestions = (questions: Question[]) => (
    <div className={styles.question}>
      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id} className={styles.questionItem}>
            <h2>
              <Link href={`/question/${question.id}`}>{question.title}</Link>
            </h2>
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
            {/* サニタイズした内容を表示 */}
            <div
              className={styles.markdownContent}
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(question.content)) }} // サニタイズを追加
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
            <div key={tag.id}>
              {tag.name}
              <br />
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
    </div>
  );
};

export default QuestionsTab;
