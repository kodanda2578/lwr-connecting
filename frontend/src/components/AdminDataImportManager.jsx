import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Copy, 
  Database, 
  Layers, 
  FileCheck, 
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AdminDataImportManager() {
  const [ingestionStatus, setIngestionStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Ingestion Workspace
  const [datasetType, setDatasetType] = useState('COLLEGES'); // 'COLLEGES' or 'CUTOFFS'
  const [sourceName, setSourceName] = useState('AICTE / State Admission Portal Official Gazette');
  const [sourceUrl, setSourceUrl] = useState('https://facilities.aicte-india.org/dashboard/pages/angulardashboard.php');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [jsonInput, setJsonInput] = useState('');
  
  // Validation / Preview state
  const [previewing, setPreviewing] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [previewError, setPreviewError] = useState('');

  // Commit state
  const [committing, setCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState(null);
  const [commitError, setCommitError] = useState('');

  useEffect(() => {
    loadStatus();
    loadTemplate('COLLEGES');
  }, []);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const status = await apiService.getDataIngestionStatus();
      if (status) setIngestionStatus(status);
    } catch (e) {
      console.error('Failed to load ingestion status:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadTemplate = (type) => {
    if (type === 'COLLEGES') {
      const sampleColleges = [
        {
          code: 'VNIT_NAGPUR',
          name: 'Visvesvaraya National Institute of Technology',
          city: 'Nagpur',
          district: 'Nagpur',
          stateCode: 'MH',
          pincode: '440010',
          governmentStatus: 'Government',
          isAutonomous: true,
          aicteApproved: true,
          feeRange: '₹1,45,000 / year',
          affiliation: 'Institute of National Importance',
          admissionAuthority: 'JoSAA / CSAB',
          officialWebsite: 'https://vnit.ac.in',
          admissionLink: 'https://vnit.ac.in/academic/admissions/'
        },
        {
          code: 'MNIT_JAIPUR',
          name: 'Malaviya National Institute of Technology',
          city: 'Jaipur',
          district: 'Jaipur',
          stateCode: 'RJ',
          pincode: '302017',
          governmentStatus: 'Government',
          isAutonomous: true,
          aicteApproved: true,
          feeRange: '₹1,50,000 / year',
          affiliation: 'Institute of National Importance',
          admissionAuthority: 'JoSAA / CSAB',
          officialWebsite: 'https://mnit.ac.in',
          admissionLink: 'https://mnit.ac.in/academics/admissions'
        }
      ];
      setJsonInput(JSON.stringify(sampleColleges, null, 2));
    } else {
      const sampleCutoffs = [
        {
          examCode: 'JEE_MAIN',
          collegeCode: 'VNIT_NAGPUR',
          branchCode: 'CSE',
          category: 'OPEN',
          seatType: 'Gender-Neutral',
          homeState: 'All India',
          quota: 'AI',
          openingRank: 3200,
          closingRank: 6850,
          academicYear: '2024-2025',
          counsellingRound: 'Round 6',
          sourceUrl: 'https://josaa.admissions.nic.in'
        }
      ];
      setJsonInput(JSON.stringify(sampleCutoffs, null, 2));
    }
  };

  const handleTypeChange = (newType) => {
    setDatasetType(newType);
    setPreviewResult(null);
    setCommitResult(null);
    setPreviewError('');
    setCommitError('');
    loadTemplate(newType);
  };

  const handlePreview = async (e) => {
    e.preventDefault();
    setPreviewing(true);
    setPreviewError('');
    setPreviewResult(null);
    setCommitResult(null);

    let parsedRecords = [];
    try {
      parsedRecords = JSON.parse(jsonInput);
      if (!Array.isArray(parsedRecords)) {
        throw new Error('JSON input must be an array of objects [ { ... } ].');
      }
    } catch (err) {
      setPreviewError('Invalid JSON format: ' + err.message);
      setPreviewing(false);
      return;
    }

    try {
      const res = await apiService.adminDataImportPreview({
        datasetType,
        sourceName,
        sourceUrl,
        academicYear,
        records: parsedRecords
      });
      setPreviewResult(res);
    } catch (err) {
      setPreviewError(err.message || 'Failed to preview records.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleCommit = async () => {
    if (!previewResult) return;
    setCommitting(true);
    setCommitError('');
    setCommitResult(null);

    try {
      const recordsToCommit = [
        ...(previewResult.validRecords || []),
        ...(previewResult.duplicateRecords || [])
      ];

      const res = await apiService.adminDataImportCommit({
        datasetType,
        sourceName,
        sourceUrl,
        academicYear,
        records: recordsToCommit
      });
      setCommitResult(res);
      loadStatus();
    } catch (err) {
      setCommitError(err.message || 'Failed to commit data import.');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Overview Status Panel */}
      <div className="glass-panel" style={{ padding: '2rem', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="badge badge-cyan" style={{ marginBottom: '0.4rem' }}>
              <ShieldCheck size={14} style={{ marginRight: '4px' }} /> Genuine Data Repository
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>
              College & Cutoff Data Ingestion Engine
            </h2>
          </div>
          <button 
            onClick={loadStatus} 
            className="btn-secondary" 
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={loadingStatus ? 'spinning' : ''} /> Refresh Status
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Indexed Premier Colleges</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
              {ingestionStatus?.verifiedCollegesCount || '40+'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across 12+ Indian states</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Verified Cutoff Benchmarks</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
              {ingestionStatus?.verifiedCutoffsCount || '50+'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Official JoSAA, AP & TG EAPCET</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Ingestion Policy</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Safe Upsert Only
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Zero deletion of good records</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Approved Authorities</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>
              AICTE, JoSAA, APSCHE, TGCHE, KEA, DTE
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Official Gazette imports only</div>
          </div>
        </div>
      </div>

      {/* Import & Verification Workspace */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '0.35rem' }}>
            Verified Data Import & Quality Preview
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            Import verified records in non-destructive mode. Duplicate detection compares against unique college codes and official entrance exam records.
          </p>
        </div>

        {/* Dataset Type Selector */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => handleTypeChange('COLLEGES')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: datasetType === 'COLLEGES' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
              background: datasetType === 'COLLEGES' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              color: datasetType === 'COLLEGES' ? '#22d3ee' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Engineering Colleges Dataset
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('CUTOFFS')}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: datasetType === 'CUTOFFS' ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
              background: datasetType === 'CUTOFFS' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)',
              color: datasetType === 'CUTOFFS' ? '#22d3ee' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cutoff Benchmarks Dataset
          </button>
        </div>

        {/* Metadata Inputs */}
        <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label>Authoritative Source Name *</label>
            <input
              type="text"
              className="form-control"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              placeholder="e.g. AICTE Official Directory, JoSAA Round 6"
              required
            />
          </div>

          <div className="form-group">
            <label>Official Verification URL *</label>
            <input
              type="url"
              className="form-control"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group">
            <label>Academic Year *</label>
            <input
              type="text"
              className="form-control"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025-2026"
              required
            />
          </div>
        </div>

        {/* JSON Editor */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ margin: 0 }}>JSON Records to Ingest (Array of Objects) *</label>
            <button 
              type="button" 
              onClick={() => loadTemplate(datasetType)} 
              className="btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              Reset to Sample Template
            </button>
          </div>
          <textarea
            className="form-control"
            rows="10"
            style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.4 }}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
        </div>

        {previewError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.85rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} /> {previewError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
            className="btn-primary"
            style={{ padding: '0.65rem 1.5rem' }}
          >
            {previewing ? 'Validating Records...' : 'Preview & Detect Duplicates'}
          </button>
        </div>

        {/* Preview Results Table */}
        {previewResult && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
                  Pre-Commit Validation Results
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Total Evaluated: <strong>{previewResult.totalEvaluated}</strong> | 
                  Valid New: <strong style={{ color: '#10b981' }}>{previewResult.validCount}</strong> | 
                  Existing to Update: <strong style={{ color: '#f59e0b' }}>{previewResult.duplicateCount}</strong> | 
                  Invalid: <strong style={{ color: '#ef4444' }}>{previewResult.invalidCount}</strong>
                </div>
              </div>

              {(previewResult.validCount > 0 || previewResult.duplicateCount > 0) && (
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={committing}
                  className="btn-primary"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', padding: '0.65rem 1.5rem' }}
                >
                  {committing ? 'Committing Changes...' : `Commit ${previewResult.validCount + previewResult.duplicateCount} Verified Records`}
                </button>
              )}
            </div>

            {commitSuccessBadge(commitResult)}
            {commitError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                {commitError}
              </div>
            )}

            {/* Records List Table */}
            <div style={{ overflowX: 'auto', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Code</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Name / Details</th>
                    <th style={{ padding: '0.75rem 1rem' }}>State / City</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Validation Note</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewResult.validRecords || []).map((r, idx) => (
                    <tr key={`v-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#38bdf8' }}>{r.code || r.collegeCode}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#f8fafc' }}>{r.name || `${r.examCode} - ${r.branchCode}`}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{r.city ? `${r.city}, ${r.stateCode}` : (r.category || 'N/A')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-green">Ready to Insert</span></td>
                      <td style={{ padding: '0.75rem 1rem', color: '#10b981' }}>Mandatory fields verified</td>
                    </tr>
                  ))}
                  {(previewResult.duplicateRecords || []).map((r, idx) => (
                    <tr key={`d-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#f59e0b' }}>{r.code || r.collegeCode}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#f8fafc' }}>{r.name || `${r.examCode} - ${r.branchCode}`}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{r.city ? `${r.city}, ${r.stateCode}` : (r.category || 'N/A')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-amber">Existing (Safe Update)</span></td>
                      <td style={{ padding: '0.75rem 1rem', color: '#f59e0b' }}>Will update existing record fields</td>
                    </tr>
                  ))}
                  {(previewResult.invalidRecords || []).map((r, idx) => (
                    <tr key={`i-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#ef4444' }}>{r.code || 'MISSING'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#f87171' }}>{r.name || 'Incomplete Record'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444' }}>{r.stateCode || 'Missing State'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-red">Invalid</span></td>
                      <td style={{ padding: '0.75rem 1rem', color: '#ef4444' }}>{r.validationError || 'Missing mandatory fields'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

function commitSuccessBadge(commitResult) {
  if (!commitResult) return null;
  return (
    <div style={{
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      color: '#34d399',
      padding: '1rem 1.25rem',
      borderRadius: '8px',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }}>
      <CheckCircle2 size={22} color="#10b981" />
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          Ingestion Committed Successfully!
        </div>
        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
          Inserted: <strong>{commitResult.insertedCount}</strong> | 
          Updated: <strong>{commitResult.updatedCount}</strong> | 
          Source: {commitResult.sourceName} ({commitResult.academicYear})
        </div>
      </div>
    </div>
  );
}
