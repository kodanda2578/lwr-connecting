import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Building2, Search, Filter, ShieldAlert, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

export const CollegeDiscoveryPage = () => {
  const [exam, setExam] = useState('AP_EAPCET');
  const [rank, setRank] = useState('3500');
  const [category, setCategory] = useState('OC_BOYS');
  const [branch, setBranch] = useState('CSE');
  const [location, setLocation] = useState('');

  const [matches, setMatches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    const rankNum = parseInt(rank) || 5000;
    const results = await apiService.predictColleges({
      exam,
      rank: rankNum,
      category,
      branch,
      location
    });
    setMatches(results);
    setHasSearched(true);
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Page Banner */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={28} color="#ffffff" />
            </div>
            <div>
              <div className="badge badge-cyan">B.Tech Admission Matcher</div>
              <h1 style={{ fontSize: '2rem', color: '#ffffff', marginTop: '0.25rem' }}>
                “Which College Can I Get?” Discovery Engine
              </h1>
            </div>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '800px' }}>
            Enter your entrance exam rank and reservation category to compare against historical round-1 closing cutoffs from verified state counselling datasets.
          </p>
        </div>

        {/* Search Input Form Panel */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <form onSubmit={handlePredict}>
            <div className="grid-4">
              
              <div className="form-group">
                <label>Target Entrance Exam</label>
                <select className="form-control" value={exam} onChange={(e) => setExam(e.target.value)}>
                  <option value="AP_EAPCET">AP EAPCET (EAMCET)</option>
                  <option value="JEE">JEE Main</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Entrance Rank</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="e.g. 2500" 
                  value={rank} 
                  onChange={(e) => setRank(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label>Category Quota</label>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="OC_BOYS">OC Boys / General</option>
                  <option value="OC_GIRLS">OC Girls</option>
                  <option value="BC_A">BC-A</option>
                  <option value="BC_B">BC-B</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Branch</label>
                <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="AI_ML">AI & Machine Learning (AI/ML)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="EEE">Electrical (EEE)</option>
                </select>
              </div>

            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem' }}>
              <Search size={18} /> Find Matching Colleges Based on Previous Cutoffs
            </button>
          </form>
        </div>

        {/* Factual Disclaimer Banner */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-start'
        }}>
          <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.85rem', color: '#fbbf24', lineHeight: '1.5' }}>
            <strong>DISCLAIMER:</strong> Results are generated <strong>based on previous cutoff data</strong>. Cutoff ranks change every year based on candidate density and seat allotment rounds. This tool does not guarantee official admission. Always cross-verify choices with official counselling notifications.
          </div>
        </div>

        {/* Matching Colleges Results List */}
        {hasSearched && (
          <div>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.25rem' }}>
              Historical Cutoff Matches ({matches.length} Colleges Found)
            </h3>

            <div className="grid-2">
              {matches.map((match) => (
                <div key={match.id} className="glass-panel" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-cyan">{match.matchStatus}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Round {match.round} ({match.year})</span>
                  </div>

                  <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    {match.collegeName}
                  </h4>

                  <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 600, marginBottom: '1rem' }}>
                    Branch: {match.branchName} ({match.branchCode})
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>Historical Opening Rank:</span>
                      <strong>{match.openingRank}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginTop: '0.3rem' }}>
                      <span>Historical Closing Rank:</span>
                      <strong style={{ color: '#10b981' }}>{match.closingRank}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Source: {match.source}</span>
                    <Link to={`/colleges/101`} style={{ color: '#06b6d4', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      College Details <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
