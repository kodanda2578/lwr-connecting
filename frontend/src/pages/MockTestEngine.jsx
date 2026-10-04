import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_TESTS_DATA } from '../data/sampleData';
import { Clock, Bookmark, CheckCircle2, ArrowRight, ArrowLeft, ShieldAlert, Flag } from 'lucide-react';

export const MockTestEngine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const testData = MOCK_TESTS_DATA.find((t) => t.id === id) || MOCK_TESTS_DATA[0];

  const [testStarted, setTestStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(testData.durationMinutes * 60);

  // Timer countdown hook
  useEffect(() => {
    if (!testStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (letter) => {
    const currentQ = testData.questions[currentQIndex];
    setAnswers((prev) => ({ ...prev, [currentQ.id]: letter }));
  };

  const toggleMarkForReview = () => {
    const currentQ = testData.questions[currentQIndex];
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleSubmitTest = () => {
    // Evaluate test results
    let correctCount = 0;
    let wrongCount = 0;
    let attemptedCount = 0;

    testData.questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected) {
        attemptedCount++;
        if (selected === q.correctOption) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    // Score calculation (AP EAPCET +1, 0 neg; JEE +4, -1 neg)
    let totalScore = 0;
    if (testData.exam === 'AP_EAPCET') {
      totalScore = correctCount * 1;
    } else {
      totalScore = correctCount * 4 - wrongCount * 1;
    }

    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    const resultPayload = {
      testId: testData.id,
      title: testData.title,
      totalScore,
      totalMarks: testData.totalMarks,
      accuracy,
      attemptedCount,
      correctCount,
      wrongCount,
      unansweredCount: testData.questions.length - attemptedCount,
      timeSpentMinutes: Math.round((testData.durationMinutes * 60 - timeLeft) / 60)
    };

    localStorage.setItem(`lwr_test_result_${testData.id}`, JSON.stringify(resultPayload));
    navigate(`/mock-tests/${testData.id}/result`);
  };

  const currentQ = testData.questions[currentQIndex];

  // If test hasn't started, render Instructions Screen
  if (!testStarted) {
    return (
      <div style={{ padding: '3rem 0', minHeight: 'calc(100vh - 80px)' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Test Instructions: {testData.title}
            </h2>
            <p style={{ color: '#06b6d4', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              Duration: {testData.durationMinutes} Mins | Total Marks: {testData.totalMarks} | Exam: {testData.exam}
            </p>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ color: '#ffffff', marginBottom: '1rem' }}>Please read the instructions carefully:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                {testData.instructions.map((inst, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: '#06b6d4', fontWeight: 700 }}>•</span> {inst}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => navigate('/mock-tests')} className="btn-secondary" style={{ padding: '0.8rem 1.5rem' }}>
                Cancel
              </button>
              <button onClick={() => setTestStarted(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }}>
                I Am Ready — Start Test <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Fullscreen CBT Test Engine
  return (
    <div style={{ background: '#04070f', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Test Engine Header */}
      <header style={{
        background: '#090d1a',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>{testData.title}</div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Subject: {currentQ?.subject} | Chapter: {currentQ?.chapter}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid #06b6d4',
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            color: '#06b6d4',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>

          <button onClick={handleSubmitTest} className="btn-accent" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Submit Test
          </button>
        </div>
      </header>

      {/* CBT Body */}
      <div style={{ flex: 1, display: 'flex' }}>
        
        {/* Left Question Area */}
        <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.85rem' }}>Question {currentQIndex + 1} of {testData.questions.length}</span>
            <button 
              onClick={toggleMarkForReview}
              style={{
                background: markedForReview[currentQ.id] ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                border: markedForReview[currentQ.id] ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                color: markedForReview[currentQ.id] ? '#f59e0b' : '#94a3b8',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
              <Flag size={14} /> {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
            </button>
          </div>

          <div style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 600, marginBottom: '2rem', lineHeight: '1.6' }}>
            {currentQ.questionText}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '700px', marginBottom: '3rem' }}>
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.letter;
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
                    width: '28px',
                    height: '28px',
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

          {/* Navigation Controls */}
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
                onClick={handleSubmitTest}
                className="btn-accent">
                Save & Submit Test <CheckCircle2 size={16} />
              </button>
            )}
          </div>

        </div>

        {/* Right Question Palette Matrix */}
        <div style={{
          width: '320px',
          background: '#070b18',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '0.95rem' }}>Question Navigator</h4>
          
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
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }}></span> Answered
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }}></span> Marked for Review
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#1e293b' }}></span> Not Visited
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
