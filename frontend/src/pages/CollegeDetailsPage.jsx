import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Globe, ShieldCheck, Award, ArrowLeft, Layers, BookOpen, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CollegeDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollege();
  }, [id]);

  const loadCollege = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCollegeDetails(id);
      setData(res);
    } catch (e) {
      console.error('Failed to load college details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="state-box">
            <div className="loading-spinner"></div>
            <div className="state-box-title">Loading College Details...</div>
            <div className="state-box-desc">Retrieving college profile, branches, and cutoffs</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.college) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div className="state-box">
            <div className="state-box-title">College Details Not Found</div>
            <div className="state-box-desc">The requested college could not be retrieved from the repository.</div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/colleges" className="btn-primary">
                <ArrowLeft size={16} /> Back to Colleges
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { college, exams, branches, cutoffs } = data;
  const isGovt = college.governmentStatus?.toLowerCase().includes('govt') || college.governmentStatus?.toLowerCase().includes('government');

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1100px' }}>

        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/colleges" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back to All Colleges
          </Link>
        </div>

        {/* Header Hero Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className={isGovt ? 'badge badge-green' : 'badge badge-purple'}>
              {college.governmentStatus || 'Government'}
            </span>
            {college.isAutonomous && (
              <span className="badge badge-cyan">
                Autonomous
              </span>
            )}
            <span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>
              {college.code}
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.5rem' }}>
            {college.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
            <MapPin size={16} color="#06b6d4" />
            <span>{college.city}{college.district ? `, ${college.district}` : ''} • {college.state?.name || college.state || 'India'}{college.pincode ? ` - ${college.pincode}` : ''}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {college.aicteApproved !== false && (
              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                ✓ AICTE Approved Institution
              </span>
            )}
            <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
              Verified: {college.lastVerifiedDate || '2026-03'}
            </span>
            {college.affiliation && (
              <span className="badge badge-gray" style={{ fontSize: '0.75rem' }}>
                Affiliation: {college.affiliation}
              </span>
            )}
          </div>

          {college.description && (
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
              {college.description}
            </p>
          )}

          <div className="grid-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Admission Authority</div>
              <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem' }}>
                {college.admissionAuthority || 'State Authority'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Institution Type</div>
              <div style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: 700, marginTop: '0.2rem' }}>
                {college.collegeType || college.governmentStatus || 'Engineering College'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Tuition Fee Range</div>
              <div style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 700, marginTop: '0.2rem', fontFamily: 'monospace' }}>
                {college.feeRange || 'As per State Committee'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Official Links</div>
              <div style={{ fontSize: '0.95rem', marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {college.admissionLink ? (
                  <a href={college.admissionLink} target="_blank" rel="noreferrer" style={{ color: '#06b6d4', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <Globe size={13} /> Admission Portal
                  </a>
                ) : college.website ? (
                  <a href={college.website} target="_blank" rel="noreferrer" style={{ color: '#06b6d4', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}>
                    <Globe size={13} /> Visit Website
                  </a>
                ) : (
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Not Available</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admission Routes / Exams */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="#06b6d4" /> Admission Entrance Exams & Routes
          </h2>
          {exams.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No entrance exam routes mapped yet.</p>
          ) : (
            <div className="grid-2">
              {exams.map(e => (
                <div key={e.id} className="glass-card" style={{ padding: '1.25rem' }}>
                  <span className="badge badge-cyan" style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>{e.code}</span>
                  <h4 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 700, marginBottom: '0.25rem' }}>{e.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{e.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offered Branches */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={20} color="#8b5cf6" /> Offered Engineering Branches
          </h2>
          {branches.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No branches mapped yet.</p>
          ) : (
            <div className="grid-3">
              {branches.map(b => (
                <div key={b.id} className="glass-card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#06b6d4', fontWeight: 800 }}>{b.code}</span>
                  <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600, marginTop: '0.25rem' }}>{b.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Cutoff Benchmarks */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} color="#10b981" /> Historical Opening & Closing Ranks (Cutoffs)
          </h2>
          {cutoffs.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No verified historical cutoff records available for this college yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Category</th>
                    <th>Round</th>
                    <th>Opening Rank</th>
                    <th>Closing Rank</th>
                    <th>Source Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {cutoffs.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', color: '#06b6d4', fontWeight: 700 }}>
                        {c.exam ? c.exam.code : 'EXAM'}
                      </td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {c.branch ? c.branch.name : 'Branch'}
                      </td>
                      <td>{c.year}</td>
                      <td>
                        <span className="badge badge-purple">{c.category}</span>
                      </td>
                      <td>Round {c.round}</td>
                      <td style={{ fontFamily: 'monospace', color: '#10b981' }}>
                        {c.openingRank ? c.openingRank.toLocaleString() : '-'}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#f59e0b', fontWeight: 800 }}>
                        {c.closingRank ? c.closingRank.toLocaleString() : '-'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {c.sourceReference || 'APSCHE / State Authority'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
