import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SYLLABUS_DATA } from '../data/sampleData';
import { BrainCircuit, CheckCircle2, ArrowRight, BookOpen, Compass, FileText, BarChart3 } from 'lucide-react';

export const JeeModule = () => {
  const [activeSubject, setActiveSubject] = useState('Physics');
  const subjects = SYLLABUS_DATA.JEE || [];
  const currentSubjectData = subjects.find((s) => s.subject === activeSubject) || subjects[0];

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Module Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BrainCircuit size={28} color="#ffffff" />
            </div>
            <div>
              <div className="badge badge-cyan">National Entrance Module</div>
              <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
                JEE Main & Advanced Preparation Hub
              </h1>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '800px', lineHeight: '1.6' }}>
            Comprehensive syllabus coverage for Class 11 & 12 Physics, Chemistry, and Mathematics. Track chapter completion, solve previous year questions (PYQs), and attempt mock tests.
          </p>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <Link to="/syllabus" className="btn-primary">
            <BookOpen size={16} /> Complete JEE Syllabus Tracker
          </Link>
          <Link to="/mock-tests" className="btn-accent">
            <Compass size={16} /> JEE Full Mock Tests
          </Link>
          <Link to="/previous-papers" className="btn-secondary">
            <FileText size={16} /> Download JEE PYQ Papers
          </Link>
        </div>

        {/* Subject Tab Switcher */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          {subjects.map((subj) => (
            <button
              key={subj.subject}
              onClick={() => setActiveSubject(subj.subject)}
              style={{
                background: activeSubject === subj.subject ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                border: activeSubject === subj.subject ? '1px solid #06b6d4' : '1px solid transparent',
                color: activeSubject === subj.subject ? '#06b6d4' : '#94a3b8',
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
                <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                  Weightage: {chapter.weightage}
                </span>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>TOPICS COVERED:</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {chapter.topics.map((t, idx) => (
                    <li key={idx} style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={14} color="#06b6d4" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <Link to="/practice" className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                  Practice Questions
                </Link>
                <Link to="/study-materials" className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                  View Notes
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
