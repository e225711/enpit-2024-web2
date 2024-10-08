"use client";

import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
  description: string;
  date: string;
};

async function fetchQuestions() {
  const res = await fetch('/api/questions', {
    cache: 'no-store', // SSR時にキャッシュを無効化
  });
  const data = await res.json();
  return data.posts;
}

const AllQuestionPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getQuestions = async () => {
      try {
        const fetchedPosts = await fetchQuestions();
        setPosts(fetchedPosts);
      } catch (err) {
        setError("Failed to fetch questions.");
      } finally {
        setLoading(false);
      }
    };

    getQuestions();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>All Questions</h1>
      {posts.length === 0 ? (
        <p>No questions available.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <small>{new Date(post.date).toLocaleDateString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllQuestionPage;
