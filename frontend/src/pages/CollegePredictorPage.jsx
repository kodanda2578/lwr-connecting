import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Award,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CollegePredictorPage() {
  const [exams, setExams] = useState([]);
  const [branches, setBranches] = useState([]);
  const [states, setStates] = useState([]);

  const [selectedExam, setSelectedExam] = useState('');
  const [userRank, setUserRank] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('OC');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedGovStatus, setSelectedGovStatus] = useState('');
  const [selectedHomeState, setSelectedHomeState] = useState('');
  const [selectedGender, setSelectedGender] = useState('NEUTRAL');
  
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [exList, brList, stList] = await Promise.all([
        apiService.getExams(),
        apiService.getBranchesList(),
        apiService.getStates()
      ]);
      setExams(exList || []);
      setBranches(brList || []);
      setStates(stList || []);
      if (exList && exList.length > 0) {
        setSelectedExam(exList[0].id);
      }
    } catch (e) {
      console.error('Error loading predictor options:', e);
    }
  };

  const executePredict = async (targetPage = 0) => {
    setValidationError('');

    const parsedRank = parseInt(userRank, 10);
    if (!selectedExam) {
      setValidationError('Please select an entrance examination.');
      return;
    }
    if (!userRank || isNaN(parsedRank) || parsedRank <= 0) {
      setValidationError('Please enter a valid positive rank (e.g. 5000).');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const res = await apiService.predictCollegesList(
        selectedExam,
        parsedRank,
        selectedCategory,
        selectedBranch,
        selectedHomeState,
        selectedGender,
        targetPage,
        12
      );
      
      let contentList = [];
      if (res && res.content) {
        contentList = res.content;
        setCurrentPage(res.number || targetPage);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || res.content.length);
      } else if (Array.isArray(res)) {
        contentList = res;
        setCurrentPage(0);
        setTotalPages(1);
        setTotalElements(res.length);
      } else {
        contentList = [];
        setTotalPages(1);
        setTotalElements(0);
      }

      // Apply preferred state and gov/private filter if selected
      let filtered = contentList;
      if (selectedState) {
        filtered = filtered.filter(item => item.college?.state && String(item.college.state.id) === String(selectedState));
      }
      if (selectedGovStatus) {
        filtered = filtered.filter(item => {
          const status = (item.college?.governmentStatus || '').toLowerCase();
          if (selectedGovStatus === 'Government') return status.includes('govt') || status.includes('government');
          if (selectedGovStatus === 'Deemed') return status.includes('deemed');
          if (selectedGovStatus === 'Private') return status.includes('private') || status.includes('autonomous');
          return true;
        });
      }

      setResults(filtered);
    } catch (e) {
      console.error('Prediction query failed:', e);
      setValidationError('Failed to retrieve verified cutoff prediction results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    executePredict(0);
  };

  const selectedExamObj = exams.find(e => String(e.id) === String(selectedExam));
  const selectedBranchObj = branches.find(b => String(b.id) === String(selectedBranch));

  const getStatusBadge = (chanceCategory) => {
    switch (chanceCategory) {
      case 'Historically within range':
        return { label: 'Historically within range', className: 'badge-green', desc: 'Rank is at or better than historical closing rank' };
      case 'Borderline':
      case 'Competitive':
        return { label: 'Borderline', className: 'badge-amber', desc: 'Rank is close to historical cutoff boundary (within 10%)' };
      case 'Historically outside range':
      default:
        return { label: 'Historically outside range', className: 'badge-purple', desc: 'Rank was outside previous years closing cutoffs' };
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '1140px' }}>

        {/* Page Hero Header */}
        <div className="page-hero">
          <div className="page-hero-badge">
            <Sparkles size={14} /> Official Historical Cutoff Engine
          </div>
          <h1 className="page-hero-title">
            College Predictor & Competitiveness Evaluator
          </h1>
          <p className="page-hero-subtitle">
            Find matching B.Tech programs and evaluate admission competitiveness based strictly on verified historical closing ranks from official state and national counselling datasets.
          </p>
        </div>

        {/* Methodology & Safety Guide Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} color="#10b981" /> Historically within range
            </div>
            <div style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Your entrance rank is numerically equal to or better than the official closing rank from the previous counselling session.
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <AlertCircle size={16} color="#f59e0b" /> Borderline
            </div>
            <div style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Your rank is close to the cutoff margin (within 10% or 500 ranks). Seat allotment depends on candidate competition.
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Info size={16} color="#06b6d4" /> Strict No-Fabrication Policy
            </div>
            <div style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
              No artificial percentage chances are invented. All evaluations derive strictly from official JoSAA, APSCHE, and TGCHE records.
            </div>
          </div>
        </div>

        {/* Predictor Form Inside Glass Card */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <form onSubmit={handlePredict}>
            <div className="filter-grid-3" style={{ marginBottom: '1.25rem' }}>
              {/* Exam Select */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-exam">
                  Entrance Examination <span style={{ color: '#06b6d4' }}>*</span>
                </label>
                <select
                  id="predictor-exam"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="form-control form-select"
                  required
                >
                  <option value="">-- Select Exam --</option>
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                  ))}
                </select>
              </div>

              {/* Rank Input */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-rank">
                  Your Entrance Rank <span style={{ color: '#06b6d4' }}>*</span>
                </label>
                <input
                  id="predictor-rank"
                  type="number"
                  min="1"
                  max="1000000"
                  placeholder="e.g. 5000"
                  value={userRank}
                  onChange={(e) => {
                    setUserRank(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="form-control"
                  required
                />
              </div>

              {/* Category Select */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-category">Counselling Category</label>
                <select
                  id="predictor-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="OC">OC (Open Competition / General)</option>
                  <option value="BC_A">BC-A</option>
                  <option value="BC_B">BC-B</option>
                  <option value="BC_C">BC-C</option>
                  <option value="BC_D">BC-D</option>
                  <option value="BC_E">BC-E</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div className="filter-grid-3">
              {/* Branch Select */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-branch">Preferred Branch (Optional)</label>
                <select
                  id="predictor-branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              {/* Preferred State */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-state">Preferred State (Optional)</label>
                <select
                  id="predictor-state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">All States in India</option>
                  {states.filter(s => s.code !== 'ALL_INDIA').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Institution Type Preference */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-gov">Ownership Preference (Optional)</label>
                <select
                  id="predictor-gov"
                  value={selectedGovStatus}
                  onChange={(e) => setSelectedGovStatus(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">All Types (Govt / Private / Deemed)</option>
                  <option value="Government">Government / State Univ</option>
                  <option value="Deemed">Deemed University</option>
                  <option value="Private">Private / Autonomous</option>
                </select>
              </div>
            </div>

            <div className="filter-grid-2" style={{ marginTop: '1.25rem' }}>
              {/* Home State / Domicile */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-homestate">Home State / Domicile (Optional)</label>
                <select
                  id="predictor-homestate"
                  value={selectedHomeState}
                  onChange={(e) => setSelectedHomeState(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="">All Regions / Open Quota</option>
                  {states.filter(s => s.code !== 'ALL_INDIA').map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Gender / Seat Pool */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="predictor-gender">Gender / Seat Pool</label>
                <select
                  id="predictor-gender"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="form-control form-select"
                >
                  <option value="NEUTRAL">Gender-Neutral Pool</option>
                  <option value="FEMALE_ONLY">Female-Only Pool</option>
                </select>
              </div>
            </div>

            {/* Validation Message */}
            {validationError && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', minWidth: '280px', justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner" style={{ width: '18px', height: '18px', margin: 0, borderWidth: '2px' }}></span>
                    Evaluating Historical Cutoffs...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Find Matching Colleges & Branches
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Mandatory Historical Cutoff Legal Notice */}
          <div style={{
            marginTop: '2rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem'
          }}>
            <ShieldCheck size={16} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#cbd5e1' }}>IMPORTANT ADMISSION DISCLAIMER:</strong> Historical cutoff matching is purely an educational benchmark derived from previous years' official counselling seat allotments (JoSAA, APSCHE, TGCHE, KEA). Real admission depends on actual candidate choice filling, question paper difficulty, seat pool fluctuations, and official reservation norms for the current year. Admission is never guaranteed solely based on past cutoffs.
            </div>
          </div>
        </div>

        {/* Prediction Results Section */}
        {searched && (
          <div style={{ marginTop: '2.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem',
              background: 'rgba(15, 23, 42, 0.6)',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
                  Verified Historical College Matches ({results.length})
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Exam: <strong style={{ color: '#ffffff' }}>{selectedExamObj?.name || 'Selected Exam'}</strong> • 
                  Rank: <strong style={{ color: '#06b6d4' }}>{Number(userRank).toLocaleString()}</strong> • 
                  Category: <strong style={{ color: '#c084fc' }}>{selectedCategory}</strong>
                  {selectedBranchObj ? ` • Branch: ${selectedBranchObj.name}` : ''}
                  {selectedState ? ' • Filtered by Preferred State' : ''}
                </div>
              </div>

              <span className="badge badge-cyan" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                {results.length} Eligible Programs
              </span>
            </div>

            {loading ? (
              <div className="state-box">
                <div className="loading-spinner"></div>
                <div className="state-box-title">Analyzing Cutoffs...</div>
                <div className="state-box-desc">Cross-referencing Rank {userRank} against verified opening & closing ranks</div>
              </div>
            ) : results.length === 0 ? (
              <div className="state-box">
                <div className="state-box-icon">
                  <Building2 size={28} />
                </div>
                <div className="state-box-title" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
                  No verified historical cutoff records match this combination.
                </div>
                <div className="state-box-desc" style={{ maxWidth: '600px', margin: '0.5rem auto 1.5rem auto' }}>
                  No historical closing ranks in the verified database matched Rank {userRank} for category {selectedCategory}. Try choosing "All Branches" or adjusting state and category preferences.
                </div>
              </div>
            ) : (
              <div className="cards-grid-2">
                {results.map((item, idx) => {
                  const badge = getStatusBadge(item.chanceCategory);
                  const margin = item.difference != null ? item.difference : (item.closingRank - item.userRank);

                  return (
                    <div key={idx} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Status Badge & Closing Rank */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span className={`badge ${badge.className}`} style={{ fontWeight: 700, fontSize: '0.8rem' }}>
                            {badge.label}
                          </span>
                          
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            Closing Rank: <strong style={{ color: '#ffffff', fontFamily: 'monospace', fontSize: '0.95rem' }}>{item.closingRank?.toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* College Name & Branch */}
                        <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.35rem', lineHeight: 1.35 }}>
                          {item.college?.name}
                        </h3>

                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#06b6d4', marginBottom: '0.75rem' }}>
                          {item.branch?.name} ({item.branch?.code})
                        </div>

                        {/* Location */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                          <MapPin size={14} color="#06b6d4" />
                          <span>
                            {item.college?.city || item.college?.location || 'Engineering College'}
                            {item.college?.state ? ` • ${item.college.state.name}` : ''}
                          </span>
                        </div>

                        {/* Why this matches insight */}
                        {item.whyMatches && (
                          <div style={{
                            background: 'rgba(6, 182, 212, 0.08)',
                            borderLeft: '3px solid #06b6d4',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '0 8px 8px 0',
                            fontSize: '0.8rem',
                            color: '#e2e8f0',
                            marginBottom: '1rem',
                            lineHeight: 1.45
                          }}>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Why this matches: </span>
                            {item.whyMatches}
                          </div>
                        )}

                        {/* Three Structured Evaluation Dimensions */}
                        <div style={{
                          fontSize: '0.8rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '0.85rem 1rem',
                          marginBottom: '1.25rem',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '0.65rem'
                        }}>
                          <div>
                            <span style={{ color: '#94a3b8', display: 'block' }}>1. Historical Cutoff Comparison:</span>
                            <strong style={{ color: margin >= 0 ? '#10b981' : '#f87171', fontFamily: 'monospace' }}>
                              {margin >= 0 ? `+${margin.toLocaleString()} ranks within closing cutoff` : `${margin.toLocaleString()} ranks past cutoff`}
                            </strong>
                          </div>

                          <div>
                            <span style={{ color: '#94a3b8', display: 'block' }}>2. Estimated Competitiveness:</span>
                            <strong style={{ color: '#f8fafc' }}>{badge.desc}</strong>
                          </div>

                          <div>
                            <span style={{ color: '#94a3b8', display: 'block' }}>Category & Seat Pool:</span>
                            <strong style={{ color: '#cbd5e1' }}>{item.category || 'General / All India'} {item.gender ? `(${item.gender})` : ''}</strong>
                          </div>

                          <div>
                            <span style={{ color: '#94a3b8', display: 'block' }}>3. Counselling Dataset & Year:</span>
                            <strong style={{ color: '#cbd5e1' }}>{item.year || '2024'} (Round {item.round || 1})</strong>
                          </div>
                        </div>

                        {item.disclaimer && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                            ℹ️ {item.disclaimer}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div style={{
                        paddingTop: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem'
                      }}>
                        <span style={{ fontSize: '0.725rem', color: '#64748b', maxWidth: '240px', lineHeight: 1.3 }}>
                          Source: {item.sourceReference || 'State Counselling Allotment Data'}
                        </span>

                        {item.college?.id && (
                          <Link
                            to={`/colleges/${item.college.id}`}
                            className="btn-secondary"
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                          >
                            College Details <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '2rem',
                padding: '1rem',
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  type="button"
                  onClick={() => executePredict(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}
                >
                  ← Previous
                </button>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  Page <strong style={{ color: '#ffffff' }}>{currentPage + 1}</strong> of <strong style={{ color: '#ffffff' }}>{totalPages}</strong> ({totalElements} matches)
                </span>
                <button
                  type="button"
                  onClick={() => executePredict(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
