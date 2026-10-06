import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowRight, ArrowLeft, Flag, Maximize2, Minimize2, AlertTriangle, ShieldAlert, X } from 'lucide-react';

export const MockTestEngine = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [questionTimeSpent, setQuestionTimeSpent] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Test Details
  useEffect(() => {
    fetchTestData();
  }, [id]);

  const fetchTestData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mock-tests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTestData(data);
        setTimeLeft(data.durationMinutes * 60);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Prevent accidental browser close/refresh during test
  useEffect(() => {
    if (!testStarted) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Warning: Leaving or refreshing the page will auto-submit your CBT exam!';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [testStarted]);

  // 3. Timer Countdown Hook
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(true); // Auto-submit on 0 timer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  // 4. Start CBT Attempt
  const handleStartCBT = async () => {
    try {
      const res = await fetch(`/api/mock-tests/${id}/start`, { method: 'POST' });
      if (res.ok) {
        const attemptData = await res.json();
        setAttempt(attemptData);
        setTestStarted(true);
      } else {
        alert('Please log in to take mock tests');
        navigate('/login');
      }
    } catch (err) {
      alert('Failed to connect to test server.');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (letter) => {
    if (!testData || !testData.questions) return;
    const currentQ = testData.questions[currentQIndex];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: letter }));
  };

  const handleClearAnswer = () => {
    if (!testData || !testData.questions) return;
    const currentQ = testData.questions[currentQIndex];
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  const toggleMarkForReview = () => {
    if (!testData || !testData.questions) return;
    const currentQ = testData.questions[currentQIndex];
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleSubmitTest = async (isAutoSubmit = false) => {
    if (!attempt || !testData) return;

    if (!isAutoSubmit) {
      const confirmSubmit = window.confirm('Are you sure you want to submit your CBT exam now?');
      if (!confirmSubmit) return;
    }

    const answersList = testData.questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] || null,
      timeSpentSeconds: questionTimeSpent[q.id] || 0,
      markedForReview: Boolean(markedForReview[q.id])
    }));

    const totalTimeSpentSeconds = (testData.durationMinutes * 60) - timeLeft;

    try {
      const res = await fetch('/api/mock-tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          totalTimeSpentSeconds,
          answers: answersList
        })
      });

      if (res.ok) {
        const resultPayload = await res.json();
        navigate(`/mock-tests/attempts/${attempt.id}/result`, { state: { resultPayload } });
      } else {
        alert('Failed to evaluate test submission.');
      }
    } catch (e) {
      alert('Network error while submitting test.');
    }
  };

  if (loading || !testData) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center', color: '#94a3b8' }}>
        Loading Computer Based Test environment...
      </div>
    );
  }

  const currentQ = testData.questions ? testData.questions[currentQIndex] : null;

  // Render Instructions Screen before test start
  if (!testStarted) {
    return (
      <div style={{ padding: '3rem 0', minHeight: 'calc(100vh - 80px)' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', borderColor: 'rgba(6,182,212,0.4)' }}>
            <div className="badge badge-cyan" style={{ marginBottom: '0.75rem' }}>Computer Based Test (CBT) Interface</div>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              {testData.title}
            </h2>
            <p style={{ color: '#06b6d4', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              Exam: {testData.examName} | Duration: {testData.durationMinutes} Mins | Total Questions: {testData.totalQuestions} | Total Marks: {testData.totalMarks}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>CBT Instructions & Marking Rules:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#06b6d4', fontWeight: 700 }}>•</span>
                  <span><strong>Correct Answer:</strong> +{currentQ?.marks || 4} Marks</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>•</span>
                  <span><strong>Incorrect Answer:</strong> {testData.negativeMarking ? `-${currentQ?.negativeMarks || 1} Negative Mark` : '0 Negative Marks'}</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>•</span>
                  <span><strong>Auto-Submit:</strong> When timer reaches 00:00, your exam will be automatically submitted and evaluated.</span>
                </li>
                <li style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>•</span>
                  <span><strong>Anti-Cheating Control:</strong> Do not refresh or switch tabs during the live test session.</span>
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/mock-tests')} className="btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>
                Cancel
              </button>
              <button onClick={handleStartCBT} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}>
                I Am Ready — Start Online Test <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Full CBT Test Engine
  return (
    <div style={{ background: '#04070f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Test Engine Header */}
      <header style={{
        background: '#090d1a',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '0.85rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>{testData.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Subject: {currentQ?.subjectName} {currentQ?.topicName ? `| ${currentQ.topicName}` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={toggleFullscreen} 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', padding: '0.5rem 0.85rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />} {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen CBT'}
          </button>

          <div style={{
            background: timeLeft < 300 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.15)',
            border: timeLeft < 300 ? '1px solid #ef4444' : '1px solid #06b6d4',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            color: timeLeft < 300 ? '#f87171' : '#06b6d4',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>

          <button onClick={() => handleSubmitTest(false)} className="btn-accent" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Submit Exam
          </button>
        </div>
      </header>

      {/* CBT Body */}
      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* Left Main Question Canvas */}
        <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.85rem' }}>
              Question {currentQIndex + 1} of {testData.questions.length}
            </span>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {answers[currentQ?.id] && (
                <button 
                  onClick={handleClearAnswer}
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <X size={14} /> Clear Choice
                </button>
              )}

              <button 
                onClick={toggleMarkForReview}
                style={{
                  background: markedForReview[currentQ?.id] ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  border: markedForReview[currentQ?.id] ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                  color: markedForReview[currentQ?.id] ? '#f59e0b' : '#94a3b8',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                <Flag size={14} /> {markedForReview[currentQ?.id] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>
          </div>

          <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 600, marginBottom: '2rem', lineHeight: '1.6' }}>
            {currentQ?.questionText}
          </div>

          {currentQ?.imageUrl && (
            <img src={currentQ.imageUrl} alt="Question diagram" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', marginBottom: '1.5rem' }} />
          )}

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '750px', marginBottom: '3rem' }}>
            {[
              { letter: 'A', text: currentQ?.optionA },
              { letter: 'B', text: currentQ?.optionB },
              { letter: 'C', text: currentQ?.optionC },
              { letter: 'D', text: currentQ?.optionD }
            ].map((opt) => {
              if (!opt.text) return null;
              const isSelected = answers[currentQ?.id] === opt.letter;
              return (
                <button
                  key={opt.letter}
                  onClick={() => handleSelectOption(opt.letter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    borderRadius: '10px',
                    background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.8)',
                    border: isSelected ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: isSelected ? '#06b6d4' : '#f8fafc',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: isSelected ? 700 : 500
                  }}>
                  <span style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.08)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}>
                    {opt.letter}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Bottom Action Control Buttons */}
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', justifyContent: 'space-between' }}>
            <button 
              type="button"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
              className="btn-secondary"
              style={{ opacity: currentQIndex === 0 ? 0.5 : 1 }}>
              <ArrowLeft size={16} /> Previous
            </button>

            {currentQIndex < testData.questions.length - 1 ? (
              <button 
                type="button"
                onClick={() => setCurrentQIndex((prev) => Math.min(prev + 1, testData.questions.length - 1))}
                className="btn-primary">
                Save & Next <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => handleSubmitTest(false)}
                className="btn-accent">
                Save & Submit Test <CheckCircle2 size={16} />
              </button>
            )}
          </div>

        </div>

        {/* Right Side Question Palette Matrix */}
        <div style={{
          width: '320px',
          background: '#070b18',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '0.95rem' }}>Question Palette Matrix</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '2rem' }}>
            {testData.questions.map((q, idx) => {
              const isAns = Boolean(answers[q.id]);
              const isMrk = Boolean(markedForReview[q.id]);
              const isCurr = idx === currentQIndex;

              let bgColor = '#1e293b';
              let textColor = '#94a3b8';

              if (isMrk) {
                bgColor = '#f59e0b';
                textColor = '#ffffff';
              } else if (isAns) {
                bgColor = '#10b981';
                textColor = '#ffffff';
              } else if (isCurr) {
                bgColor = '#06b6d4';
                textColor = '#ffffff';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: isCurr ? '2px solid #ffffff' : 'none',
                    background: bgColor,
                    color: textColor,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></span> Answered ({Object.keys(answers).length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }}></span> Marked for Review ({Object.values(markedForReview).filter(Boolean).length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#1e293b' }}></span> Not Visited ({testData.questions.length - Object.keys(answers).length})
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
