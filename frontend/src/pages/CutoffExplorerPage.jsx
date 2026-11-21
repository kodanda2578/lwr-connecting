import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Filter, ShieldCheck, CheckCircle2, Search, ArrowUpDown, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CutoffExplorerPage() {
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';
  const initialCollegeId = searchParams.get('collegeId') || '';

  const [cutoffs, setCutoffs] = useState([]);
  const [exams, setExams] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [states, setStates] = useState([]);

  // Filters
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [selectedCollege, setSelectedCollege] = useState(initialCollegeId);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRound, setSelectedRound] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [loading, setLoading] = useState(true);

  // Sorting & Pagination
  const [sortField, setSortField] = useState('closingRank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 15;

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    fetchCutoffs();
  }, [selectedExam, selectedCollege, selectedBranch, selectedCategory, selectedYear, selectedRound, selectedState]);

  const loadFilters = async () => {
    try {
      const [exList, colList, brList, stList] = await Promise.all([
        apiService.getExams(),
        apiService.getCollegesList(),
        apiService.getBranchesList(),
        apiService.getStates()
      ]);
      setExams(exList || []);
      setColleges(colList?.content || (Array.isArray(colList) ? colList : []));
      setBranches(brList || []);
      setStates(stList || []);
    } catch (e) {
      console.error('Error loading cutoff filters:', e);
    }
  };

  const fetchCutoffs = async () => {
    setLoading(true);
    try {
      const list = await apiService.getCutoffsList({
        examId: selectedExam,
        collegeId: selectedCollege,
        branchId: selectedBranch,
        category: selectedCategory,
        year: selectedYear,
        round: selectedRound,
        stateId: selectedState
      });

      // Filter locally for round and state if provided
      let filtered = list || [];
      if (selectedRound) {
        filtered = filtered.filter(c => String(c.round) === String(selectedRound));
      }
      if (selectedState) {
        filtered = filtered.filter(c => c.college && c.college.state && String(c.college.state.id) === String(selectedState));
      }

      setCutoffs(filtered);
    } catch (e) {
      console.error('Error fetching cutoffs:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedExam('');
    setSelectedCollege('');
    setSelectedBranch('');
    setSelectedCategory('');
    setSelectedYear('');
    setSelectedRound('');
    setSelectedState('');
    setCurrentPage(0);
  };

  const isVerifiedOfficial = (source) => {
    if (!source) return false;
    const s = source.toLowerCase();
    return s.includes('official') || s.includes('apsche') || s.includes('jntu') || s.includes('josaa') || s.includes('kea') || s.includes('cet') || s.includes('tnea');
  };

  const getSourcePortalUrl = (source, examCode) => {
    if (!source) return 'https://josaa.nic.in/';
    const s = source.toLowerCase();
    if (s.includes('josaa')) return 'https://josaa.nic.in/';
    if (s.includes('apsche') || (examCode && examCode.includes('EAPCET'))) return 'https://eapcet-sche.aptonline.in/';
    if (s.includes('tgche') || s.includes('tsche') || (examCode && examCode.includes('TG'))) return 'https://tgeamcet.nic.in/';
    if (s.includes('kea') || (examCode && examCode.includes('KCET'))) return 'https://cetonline.karnataka.gov.in/';
    if (s.includes('tnea')) return 'https://www.tneaonline.org/';
    if (s.includes('mht')) return 'https://cetcell.mahacet.org/';
    return 'https://josaa.nic.in/';
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(0);
  };

  const sortedCutoffs = [...cutoffs].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'college') {
      valA = a.college?.name || '';
      valB = b.college?.name || '';
    } else if (sortField === 'branch') {
      valA = a.branch?.name || '';
      valB = b.branch?.name || '';
    }

    if (valA == null) return 1;
    if (valB == null) return -1;

    if (typeof valA === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const totalPages = Math.ceil(sortedCutoffs.length / pageSize) || 1;
  const paginatedCutoffs = sortedCutoffs.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Page Hero Header */}
        <div className="page-hero">
          <div className="page-hero-badge">
            <Compass size={14} /> Official Verified Benchmarks
          </div>
          <h1 className="page-hero-title">
            Cutoff Explorer & Historical Ranks
          </h1>
          <p className="page-hero-subtitle">
            Explore authentic opening and closing ranks from official state admissions counselling (APSCHE, TGCHE, JoSAA, KEA, TNEA) across colleges, branches, categories, and rounds.
          </p>
        </div>

        {/* Multi-Filter Bar */}
        <div className="filter-panel">
          <div className="filter-grid-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {/* Exam */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-exam">Entrance Exam</label>
              <select
                id="filter-cutoff-exam"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Exams</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-state">State</label>
              <select
                id="filter-cutoff-state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All States</option>
                {states.filter(s => s.code !== 'ALL_INDIA').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* College */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-college">College</label>
              <select
                id="filter-cutoff-college"
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Colleges</option>
                {colleges.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-branch">Branch</label>
              <select
                id="filter-cutoff-branch"
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

            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-category">Category</label>
              <select
                id="filter-cutoff-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Categories</option>
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

            {/* Admission Year */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-year">Admission Year</label>
              <select
                id="filter-cutoff-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Years</option>
                <option value="2024">2024 (Latest)</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            {/* Round */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-cutoff-round">Counselling Round</label>
              <select
                id="filter-cutoff-round"
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Rounds</option>
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
                <option value="3">Round 3 / Final</option>
              </select>
            </div>
          </div>

          {(selectedExam || selectedCollege || selectedBranch || selectedCategory || selectedYear || selectedRound || selectedState) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Showing filtered records (<strong>{cutoffs.length}</strong> verified cutoffs)
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Cutoff Table Container */}
        {loading ? (
          <div className="state-box">
            <div className="loading-spinner"></div>
            <div className="state-box-title">Loading Cutoff Records...</div>
            <div className="state-box-desc">Retrieving verified opening & closing ranks from official databases</div>
          </div>
        ) : cutoffs.length === 0 ? (
          <div className="state-box">
            <div className="state-box-icon">
              <Compass size={28} />
            </div>
            <div className="state-box-title" style={{ fontSize: '1.25rem', color: '#ffffff' }}>
              No verified cutoff data is currently available for this combination.
            </div>
            <div className="state-box-desc" style={{ maxWidth: '600px', margin: '0.5rem auto 1.5rem auto' }}>
              No official historical opening or closing ranks exist in the verified dataset for the selected exam, branch, category, or round. Try resetting one or more filters to view verified benchmarks.
            </div>
            <button
              onClick={handleResetFilters}
              className="btn-primary"
              style={{ padding: '0.55rem 1.35rem', fontSize: '0.85rem' }}
            >
              Reset Filters & Show Available Cutoffs
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Exam & Authority</th>
                  <th onClick={() => toggleSort('college')} style={{ cursor: 'pointer' }} title="Click to sort by College Name">
                    College Name <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th onClick={() => toggleSort('branch')} style={{ cursor: 'pointer' }} title="Click to sort by Branch">
                    Branch / Program <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th onClick={() => toggleSort('year')} style={{ cursor: 'pointer' }} title="Click to sort by Year">
                    Year & Round <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th>Category / Pool</th>
                  <th onClick={() => toggleSort('openingRank')} style={{ cursor: 'pointer' }} title="Click to sort by Opening Rank">
                    Opening Rank <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th onClick={() => toggleSort('closingRank')} style={{ cursor: 'pointer' }} title="Click to sort by Closing Rank">
                    Closing Rank <ArrowUpDown size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                  </th>
                  <th>Official Source & Verification</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCutoffs.map((c) => {
                  const verified = isVerifiedOfficial(c.sourceReference);
                  const portalUrl = getSourcePortalUrl(c.sourceReference, c.exam?.code);

                  return (
                    <tr key={c.id}>
                      {/* Exam & Authority */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span className="badge badge-purple" style={{ fontFamily: 'monospace', alignSelf: 'flex-start' }}>
                            {c.exam ? c.exam.code : 'EXAM'}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                            {c.college?.admissionAuthority || 'State Authority'}
                          </span>
                        </div>
                      </td>

                      {/* College */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff', maxWidth: '240px', lineHeight: 1.35 }}>
                          {c.college ? c.college.name : 'Engineering College'}
                        </div>
                        {c.college?.city && (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                            <MapPin size={11} color="#06b6d4" /> {c.college.city}{c.college.state ? ` (${c.college.state.code || c.college.state.name})` : ''}
                          </span>
                        )}
                      </td>

                      {/* Branch */}
                      <td>
                        <div style={{ fontWeight: 500, color: '#f8fafc' }}>
                          {c.branch ? c.branch.name : 'Branch'}
                        </div>
                        {c.branch?.code && (
                          <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontFamily: 'monospace' }}>
                            {c.branch.code}
                          </span>
                        )}
                      </td>

                      {/* Year & Round */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#cbd5e1' }}>
                          {c.year}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Round {c.round || 1}
                        </span>
                      </td>

                      {/* Category */}
                      <td>
                        <span className="badge badge-cyan">
                          {c.category || 'OC'}
                        </span>
                      </td>

                      {/* Opening Rank */}
                      <td>
                        <span style={{ color: c.openingRank ? '#10b981' : '#64748b', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                          {c.openingRank ? c.openingRank.toLocaleString() : '—'}
                        </span>
                      </td>

                      {/* Closing Rank */}
                      <td>
                        <span style={{ color: '#06b6d4', fontWeight: 800, fontFamily: 'monospace', fontSize: '1rem' }}>
                          {c.closingRank ? c.closingRank.toLocaleString() : '—'}
                        </span>
                      </td>

                      {/* Source Reference & Verification */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <span className={verified ? 'badge badge-green' : 'badge badge-gray'} style={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}>
                            {verified ? <><ShieldCheck size={11} style={{ marginRight: '3px' }} /> Verified Official</> : 'Historical Data'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '240px', lineHeight: 1.3 }}>
                            {c.sourceReference || 'State Counselling Seat Allotment Data'}
                          </span>
                          <a
                            href={portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.725rem',
                              color: '#06b6d4',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              textDecoration: 'none'
                            }}
                          >
                            Official Portal <ExternalLink size={10} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(15, 23, 42, 0.4)',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                  Showing records {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, sortedCutoffs.length)} of <strong>{sortedCutoffs.length}</strong>
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    ← Previous
                  </button>
                  <span style={{ fontSize: '0.825rem', color: '#ffffff', fontWeight: 600 }}>
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="btn-secondary"
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
