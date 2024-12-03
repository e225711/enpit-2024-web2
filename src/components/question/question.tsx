"use client";

import React, { useState } from 'react';
import { marked } from 'marked';
import { Maximize2, Minimize2 } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Header from '@/components/header/header';
import styles from './question.module.css';

function QuestionContent({ question }: { question: any }) {  
  const [answerContent, setAnswerContent] = useState('');
  const [answers, setAnswers] = useState(question.answers);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResolved, setIsResolved] = useState(question.isResolved);

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy年MM月dd日 HH:mm', { locale: ja });
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/create-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: answerContent, questionId: question.id }),
      });
      setAnswerContent('');
    } catch (err) {
      console.error('Error creating answer:', err);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const markAsResolved = async () => {
    try {
      const response = await fetch(`/api/close_question/${question.id}`, {
        method: "PATCH",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("APIレスポンス:", result);

        // 状態を更新
        setIsResolved(true);
      } else {
        const errorText = await response.text();
        console.error("APIエラー:", errorText);
      }
    } catch (error) {
      console.error("ネットワークエラー:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={`${styles.mainContent} ${isExpanded ? styles.shrinkContent : ''}`}>
        <div className={styles.headerRow}>
          <h3>質問</h3>
          <button
            onClick={markAsResolved}
            disabled={isResolved}
            className={styles.resolveButton}
          >
            {isResolved ? "解決済み" : "解決済みにする"}
          </button>
        </div>
        <div className={styles.question}>
          <div className={styles.questionHeader}>
            <h2>{question.title}</h2>
            <span className={styles.dateInfo}>
              投稿日時: {formatDate(question.createdAt)}
            </span>
          </div>
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
