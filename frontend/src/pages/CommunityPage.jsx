import React, { useState } from 'react';
import { COMMUNITY_POSTS_DATA } from '../data/sampleData';
import { MessageSquare, ThumbsUp, MessageCircle, PlusCircle, Filter } from 'lucide-react';

export const CommunityPage = () => {
  const [posts, setPosts] = useState(COMMUNITY_POSTS_DATA);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('EAPCET');

  const filteredPosts = posts.filter(p => selectedCategory === 'ALL' || p.category === selectedCategory);

  const handleLike = (id) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const postObj = {
      id: Date.now(),
      author: 'You (Student)',
      category: newCategory,
      title: newTitle,
      content: newContent,
      likes: 0,
      commentsCount: 0,
      timestamp: 'Just now',
      comments: []
    };

    setPosts([postObj, ...posts]);
    setShowNewPostModal(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>Student Discussion Forum</div>
            <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>LWR Community Hub</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Connect with fellow JEE & AP EAPCET aspirants to discuss preparation, cutoffs, and B.Tech choices.
            </p>
          </div>

          <button onClick={() => setShowNewPostModal(true)} className="btn-accent">
            <PlusCircle size={18} /> Start Discussion
          </button>
        </div>

        {/* Category Filter Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['ALL', 'JEE', 'EAPCET', 'B.Tech', 'Colleges', 'Careers'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#06b6d4' : 'rgba(15,23,42,0.8)',
                color: '#ffffff',
                border: selectedCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Create Post Modal */}
        {showNewPostModal && (
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Create Community Post</h3>
            <form onSubmit={handleCreatePost}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="EAPCET">AP EAPCET</option>
                    <option value="JEE">JEE Main</option>
                    <option value="B.Tech">B.Tech Guidance</option>
                    <option value="Colleges">Colleges & Cutoffs</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Post Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Topic title..." 
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Ask question or share insights..." 
                  value={newContent} 
                  onChange={(e) => setNewContent(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowNewPostModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Publish Post</button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredPosts.map(post => (
            <div key={post.id} className="glass-panel" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="badge badge-cyan">{post.category}</span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{post.author} • {post.timestamp}</span>
              </div>

              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{post.title}</h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>{post.content}</p>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
                <button 
                  onClick={() => handleLike(post.id)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <ThumbsUp size={16} color="#06b6d4" /> {post.likes} Likes
                </button>
                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <MessageCircle size={16} color="#8b5cf6" /> {post.comments.length} Replies
                </span>
              </div>

              {/* Replies List */}
              {post.comments.map(c => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '8px', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#38bdf8' }}>{c.author}:</strong> <span style={{ color: '#cbd5e1' }}>{c.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
