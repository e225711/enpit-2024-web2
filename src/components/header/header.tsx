import styles from './header.module.css';
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1>
          <Link href="/" className={styles.link}>
            OS課題相談広場
          </Link>
        </h1>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <Link href="/search_question">
            <button className={styles.questionButton}>質問検索</button>
            </Link>
          </li>
          <li>使い方</li>
          <li>
            <Link href="/new_question">
              <button className={styles.questionButton}>＋質問する</button>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
