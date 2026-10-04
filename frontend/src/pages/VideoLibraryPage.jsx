import React, { useState } from 'react';
import { VIDEOS_DATA } from '../data/sampleData';
import { Video, Play, Clock, Sparkles } from 'lucide-react';

export const VideoLibraryPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <div className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>Video Learning & Counselling</div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Video Guidance & Lecture Hub</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px', marginTop: '0.25rem' }}>
            Watch strategy breakdowns, branch choice guides, AP EAPCET web options walkthroughs, and coding skill playlists.
          </p>
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff' }}>{selectedVideo.title}</h3>
              <button onClick={() => setSelectedVideo(null)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>Close Player</button>
            </div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
              <iframe 
                src={selectedVideo.embedUrl} 
                title={selectedVideo.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid-3">
          {VIDEOS_DATA.map(vid => (
            <div key={vid.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <img src={vid.thumbnail} alt={vid.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(6, 9, 19, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <button 
                    onClick={() => setSelectedVideo(vid)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(6,182,212,0.5)'
                    }}>
                    <Play size={22} style={{ marginLeft: '3px' }} />
                  </button>
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>{vid.category}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {vid.duration}
                  </span>
                </div>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', lineHeight: '1.4' }}>{vid.title}</h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
