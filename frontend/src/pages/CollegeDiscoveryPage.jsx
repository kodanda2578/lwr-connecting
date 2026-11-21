import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  GitCompare, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  CreditCard, 
  Calendar,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function CollegeDiscoveryPage() {
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const [colleges, setColleges] = useState([]);
  const [states, setStates] = useState([]);
  const [exams, setExams] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingestionInfo, setIngestionInfo] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Online Lookup state
  const [onlineResults, setOnlineResults] = useState(null);
  const [searchingOnline, setSearchingOnline] = useState(false);
  const [onlineMessage, setOnlineMessage] = useState('');
  const [onlineLinks, setOnlineLinks] = useState([]);

  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [selectedGovStatus, setSelectedGovStatus] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedAffiliation, setSelectedAffiliation] = useState('');
  const [selectedAccreditation, setSelectedAccreditation] = useState('');
  const [selectedVerificationStatus, setSelectedVerificationStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    loadFilters();
    loadIngestionStatus();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
    setOnlineResults(null);
    setOnlineLinks([]);
  }, [selectedState, selectedExam, selectedGovStatus, selectedBranch, selectedAffiliation, selectedAccreditation, selectedVerificationStatus, searchQuery]);

  useEffect(() => {
    fetchColleges();
  }, [selectedState, selectedExam, selectedGovStatus, selectedBranch, selectedAffiliation, selectedAccreditation, selectedVerificationStatus, searchQuery, currentPage, pageSize]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadFilters = async () => {
    try {
      const [stList, exList, brList] = await Promise.all([
        apiService.getStates(),
        apiService.getExams(),
        apiService.getBranchesList()
      ]);
      setStates(stList || []);
      setExams(exList || []);
      setBranches(brList || []);
    } catch (e) {
      console.error('Error loading filters:', e);
    }
  };

  const loadIngestionStatus = async () => {
    try {
      const status = await apiService.getDataIngestionStatus();
      if (status) {
        setIngestionInfo(status);
      }
    } catch (e) {
      // silently fallback
    }
  };

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCollegesList({
        stateId: selectedState,
        examId: selectedExam,
        govStatus: selectedGovStatus,
        branchId: selectedBranch,
        affiliation: selectedAffiliation,
        accreditation: selectedAccreditation,
        verificationStatus: selectedVerificationStatus,
        search: searchQuery,
        page: currentPage,
        size: pageSize
      });

      if (res && res.content) {
        setColleges(res.content);
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || res.content.length);
      } else if (Array.isArray(res)) {
        setColleges(res);
        setTotalPages(1);
        setTotalElements(res.length);
      } else {
        setColleges([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (e) {
      console.error('Error fetching colleges:', e);
      setColleges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    setSearchingOnline(true);
    setOnlineMessage('');
    try {
      const res = await apiService.onlineCollegeSearch(searchQuery.trim());
      setOnlineResults(res?.items || res?.results || []);
      setOnlineMessage(res?.message || '');
      setOnlineLinks(res?.officialSearchLinks || []);
    } catch (e) {
      setOnlineResults([]);
      setOnlineMessage('Online directory verification service is temporarily unreachable.');
      setOnlineLinks([]);
    } finally {
      setSearchingOnline(false);
    }
  };

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      try {
        const suggs = await apiService.getCollegeSuggestions(val);
        setSuggestions(suggs || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (sugg) => {
    setSearchQuery(sugg.name);
    setShowSuggestions(false);
  };

  const handleResetFilters = () => {
    setSelectedState('');
    setSelectedExam('');
    setSelectedGovStatus('');
    setSelectedBranch('');
    setSelectedAffiliation('');
    setSelectedAccreditation('');
    setSelectedVerificationStatus('');
    setSearchQuery('');
  };

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Page Hero Header */}
        <div className="page-hero">
          <div className="page-hero-badge">
            <Building2 size={14} /> All-India Engineering College Directory
          </div>
          <h1 className="page-hero-title">
            All-India B.Tech College Directory
          </h1>
          <p className="page-hero-subtitle">
            Explore verified government, autonomous, and premier private institutions across India — including IITs, NITs, BITS, KL University, VIT, and state universities with authentic cutoffs and fees.
          </p>
        </div>

        {/* Ingestion & Verification Trust Banner */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.05)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#06b6d4',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
                Verified Official Repository & JoSAA / APSCHE / TGCHE Datasets
              </div>
              <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                {ingestionInfo 
                  ? `${ingestionInfo.verifiedCollegesCount || colleges.length} verified premier colleges indexed • ${ingestionInfo.verifiedCutoffsCount || 50} official cutoff benchmarks • Safe upserts active`
                  : 'Official institution records cross-verified against AICTE, JoSAA, APSCHE, and state counselling databases.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
              <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> AICTE & State Verified
            </span>
            <Link to="/compare-colleges" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              <GitCompare size={14} /> Compare Colleges
            </Link>
          </div>
        </div>

        {/* Multi-Filter Bar with Search Suggestions */}
        <div className="filter-panel" style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {/* Search Input with Autocomplete */}
            <div className="form-group" style={{ marginBottom: 0, position: 'relative', gridColumn: 'span 2' }} ref={searchContainerRef}>
              <label htmlFor="search-college">Search Name / Code / City / PIN</label>
              <div className="input-icon-wrapper">
                <Search size={18} />
                <input
                  id="search-college"
                  type="text"
                  placeholder="e.g. KL University, IIT, AUCE, 522502..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  className="form-control"
                  autoComplete="off"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  background: '#090d1a',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  borderRadius: '10px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.85)',
                  zIndex: 100,
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map((sugg) => (
                    <div
                      key={sugg.id}
                      onClick={() => handleSelectSuggestion(sugg)}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                          {sugg.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {sugg.city ? `${sugg.city}, ` : ''}{sugg.stateName || 'India'}
                        </div>
                      </div>
                      <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {sugg.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* State Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-state">State / Region</label>
              <select
                id="filter-state"
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

            {/* Entrance Exam Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-exam">Admission Route / Exam</label>
              <select
                id="filter-exam"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Entrance Exams</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                ))}
              </select>
            </div>

            {/* Branch / Course Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-branch">Course / Branch</label>
              <select
                id="filter-branch"
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

            {/* Ownership Type */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-status">Institution Type</label>
              <select
                id="filter-status"
                value={selectedGovStatus}
                onChange={(e) => setSelectedGovStatus(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Ownership Types</option>
                <option value="Government">Government / State Univ</option>
                <option value="Deemed">Deemed University</option>
                <option value="Private">Private / Autonomous</option>
                <option value="Govt-Aided">Government-Aided</option>
              </select>
            </div>

            {/* Affiliation Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-affiliation">University Affiliation</label>
              <select
                id="filter-affiliation"
                value={selectedAffiliation}
                onChange={(e) => setSelectedAffiliation(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Affiliations</option>
                <option value="Autonomous">Autonomous Institutions</option>
                <option value="Deemed">Deemed Universities</option>
                <option value="National Importance">Institutes of National Importance</option>
                <option value="JNTUK">JNTUK, Kakinada</option>
                <option value="JNTUH">JNTUH, Hyderabad</option>
                <option value="Andhra University">Andhra University</option>
                <option value="Osmania">Osmania University</option>
                <option value="Anna University">Anna University</option>
                <option value="VTU">VTU Karnataka</option>
                <option value="SPPU">SPPU Pune</option>
              </select>
            </div>

            {/* Accreditation Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-accreditation">Accreditation & NIRF</label>
              <select
                id="filter-accreditation"
                value={selectedAccreditation}
                onChange={(e) => setSelectedAccreditation(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Accreditations</option>
                <option value="NAAC A++">NAAC A++ Accredited</option>
                <option value="NAAC A+">NAAC A+ Accredited</option>
                <option value="NBA">NBA Tier-1 / Accredited</option>
                <option value="NIRF Top 100">NIRF Top 100 Ranked</option>
              </select>
            </div>

            {/* Verification Status Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="filter-verification">Verification Status</label>
              <select
                id="filter-verification"
                value={selectedVerificationStatus}
                onChange={(e) => setSelectedVerificationStatus(e.target.value)}
                className="form-control form-select"
              >
                <option value="">All Statuses (Verified & Provisional)</option>
                <option value="VERIFIED_OFFICIAL">Officially Verified (AICTE / JoSAA)</option>
                <option value="PROVISIONAL_IMPORT">Provisional Import (Audit Pending)</option>
              </select>
            </div>
          </div>

          {(selectedState || selectedExam || selectedGovStatus || selectedBranch || selectedAffiliation || selectedAccreditation || selectedVerificationStatus || searchQuery) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Showing <strong>{colleges.length}</strong> matching verified institutions
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

        {/* Colleges Grid */}
        {loading ? (
          <div className="state-box">
            <div className="loading-spinner"></div>
            <div className="state-box-title">Searching All-India College Directory...</div>
            <div className="state-box-desc">Retrieving verified college profiles, fee ranges, and cutoff records</div>
          </div>
        ) : colleges.length === 0 ? (
          <div>
            <div className="state-box">
              <div className="state-box-icon">
                <Building2 size={28} />
              </div>
              <div className="state-box-title">No Local College Records Found</div>
              <div className="state-box-desc">
                No verified college in the local database matched your filter criteria ("{searchQuery || 'selected filters'}"). 
                {searchQuery ? ' You can verify this institution directly against national AICTE and JoSAA official public directories.' : ' Try clearing filters or searching by name, city, or code.'}
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {searchQuery && (
                  <button 
                    onClick={handleOnlineSearch} 
                    disabled={searchingOnline}
                    className="btn-primary" 
                    style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
                  >
                    <Globe size={15} style={{ marginRight: '6px' }} />
                    {searchingOnline ? 'Querying Official Public Registries...' : 'Search Official AICTE / JoSAA Online Directory'}
                  </button>
                )}
                <button onClick={handleResetFilters} className="btn-secondary" style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}>
                  Reset Filters & View All Colleges
                </button>
              </div>
            </div>

            {/* Online Search Results Section */}
            {searchingOnline && (
              <div className="state-box" style={{ marginTop: '1.5rem' }}>
                <div className="loading-spinner"></div>
                <div className="state-box-title">Querying Official Government & National Registries...</div>
                <div className="state-box-desc">Searching AICTE Approved Institutions and JoSAA participating lists.</div>
              </div>
            )}

            {!searchingOnline && onlineResults && (
              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={20} color={onlineResults.length > 0 ? '#10b981' : '#f59e0b'} />
                  <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0 }}>
                    Official National Registry Status ({onlineResults.length} match{onlineResults.length === 1 ? '' : 'es'})
                  </h3>
                </div>

                {onlineResults.length === 0 ? (
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '1.75rem', textAlign: 'center' }}>
                    <div style={{ color: '#f59e0b', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      College Not Found in Local Database or Fast Public Index
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 auto 0.75rem', maxWidth: '640px', lineHeight: 1.5 }}>
                      {onlineMessage || `No officially approved engineering institution was found under "${searchQuery}" in our indexed repository.`}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: '1.5rem', maxWidth: '640px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
                      <strong>Integrity Guarantee:</strong> LWR Connecting never invents college details or cutoffs. You can verify this institution directly across authoritative government portals below:
                    </p>

                    {onlineLinks && onlineLinks.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                        {onlineLinks.map((link, lIdx) => (
                          <a
                            key={`link-${lIdx}`}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="glass-panel"
                            style={{
                              padding: '1rem',
                              textDecoration: 'none',
                              display: 'block',
                              border: '1px solid rgba(6, 182, 212, 0.25)',
                              background: 'rgba(6, 182, 212, 0.04)',
                              borderRadius: '8px'
                            }}
                          >
                            <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                              <span>{link.title || link.name}</span>
                              <ExternalLink size={14} />
                            </div>
                            <div style={{ color: '#94a3b8', fontSize: '0.775rem', lineHeight: 1.4 }}>
                              {link.description}
                            </div>
                          </a>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <Link
                        to="/doubt-sessions"
                        className="btn-primary"
                        style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}
                      >
                        Request College Ingestion via Connect with Ramesh
                      </Link>
                      <button onClick={handleResetFilters} className="btn-secondary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}>
                        Reset Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="cards-grid-3">
                    {onlineResults.map((item, idx) => (
                      <div key={`onl-${idx}`} className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                            ✓ {item.officialSource || item.sourceName || 'Official Source'}
                          </span>
                          <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {item.code}
                          </span>
                        </div>

                        <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                          {item.name}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                          <MapPin size={14} color="#06b6d4" />
                          <span>{item.city}, {item.state}</span>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                          <div style={{ color: '#cbd5e1', marginBottom: '0.25rem' }}>
                            <strong>Status:</strong> {item.governmentStatus || item.institutionType || 'University'}
                          </div>
                          <div style={{ color: '#cbd5e1' }}>
                            <strong>Verified:</strong> {item.lastVerified || item.retrievalDate || '2024'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          {(item.officialWebsite || item.website) && (
                            <a
                              href={item.officialWebsite || item.website}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary"
                              style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', flex: 1, justifyContent: 'center' }}
                            >
                              Official Site <ExternalLink size={13} style={{ marginLeft: '4px' }} />
                            </a>
                          )}
                          <Link
                            to="/doubt-sessions"
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', flex: 1, justifyContent: 'center' }}
                          >
                            Request Ingestion
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="cards-grid-3">
            {colleges.map((college) => {
              const isGovt = college.governmentStatus?.toLowerCase().includes('govt') || college.governmentStatus?.toLowerCase().includes('government');
              const isDeemed = college.governmentStatus?.toLowerCase().includes('deemed');

              return (
                <div key={college.id} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span className={isGovt ? 'badge badge-green' : isDeemed ? 'badge badge-cyan' : 'badge badge-purple'}>
                        {college.governmentStatus || 'University'}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {(college.verificationStatus === 'VERIFIED_OFFICIAL' || college.verificationStatus === 'VERIFIED') ? (
                          <span className="badge badge-green" title="Verified against official AICTE / JoSAA / State counselling records" style={{ fontSize: '0.7rem' }}>
                            ✓ Officially Verified
                          </span>
                        ) : (
                          <span className="badge badge-amber" title="Provisional data import pending official authority audit" style={{ fontSize: '0.7rem' }}>
                            Provisional Import
                          </span>
                        )}
                        {college.aicteApproved !== false && (
                          <span className="badge badge-green" title="AICTE Approved Institution" style={{ fontSize: '0.7rem' }}>
                            ✓ AICTE
                          </span>
                        )}
                        {college.accreditation && (
                          <span className="badge badge-purple" title="Accreditation & Quality" style={{ fontSize: '0.7rem' }}>
                            {college.accreditation}
                          </span>
                        )}
                        {college.isAutonomous && (
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                            Autonomous
                          </span>
                        )}
                        <span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {college.code}
                        </span>
                      </div>
                    </div>

                    {/* College Title */}
                    <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.45rem', lineHeight: 1.35 }}>
                      {college.name}
                    </h3>

                    {/* Location & PIN */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <MapPin size={15} color="#06b6d4" style={{ flexShrink: 0 }} />
                      <span>
                        {college.city || college.location}
                        {college.district ? `, ${college.district}` : ''}
                        {college.state ? ` (${college.state.name})` : ''}
                        {college.pincode ? ` - ${college.pincode}` : ''}
                      </span>
                    </div>

                    {/* Details Box */}
                    <div style={{
                      fontSize: '0.8rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#94a3b8' }}>Authority:</span>
                        <strong style={{ color: '#cbd5e1' }}>{college.admissionAuthority || 'State Authority'}</strong>
                      </div>

                      {college.feeRange && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CreditCard size={13} color="#06b6d4" /> Tuition Fee:
                          </span>
                          <strong style={{ color: '#10b981', fontFamily: 'monospace' }}>{college.feeRange}</strong>
                        </div>
                      )}

                      {college.affiliation && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#94a3b8' }}>Affiliation:</span>
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem', maxWidth: '170px', textAlign: 'right' }}>
                            {college.affiliation}
                          </span>
                        </div>
                      )}

                      {college.contactInfo && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#94a3b8' }}>Contact:</span>
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem', maxWidth: '170px', textAlign: 'right' }}>
                            {college.contactInfo}
                          </span>
                        </div>
                      )}

                      {college.description && (
                        <p style={{ color: '#94a3b8', margin: '0.25rem 0 0 0', lineHeight: 1.5, fontSize: '0.775rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.4rem' }}>
                          {college.description}
                        </p>
                      )}
                    </div>

                    {/* Verification & Source Tag */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ShieldCheck size={13} color="#10b981" /> Verified: {college.lastVerifiedDate || '2026-03'}
                      </span>
                      {college.admissionLink && (
                        <a 
                          href={college.admissionLink} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ color: '#06b6d4', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          Admissions <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div style={{
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <Link
                      to={`/colleges/${college.id}`}
                      className="btn-primary"
                      style={{ fontSize: '0.825rem', padding: '0.55rem 1rem', flex: 1, justifyContent: 'center' }}
                    >
                      View Profile & Cutoffs <ArrowRight size={14} />
                    </Link>

                    <Link
                      to={`/compare-colleges?c1=${college.id}`}
                      className="btn-secondary"
                      style={{ fontSize: '0.825rem', padding: '0.55rem 0.9rem' }}
                      title="Compare this college"
                    >
                      <GitCompare size={14} /> Compare
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2.5rem',
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="btn-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', opacity: currentPage === 0 ? 0.5 : 1 }}
            >
              ← Previous Page
            </button>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Page <strong style={{ color: '#06b6d4' }}>{currentPage + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} total colleges)
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="btn-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', opacity: currentPage >= totalPages - 1 ? 0.5 : 1 }}
            >
              Next Page →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
