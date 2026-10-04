import React from 'react';
import { Map, CheckCircle2, ArrowRight, FileText, Video, Compass, Building2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BTechRoadmapPage = () => {
  const steps = [
    { number: 1, title: 'Understand Your Rank', desc: 'Use score-to-rank tools to analyze your rank standing across general and category quotas.' },
    { number: 2, title: 'Identify Suitable Branches', desc: 'Explore CSE, AI/ML, ECE, EEE, Mech, and Civil core subjects to align with your personal interest.' },
    { number: 3, title: 'Check Historical Cutoffs', desc: 'Query verified 2024 state round-1 cutoffs for your category quota.' },
    { number: 4, title: 'Shortlist Colleges', desc: 'Create a list of 10-15 top target colleges within your realistic cutoff range.' },
    { number: 5, title: 'Compare Colleges Side-by-Side', desc: 'Evaluate placement records, faculty, campus infrastructure, and accreditation.' },
    { number: 6, title: 'Check Fees, Academics & Location', desc: 'Confirm government quota tuition fees vs hostel costs and travel distance.' },
    { number: 7, title: 'Review Official Counselling Information', desc: 'Read official APSCHE / JoSAA counselling guidelines and certificate verification schedules.' },
    { number: 8, title: 'Prepare Counselling Web Option Choices', desc: 'Order your web option choices strategically (Dream Colleges → Realistic Matches → Safe Options).' },
    { number: 9, title: 'Make Final Informed Decision', desc: 'Accept your allotted seat with confidence and prepare for your B.Tech journey!' }
  ];

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <Map size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>9-Step B.Tech College Selection Roadmap</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Follow our structured decision framework to transition smoothly from Intermediate to B.Tech.
          </p>
        </div>

        {/* 9 Steps Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
          {steps.map((step) => (
            <div key={step.number} className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontSize: '1.2rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {step.number}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tool Links */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Execute Your Roadmap Steps Now</h3>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/college-predictor" className="btn-primary">
              <Building2 size={16} /> Step 3 & 4: Cutoff Matcher
            </Link>
            <Link to="/compare" className="btn-secondary">
              <Compass size={16} /> Step 5: Compare Colleges
            </Link>
            <Link to="/ai-assistant" className="btn-accent">
              <Sparkles size={16} /> Step 8: Ask AI Choice Guidance
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
