import React, { useState } from 'react';
import { BRANCHES_DATA } from '../data/sampleData';
import { BookOpen, Briefcase, GraduationCap, CheckCircle2, ShieldCheck } from 'lucide-react';

export const BranchDirectoryPage = () => {
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES_DATA[0]);

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <div className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>B.Tech Branch Insights</div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Explore B.Tech Engineering Branches</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px', marginTop: '0.25rem' }}>
            Understand what you will study, core subjects, industry skills, and realistic career paths before locking your counselling choices.
          </p>
        </div>

        {/* Branch Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
          {BRANCHES_DATA.map((branch) => (
            <button
              key={branch.code}
              onClick={() => setSelectedBranch(branch)}
              style={{
                background: selectedBranch.code === branch.code ? 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' : 'rgba(15, 23, 42, 0.7)',
                color: '#ffffff',
                border: selectedBranch.code === branch.code ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}>
              {branch.code} — {branch.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Branch Detail View */}
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.85rem' }}>{selectedBranch.code}</span>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginTop: '0.25rem' }}>{selectedBranch.name}</h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7', marginTop: '0.5rem' }}>
              {selectedBranch.description}
            </p>
          </div>

          <div className="grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
            
            {/* Core Subjects */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} /> Core Academic Subjects
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedBranch.coreSubjects.map((subj, idx) => (
                  <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#06b6d4" /> {subj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Practical Skills */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
              <h4 style={{ color: '#c084fc', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} /> Essential Industry Skills
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedBranch.skills.map((skill, idx) => (
                  <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#8b5cf6" /> {skill}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          <div className="grid-2" style={{ gap: '2rem' }}>
            
            {/* Career Roles */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
              <h4 style={{ color: '#34d399', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} /> Typical Career Profiles
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedBranch.careerPaths.map((career, idx) => (
                  <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#10b981" /> {career}
                  </li>
                ))}
              </ul>
            </div>

            {/* Higher Studies */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
              <h4 style={{ color: '#fbbf24', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} /> Higher Education Pathways
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedBranch.higherStudies.map((hs, idx) => (
                  <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#f59e0b" /> {hs}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
