import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  Layers, 
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';

export default function AdminTestManager() {
  const [tests, setTests] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state for creating test
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [testType, setTestType] = useState('TOPIC_MOCK');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('Standard exam environment. Timer is active.');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [useAiGen, setUseAiGen] = useState(true);
  const [aiProvider, setAiProvider] = useState('MOCK_AI');

  // AI Generator Batch state
  const [aiGenExamId, setAiGenExamId] = useState('');
  const [aiGenSubjectId, setAiGenSubjectId] = useState('');
  const [aiGenTopicId, setAiGenTopicId] = useState('');
  const [aiGenDiff, setAiGenDiff] = useState('MEDIUM');
  const [aiGenCount, setAiGenCount] = useState(5);
  const [aiGenProvider, setAiGenProvider] = useState('MOCK_AI');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetch(`/api/subjects?examId=${selectedExamId}`)
        .then(res => res.json())
        .then(data => setSubjects(data))
        .catch(() => {});
    }
  }, [selectedExamId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetch(`/api/topics?subjectId=${selectedSubjectId}`)
        .then(res => res.json())
        .then(data => setTopics(data))
        .catch(() => {});
    }
  }, [selectedSubjectId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [testsRes, examsRes, valRes] = await Promise.all([
        fetch('/api/admin/tests'),
        fetch('/api/exams'),
        fetch('/api/admin/tests/validations')
      ]);

      if (testsRes.ok) setTests(await testsRes.json());
      if (examsRes.ok) setExams(await examsRes.json());
      if (valRes.ok) setValidations(await valRes.json());
    } catch (e) {
      console.error('Failed to load admin test data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        examId: Number(selectedExamId),
        testType,
        title,
        instructions,
        durationMinutes: Number(durationMinutes),
        totalQuestions: Number(totalQuestions),
        negativeMarking,
        subjectId: selectedSubjectId ? Number(selectedSubjectId) : null,
        topicId: selectedTopicId ? Number(selectedTopicId) : null,
        difficulty: selectedDifficulty,
        useAiGeneration: useAiGen,
        aiProvider
      };

      const res = await fetch('/api/admin/tests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchInitialData();
        alert('Test configuration created and published successfully!');
      } else {
        alert('Failed to create test configuration.');
      }
    } catch (err) {
      alert('Error connecting to backend');
    }
  };

  const handleToggleStatus = async (testId) => {
    try {
      const res = await fetch(`/api/admin/tests/${testId}/toggle`, { method: 'POST' });
      if (res.ok) {
        fetchInitialData();
      }
    } catch (err) {}
  };

  const handleBatchAIGeneration = async (e) => {
    e.preventDefault();
    if (!aiGenExamId || !aiGenSubjectId) {
      alert('Please select Exam and Subject for AI question generation');
      return;
    }
    setIsGenerating(true);
    try {
      let url = `/api/admin/tests/generate-ai-questions?examId=${aiGenExamId}&subjectId=${aiGenSubjectId}&count=${aiGenCount}&provider=${aiGenProvider}&difficulty=${aiGenDiff}`;
      if (aiGenTopicId) url += `&topicId=${aiGenTopicId}`;

      const res = await fetch(url, { method: 'POST' });
      if (res.ok) {
        const generated = await res.json();
        alert(`Successfully generated and validated ${generated.length} AI questions in Question Bank!`);
        fetchInitialData();
      } else {
        alert('AI Question Generation failed.');
      }
    } catch (err) {
      alert('Network error during AI question generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGrandTest = async (examId) => {
    try {
      const res = await fetch(`/api/mock-tests/grand-test/generate?examId=${examId}`, { method: 'POST' });
      if (res.ok) {
        alert('Official Pattern Grand Test generated & published!');
        fetchInitialData();
      }
    } catch (err) {}
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '2rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>AI Test Engine Publisher</div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>Mock Test & Grand Test Manager</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Create AI-powered tests, configure exam patterns, and monitor AI question validation logic.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ padding: '0.7rem 1.25rem' }}>
              <Plus size={16} /> Create Mock Test Config
            </button>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Published Tests & Grand Tests ({tests.length})
        </h3>

        {loading ? (
          <div style={{ color: '#94a3b8', padding: '2rem 0', textAlign: 'center' }}>Loading test engine database...</div>
        ) : tests.length === 0 ? (
          <div style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            No tests created yet. Click "Create Mock Test Config" or generate a Grand Test.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Test Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Exam</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Questions</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Total Marks</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f8fafc' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{t.title}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-purple">{t.examName}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-cyan">{t.testType}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{t.durationMinutes} mins</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{t.totalQuestions} Qs</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{t.totalMarks} Marks</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button 
                        onClick={() => handleToggleStatus(t.id)}
                        className={t.active ? 'badge badge-green' : 'badge badge-amber'}
                        style={{ border: 'none', cursor: 'pointer' }}>
                        {t.active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <a href={`/mock-tests/${t.id}/take`} target="_blank" rel="noreferrer" style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontWeight: 600 }}>
                        <Play size={14} /> Preview
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Question Generator & Validation Log Section */}
      <div className="grid-2">
        
        {/* Batch AI Generator */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={20} color="#8b5cf6" />
            <h3 style={{ color: '#ffffff', fontSize: '1.15rem', margin: 0 }}>AI Question Bank Generator</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Generate structured AI questions for any syllabus topic. Generated questions pass strict validation before entering the Question Bank with <code style={{ color: '#8b5cf6' }}>sourceType = AI_GENERATED</code>.
          </p>

          <form onSubmit={handleBatchAIGeneration}>
            <div className="form-group">
              <label>Exam *</label>
              <select className="form-control" value={aiGenExamId} onChange={e => { setAiGenExamId(e.target.value); setSelectedExamId(e.target.value); }} required>
                <option value="">-- Select Exam --</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select className="form-control" value={aiGenSubjectId} onChange={e => setAiGenSubjectId(e.target.value)} required>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Difficulty</label>
                <select className="form-control" value={aiGenDiff} onChange={e => setAiGenDiff(e.target.value)}>
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div className="form-group">
                <label>Count</label>
                <input type="number" className="form-control" min="1" max="50" value={aiGenCount} onChange={e => setAiGenCount(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>AI Provider Abstraction</label>
              <select className="form-control" value={aiGenProvider} onChange={e => setAiGenProvider(e.target.value)}>
                <option value="MOCK_AI">Mock AI Provider (Deterministic Engine)</option>
                <option value="GEMINI">Gemini 1.5 Pro AI Engine</option>
              </select>
            </div>

            <button type="submit" disabled={isGenerating} className="btn-accent" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {isGenerating ? 'Generating & Validating...' : 'Generate & Store in Question Bank'}
            </button>
          </form>
        </div>

        {/* Validation Audit Log */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="#10b981" />
            <h3 style={{ color: '#ffffff', fontSize: '1.15rem', margin: 0 }}>AI Question Validation Log</h3>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Automated quality filter preventing empty questions, missing options, invalid marks, or PYQ mislabeling.
          </p>

          <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {validations.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                No AI question validation events recorded yet.
              </div>
            ) : (
              validations.slice(0, 10).map(v => (
                <div key={v.id} style={{ background: 'rgba(255,255,255,0.03)', border: v.isValid ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span className={v.isValid ? 'badge badge-green' : 'badge badge-red'}>
                      {v.isValid ? 'VALIDATED & STORED' : 'REJECTED'}
                    </span>
                    <span className="badge badge-purple">{v.sourceType}</span>
                  </div>
                  <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.25rem' }}>
                    "{v.questionText?.substring(0, 75)}..."
                  </div>
                  <div style={{ color: v.isValid ? '#10b981' : '#f87171' }}>
                    Status: {v.errors}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Quick Grand Test Generator Cards */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          One-Click Exam Grand Test Publishers
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Instantly assemble full-syllabus official pattern Grand Tests for supported national and state exams.
        </p>

        <div className="grid-3">
          {exams.slice(0, 6).map(ex => (
            <div key={ex.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: '10px' }}>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem', marginBottom: '0.25rem' }}>{ex.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', marginBottom: '1rem' }}>Category: {ex.category}</div>
              <button onClick={() => handleGenerateGrandTest(ex.id)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}>
                <Compass size={14} /> Publish Grand Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Creating Test Config */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.4rem', marginBottom: '1.5rem' }}>Create Mock Test Configuration</h3>

            <form onSubmit={handleCreateTest}>
              <div className="form-group">
                <label>Select Exam *</label>
                <select className="form-control" value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} required>
                  <option value="">-- Select Exam --</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Test Type *</label>
                  <select className="form-control" value={testType} onChange={e => setTestType(e.target.value)}>
                    <option value="TOPIC_MOCK">TOPIC MOCK TEST</option>
                    <option value="SUBJECT_MOCK">SUBJECT MOCK TEST</option>
                    <option value="FULL_SYLLABUS_MOCK">FULL SYLLABUS MOCK</option>
                    <option value="GRAND_TEST">GRAND TEST</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <select className="form-control" value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Test Title *</label>
                <input type="text" className="form-control" placeholder="e.g., Physics Mechanics Speed Drill - 01" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label>Duration (Mins)</label>
                  <input type="number" className="form-control" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Total Questions</label>
                  <input type="number" className="form-control" value={totalQuestions} onChange={e => setTotalQuestions(e.target.value)} required />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.25rem' }}>
                    <input type="checkbox" checked={negativeMarking} onChange={e => setNegativeMarking(e.target.checked)} />
                    Negative Marking
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Subject (Optional for Topic/Subject test)</label>
                <select className="form-control" value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)}>
                  <option value="">-- All Subjects / Any --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useAiGen} onChange={e => setUseAiGen(e.target.checked)} />
                  Enable AI Question Generation for missing questions
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Publish Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
