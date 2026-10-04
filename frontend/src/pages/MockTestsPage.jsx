import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_TESTS_DATA } from '../data/sampleData';
import { Compass, Clock, Award, CheckCircle2, ArrowRight, Play } from 'lucide-react';

export const MockTestsPage = () => {
  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Compass size={28} color="#ffffff" />
            </div>
            <div>
              <div className="badge badge-cyan">Computer Based Test Engine</div>
              <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
                Online Mock Test Series
              </h1>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px' }}>
            Simulate real exam room pressure with timed grand mock tests for AP EAPCET (160 Marks) and JEE Main (300 Marks). Get instant evaluation reports & accuracy insights.
          </p>
        </div>

        {/* Tests List Grid */}
        <div className="grid-2">
          {MOCK_TESTS_DATA.map((test) => (
            <div key={test.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className={test.exam === 'AP_EAPCET' ? 'badge badge-purple' : 'badge badge-cyan'}>
                    {test.exam === 'AP_EAPCET' ? 'AP EAPCET' : 'JEE Main'}
                  </span>
                  <span className="badge badge-amber">{test.category}</span>
                </div>

                <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.75rem' }}>
                  {test.title}
                </h3>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={16} color="#06b6d4" /> {test.durationMinutes} Minutes
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={16} color="#8b5cf6" /> {test.totalMarks} Marks
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} color="#10b981" /> {test.questionsCount} Questions
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                  <strong>Key Instructions:</strong> {test.instructions[0]}
                </div>
              </div>

              <Link 
                to={`/mock-tests/${test.id}/take`}
                className={test.exam === 'AP_EAPCET' ? 'btn-accent' : 'btn-primary'}
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                <Play size={18} /> Start Online Test Now
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
