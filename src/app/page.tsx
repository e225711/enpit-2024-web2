"use client";
import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import Header from '@/components/header/header';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Question = {
  id: number;
  title: string;
  content: string;
};

async function fetchQuestions(): Promise<Question[]> {
  // データベースから最新の質問を取得
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return questions;
}

export default async function Home() {
  // 最新のデータを常に取得するようにキャッシュ設定を無効化
  const questions = await fetchQuestions();

  const [activeTab, setActiveTab] = useState('tab1'); // タブの状態を管理
 
  // タブを切り替える関数
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };
  
  return (
    <div>
      <Header />

<div className={styles.introSection}>
  <h2>相談広場へようこそ！</h2>
  <p>
    OSの課題について質問をたくさん聞いてね〜 <br />
    匿名で授業や課題について分からないことを質問できるよ！ <br />
    学サポのTAや友人が答えてくれるよ！！
  </p>
</div>

<div className={styles.container}>
  <aside className={styles.sidebar}>
    <p>タグ一覧</p>
    {/* タグのリスト（ダミー表示のまま） */}
    {1.1}<br />
    {1.2}<br />
    {1.3}<br />
  </aside>

  <main className={styles.main}>
    {/* タブナビゲーション */}
    <div className={styles.tabs}>
      <button
        className={`${activeTab === 'tab1' ? styles.activeTab1 : styles.inactiveTab}`}
        onClick={() => handleTabClick('tab1')}
      >
        最新の質問
      </button>
      <button
        className={`${activeTab === 'tab2' ? styles.activeTab2 : styles.inactiveTab}`}
        onClick={() => handleTabClick('tab2')}
      >
        未解決の質問
      </button>
    </div>

    {/* タブのコンテンツ */}
    <div className={styles.tabContent}>
      {activeTab === 'tab1' && (
        <div className={styles.question}>
          {questions.map((question) => (
            <div key={question.id} className={styles.questionItem}>
              <h2>{question.title}</h2>
              <p>{question.content}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'tab2' && (
        <div className={styles.question}>
          {/* 未解決の質問をここに表示する */}
          <div className={styles.questionItem}>
            <h2>未解決の問題1: データベース接続エラーの解決策</h2>
            <p>
              あるデータベースに接続する際に「接続タイムアウト」のエラーが発生しました。この問題を解決するための手順を教えていただけますか？
            </p>
          </div>
          {/* 他の未解決の問題も同様に追加 */}
        </div>
      )}
    </div>
  </main>
</div>
</div>
);
}

export const revalidate = 0; // ISRのキャッシュを無効化して最新のデータを取得
