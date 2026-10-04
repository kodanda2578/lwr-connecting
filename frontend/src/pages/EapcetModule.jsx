import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SYLLABUS_DATA } from '../data/sampleData';
import { GraduationCap, CheckCircle2, ArrowRight, BookOpen, Compass, FileText, Zap } from 'lucide-react';

export const EapcetModule = () => {
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const subjects = SYLLABUS_DATA.AP_EAPCET || [];
  const currentSubjectData = subjects.find((s) => s.subject === activeSubject) || subjects[0];

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Module Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GraduationCap size={28} color="#ffffff" />
            </div>
            <div>
              <div className="badge badge-purple">AP State Entrance Module</div>
              <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
                AP EAPCET (EAMCET) Preparation Hub
              </h1>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '800px', lineHeight: '1.6' }}>
            Specialized prep tailored for AP EAPCET syllabus weightages (Mathematics: 80 Marks, Physics: 40 Marks, Chemistry: 40 Marks). Master speed solving with zero negative marking.
          </p>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link to="/syllabus" className="btn-accent">
            <BookOpen size={16} /> AP EAPCET Syllabus Tracker
          </Link>
          <Link to="/mock-tests" className="btn-primary">
            <Compass size={16} /> 160-Mark Full Grand Tests
          </Link>
          <Link to="/college-predictor" className="btn-secondary">
            <Zap size={16} /> Predict AP University Colleges
          </Link>
        </div>

        {/* Subject Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          {subjects.map((subj) => (
            <button
              key={subj.subject}
              onClick={() => setActiveSubject(subj.subject)}
              style={{
                background: activeSubject === subj.subject ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                border: activeSubject === subj.subject ? '1px solid #8b5cf6' : '1px solid transparent',
                color: activeSubject === subj.subject ? '#8b5cf6' : '#94a3b8',
                padding: '0.6rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}>
              {subj.subject}
            </button>
          ))}
        </div>

        {/* Chapters Grid */}
        <div className="grid-2">
          {currentSubjectData?.chapters.map((chapter) => (
            <div key={chapter.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem' }}>{chapter.title}</h3>
                <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                  Weightage: {chapter.weightage}
                </span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>KEY CONCEPTS:</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {chapter.topics.map((t, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={14} color="#8b5cf6" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Link to="/practice" className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                  Practice Speed MCQs
                </Link>
                <Link to="/study-materials" className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                  Formula Sheet
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
