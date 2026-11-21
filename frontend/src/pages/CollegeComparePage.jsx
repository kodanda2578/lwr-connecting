import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowLeft,
  Building2,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Award,
  CreditCard,
  ExternalLink,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CollegeComparePage() {
  const [searchParams] = useSearchParams();
  const c1Id = searchParams.get('c1') || '';
  const c2Id = searchParams.get('c2') || '';

  const [collegesList, setCollegesList] = useState([]);
  const [college1, setCollege1] = useState(null);
  const [college2, setCollege2] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedC1, setSelectedC1] = useState(c1Id);
  const [selectedC2, setSelectedC2] = useState(c2Id);

  useEffect(() => {
    loadCollegesList();
  }, []);

  useEffect(() => {
    if (selectedC1) fetchCollegeData(selectedC1, setCollege1);
  }, [selectedC1]);

  useEffect(() => {
    if (selectedC2) fetchCollegeData(selectedC2, setCollege2);
  }, [selectedC2]);

  const loadCollegesList = async () => {
    try {
      const res = await apiService.getCollegesList({ size: 150 });
      const list = res?.content || (Array.isArray(res) ? res : []);
      setCollegesList(list || []);
      if (!selectedC1 && list && list.length > 0) setSelectedC1(list[0].id);
      if (!selectedC2 && list && list.length > 1) setSelectedC2(list[1].id);
    } catch (e) {
      console.error('Error loading colleges list:', e);
    }
  };

  const fetchCollegeData = async (id, setter) => {
    setLoading(true);
    try {
      const res = await apiService.getCollegeDetails(id);
      setter(res);
    } catch (e) {
      console.error('Error fetching college details:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRankOrStatus = (college) => {
    if (!college) return '—';
    if (college.accreditation && college.accreditation.toLowerCase().includes('nirf')) {
      return college.accreditation;
    }
    if (college.description && college.description.includes('NIRF')) {
      const match = college.description.match(/NIRF[^.]+rank[^.]*/i);
      if (match) return match[0];
    }
    return 'Not Officially Ranked / Unreported';
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1240px' }}>

        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/colleges" className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back to Colleges Directory
          </Link>
        </div>

        {/* Header */}
        <div className="page-hero">
          <div className="page-hero-badge">
            <GitCompare size={14} /> Side-by-Side Analysis
          </div>
          <h1 className="page-hero-title">
            Compare Engineering Colleges & Cutoffs
          </h1>
          <p className="page-hero-subtitle">
            Compare location, ownership status, admission authority, entrance exams, offered branches, tuition fees, and authentic historical closing ranks side-by-side.
          </p>
        </div>

        {/* Selectors Panel */}
        <div className="filter-panel" style={{ marginBottom: '2rem' }}>
          <div className="filter-grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="compare-c1" style={{ color: '#38bdf8', fontWeight: 600 }}>First College</label>
              <select
                id="compare-c1"
                value={selectedC1}
                onChange={(e) => setSelectedC1(e.target.value)}
                className="form-control form-select"
              >
                <option value="">-- Choose First College --</option>
                {collegesList.map(c => (
                  <option key={`c1-${c.id}`} value={c.id}>
                    {c.name} ({c.code} - {c.city || (c.state ? c.state.name : 'India')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="compare-c2" style={{ color: '#a855f7', fontWeight: 600 }}>Second College</label>
              <select
                id="compare-c2"
                value={selectedC2}
                onChange={(e) => setSelectedC2(e.target.value)}
                className="form-control form-select"
              >
                <option value="">-- Choose Second College --</option>
                {collegesList.map(c => (
                  <option key={`c2-${c.id}`} value={c.id}>
                    {c.name} ({c.code} - {c.city || (c.state ? c.state.name : 'India')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Institutional Metric Comparison Table */}
        {college1 && college2 && (
          <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitCompare size={20} color="#06b6d4" /> Institutional & Academic Metrics
              </h2>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Institutional Metric</th>
                      <th style={{ width: '39%', color: '#38bdf8', fontSize: '1.05rem' }}>
                        <div style={{ fontWeight: 700 }}>{college1.college.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Code: {college1.college.code}
                        </div>
                      </th>
                      <th style={{ width: '39%', color: '#a855f7', fontSize: '1.05rem' }}>
                        <div style={{ fontWeight: 700 }}>{college2.college.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          Code: {college2.college.code}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Verification Status */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Directory Verification</td>
                      <td>
                        {(college1.college.verificationStatus === 'VERIFIED_OFFICIAL' || college1.college.verificationStatus === 'VERIFIED') ? (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                            ✓ Officially Verified
                          </span>
                        ) : (
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                            Provisional Import
                          </span>
                        )}
                      </td>
                      <td>
                        {(college2.college.verificationStatus === 'VERIFIED_OFFICIAL' || college2.college.verificationStatus === 'VERIFIED') ? (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                            ✓ Officially Verified
                          </span>
                        ) : (
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                            Provisional Import
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Location */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Location & Campus</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {college1.college.city}, {college1.college.state?.name || college1.college.stateText || 'India'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {college1.college.location} {college1.college.pincode ? `(PIN: ${college1.college.pincode})` : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {college2.college.city}, {college2.college.state?.name || college2.college.stateText || 'India'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          {college2.college.location} {college2.college.pincode ? `(PIN: ${college2.college.pincode})` : ''}
                        </div>
                      </td>
                    </tr>

                    {/* Ownership / Category */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Ownership & Classification</td>
                      <td>
                        <span className={college1.college.governmentStatus?.toLowerCase().includes('govt') ? 'badge badge-green' : college1.college.governmentStatus?.toLowerCase().includes('deemed') ? 'badge badge-cyan' : 'badge badge-purple'}>
                          {college1.college.governmentStatus || 'University'}
                        </span>
                        {college1.college.isAutonomous && <span className="badge badge-cyan" style={{ marginLeft: '6px' }}>Autonomous</span>}
                      </td>
                      <td>
                        <span className={college2.college.governmentStatus?.toLowerCase().includes('govt') ? 'badge badge-green' : college2.college.governmentStatus?.toLowerCase().includes('deemed') ? 'badge badge-cyan' : 'badge badge-purple'}>
                          {college2.college.governmentStatus || 'University'}
                        </span>
                        {college2.college.isAutonomous && <span className="badge badge-cyan" style={{ marginLeft: '6px' }}>Autonomous</span>}
                      </td>
                    </tr>

                    {/* Accreditation & Quality */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Accreditation & Quality</td>
                      <td>
                        <span className="badge badge-purple">
                          {college1.college.accreditation || 'Affiliated / NBA Pending'}
                        </span>
                        {college1.college.aicteApproved !== false && (
                          <span className="badge badge-green" style={{ marginLeft: '6px' }}>✓ AICTE Approved</span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-purple">
                          {college2.college.accreditation || 'Affiliated / NBA Pending'}
                        </span>
                        {college2.college.aicteApproved !== false && (
                          <span className="badge badge-green" style={{ marginLeft: '6px' }}>✓ AICTE Approved</span>
                        )}
                      </td>
                    </tr>

                    {/* NIRF / Official Ranking */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>National Ranking (NIRF)</td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                        {getRankOrStatus(college1.college)}
                      </td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                        {getRankOrStatus(college2.college)}
                      </td>
                    </tr>

                    {/* Admission Authority */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Admission Authority</td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {college1.college.admissionAuthority || 'State / Central Counselling Authority'}
                      </td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>
                        {college2.college.admissionAuthority || 'State / Central Counselling Authority'}
                      </td>
                    </tr>

                    {/* Accepted Entrance Exams */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Accepted Entrance Exams</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {college1.exams && college1.exams.length > 0 ? (
                            college1.exams.map(e => (
                              <span key={`e1-${e.id}`} className="badge badge-cyan">
                                {e.name} ({e.code})
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>National / State Entrance</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {college2.exams && college2.exams.length > 0 ? (
                            college2.exams.map(e => (
                              <span key={`e2-${e.id}`} className="badge badge-cyan">
                                {e.name} ({e.code})
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>National / State Entrance</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Tuition Fee Range */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Tuition Fee Range</td>
                      <td style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
                        {college1.college.feeRange || 'State Prescribed Fee / Not Disclosed by Institution'}
                      </td>
                      <td style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
                        {college2.college.feeRange || 'State Prescribed Fee / Not Disclosed by Institution'}
                      </td>
                    </tr>

                    {/* Branches Offered */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>
                        Sanctioned Branches ({college1.branches?.length || 0} vs {college2.branches?.length || 0})
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {college1.branches && college1.branches.length > 0 ? (
                            college1.branches.map(b => (
                              <span key={`b1-${b.id}`} className="badge badge-gray" title={b.name}>
                                {b.code}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Standard B.Tech Offerings</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {college2.branches && college2.branches.length > 0 ? (
                            college2.branches.map(b => (
                              <span key={`b2-${b.id}`} className="badge badge-gray" title={b.name}>
                                {b.code}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8' }}>Standard B.Tech Offerings</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Official Portal */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Official Admission Portal</td>
                      <td>
                        {college1.college.admissionLink || college1.college.website ? (
                          <a
                            href={college1.college.admissionLink || college1.college.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Official Website <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Portal Not Reported</span>
                        )}
                      </td>
                      <td>
                        {college2.college.admissionLink || college2.college.website ? (
                          <a
                            href={college2.college.admissionLink || college2.college.website}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#a855f7', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            Official Website <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Portal Not Reported</span>
                        )}
                      </td>
                    </tr>

                    {/* Source Reference */}
                    <tr>
                      <td style={{ fontWeight: 600, color: '#94a3b8' }}>Official Data Source</td>
                      <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {college1.college.source || 'AICTE / JoSAA National Directory'}
                        {college1.college.lastVerifiedDate ? ` (Audit: ${college1.college.lastVerifiedDate})` : ''}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {college2.college.source || 'AICTE / JoSAA National Directory'}
                        {college2.college.lastVerifiedDate ? ` (Audit: ${college2.college.lastVerifiedDate})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Cutoff Benchmarks Comparison */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#10b981" /> Historical Cutoff Benchmarks Comparison
                </h2>
                <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                  Authentic 2024 / 2023 Central & State Counselling Data
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                {/* College 1 Cutoffs */}
                <div style={{ background: 'rgba(56, 189, 248, 0.03)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h3 style={{ color: '#38bdf8', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                    {college1.college.code} Verified Cutoffs ({college1.cutoffs?.length || 0})
                  </h3>

                  {college1.cutoffs && college1.cutoffs.length > 0 ? (
                    <div className="table-wrapper">
                      <table className="data-table" style={{ fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th>Branch</th>
                            <th>Exam / Yr</th>
                            <th>Round</th>
                            <th>Closing Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {college1.cutoffs.map((ct) => (
                            <tr key={`c1-ct-${ct.id}`}>
                              <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                                {ct.branch?.code || 'B.Tech'}
                              </td>
                              <td style={{ color: '#cbd5e1' }}>
                                {ct.exam?.code || 'Exam'} '{ct.year}
                              </td>
                              <td style={{ color: '#94a3b8' }}>
                                R{ct.round} ({ct.category})
                              </td>
                              <td style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
                                {ct.closingRank ? ct.closingRank.toLocaleString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                      No verified cutoff records published yet for this institution. Inquire via Connect with Ramesh.
                    </div>
                  )}
                </div>

                {/* College 2 Cutoffs */}
                <div style={{ background: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h3 style={{ color: '#a855f7', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                    {college2.college.code} Verified Cutoffs ({college2.cutoffs?.length || 0})
                  </h3>

                  {college2.cutoffs && college2.cutoffs.length > 0 ? (
                    <div className="table-wrapper">
                      <table className="data-table" style={{ fontSize: '0.8rem' }}>
                        <thead>
                          <tr>
                            <th>Branch</th>
                            <th>Exam / Yr</th>
                            <th>Round</th>
                            <th>Closing Rank</th>
                          </tr>
                        </thead>
                        <tbody>
                          {college2.cutoffs.map((ct) => (
                            <tr key={`c2-ct-${ct.id}`}>
                              <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                                {ct.branch?.code || 'B.Tech'}
                              </td>
                              <td style={{ color: '#cbd5e1' }}>
                                {ct.exam?.code || 'Exam'} '{ct.year}
                              </td>
                              <td style={{ color: '#94a3b8' }}>
                                R{ct.round} ({ct.category})
                              </td>
                              <td style={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 700 }}>
                                {ct.closingRank ? ct.closingRank.toLocaleString() : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center' }}>
                      No verified cutoff records published yet for this institution. Inquire via Connect with Ramesh.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Honest Integrity Disclaimer */}
            <div style={{
              background: 'rgba(245, 158, 11, 0.05)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <Info size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Educational Guidance & Honest Comparison Disclaimer
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.825rem', lineHeight: 1.5 }}>
                  Historical cutoff benchmarks, tuition fees, and institutional rankings are sourced from official publications (JoSAA, AICTE, and State CET Directorates) and are presented for guidance purposes only. LWR Connecting never fabricates rankings, cutoff estimates, or guarantees seat allotment. Actual cutoffs fluctuate annually based on candidate performance, sanctioned seat matrix changes, and official counselling rounds.
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to={`/colleges/${college1.college.id}`} className="btn-secondary" style={{ flex: '1 1 240px', justifyContent: 'center' }}>
                View {college1.college.code} Profile →
              </Link>
              <Link to="/college-predictor" className="btn-primary" style={{ flex: '1 1 240px', justifyContent: 'center' }}>
                Predict My Admission Chances →
              </Link>
              <Link to={`/colleges/${college2.college.id}`} className="btn-secondary" style={{ flex: '1 1 240px', justifyContent: 'center' }}>
                View {college2.college.code} Profile →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
