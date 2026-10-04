import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { BarChart3, ShieldAlert, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RankEstimatorPage = () => {
  const [exam, setExam] = useState('AP_EAPCET');
  const [score, setScore] = useState('115');
  const [result, setResult] = useState(null);

  const handleEstimate = async (e) => {
    e.preventDefault();
    const scoreNum = parseInt(score) || 80;
    const res = await apiService.estimateRank({ exam, score: scoreNum });
    setResult(res);
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <BarChart3 size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Score to Rank Estimator</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Estimate your rank range based on previous year marks vs rank trends.
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleEstimate}>
            <div className="grid-2">
              <div className="form-group">
                <label>Select Exam</label>
                <select className="form-control" value={exam} onChange={(e) => setExam(e.target.value)}>
                  <option value="AP_EAPCET">AP EAPCET (Out of 160 Marks)</option>
                  <option value="JEE">JEE Main (Out of 300 Marks)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Expected / Mock Score</label>
                <input 
                  type="number"
                  className="form-control"
                  placeholder={exam === 'AP_EAPCET' ? 'e.g. 115' : 'e.g. 185'}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}>
              Calculate Estimated Rank Range
            </button>
          </form>
        </div>

        {/* Result Card */}
        {result && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
            
            {/* Warning Badge */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1.5rem',
              textTransform: 'uppercase'
            }}>
              <ShieldAlert size={16} /> Estimated Rank — Not Official
            </div>

            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              Estimated Rank Range for Score {result.score} / {result.exam === 'AP_EAPCET' ? '160' : '300'}
            </h3>

            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#06b6d4', margin: '1rem 0' }}>
              {result.estimatedMinRank} — {result.estimatedMaxRank}
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
              {result.disclaimer}
            </p>

            <Link to="/college-predictor" className="btn-accent" style={{ padding: '0.85rem 2rem' }}>
              <Building2 size={18} /> Predict Colleges for Rank ~{result.estimatedMinRank} <ArrowRight size={16} />
            </Link>

          </div>
        )}

      </div>
    </div>
  );
};
