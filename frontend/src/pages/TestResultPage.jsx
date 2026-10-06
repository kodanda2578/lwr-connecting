import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Clock, ArrowRight, Sparkles, Building2, BarChart3, HelpCircle, Layers, ShieldCheck, Cpu } from 'lucide-react';

export const TestResultPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [resultData, setResultData] = useState(location.state?.resultPayload || null);
  const [loading, setLoading] = useState(!location.state?.resultPayload);
  const [activeTab, setActiveTab] = useState('SOLUTIONS'); // SOLUTIONS, SUBJECTS, TOPICS, DIFFICULTY

  useEffect(() => {
    if (!resultData && id) {
      fetchResult();
    }
  }, [id]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mock-tests/attempts/${id}/result`);
      if (res.ok) {
        setResultData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
        Evaluating CBT test results and step-by-step AI solutions...
      </div>
    );
  }

  if (!resultData || !resultData.attempt) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
        No attempt result found for ID #{id}. <Link to="/mock-tests" style={{ color: '#06b6d4' }}>Back to Mock Tests</Link>
      </div>
    );
  }

  const { attempt, test, subjectPerformance, topicPerformance, difficultyPerformance, solutions } = resultData;

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        
        {/* Header Result Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
            🎉 Test Submitted & Evaluated
          </div>

          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            {attempt.testTitle}
          </h1>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', margin: '1.5rem 0' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#06b6d4' }}>{attempt.score}</span>
            <span style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 600 }}>/ {attempt.totalMarks} Marks</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Accuracy: {attempt.accuracyPercentage}%
            </div>
            <div className="badge badge-amber" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Time Spent: {Math.round((attempt.totalTimeSpentSeconds || 0) / 60)} Mins
            </div>
            <div className="badge badge-green" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Exam: {attempt.examName}
            </div>
          </div>
        </div>

        {/* 4 Quick Analytics Summary Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {(attempt.totalCorrect || 0) + (attempt.totalIncorrect || 0)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Attempted</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{attempt.totalCorrect || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Correct</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{attempt.totalIncorrect || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Wrong</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{attempt.totalUnattempted || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Unattempted</div>
          </div>
        </div>

        {/* Tab Navigation for Analytics & Detailed Solutions */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', overflowX: 'auto' }}>
          {[
            { id: 'SOLUTIONS', label: 'Detailed Step-by-Step Solutions', icon: CheckCircle2 },
            { id: 'SUBJECTS', label: 'Subject Performance', icon: Layers },
            { id: 'TOPICS', label: 'Topic Breakdown', icon: BarChart3 },
            { id: 'DIFFICULTY', label: 'Difficulty Analysis', icon: Cpu }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' : 'rgba(15,23,42,0.8)',
                  color: '#ffffff',
                  border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}>
                <IconComp size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: DETAILED SOLUTIONS */}
        {activeTab === 'SOLUTIONS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {solutions && solutions.map((sol, index) => (
              <div key={sol.questionId || index} className="glass-panel" style={{
                padding: '2rem',
                borderColor: sol.isCorrect === true ? 'rgba(16, 185, 129, 0.4)' : sol.isCorrect === false ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'
              }}>
                {/* Question Header Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-cyan">Question #{index + 1}</span>
                    <span className="badge badge-purple">{sol.subjectName}</span>
                    {sol.topicName && <span className="badge badge-amber">{sol.topicName}</span>}
                    <span className="badge badge-blue">{sol.difficulty}</span>
                  </div>

                  {/* Question Source Attribution */}
                  <span className={sol.sourceType === 'AI_GENERATED' ? 'badge badge-purple' : 'badge badge-green'} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {sol.sourceType === 'AI_GENERATED' ? <Sparkles size={12} /> : <ShieldCheck size={12} />}
                    {sol.sourceType === 'AI_GENERATED' ? 'AI-GENERATED PRACTICE' : 'VERIFIED HISTORICAL PYQ'}
                  </span>
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600, marginBottom: '1.25rem', lineHeight: '1.6' }}>
                  {sol.questionText}
                </div>

                {sol.imageUrl && (
                  <img src={sol.imageUrl} alt="Diagram" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', marginBottom: '1.25rem' }} />
                )}

                {/* Options Grid */}
                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    { letter: 'A', text: sol.optionA },
                    { letter: 'B', text: sol.optionB },
                    { letter: 'C', text: sol.optionC },
                    { letter: 'D', text: sol.optionD }
                  ].map(opt => {
                    if (!opt.text) return null;
                    const isUserPick = sol.selectedOption === opt.letter;
                    const isCorrectOpt = sol.correctOption === opt.letter;

                    let bg = 'rgba(15,23,42,0.6)';
                    let border = 'rgba(255,255,255,0.08)';
                    let textColor = '#cbd5e1';

                    if (isCorrectOpt) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = '#10b981';
                      textColor = '#10b981';
                    } else if (isUserPick && !isCorrectOpt) {
                      bg = 'rgba(239, 68, 68, 0.15)';
                      border = '#ef4444';
                      textColor = '#f87171';
                    }

                    return (
                      <div key={opt.letter} style={{ background: bg, border: `1px solid ${border}`, padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: textColor, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 800 }}>{opt.letter}.</span>
                        <span>{opt.text}</span>
                        {isCorrectOpt && <span style={{ marginLeft: 'auto', fontWeight: 700 }}>✓ Correct</span>}
                        {isUserPick && !isCorrectOpt && <span style={{ marginLeft: 'auto', fontWeight: 700 }}>✗ Your Choice</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-Step AI Explanation */}
                <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '1.25rem', borderRadius: '10px' }}>
                  <div style={{ color: '#06b6d4', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> Step-by-Step Solution & Concept Explanation:
                  </div>
                  <div style={{ color: '#f8fafc', fontSize: '0.92rem', lineHeight: '1.6' }}>
                    {sol.explanation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: SUBJECT PERFORMANCE */}
        {activeTab === 'SUBJECTS' && subjectPerformance && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Subject-wise Performance</h3>
            <div className="grid-3">
              {Object.entries(subjectPerformance).map(([subject, perf]) => (
                <div key={subject} className="glass-card">
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#06b6d4', marginBottom: '0.5rem' }}>{subject}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
                    {perf.score} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Score</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Correct: <strong style={{ color: '#10b981' }}>{perf.correct}</strong> / {perf.totalQuestions}</div>
                    <div>Accuracy: <strong style={{ color: '#c084fc' }}>{perf.accuracy}%</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TOPICS BREAKDOWN */}
        {activeTab === 'TOPICS' && topicPerformance && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Topic-wise Accuracy Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Topic Name</th>
                    <th style={{ padding: '0.75rem' }}>Total Qs</th>
                    <th style={{ padding: '0.75rem' }}>Correct</th>
                    <th style={{ padding: '0.75rem' }}>Incorrect</th>
                    <th style={{ padding: '0.75rem' }}>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(topicPerformance).map(([topic, perf]) => (
                    <tr key={topic} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#f8fafc' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{topic}</td>
                      <td style={{ padding: '0.75rem' }}>{perf.totalQuestions}</td>
                      <td style={{ padding: '0.75rem', color: '#10b981', fontWeight: 700 }}>{perf.correct}</td>
                      <td style={{ padding: '0.75rem', color: '#ef4444' }}>{perf.incorrect}</td>
                      <td style={{ padding: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>{perf.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DIFFICULTY ANALYSIS */}
        {activeTab === 'DIFFICULTY' && difficultyPerformance && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Difficulty-wise Accuracy Breakdown</h3>
            <div className="grid-3">
              {Object.entries(difficultyPerformance).map(([diff, perf]) => (
                <div key={diff} className="glass-card" style={{ textAlign: 'center' }}>
                  <div className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>{diff}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', margin: '0.5rem 0' }}>{perf.accuracy}%</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    {perf.correct} Correct out of {perf.totalQuestions} Qs
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Step Recommendations */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <Link to="/college-predictor" className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
            <Building2 size={18} /> Check Matching Colleges For This Score
          </Link>
          <Link to="/rank-estimator" className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
            <BarChart3 size={18} /> Estimate Entrance Exam Rank
          </Link>
          <Link to="/ai-assistant" className="btn-accent" style={{ padding: '0.85rem 1.75rem' }}>
            <Sparkles size={18} /> Ask AI Guidance on Weak Topics
          </Link>
        </div>

      </div>
    </div>
  );
};
