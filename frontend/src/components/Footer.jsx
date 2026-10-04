import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: '#04070f',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '4rem 0 2rem 0',
      marginTop: '5rem',
      color: '#94a3b8'
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '3rem' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={20} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                LAUGHS WITH RAMESH <span className="text-gradient">CONNECTING</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              One Platform. Complete B.Tech Guidance. Empowering Intermediate students in Andhra Pradesh & Telangana to conquer JEE, AP EAPCET, and make smart college choices.
            </p>
            <div className="badge badge-cyan" style={{ gap: '0.35rem' }}>
              <ShieldCheck size={12} /> Verified Educational Resources
            </div>
          </div>

          {/* Quick Exam Prep */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1rem' }}>Entrance Exam Prep</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/jee" style={{ hover: { color: '#06b6d4' } }}>JEE Main & Advanced Syllabus</Link></li>
              <li><Link to="/eapcet">AP EAPCET (EAMCET) Syllabus</Link></li>
              <li><Link to="/mock-tests">Online Mock Test Engine</Link></li>
              <li><Link to="/previous-papers">Previous Year Question Papers</Link></li>
              <li><Link to="/study-materials">Formula Sheets & Revision Notes</Link></li>
            </ul>
          </div>

          {/* College & Branch Guidance */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1rem' }}>College Discovery & Tools</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/college-predictor">"Which College Can I Get?" Matcher</Link></li>
              <li><Link to="/rank-estimator">Score to Rank Estimator</Link></li>
              <li><Link to="/colleges">AP & Telangana College Directory</Link></li>
              <li><Link to="/branches">B.Tech Branch Insights (CSE, ECE, AI)</Link></li>
              <li><Link to="/compare">Side-by-Side College Comparison</Link></li>
              <li><Link to="/btech-roadmap">9-Step B.Tech Selection Roadmap</Link></li>
            </ul>
          </div>

          {/* LWR AI & Student Support */}
          <div>
            <h4 style={{ color: '#ffffff', marginBottom: '1.25rem', fontSize: '1rem' }}>AI & Mentor Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/ai-assistant" style={{ color: '#06b6d4', fontWeight: 600 }}>Ask LWR AI Assistant</Link></li>
              <li><Link to="/messages">Message Laughs With Ramesh</Link></li>
              <li><Link to="/doubt-sessions">Book 1-on-1 Doubt Session</Link></li>
              <li><Link to="/community">Student Community Forum</Link></li>
              <li><Link to="/videos">Video Learning & Guidance Hub</Link></li>
            </ul>
          </div>

        </div>

        {/* Counselling Disclaimer Notice */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '1.25rem',
          fontSize: '0.8rem',
          lineHeight: '1.5',
          marginBottom: '2rem',
          color: '#64748b'
        }}>
          <strong style={{ color: '#cbd5e1' }}>IMPORTANT ADMISSION & CUTOFF DISCLAIMER:</strong> All historical cutoff ranks, college seat allocations, and rank estimations displayed on Laughs With Ramesh Connecting are derived from previous year official counselling datasets (such as APSCHE and JoSAA). Cutoffs fluctuate annually depending on exam difficulty, total candidates, seat matrix updates, and category dynamics. Historical data is provided for guidance only and is <strong>never a guarantee of future admission</strong>. Students are strongly advised to verify final admission criteria and official seat allotments from official state counselling websites (e.g. <a href="https://eapcet-sche.aptonline.in" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', textDecoration: 'underline' }}>APSCHE Portal</a> & <a href="https://josaa.nic.in" target="_blank" rel="noreferrer" style={{ color: '#06b6d4', textDecoration: 'underline' }}>JoSAA Portal</a>).
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          fontSize: '0.8rem'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>Laughs With Ramesh Connecting</strong>. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Data Sources & Attribution</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
