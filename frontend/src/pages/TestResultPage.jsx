import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Award, CheckCircle2, XCircle, Clock, ArrowRight, Sparkles, Building2, BarChart3 } from 'lucide-react';

export const TestResultPage = () => {
  const { id } = useParams();
  const rawResult = localStorage.getItem(`lwr_test_result_${id}`);
  
  // Default mock payload if evaluated directly
  const result = rawResult ? JSON.parse(rawResult) : {
    title: 'AP EAPCET Full Length Grand Mock Test - 01',
    totalScore: 118,
    totalMarks: 160,
    accuracy: 78,
    attemptedCount: 151,
    correctCount: 118,
    wrongCount: 33,
    unansweredCount: 9,
    timeSpentMinutes: 142
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header Result Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
            🎉 Test Submitted & Evaluated
          </div>

          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            {result.title}
          </h1>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', margin: '1.5rem 0' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800, color: '#06b6d4' }}>{result.totalScore}</span>
            <span style={{ fontSize: '1.5rem', color: '#94a3b8', fontWeight: 600 }}>/ {result.totalMarks} Marks</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="badge badge-purple" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Accuracy: {result.accuracy}%
            </div>
            <div className="badge badge-amber" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Time Spent: {result.timeSpentMinutes} Mins
            </div>
          </div>
        </div>

        {/* 4 Analytics Breakdown Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{result.attemptedCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Attempted</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{result.correctCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Correct</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{result.wrongCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Wrong</div>
          </div>

          <div className="glass-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{result.unansweredCount}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Unanswered</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/college-predictor`} className="btn-primary" style={{ padding: '0.85rem 1.75rem' }}>
            <Building2 size={18} /> Check Matching Colleges For This Score
          </Link>
          <Link to="/rank-estimator" className="btn-secondary" style={{ padding: '0.85rem 1.75rem' }}>
            <BarChart3 size={18} /> Calculate Estimated Rank
          </Link>
          <Link to="/ai-assistant" className="btn-accent" style={{ padding: '0.85rem 1.75rem' }}>
            <Sparkles size={18} /> Ask AI Weak Topic Advice
          </Link>
        </div>

      </div>
    </div>
  );
};
