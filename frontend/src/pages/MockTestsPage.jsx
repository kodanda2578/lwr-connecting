import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Sparkles, 
  Filter, 
  FileText, 
  BarChart3, 
  AlertCircle, 
  LogIn, 
  X,
  ShieldCheck 
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';

export const MockTestsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Auth requirement prompt modal
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptReason, setLoginPromptReason] = useState('');
  const [generatorError, setGeneratorError] = useState('');

  useEffect(() => {
    fetchData();
  }, [selectedExamId, selectedType]);

  useEffect(() => {
    apiService.getExams()
      .then(data => setExams(data || []))
      .catch(() => {});
    
    if (user) {
      apiService.getMyAttempts()
        .then(data => setMyAttempts(data || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (genExamId) {
      apiService.getSubjects()
        .then(data => setGenSubjects(data || []))
        .catch(() => {});
    }
  }, [genExamId]);

  useEffect(() => {
    if (genSubjectId) {
      apiService.getTopics(genSubjectId, genExamId)
        .then(data => setGenTopics(data || []))
        .catch(() => {});
    }
  }, [genSubjectId, genExamId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMockTests(selectedExamId, selectedType);
      setTests(data || []);
    } catch (e) {
      console.error('Failed to load mock tests:', e);
    } finally {
      setLoading(false);
    }
  };

  const openGeneratorModal = () => {
    if (!user) {
      setLoginPromptReason('Generating custom AI mock tests and saving score analytics requires an active student account.');
      setShowLoginPrompt(true);
      return;
    }
    setGeneratorError('');
    setShowGenModal(true);
  };

  const handleStartTest = (testId) => {
    if (!user) {
      setLoginPromptReason('Taking CBT mock tests with timer tracking and answer evaluation requires an active student account.');
      setShowLoginPrompt(true);
      return;
    }
    navigate(`/mock-tests/${testId}/take`);
  };

  const handleCreateCustomTest = async (e) => {
    e.preventDefault();
    setGeneratorError('');

    if (!genExamId) {
      setGeneratorError('Please select a target entrance exam.');
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

      const created = await apiService.generateMockTest(payload);
      setShowGenModal(false);
      navigate(`/mock-tests/${created.id}/take`);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized') || msg.includes('Forbidden') || msg.includes('verification')) {
        setShowGenModal(false);
        setLoginPromptReason('Your session has expired or requires student authorization. Please log in to proceed.');
        setShowLoginPrompt(true);
      } else {
        setGeneratorError('Failed to generate test: ' + msg);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        
        {/* Page Hero Header */}
        <div className="page-hero">
          <div className="page-hero-badge">
            <Compass size={14} /> AI Computer-Based Test (CBT) Engine
          </div>
          <h1 className="page-hero-title">
            Mock Tests & Grand Tests
          </h1>
          <p className="page-hero-subtitle">
            Take timed, anti-cheating CBT mock tests for JEE Main, AP EAPCET, TS EAMCET, and state exams. Features verified PYQ benchmarks, instant AI scoring, and question-by-question explanations.
          </p>
        </div>

        {/* Action Header Card */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              <Sparkles size={16} /> Instant Custom Exam Generator
            </div>
            <div style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700 }}>
              Need a targeted practice test on a specific subject or topic?
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Customize difficulty, question count, and topic coverage with real-time AI question assembly.
            </div>
          </div>

          <button onClick={openGeneratorModal} className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>
            <Sparkles size={18} /> Generate Custom AI Mock Test
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
                <Filter size={16} color="#06b6d4" /> Filter Exam:
              </div>

              <select 
                className="form-control form-select" 
                style={{ width: 'auto', minWidth: '220px', padding: '0.55rem 2.25rem 0.55rem 1rem', fontSize: '0.85rem' }} 
                value={selectedExamId} 
                onChange={e => setSelectedExamId(e.target.value)}>
                <option value="">All Entrance Exams</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.code})</option>)}
              </select>
            </div>

            {/* Test Type Tabs */}
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
                    background: selectedType === t.id ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'rgba(255,255,255,0.05)',
                    color: selectedType === t.id ? '#ffffff' : '#cbd5e1',
                    border: selectedType === t.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Available Tests Grid */}
        <div style={{ marginBottom: '3.5rem' }}>
          {loading ? (
            <div className="state-box">
              <div className="loading-spinner"></div>
              <div className="state-box-title">Loading CBT Test Catalog...</div>
              <div className="state-box-desc">Retrieving active full length and topic mock tests</div>
            </div>
          ) : tests.length === 0 ? (
            <div className="state-box">
              <div className="state-box-icon">
                <Compass size={28} />
              </div>
              <div className="state-box-title">No Mock Tests Found for Selected Filter</div>
              <div className="state-box-desc" style={{ marginBottom: '1.5rem' }}>
                There are no pre-seeded tests matching this filter. You can generate a personalized AI test right now!
              </div>
              <button onClick={openGeneratorModal} className="btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}>
                <Sparkles size={16} /> Generate Custom Test
              </button>
            </div>
          ) : (
            <div className="cards-grid-2">
              {tests.map(test => (
                <div key={test.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="badge badge-purple">
                        {test.examName || 'Entrance Exam'}
                      </span>
                      <span className="badge badge-cyan">
                        {test.testType?.replace(/_/g, ' ') || 'Mock Test'}
                      </span>
                    </div>

                    {/* Test Title */}
                    <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '0.85rem', lineHeight: 1.35 }}>
                      {test.title}
                    </h3>

                    {/* Test Meta Info */}
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={16} color="#06b6d4" /> {test.durationMinutes} Minutes
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Award size={16} color="#8b5cf6" /> {test.totalMarks} Marks
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} color="#10b981" /> {test.totalQuestions} Questions
                      </span>
                    </div>

                    {/* Instructions Box */}
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      <strong style={{ color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>Exam Instructions:</strong>
                      {test.instructions || 'Standard CBT mode with anti-cheating timer, question palette navigation, and instant review.'}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleStartTest(test.id)}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}>
                    <Play size={18} /> Start Online CBT Test
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Previous Attempts Section */}
        {user && myAttempts.length > 0 && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <BarChart3 size={22} color="#06b6d4" /> Your Previous Test Attempt History ({myAttempts.length})
            </h3>

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test Title</th>
                    <th>Score</th>
                    <th>Correct / Total</th>
                    <th>Accuracy</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myAttempts.map(att => (
                    <tr key={att.id}>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {att.testTitle}
                      </td>
                      <td style={{ color: '#06b6d4', fontWeight: 800, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                        {att.score != null ? `${att.score} / ${att.totalMarks}` : 'N/A'}
                      </td>
                      <td>
                        {att.totalCorrect != null ? `${att.totalCorrect} / ${att.totalQuestions}` : '-'}
                      </td>
                      <td>
                        <span style={{ color: Number(att.accuracyPercentage) >= 60 ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                          {att.accuracyPercentage != null ? `${att.accuracyPercentage}%` : '-'}
                        </span>
                      </td>
                      <td>
                        <span className={att.status === 'SUBMITTED' || att.status === 'AUTO_SUBMITTED' ? 'badge badge-green' : 'badge badge-amber'}>
                          {att.status}
                        </span>
                      </td>
                      <td>
                        {att.status === 'SUBMITTED' || att.status === 'AUTO_SUBMITTED' ? (
                          <Link to={`/mock-tests/attempts/${att.id}/result`} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: '#06b6d4' }}>
                            View Detailed Solutions
                          </Link>
                        ) : (
                          <Link to={`/mock-tests/${att.testId}/take`} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
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
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#06b6d4" /> Generate Custom AI Mock Test
              </h3>
              <button 
                onClick={() => setShowGenModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Choose your target entrance exam, subject, topic, and question count to build an adaptive exam session immediately.
            </p>

            {generatorError && (
              <div style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{generatorError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomTest}>
              <div className="form-group">
                <label>Select Target Exam <span style={{ color: '#06b6d4' }}>*</span></label>
                <select className="form-control form-select" value={genExamId} onChange={e => setGenExamId(e.target.value)} required>
                  <option value="">-- Choose Exam --</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div className="filter-grid-2">
                <div className="form-group">
                  <label>Test Type</label>
                  <select className="form-control form-select" value={genType} onChange={e => setGenType(e.target.value)}>
                    <option value="TOPIC_MOCK">Topic Mock Test</option>
                    <option value="SUBJECT_MOCK">Subject Mock Test</option>
                    <option value="FULL_SYLLABUS_MOCK">Full Syllabus Mock</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select className="form-control form-select" value={genDiff} onChange={e => setGenDiff(e.target.value)}>
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              {genType !== 'FULL_SYLLABUS_MOCK' && (
                <div className="form-group">
                  <label>Subject</label>
                  <select className="form-control form-select" value={genSubjectId} onChange={e => setGenSubjectId(e.target.value)}>
                    <option value="">-- Any Subject --</option>
                    {genSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {genType === 'TOPIC_MOCK' && genSubjectId && (
                <div className="form-group">
                  <label>Topic</label>
                  <select className="form-control form-select" value={genTopicId} onChange={e => setGenTopicId(e.target.value)}>
                    <option value="">-- Any Topic --</option>
                    {genTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Number of Questions</label>
                <input type="number" className="form-control" min="5" max="50" value={genCount} onChange={e => setGenCount(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
                <button type="button" onClick={() => setShowGenModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isGenerating} className="btn-primary" style={{ flex: 1.5, justifyContent: 'center' }}>
                  {isGenerating ? (
                    <>
                      <span className="loading-spinner" style={{ width: '16px', height: '16px', margin: 0, borderWidth: '2px' }}></span>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Start Test Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06b6d4'
                }}>
                  <LogIn size={20} />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', margin: 0 }}>
                  Student Sign In Required
                </h3>
              </div>
              <button 
                onClick={() => setShowLoginPrompt(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {loginPromptReason || 'Please sign in with your student account to access timed online tests, AI test generation, and score tracking.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/login');
                }}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                <LogIn size={18} /> Sign In to Student Account
              </button>

              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/register');
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                Create New Student Account
              </button>

              <button
                onClick={() => setShowLoginPrompt(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  textAlign: 'center'
                }}>
                Stay on Mock Tests Page
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
