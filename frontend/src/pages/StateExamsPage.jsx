import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Search, Filter, Building2, Compass, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function StateExamsPage() {
  const [exams, setExams] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examList, stateList] = await Promise.all([
        apiService.getExams('STATE'),
        apiService.getStates()
      ]);
      setExams(examList || []);
      setStates(stateList || []);
    } catch (e) {
      console.error('Failed to load state exams:', e);
    } finally {
      setLoading(false);
    }
  };

  const getAuthority = (code) => {
    const authorities = {
      AP_EAPCET: 'JNTU Kakinada on behalf of APSCHE',
      TS_EAMCET: 'JNTU Hyderabad on behalf of TGCHE',
      TG_EAPCET: 'JNTU Hyderabad on behalf of TGCHE',
      KCET: 'Karnataka Examinations Authority (KEA)',
      MHT_CET: 'State Common Entrance Test Cell, Maharashtra',
      WBJEE: 'West Bengal Joint Entrance Examinations Board',
      KEAM: 'Commissioner for Entrance Examinations (CEE), Kerala',
      GUJCET: 'Gujarat Secondary & Higher Secondary Education Board',
      TNEA: 'Directorate of Technical Education (DoTE), Tamil Nadu',
      COMEDK: 'Consortium of Medical, Engineering and Dental Colleges of Karnataka'
    };
    return authorities[code] || 'State Technical Higher Education Department';
  };

  const filteredExams = exams.filter((exam) => {
    const stateMatch = !selectedState || (exam.state && String(exam.state.id) === String(selectedState));
    const searchMatch = !searchTerm ||
      exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.state && exam.state.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return stateMatch && searchMatch;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        
        {/* Page Hero Header */}
        <div className="page-hero">
          <div className="page-hero-badge">
            <Award size={14} /> State Engineering Admissions
          </div>
          <h1 className="page-hero-title">
            State Engineering Entrance Exams
          </h1>
          <p className="page-hero-subtitle">
            Explore state-specific entrance exams, conducting authorities, participating colleges, and historical cutoffs across Andhra Pradesh, Telangana, and other major states.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="filter-panel">
          <div className="filter-grid-2" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="search-exam">
                Search Exam or State
              </label>
              <div className="input-icon-wrapper">
                <Search size={18} />
                <input
                  id="search-exam"
                  type="text"
                  placeholder="e.g. AP EAPCET, KCET, MHT-CET, WBJEE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="select-state">
                Filter by State
              </label>
              <select
                id="select-state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All States in India</option>
                {states.filter(s => s.code !== 'ALL_INDIA').map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exam Cards Grid */}
        {loading ? (
          <div className="state-box">
            <div className="loading-spinner"></div>
            <div className="state-box-title">Loading State Entrance Exams...</div>
            <div className="state-box-desc">Fetching verified official state entrance test details</div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="state-box">
            <div className="state-box-icon">
              <Award size={28} />
            </div>
            <div className="state-box-title">No State Entrance Exams Found</div>
            <div className="state-box-desc">
              No entrance exams matched your search criteria. Try selecting "All States" or clearing the search query.
            </div>
          </div>
        ) : (
          <div className="cards-grid-3">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-cyan" style={{ gap: '0.35rem' }}>
                      <MapPin size={12} /> {exam.state ? exam.state.name : 'State Level'}
                    </span>
                    <span className="badge badge-purple" style={{ fontFamily: 'monospace' }}>
                      {exam.code}
                    </span>
                  </div>

                  {/* Exam Name */}
                  <h3 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                    {exam.name}
                  </h3>

                  {/* Conducting Authority */}
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#94a3b8',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <ShieldCheck size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <strong style={{ color: '#cbd5e1', display: 'block', marginBottom: '0.15rem' }}>Conducting Authority:</strong>
                      <span>{getAuthority(exam.code)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    {exam.description || 'Official State Engineering Admission Pathway.'}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div style={{
                  paddingTop: '1.25rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <Link
                    to={`/colleges?examId=${exam.id}`}
                    className="btn-primary"
                    style={{ fontSize: '0.825rem', padding: '0.55rem 1rem' }}
                  >
                    <Building2 size={14} /> View Colleges
                  </Link>

                  <Link
                    to={`/cutoffs?examId=${exam.id}`}
                    className="btn-secondary"
                    style={{ fontSize: '0.825rem', padding: '0.55rem 1rem' }}
                  >
                    <Compass size={14} /> Cutoffs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
