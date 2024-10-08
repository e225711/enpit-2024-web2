"use client";
import React, { useState } from 'react';
import styles from './page.module.css'; 
import Link from 'next/link';
import { marked } from 'marked'; // markedライブラリをインポート

const NewQuestionPage = () => {
  const [content, setContent] = useState(''); // 入力内容を管理するステート


  //データベースに保存するための関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('../api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),  // 質問内容を送信
    });
  };

  

  return (
    <div className={styles.container}>
      <h1>OS課題相談広場</h1>
      <form>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="タイトルを入力してください"
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="タグを選択してください"
            className={styles.input}
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="button" className={styles.imageButton}>画像添付</button>
          <button type="button" className={styles.editButton}>エディタ</button>
          <button type="button" className={styles.previewButton}>プレビュー</button>
        </div>
        <div className={styles.textAreaContainer}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)} // 入力内容をステートに反映
            placeholder="Markdown形式で質問内容を入力してください"
            rows={10}
            className={styles.textArea}
          />
          <div
            className={styles.previewArea}
            dangerouslySetInnerHTML={{ __html: marked(content) }} // MarkdownをHTMLに変換して表示
          />
        </div>
        <div className={styles.footer}>
          <Link href="/">
            <button type="button" className={styles.cancelButton}>キャンセル</button>
          </Link>
          <form onSubmit={handleSubmit}> 
            <button type="submit" className={styles.submitButton}>作成</button>
          </form>
        </div>
      </form>
    </div>
  );
};

export default NewQuestionPage;
