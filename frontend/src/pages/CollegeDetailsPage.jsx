import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { COLLEGES_DATA } from '../data/sampleData';
import { Building2, MapPin, Globe, CheckCircle2, ShieldCheck, ExternalLink, Award, FileText } from 'lucide-react';

export const CollegeDetailsPage = () => {
  const { id } = useParams();
  const collegeId = parseInt(id) || 101;
  const college = COLLEGES_DATA.find((c) => c.id === collegeId) || COLLEGES_DATA[0];

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Header Banner */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>{college.type}</span>
              <h1 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
                {college.name}
              </h1>
              <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><MapPin size={16} color="#06b6d4" /> {college.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Award size={16} color="#8b5cf6" /> {college.affiliation}</span>
              </div>
            </div>

            <a href={college.website} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
              Official Website <ExternalLink size={16} />
            </a>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
          
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '1rem' }}>Key Overview & Fees</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Annual Tuition Fees</span>
                <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{college.feesPerYear}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Accepted Entrance Exams</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {college.entranceExams.map((ex) => (
                    <span key={ex} className="badge badge-purple">{ex}</span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Placement Highlights</span>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginTop: '0.25rem' }}>{college.placementInfo}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '1rem' }}>Campus Facilities</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
              {college.facilities.map((fac, idx) => (
                <li key={idx} style={{ color: '#cbd5e1', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#06b6d4" /> {fac}
                </li>
              ))}
            </ul>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b' }}>
              <strong style={{ color: '#94a3b8' }}>Data Attribution Source:</strong> {college.source} <br />
              <strong>Last Verified Date:</strong> {college.lastUpdated}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
