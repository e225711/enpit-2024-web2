'use client';

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify'; // DOMPurifyをインポート
import { Maximize2, Minimize2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Header from '@/components/header/header';
import styles from './question.module.css';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  id: number;
  email: string;
  exp: number;
  iat: number;
};

// Question 型を定義
type Question = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  isResolved: boolean;
  user: {
    id: number;
  };
  answers: Answer[];
};

// Answer 型を定義
type Answer = {
  id: number;
  content: string;
  createdAt: string;
};

function QuestionContent({ question }: { question: Question }) {
  const [answerContent, setAnswerContent] = useState('');
  const [answers, setAnswers] = useState<Answer[]>(question.answers);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResolved, setIsResolved] = useState(question.isResolved);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error('トークンのデコードに失敗しました', error);
      }
    }
  }, []);

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 空文字または空白のみの場合は投稿させない
    if (answerContent.trim() === '') {
      alert('回答内容を入力してください。');
      return;
    }
    
    try {
      const res = await fetch('/api/create-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent, questionId: question.id }),
      });
      if (res.ok) {
        const newAnswer = await res.json();
        setAnswers((prev: Answer[]) => [...prev, newAnswer]);
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
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('APIレスポンス:', result);
        setIsResolved(true);
      } else {
        const errorText = await response.text();
        console.error('APIエラー:', errorText);
      }
    } catch (error) {
      console.error('ネットワークエラー:', error);
    }
  };

  const isOwner = currentUserId === question.user.id; // 投稿者本人かどうか確認

  // サニタイズしたHTMLを生成
// 型を明示的に指定
const sanitizedQuestionContent = DOMPurify.sanitize(marked(question.content) as string);
const sanitizedAnswerContent = (answer: Answer) => DOMPurify.sanitize(marked(answer.content) as string);


  return (
    <div className={styles.container}>
      <Header />
      <div className={`${styles.mainContent} ${isExpanded ? styles.shrinkContent : ''}`}>
        <div className={styles.headerRow}>
          <h3>質問</h3>
          {isOwner && ( // 質問者本人のみ表示
            <button
              onClick={markAsResolved}
              disabled={isResolved}
              className={styles.resolveButton}
            >
              {isResolved ? '解決済み' : '解決済みにする'}
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
          <div className={styles.content}>
            <div dangerouslySetInnerHTML={{ __html: sanitizedQuestionContent }} />
          </div>
        </div>

        <div className={styles.answers}>
          <h3>回答 ({answers.length}件)</h3>
          {answers.map((answer: Answer) => (
            <div key={answer.id} className={styles.answer}>
              <div className={styles.answerHeader}>
                <span className={styles.dateInfo}>
                  回答日時: {formatDate(answer.createdAt)}
                </span>
              </div>
              <div className={styles.content}>
                <div dangerouslySetInnerHTML={{ __html: sanitizedAnswerContent(answer) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

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
