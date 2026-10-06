import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Clock, Award, CheckCircle2, ArrowRight, Play, Sparkles, Filter, FileText, CheckCircle, BarChart3 } from 'lucide-react';

export const MockTestsPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [exams, setExams] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  // Generator modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genExamId, setGenExamId] = useState('');
  const [genType, setGenType] = useState('TOPIC_MOCK');
  const [genSubjectId, setGenSubjectId] = useState('');
  const [genSubjects, setGenSubjects] = useState([]);
  const [genTopicId, setGenTopicId] = useState('');
  const [genTopics, setGenTopics] = useState([]);
  const [genDiff, setGenDiff] = useState('MEDIUM');
  const [genCount, setGenCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedExamId, selectedType]);

  useEffect(() => {
    fetch('/api/exams')
      .then(res => res.json())
      .then(data => setExams(data))
      .catch(() => {});
    
    fetch('/api/mock-tests/my-attempts')
      .then(res => res.ok ? res.json() : [])
      .then(data => setMyAttempts(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (genExamId) {
      fetch(`/api/subjects?examId=${genExamId}`)
        .then(res => res.json())
        .then(data => setGenSubjects(data))
        .catch(() => {});
    }
  }, [genExamId]);

  useEffect(() => {
    if (genSubjectId) {
      fetch(`/api/topics?subjectId=${genSubjectId}`)
        .then(res => res.json())
        .then(data => setGenTopics(data))
        .catch(() => {});
    }
  }, [genSubjectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/api/mock-tests?';
      if (selectedExamId) url += `examId=${selectedExamId}&`;
      if (selectedType !== 'ALL') url += `testType=${selectedType}&`;
      const res = await fetch(url);
      if (res.ok) setTests(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomTest = async (e) => {
    e.preventDefault();
    if (!genExamId) {
      alert('Please select an Exam');
      return;
    }
    setIsGenerating(true);
    try {
      const payload = {
        examId: Number(genExamId),
        testType: genType,
        totalQuestions: Number(genCount),
        durationMinutes: genType === 'GRAND_TEST' ? 180 : Math.max(15, Number(genCount) * 2),
        subjectId: genSubjectId ? Number(genSubjectId) : null,
        topicId: genTopicId ? Number(genTopicId) : null,
        difficulty: genDiff,
        useAiGeneration: true,
        aiProvider: 'MOCK_AI'
      };

      const res = await fetch('/api/mock-tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setShowGenModal(false);
        navigate(`/mock-tests/${created.id}/take`);
      } else {
        alert('Failed to generate dynamic mock test.');
      }
    } catch (err) {
      alert('Error creating dynamic test');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGrandTest = async (examId) => {
    try {
      const res = await fetch(`/api/mock-tests/grand-test/generate?examId=${examId}`, { method: 'POST' });
      if (res.ok) {
        const test = await res.json();
        navigate(`/mock-tests/${test.id}/take`);
      }
    } catch (err) {}
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Compass size={30} color="#ffffff" />
              </div>
              <div>
                <div className="badge badge-cyan">AI CBT Exam Engine</div>
                <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
                  Mock Tests & Grand Tests
                </h1>
              </div>
            </div>

            <button onClick={() => setShowGenModal(true)} className="btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
              <Sparkles size={18} /> Generate Custom AI Mock Test
            </button>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '800px', marginTop: '1rem' }}>
            Take timed CBT mock tests for JEE Main, JEE Advanced, AP EAPCET, TS EAPCET, KCET, MHT-CET, WBJEE, and state entrance exams. AI-generated and verified historical questions with detailed step-by-step solutions.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <Filter size={16} /> Filter Exam:
          </div>

          <select 
            className="form-control" 
            style={{ width: 'auto', minWidth: '180px' }} 
            value={selectedExamId} 
            onChange={e => setSelectedExamId(e.target.value)}>
            <option value="">All Entrance Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Tests' },
              { id: 'TOPIC_MOCK', label: 'Topic Mocks' },
              { id: 'SUBJECT_MOCK', label: 'Subject Mocks' },
              { id: 'FULL_SYLLABUS_MOCK', label: 'Full Syllabus' },
              { id: 'GRAND_TEST', label: 'Grand Tests' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                style={{
                  background: selectedType === t.id ? '#06b6d4' : 'rgba(15,23,42,0.8)',
                  color: '#ffffff',
                  border: selectedType === t.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '0.45rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Available Tests Grid */}
        <div className="grid-2" style={{ marginBottom: '3rem' }}>
          {loading ? (
            <div style={{ color: '#94a3b8', gridColumn: 'span 2', textAlign: 'center', padding: '3rem' }}>
              Loading test catalog...
            </div>
          ) : tests.length === 0 ? (
            <div style={{ color: '#94a3b8', gridColumn: 'span 2', textAlign: 'center', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
              No tests match selected filters. Click "Generate Custom AI Mock Test" to create one instantly!
            </div>
          ) : (
            tests.map(test => (
              <div key={test.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <span className="badge badge-purple">{test.examName}</span>
                    <span className="badge badge-cyan">{test.testType?.replace('_', ' ')}</span>
                  </div>

                  <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                    {test.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={16} color="#06b6d4" /> {test.durationMinutes} Mins
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Award size={16} color="#8b5cf6" /> {test.totalMarks} Marks
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={16} color="#10b981" /> {test.totalQuestions} Qs
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <strong>Instructions:</strong> {test.instructions || 'Standard CBT mode with anti-cheating timer.'}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/mock-tests/${test.id}/take`)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                  <Play size={18} /> Start Online CBT Test
                </button>
              </div>
            ))
          )}
        </div>

        {/* Student Previous Attempts Section */}
        {myAttempts.length > 0 && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} color="#06b6d4" /> Your Previous Test Attempt History ({myAttempts.length})
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Test Title</th>
                    <th style={{ padding: '0.75rem' }}>Score</th>
                    <th style={{ padding: '0.75rem' }}>Correct / Total</th>
                    <th style={{ padding: '0.75rem' }}>Accuracy</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttempts.map(att => (
                    <tr key={att.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f8fafc' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{att.testTitle}</td>
                      <td style={{ padding: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>
                        {att.score != null ? `${att.score} / ${att.totalMarks}` : 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {att.totalCorrect != null ? `${att.totalCorrect} / ${att.totalQuestions}` : '-'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {att.accuracyPercentage != null ? `${att.accuracyPercentage}%` : '-'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={att.status === 'SUBMITTED' ? 'badge badge-green' : 'badge badge-amber'}>
                          {att.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {att.status === 'SUBMITTED' || att.status === 'AUTO_SUBMITTED' ? (
                          <Link to={`/mock-tests/attempts/${att.id}/result`} style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}>
                            View Detailed Solutions
                          </Link>
                        ) : (
                          <Link to={`/mock-tests/${att.testId}/take`} style={{ color: '#f59e0b', fontWeight: 600, textDecoration: 'none' }}>
                            Resume Test
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Modal for Custom Test Generation */}
      {showGenModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '550px', padding: '2.5rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#06b6d4" /> Generate Custom AI Mock Test
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Select target exam, subject/topic, and count to create a personalized test session immediately.
            </p>

            <form onSubmit={handleCreateCustomTest}>
              <div className="form-group">
                <label>Select Target Exam *</label>
                <select className="form-control" value={genExamId} onChange={e => setGenExamId(e.target.value)} required>
                  <option value="">-- Choose Exam --</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Test Type</label>
                  <select className="form-control" value={genType} onChange={e => setGenType(e.target.value)}>
                    <option value="TOPIC_MOCK">Topic Mock Test</option>
                    <option value="SUBJECT_MOCK">Subject Mock Test</option>
                    <option value="FULL_SYLLABUS_MOCK">Full Syllabus Mock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select className="form-control" value={genDiff} onChange={e => setGenDiff(e.target.value)}>
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              {genType !== 'FULL_SYLLABUS_MOCK' && (
                <div className="form-group">
                  <label>Subject</label>
                  <select className="form-control" value={genSubjectId} onChange={e => setGenSubjectId(e.target.value)}>
                    <option value="">-- Any Subject --</option>
                    {genSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {genType === 'TOPIC_MOCK' && genSubjectId && (
                <div className="form-group">
                  <label>Topic</label>
                  <select className="form-control" value={genTopicId} onChange={e => setGenTopicId(e.target.value)}>
                    <option value="">-- Any Topic --</option>
                    {genTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Number of Questions</label>
                <input type="number" className="form-control" min="5" max="50" value={genCount} onChange={e => setGenCount(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowGenModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={isGenerating} className="btn-primary" style={{ flex: 1 }}>
                  {isGenerating ? 'Assembling AI Test...' : 'Start Test Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
