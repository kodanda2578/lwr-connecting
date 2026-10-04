import React, { useState } from 'react';
import { COLLEGES_DATA } from '../data/sampleData';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export const CollegeComparePage = () => {
  const [college1, setCollege1] = useState(COLLEGES_DATA[0]);
  const [college2, setCollege2] = useState(COLLEGES_DATA[1]);

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Factual Side-by-Side Comparison</div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>College Comparison Tool</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px', marginTop: '0.25rem' }}>
            Compare location, fee structure, historical cutoffs, placement highlights, facilities, and official sources to make your own educated decision.
          </p>
        </div>

        {/* Selectors Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div className="grid-2">
            <div className="form-group">
              <label>Select First College</label>
              <select 
                className="form-control" 
                value={college1.id} 
                onChange={(e) => setCollege1(COLLEGES_DATA.find(c => c.id === parseInt(e.target.value)))}>
                {COLLEGES_DATA.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Select Second College</label>
              <select 
                className="form-control" 
                value={college2.id} 
                onChange={(e) => setCollege2(COLLEGES_DATA.find(c => c.id === parseInt(e.target.value)))}>
                {COLLEGES_DATA.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', width: '25%', color: '#94a3b8' }}>Feature</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', width: '37.5%', color: '#06b6d4', fontSize: '1.1rem' }}>{college1.name}</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', width: '37.5%', color: '#8b5cf6', fontSize: '1.1rem' }}>{college2.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Location & City</td>
                <td style={{ padding: '1rem 1.25rem' }}>{college1.location}</td>
                <td style={{ padding: '1rem 1.25rem' }}>{college2.location}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Institution Type</td>
                <td style={{ padding: '1rem 1.25rem' }}><span className="badge badge-cyan">{college1.type}</span></td>
                <td style={{ padding: '1rem 1.25rem' }}><span className="badge badge-purple">{college2.type}</span></td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Annual Tuition Fees</td>
                <td style={{ padding: '1rem 1.25rem', color: '#10b981', fontWeight: 700 }}>{college1.feesPerYear}</td>
                <td style={{ padding: '1rem 1.25rem', color: '#10b981', fontWeight: 700 }}>{college2.feesPerYear}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Accepted Entrance Exams</td>
                <td style={{ padding: '1rem 1.25rem' }}>{college1.entranceExams.join(', ')}</td>
                <td style={{ padding: '1rem 1.25rem' }}>{college2.entranceExams.join(', ')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Placement Information</td>
                <td style={{ padding: '1rem 1.25rem', lineHeight: '1.6', fontSize: '0.85rem' }}>{college1.placementInfo}</td>
                <td style={{ padding: '1rem 1.25rem', lineHeight: '1.6', fontSize: '0.85rem' }}>{college2.placementInfo}</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontWeight: 600 }}>Official Website & Source</td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <a href={college1.website} target="_blank" rel="noreferrer" style={{ color: '#06b6d4' }}>{college1.website}</a> <br />
                  Source: {college1.source} ({college1.lastUpdated})
                </td>
                <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                  <a href={college2.website} target="_blank" rel="noreferrer" style={{ color: '#8b5cf6' }}>{college2.website}</a> <br />
                  Source: {college2.source} ({college2.lastUpdated})
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
