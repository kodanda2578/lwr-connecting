import React from 'react';
import { STUDY_MATERIALS_DATA } from '../data/sampleData';
import { useAuth } from '../context/AuthContext';
import { FileText, Bookmark, Download, Sparkles } from 'lucide-react';

export const StudyMaterialsPage = () => {
  const { savedResources, toggleSaveResource } = useAuth();

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Resource Library</div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Study Materials, Notes & Formula Vault</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px', marginTop: '0.25rem' }}>
            High-yield formula sheets, chapter revision notes, exam strategies, and downloadable PDF study guides.
          </p>
        </div>

        {/* Materials Grid */}
        <div className="grid-3">
          {STUDY_MATERIALS_DATA.map(item => {
            const isSaved = savedResources.some(r => r.id === item.id && r.type === 'MATERIAL');

            return (
              <div key={item.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-purple">{item.category}</span>
                    <span className="badge badge-cyan">{item.exam}</span>
                  </div>

                  <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                    Subject: {item.subject} | File Size: {item.fileSize}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <button 
                    onClick={() => toggleSaveResource({ id: item.id, type: 'MATERIAL', title: item.title })}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                    <Bookmark size={14} color={isSaved ? '#ec4899' : '#94a3b8'} /> {isSaved ? 'Saved' : 'Save'}
                  </button>
                  
                  <button 
                    onClick={() => alert(`Downloading material: ${item.title}`)}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
