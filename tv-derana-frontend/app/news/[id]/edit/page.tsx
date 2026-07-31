'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('SPORTS');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`http://localhost:3001/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setFetching(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('access_token');

    try {
      const res = await fetch(`http://localhost:3001/articles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update article');
      }

      router.push('/news');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Edit Article</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="SPORTS">Sports</option>
          <option value="BUSINESS">Business</option>
          <option value="ENTERTAINMENT">Entertainment</option>
          <option value="POLITICS">Politics</option>
          <option value="TECHNOLOGY">Technology</option>
          <option value="WORLD">World</option>
        </select>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={8}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px', background: '#000', color: '#fff', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}