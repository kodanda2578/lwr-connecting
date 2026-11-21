import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { 
  Database, 
  Compass, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function ExamSyllabusPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [selectedExamId, selectedSubjectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exRes, subRes] = await Promise.all([
        apiService.getExams(),
        apiService.getSubjects()
      ]);
      setExams(exRes || []);
      setSubjects(subRes || []);
      if (exRes && exRes.length > 0) {
        setSelectedExamId(exRes[0].id);
      }
      if (subRes && subRes.length > 0) {
        setSelectedSubjectId(subRes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    if (!selectedExamId && !selectedSubjectId) return;
    try {
      const tData = await apiService.getTopics(selectedSubjectId, selectedExamId);
      setTopics(tData || []);
      const stData = await apiService.getSubTopics();
      setSubTopics(stData || []);
    } catch (e) {
      console.error('Failed to load topics:', e);
    }
  };

  const selectedExam = exams.find(e => e.id === Number(selectedExamId));
  const selectedSubject = subjects.find(s => s.id === Number(selectedSubjectId));

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Page Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div className="badge badge-cyan" style={{ marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Database size={13} /> Official Database-Driven Syllabus
              </div>
              <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 800 }}>
                Exam Syllabus &amp; Topic Weightages
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '720px' }}>
                Explore official topic structures, weightage percentages, subtopic breakdowns, and source references verified in our database.
              </p>
            </div>
            {selectedExam && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Award size={14} style={{ marginRight: '0.35rem' }} /> {selectedExam.name} ({selectedExam.type})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Selector Panel */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          
          {/* Exam Selector */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Compass size={15} color="#06b6d4" /> Select Entrance Exam
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {exams.map((ex) => {
                const isSelected = Number(selectedExamId) === ex.id;
                return (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExamId(ex.id)}
                    className={isSelected ? 'btn-primary' : 'btn-secondary'}
                    style={{
                      padding: '0.65rem 1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderRadius: '12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: isSelected ? '0 0 20px rgba(6, 182, 212, 0.3)' : 'none'
                    }}
                  >
                    <span>{ex.name}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      color: isSelected ? '#ffffff' : '#94a3b8'
                    }}>
                      {ex.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Selector Tabs */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Layers size={15} color="#8b5cf6" /> Select Subject
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {subjects.map((s) => {
                const isSelected = Number(selectedSubjectId) === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubjectId(s.id)}
                    style={{
                      padding: '0.6rem 1.35rem',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(6, 182, 212, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                      color: isSelected ? '#38bdf8' : '#cbd5e1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.2)' : 'none'
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Topics List with Subtopics */}
        {loading ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(6, 182, 212, 0.2)',
              borderTopColor: '#06b6d4',
              borderRadius: '50%',
              margin: '0 auto 1rem auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading syllabus data...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            No topic weightage structure found for {selectedExam?.name} - {selectedSubject?.name}.
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
                <BookOpen size={22} color="#06b6d4" /> {selectedExam?.name} • {selectedSubject?.name} Topics
              </h2>
              <span className="badge badge-cyan" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
                {topics.length} Units Mapped
              </span>
            </div>

            <div className="grid-2">
              {topics.map((t) => {
                const topicSubTopics = subTopics.filter(st => st.topic?.id === t.id);

                return (
                  <div
                    key={t.id}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      gap: '1.25rem'
                    }}
                  >
                    <div>
                      {/* Topic Title & Weightage */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, lineHeight: 1.4 }}>
                          {t.name}
                        </h3>
                        {t.weightagePercentage && (
                          <span className="badge badge-green" style={{ whiteSpace: 'nowrap', fontSize: '0.78rem', fontWeight: 700 }}>
                            ~{t.weightagePercentage}% Weightage
                          </span>
                        )}
                      </div>

                      {/* Source Reference */}
                      {t.sourceReference && (
                        <p style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                          <FileText size={13} color="#94a3b8" /> Ref: {t.sourceReference}
                        </p>
                      )}

                      {/* Subtopics */}
                      {topicSubTopics.length > 0 && (
                        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem', marginTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.6rem' }}>
                            Subtopic Breakdown ({topicSubTopics.length})
                          </span>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {topicSubTopics.map(st => (
                              <li
                                key={st.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.55rem',
                                  background: 'rgba(2, 6, 23, 0.4)',
                                  padding: '0.45rem 0.75rem',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(255, 255, 255, 0.05)',
                                  fontSize: '0.82rem',
                                  color: '#e2e8f0'
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', flexShrink: 0 }}></span>
                                <span style={{ fontWeight: 500 }}>{st.name}</span>
                                {st.description && (
                                  <span style={{ color: '#64748b', fontSize: '0.75rem', marginLeft: 'auto' }}>
                                    ({st.description})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={13} color="#10b981" /> Active Syllabus
                      </span>
                      <span style={{ color: '#06b6d4', fontWeight: 500 }}>
                        Official Standard
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
