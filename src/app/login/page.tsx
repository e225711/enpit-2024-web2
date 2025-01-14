"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import DOMPurify from "dompurify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // useRouterフックを使用

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // メールアドレスとパスワードをサニタイズ
    const sanitizedEmail = DOMPurify.sanitize(email);
    const sanitizedPassword = DOMPurify.sanitize(password);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      // ログイン成功時にトップページへ遷移
      router.push("/");
    } else {
      alert(data.error || "ログインに失敗しました。");
    }
  };

  return (
    <div className={styles.pageRoot}>
      <div className={styles["auth-container"]}>
        <h1>ログイン</h1>
        <p>登録済みのアカウントでログインしてください。</p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">ログイン</button>
        </form>
        <Link href="/register">
          <button className={styles["link-button"]} type="button">
            アカウントをお持ちでない場合はこちら
          </button>
        </Link>
      </div>
    </div>
  );
}
