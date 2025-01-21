"use client";

import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { marked } from 'marked';
import { Maximize2, Minimize2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Header from '@/components/header/header';
import styles from './question.module.css';

// トークンのデコード用の型
type DecodedToken = {
  id: number;
  email: string;
  exp: number;
  iat: number;
};

// QuestionContent コンポーネント
function QuestionContent({ question }: { question: any }) {
  const [answerContent, setAnswerContent] = useState('');
  const [answers, setAnswers] = useState(question.answers);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResolved, setIsResolved] = useState(question.isResolved);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 拡大画像用の状態

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("トークンのデコードに失敗しました", error);
      }
    }
  }, []);

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };

  const toDataURL = (base64: string): string => {
    return `data:image/jpeg;base64,${base64}`; // 必要に応じてMIMEタイプを変更
  };

  const closeModal = () => {
    setSelectedImage(null); // モーダルを閉じる
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answerContent.trim() === '') {
      alert('回答内容を入力してください。');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/create-answer', {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: answerContent, questionId: question.id }),
      });
      if (res.ok) {
        const newAnswer = await res.json();
        setAnswers((prev: any) => [...prev, newAnswer]);
        setAnswerContent('');
      } else {
        console.error('回答の投稿に失敗しました');
      }
    } catch (err) {
      console.error('Error creating answer:', err);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const markAsResolved = async () => {
    try {
      const response = await fetch(`/api/close-question/${question.id}`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        console.log("APIレスポンス:", result);
        setIsResolved(true);
      } else {
        const errorText = await response.text();
        console.error("APIエラー:", errorText);
      }
    } catch (error) {
      console.error("ネットワークエラー:", error);
    }
  };

  const isOwner = currentUserId === question.user.id;

  return (
    <div className={styles.container}>
      <Header />
      <div className={`${styles.mainContent} ${isExpanded ? styles.shrinkContent : ''}`}>
        <div className={styles.headerRow}>
          <h3>質問</h3>
          {isOwner && (
            <button
              onClick={markAsResolved}
              disabled={isResolved}
              className={styles.resolveButton}
            >
              {isResolved ? "解決済み" : "解決済みにする"}
            </button>
          )}
        </div>
        <div className={styles.question}>
          <div className={styles.questionHeader}>
            <h2>{question.title}</h2>
            <span className={styles.dateInfo}>
              投稿日時: {formatDate(question.createdAt)}
            </span>
          </div>
          {/* 添付画像の表示 */}
          {question.images.length > 0 && (
            <div className={styles.imageGrid}>
              {question.images.map((image: any) => (
                <img
                  key={image.id}
                  src={toDataURL(image.binaryData)}
                  alt="添付画像"
                  className={styles.image}
                  onClick={() => setSelectedImage(toDataURL(image.binaryData))} // 拡大表示用画像を設定
                  onError={(e) => (e.currentTarget.src = '/fallback-image.jpg')} // フォールバック画像
                />
              ))}
            </div>
          )}
          <div className={styles.content}>
            <div dangerouslySetInnerHTML={{ __html: marked(question.content) }} />
          </div>
        </div>

        <div className={styles.answers}>
          <h3>回答 ({answers.length}件)</h3>
          {answers.map((answer: any) => (
            <div key={answer.id} className={styles.answer}>
              <div className={styles.answerHeader}>
                <span className={styles.dateInfo}>
                  回答日時: {formatDate(answer.createdAt)}
                </span>
              </div>
              <div className={styles.content}>
                <div dangerouslySetInnerHTML={{ __html: marked(answer.content) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* モーダル */}
      {selectedImage && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent}>
            <img src={selectedImage} alt="拡大画像" className={styles.modalImage} />
          </div>
        </div>
      )}

      <div className={`${styles.answerFormContainer} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.expandToggle}>
          <button
            type="button"
            onClick={toggleExpand}
            className={styles.expandButton}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            {isExpanded ? '縮小' : '拡大'}
          </button>
        </div>

        <form className={styles.answerForm} onSubmit={handleAnswerSubmit}>
          <textarea
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
            placeholder="回答を入力してください"
            className={`${styles.answerTextarea} ${isExpanded ? styles.expandedTextarea : ''}`}
            rows={isExpanded ? 15 : 3}
          />
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.submitButton}>
              回答を投稿
            </button>
            <button
              type="button"
              className={styles.reloadButton}
              onClick={() => window.location.reload()}
            >
              リロード
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionContent;
