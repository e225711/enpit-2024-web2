"use client";
import React, { useState } from 'react';
import styles from './page.module.css'; 
import Link from 'next/link';

const NewQuestionPage = () => {
  const [content, setContent] = useState(''); // 入力内容を管理するステート

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
            placeholder="質問内容を入力してください"
            rows={10}
            className={styles.textArea}
          />
          <div className={styles.previewArea}>
            {content || "ここにプレビューが表示されます"} {/* 入力された内容を表示 */}
          </div>
        </div>
        <div className={styles.footer}>
          <Link href="/">
            <button type="button" className={styles.cancelButton}>キャンセル</button>
          </Link>
          <button type="submit" className={styles.submitButton}>作成</button>
        </div>
      </form>
    </div>
  );
};

export default NewQuestionPage;
