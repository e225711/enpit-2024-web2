"use client";

import React, { useState } from 'react';
import styles from './page.module.css';
import Header from '@/components/header/header'; // Headerコンポーネントをインポート

export default function Home() {
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
          {/* ログのリストを追加 */}
          {1.1}<br />
          {1.2}<br />
          {1.3}<br />
          {1.4}<br />
          {2.1}<br />
          {2.2}<br />
          {2.3}<br />
          {2.4}<br />
          {2.5}<br />
          {2.6}<br />
          {2.7}<br />
          {2.8}<br />
          {2.9}<br />
          {3.1}<br />
          {3.2}<br />
          {3.3}<br />
          {3.4}<br />
          {4.1}<br />
          {4.2}<br />
          {4.3}<br />
          {5.1}<br />
          {5.2}<br />
          {6.1}<br />
          {6.2}<br />
          {6.3}<br />
          {7.1}<br />
          {7.2}<br />
          {7.3}<br />
          {7.4}<br />
          {8.1}<br />
          {8.2}<br />
          {8.3}<br />
          {8.4}<br />
          {8.5}<br />
          {9.1}<br />
          {9.2}<br />
          {10.1}<br />
          {10.2}<br />
          {11.1}<br />
          {11.2}<br />
          {11.3}<br />
          {11.4}<br />

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
              <div className={styles.questionItem}>
                <h2>課題8.1: Perlスクリプト実行時のSSHエラーとIllegal division by zeroエラーについて</h2>
                <p>
                  質問があります。課題8.1のperl display_is.pl {'>'} data1.htmlを実行した際に、ssh: Could not resolve
                  hostname amane.u-ryukyu.ac.jp: nodename nor servname provided, or not known Illegal division by zero at
                  display_is.pl line 35. というエラーが起こります。ssh amane接続でもエラーが発生してしまうのですが、どう対処すれば良いでしょうか？
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>課題8.2: Pythonでのデータ処理の最適化について</h2>
                <p>
                  Pythonを使用してデータを処理していますが、処理速度が遅く、最適化する方法が知りたいです。
                  具体的には、Pandasを使って数百万行のデータを操作する際に、メモリ使用量を減らす方法はありますか？
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>課題8.3: Javaでのデータベース接続エラーについて</h2>
                <p>
                  Javaを使ってMySQLに接続する際にエラーが発生しました。具体的には「Communications link failure」というエラーです。
                  これを解決するための手順を教えていただけますか？
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>課題8.4: Gitのブランチ管理について</h2>
                <p>
                  Gitで複数のブランチを管理する際、どのようにブランチを整理するのがベストプラクティスですか？
                  特に、長期間の開発がある場合の運用方法についてアドバイスをいただきたいです。
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>課題8.5: HTML/CSSでのレスポンシブデザインについて</h2>
                <p>
                  レスポンシブデザインを実現するために、どのようなCSSの技術を使用するのが良いでしょうか？
                  具体的なコード例などがあれば教えていただきたいです。
                </p>
              </div>
            </div>
            )}
            {activeTab === 'tab2' && (
              <div className={styles.question}>
              <div className={styles.questionItem}>
                <h2>未解決の問題1: データベース接続エラーの解決策</h2>
                <p>
                  あるデータベースに接続する際に「接続タイムアウト」のエラーが発生しました。この問題を解決するための手順を教えていただけますか？
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>未解決の問題2: APIのレスポンスが遅い</h2>
                <p>
                  特定のAPIを呼び出した際に、レスポンスが非常に遅いと感じています。この遅延を改善する方法はありますか？
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>未解決の問題3: JavaScriptの非同期処理について</h2>
                <p>
                  JavaScriptで非同期処理を行う際に、Promiseやasync/awaitの使い方に迷っています。効率的な書き方を教えてください。
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>未解決の問題4: CSS Gridのレイアウトについて</h2>
                <p>
                  CSS Gridを使ったレイアウトで、要素の位置を正しく配置できません。特に、カラムのサイズ調整についてアドバイスをいただきたいです。
                </p>
              </div>
          
              <div className={styles.questionItem}>
                <h2>未解決の問題5: GitHub Actionsの設定について</h2>
                <p>
                  GitHub Actionsを使用してCI/CDを実現したいのですが、初期設定でつまずいています。どのように設定すれば良いでしょうか？
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
