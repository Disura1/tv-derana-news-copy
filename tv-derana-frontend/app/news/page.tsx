'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  likes: number;
  publishedAt: string;
  author: { username: string };
}

interface User {
  id: string;
  username: string;
  role: string;
}

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userStr) setUser(JSON.parse(userStr));
    fetchArticles(token);
  }, [sortBy]);

  const fetchArticles = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/articles?sortBy=${sortBy}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
        return;
      }

      const data = await res.json();
      setArticles(data);
    } catch (err: any) {
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3001/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (err) {
      alert('Failed to delete article');
    }
  };

  const handleLike = async (id: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:3001/articles/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setArticles(articles.map((a) => (a.id === id ? { ...a, likes: updated.likes } : a)));
      }
    } catch (err) {
      // ignore
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'EDITOR';

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px' }}>TV Derana News</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {canManage && (
            <Link href="/news/create" style={{ padding: '8px 16px', background: '#000', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
              + New Article
            </Link>
          )}
          <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Sort by: </label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '6px' }}>
          <option value="date">Newest First</option>
          <option value="popularity">Popularity</option>
          <option value="category">Category</option>
        </select>
      </div>

      {loading && <p>Loading articles...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && articles.length === 0 && <p>No articles yet.</p>}

      {articles.map((article) => (
        <div key={article.id} style={{ border: '1px solid #444', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>{article.title}</h2>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
            {article.category} • By {article.author.username} • {article.views} views • {article.likes} likes
          </p>
          <p style={{ marginBottom: '12px' }}>{article.content.slice(0, 150)}...</p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleLike(article.id)} style={{ padding: '6px 12px', cursor: 'pointer' }}>
              👍 Like
            </button>
            {canManage && (
              <>
                <Link href={`/news/${article.id}/edit`} style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', textDecoration: 'none' }}>
                  Edit
                </Link>
                <button onClick={() => handleDelete(article.id)} style={{ padding: '6px 12px', color: 'red', cursor: 'pointer' }}>
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}