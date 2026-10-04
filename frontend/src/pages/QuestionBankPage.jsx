import React, { useState } from 'react';
import { MOCK_TESTS_DATA } from '../data/sampleData';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Filter, ChevronDown, BookOpen } from 'lucide-react';

export const QuestionBankPage = () => {
  // Aggregate all questions from mock tests data into question bank
  const allQuestions = MOCK_TESTS_DATA.flatMap((t) => t.questions.map(q => ({ ...q, exam: t.exam })));
  
  const [selectedExam, setSelectedExam] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  const filteredQuestions = allQuestions.filter((q) => {
    const examMatch = selectedExam === 'ALL' || q.exam === selectedExam;
    const subjectMatch = selectedSubject === 'ALL' || q.subject === selectedSubject;
    return examMatch && subjectMatch;
  });

  const handleSelectOption = (qId, optionLetter) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
    setShowExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <HelpCircle size={24} color="#06b6d4" />
            <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Question Practice Bank</h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Practice topic-wise MCQs with instant answer validation and step-by-step solutions.
          </p>

          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Exam</label>
              <select className="form-control" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                <option value="ALL">All Entrance Exams</option>
                <option value="AP_EAPCET">AP EAPCET</option>
                <option value="JEE">JEE Main</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Subject</label>
              <select className="form-control" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                <option value="ALL">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredQuestions.map((q, idx) => {
            const selectedOpt = selectedAnswers[q.id];
            const isAnswered = Boolean(selectedOpt);
            const isCorrect = selectedOpt === q.correctOption;
            const showExp = showExplanations[q.id];

            return (
              <div key={q.id} className="glass-panel" style={{ padding: '2rem' }}>
                
                {/* Meta Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-cyan">Question {idx + 1}</span>
                    <span className="badge badge-purple">{q.subject}</span>
                    <span className="badge badge-amber">{q.chapter}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Exam: {q.exam}</span>
                </div>

                {/* Question Text */}
                <div style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: 600, marginBottom: '1.25rem', lineHeight: '1.6' }}>
                  {q.questionText}
                </div>

                {/* Options List */}
                <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {q.options.map((opt) => {
                    let btnStyle = {
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc'
                    };

                    if (isAnswered) {
                      if (opt.letter === q.correctOption) {
                        btnStyle = {
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid #10b981',
                          color: '#10b981'
                        };
                      } else if (opt.letter === selectedOpt && !isCorrect) {
                        btnStyle = {
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid #ef4444',
                          color: '#ef4444'
                        };
                      }
                    }

                    return (
                      <button
                        key={opt.letter}
                        onClick={() => handleSelectOption(q.id, opt.letter)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.85rem 1rem',
                          borderRadius: '10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          transition: 'all 0.2s ease',
                          ...btnStyle
                        }}>
                        <span style={{
                          fontWeight: 700,
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem'
                        }}>
                          {opt.letter}
                        </span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {showExp && (
                  <div style={{
                    background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '10px',
                    padding: '1.25rem',
                    marginTop: '1rem'
                  }}>
                    <div style={{
                      fontWeight: 700,
                      color: isCorrect ? '#10b981' : '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.95rem'
                    }}>
                      {isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      {isCorrect ? 'Correct Answer!' : `Incorrect. Correct Option is (${q.correctOption})`}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                      <strong style={{ color: '#ffffff' }}>Solution Breakdown:</strong> {q.explanation}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
