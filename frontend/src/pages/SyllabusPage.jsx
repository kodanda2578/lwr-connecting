import React, { useState } from 'react';
import { SYLLABUS_DATA } from '../data/sampleData';
import { BookOpen, CheckCircle2, Circle, TrendingUp } from 'lucide-react';

export const SyllabusPage = () => {
  const [selectedExam, setSelectedExam] = useState('AP_EAPCET');
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('lwr_completed_topics');
    return saved ? JSON.parse(saved) : ['Newton’s Laws of Motion', 'Matrix Algebra', 'Vector Algebra'];
  });

  const toggleTopic = (topicName) => {
    setCompletedTopics((prev) => {
      let updated;
      if (prev.includes(topicName)) {
        updated = prev.filter((t) => t !== topicName);
      } else {
        updated = [...prev, topicName];
      }
      localStorage.setItem('lwr_completed_topics', JSON.stringify(updated));
      return updated;
    });
  };

  const currentSyllabus = SYLLABUS_DATA[selectedExam] || [];
  
  // Calculate completion percentage
  let totalTopicsCount = 0;
  currentSyllabus.forEach(subj => {
    subj.chapters.forEach(ch => {
      totalTopicsCount += ch.topics.length;
    });
  });

  let completedCount = 0;
  currentSyllabus.forEach(subj => {
    subj.chapters.forEach(ch => {
      ch.topics.forEach(t => {
        if (completedTopics.includes(t)) completedCount++;
      });
    });
  });

  const completionPercentage = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}><BookOpen size={14} /> Interactive Syllabus Tracker</div>
              <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Exam Syllabus & Topic Completion</h1>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Check off topics as you finish revision to track your preparation percentage.
              </p>
            </div>

            {/* Exam Selector */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setSelectedExam('AP_EAPCET')}
                className={selectedExam === 'AP_EAPCET' ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                AP EAPCET
              </button>
              <button 
                onClick={() => setSelectedExam('JEE')}
                className={selectedExam === 'JEE' ? 'btn-accent' : 'btn-secondary'}
                style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                JEE Main
              </button>
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
              <span>{selectedExam === 'AP_EAPCET' ? 'AP EAPCET' : 'JEE'} Completion Status</span>
              <span style={{ color: '#06b6d4' }}>{completedCount} / {totalTopicsCount} Topics ({completionPercentage}%)</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '10px' }}>
              <div className="progress-bar-fill" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Subjects Accordion / Cards */}
        {currentSyllabus.map((subj) => (
          <div key={subj.subject} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#06b6d4" /> {subj.subject}
            </h2>

            <div className="grid-2">
              {subj.chapters.map((ch) => (
                <div key={ch.id} className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h3 style={{ color: '#ffffff', fontSize: '1.1rem' }}>{ch.title}</h3>
                    <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>Weightage: {ch.weightage}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {ch.topics.map((topic) => {
                      const isDone = completedTopics.includes(topic);
                      return (
                        <div 
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.8rem',
                            borderRadius: '8px',
                            background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.03)',
                            border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}>
                          {isDone ? (
                            <CheckCircle2 size={18} color="#10b981" />
                          ) : (
                            <Circle size={18} color="#64748b" />
                          )}
                          <span style={{
                            fontSize: '0.9rem',
                            color: isDone ? '#10b981' : '#f8fafc',
                            textDecoration: isDone ? 'line-through' : 'none'
                          }}>
                            {topic}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};
