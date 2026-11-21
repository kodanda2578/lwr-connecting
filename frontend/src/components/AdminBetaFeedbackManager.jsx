import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  Filter, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Save, 
  Loader2, 
  RefreshCw, 
  Building, 
  CheckCircle2, 
  HelpCircle, 
  TrendingUp, 
  Tag,
  ShieldAlert,
  PauseCircle,
  PlayCircle,
  Sliders,
  Settings,
  Users,
  Compass,
  FileCheck
} from 'lucide-react';
import { apiService } from '../services/apiService';

export const AdminBetaFeedbackManager = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState(null);
  const [betaAnalytics, setBetaAnalytics] = useState(null);
  const [betaConfig, setBetaConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingNotes, setEditingNotes] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Beta Registration Controls State
  const [savingConfig, setSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    maxStudentsLimit: 100,
    registrationsPaused: false,
    betaNoticeMessage: ''
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, severityFilter]);

  const loadData = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      const [list, statsData, analyticsData, configData] = await Promise.all([
        apiService.getAdminBetaFeedback(statusFilter, categoryFilter, severityFilter),
        apiService.getAdminBetaFeedbackStats(),
        apiService.getAdminBetaAnalytics().catch(() => null),
        apiService.getAdminBetaConfig().catch(() => null)
      ]);
      setFeedbackList(list || []);
      setStats(statsData || null);
      if (analyticsData) setBetaAnalytics(analyticsData);
      if (configData) {
        setBetaConfig(configData);
        setConfigForm({
          maxStudentsLimit: configData.maxStudentsLimit || 100,
          registrationsPaused: Boolean(configData.registrationsPaused),
          betaNoticeMessage: configData.betaNoticeMessage || ''
        });
      }
    } catch (err) {
      console.error('Failed to load beta feedback:', err);
      setActionMessage('Failed to fetch feedback data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBetaConfig = async (e) => {
    e?.preventDefault();
    setSavingConfig(true);
    try {
      const updated = await apiService.updateAdminBetaConfig({
        maxStudentsLimit: Number(configForm.maxStudentsLimit),
        registrationsPaused: Boolean(configForm.registrationsPaused),
        betaNoticeMessage: configForm.betaNoticeMessage
      });
      setBetaConfig(updated);
      showActionSuccess('Beta configuration successfully updated!');
      const analytics = await apiService.getAdminBetaAnalytics().catch(() => null);
      if (analytics) setBetaAnalytics(analytics);
    } catch (err) {
      alert('Failed to update config: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTogglePause = async () => {
    setSavingConfig(true);
    try {
      const newStatus = !configForm.registrationsPaused;
      const updated = await apiService.updateAdminBetaConfig({
        maxStudentsLimit: Number(configForm.maxStudentsLimit),
        registrationsPaused: newStatus,
        betaNoticeMessage: configForm.betaNoticeMessage
      });
      setConfigForm(prev => ({ ...prev, registrationsPaused: newStatus }));
      setBetaConfig(updated);
      showActionSuccess(`Beta registrations are now ${newStatus ? 'PAUSED' : 'ACTIVE / OPEN'}`);
      const analytics = await apiService.getAdminBetaAnalytics().catch(() => null);
      if (analytics) setBetaAnalytics(analytics);
    } catch (err) {
      alert('Failed to toggle registration status: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setSavingId(id);
    try {
      const updated = await apiService.updateAdminBetaFeedback(id, { status: newStatus });
      setFeedbackList(prev => prev.map(item => item.id === id ? { ...item, status: updated.status } : item));
      // Refresh stats
      const newStats = await apiService.getAdminBetaFeedbackStats();
      setStats(newStats);
      showActionSuccess(`Feedback #${id} status updated to ${newStatus}`);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNotes = async (id) => {
    setSavingId(id);
    try {
      const notes = editingNotes[id] ?? '';
      const updated = await apiService.updateAdminBetaFeedback(id, { adminNotes: notes });
      setFeedbackList(prev => prev.map(item => item.id === id ? { ...item, adminNotes: updated.adminNotes } : item));
      showActionSuccess(`Notes saved for Feedback #${id}`);
    } catch (err) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Beta Feedback #${id}?`)) return;
    try {
      await apiService.deleteAdminBetaFeedback(id);
      setFeedbackList(prev => prev.filter(item => item.id !== id));
      const newStats = await apiService.getAdminBetaFeedbackStats();
      setStats(newStats);
      showActionSuccess(`Feedback #${id} deleted.`);
    } catch (err) {
      alert('Failed to delete feedback: ' + err.message);
    }
  };

  const showActionSuccess = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const filteredItems = feedbackList.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.studentName && item.studentName.toLowerCase().includes(q)) ||
      (item.studentEmail && item.studentEmail.toLowerCase().includes(q)) ||
      (item.overallExperience && item.overallExperience.toLowerCase().includes(q)) ||
      (item.collegeInfoIssues && item.collegeInfoIssues.toLowerCase().includes(q)) ||
      (item.suggestions && item.suggestions.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 1. BETA LAUNCH OVERVIEW & ANALYTICS */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderColor: 'rgba(6, 182, 212, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: '9999px',
                background: betaConfig?.registrationsPaused ? '#ef4444' : '#06b6d4',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {betaConfig?.registrationsPaused ? 'Registrations Paused' : 'Beta Live (Wave 1)'}
              </span>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
                Intermediate Student Beta v1 Console
              </h2>
            </div>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
              Aggregated platform metrics and student safeguards for Class 11 & Class 12 engineering aspirants.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={handleTogglePause}
              disabled={savingConfig}
              className={configForm.registrationsPaused ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{
                fontSize: '0.82rem',
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: configForm.registrationsPaused ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                borderColor: configForm.registrationsPaused ? '#22c55e' : '#ef4444',
                color: configForm.registrationsPaused ? '#86efac' : '#fca5a5'
              }}
            >
              {configForm.registrationsPaused ? <PlayCircle size={15} /> : <PauseCircle size={15} />}
              {configForm.registrationsPaused ? 'Resume Registrations' : 'Pause Registrations'}
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Aggregated Analytics Cards */}
        {betaAnalytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.85rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
              <div style={{ color: '#67e8f9', fontSize: '0.72rem', fontWeight: 600 }}>Beta Capacity</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                {betaAnalytics.totalRegisteredStudents} / {betaAnalytics.maxLimit}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>{betaAnalytics.remainingSpots} spots remaining</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(34, 197, 94, 0.08)', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ color: '#86efac', fontSize: '0.72rem', fontWeight: 600 }}>Active Students</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80', marginTop: '0.2rem' }}>
                {betaAnalytics.activeStudents}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>Verified & Onboarded</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(168, 85, 247, 0.08)', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
              <div style={{ color: '#d8b4fe', fontSize: '0.72rem', fontWeight: 600 }}>Mock Tests Done</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
                {betaAnalytics.mockTestsAttempted}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>JEE & EAPCET CBT</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <div style={{ color: '#93c5fd', fontSize: '0.72rem', fontWeight: 600 }}>Cutoffs & Predictor</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
                {betaAnalytics.cutoffRecordsCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>Verified Cutoffs</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(234, 179, 8, 0.08)', borderRadius: '10px', border: '1px solid rgba(234, 179, 8, 0.25)' }}>
              <div style={{ color: '#fde047', fontSize: '0.72rem', fontWeight: 600 }}>Mentorship</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#facc15', marginTop: '0.2rem' }}>
                {betaAnalytics.mentorshipRequestsCount}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>Supervised Sessions</div>
            </div>

            <div style={{ padding: '0.85rem', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ color: '#fca5a5', fontSize: '0.72rem', fontWeight: 600 }}>Bugs / Issues</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {betaAnalytics.openBugsCount}
                {(betaAnalytics.criticalBugsCount > 0 || betaAnalytics.highBugsCount > 0) && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#ef4444', color: '#fff', borderRadius: '4px' }}>
                    {betaAnalytics.criticalBugsCount} Crit / {betaAnalytics.highBugsCount} High
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.15rem' }}>Open Bug Reports</div>
            </div>
          </div>
        )}

        {/* 2. BETA REGISTRATION CONFIGURATION FORM */}
        <form onSubmit={handleSaveBetaConfig} style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700 }}>
            <Sliders size={16} color="#06b6d4" />
            Beta Cohort Access Controls
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                Registration Limit (Students)
              </label>
              <input 
                type="number"
                min="1"
                max="1000"
                value={configForm.maxStudentsLimit}
                onChange={(e) => setConfigForm(prev => ({ ...prev, maxStudentsLimit: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                Student Beta Notice Message
              </label>
              <input 
                type="text"
                value={configForm.betaNoticeMessage}
                onChange={(e) => setConfigForm(prev => ({ ...prev, betaNoticeMessage: e.target.value }))}
                placeholder="e.g. Welcome to the LWR Connecting Beta for Class 11 and Class 12 students."
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Config
            </button>
          </div>
        </form>
      </div>

      {/* 3. FEEDBACK CONSOLE & FILTER BAR */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#8b5cf6" /> Student Beta Feedback & Bug Tracker
            </h3>
            <p style={{ color: '#94a3b8', margin: '0.2rem 0 0 0', fontSize: '0.8rem' }}>
              Filter by status, category, and bug severity. Respond to students with verified cutoff adjustments.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feedback by student name, email, or keywords..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Categories</option>
              <option value="GENERAL">General</option>
              <option value="COLLEGE_DATA">College Data & Cutoffs</option>
              <option value="MOCK_TEST">Mock Tests</option>
              <option value="AI_ASSISTANT">LWR AI Guidance</option>
              <option value="COUNSELLING">Connect with Ramesh</option>
              <option value="BUG">Technical Bugs</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.85rem'
              }}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>
        </div>

        {actionMessage && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.6rem 0.85rem',
            borderRadius: '6px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#4ade80',
            fontSize: '0.85rem'
          }}>
            {actionMessage}
          </div>
        )}
      </div>

      {/* 4. FEEDBACK LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Loading beta feedback records...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
          <h4 style={{ color: '#f8fafc', margin: '0 0 0.5rem 0' }}>No matching beta feedback records</h4>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            {feedbackList.length === 0 ? 'No students have submitted feedback yet.' : 'Try adjusting your filters or search keywords.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="glass-panel"
              style={{
                padding: '1.5rem',
                borderLeft: item.status === 'NEW' 
                  ? '4px solid #60a5fa' 
                  : item.status === 'IN_REVIEW' 
                    ? '4px solid #facc15' 
                    : '4px solid #4ade80'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                      {item.studentName}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                      ({item.studentEmail})
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#c4b5fd'
                    }}>
                      <Tag size={10} style={{ display: 'inline', marginRight: '4px' }} />
                      {item.category}
                    </span>
                    {item.bugSeverity && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: item.bugSeverity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.25)' : item.bugSeverity === 'HIGH' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(234, 179, 8, 0.25)',
                        color: item.bugSeverity === 'CRITICAL' ? '#f87171' : item.bugSeverity === 'HIGH' ? '#fb923c' : '#fde047'
                      }}>
                        Severity: {item.bugSeverity}
                      </span>
                    )}
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      #{item.id} • {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < (item.overallRating || 5) ? '#eab308' : 'none'} 
                        color={i < (item.overallRating || 5) ? '#eab308' : '#475569'} 
                      />
                    ))}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                    disabled={savingId === item.id}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: item.status === 'RESOLVED' 
                        ? 'rgba(34, 197, 94, 0.2)' 
                        : item.status === 'IN_REVIEW' 
                          ? 'rgba(234, 179, 8, 0.2)' 
                          : 'rgba(59, 130, 246, 0.2)',
                      color: item.status === 'RESOLVED' 
                        ? '#4ade80' 
                        : item.status === 'IN_REVIEW' 
                          ? '#fde047' 
                          : '#93c5fd',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Delete feedback entry"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Feature Ratings Breakdown Bar */}
              {(item.mockTestsRating || item.predictorRating || item.cutoffsRating || item.aiGuidanceRating || item.mentorshipRating) && (
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.85rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#94a3b8'
                }}>
                  {item.mockTestsRating && <span>Mock Tests: <strong style={{ color: '#facc15' }}>{item.mockTestsRating}★</strong></span>}
                  {item.predictorRating && <span>Predictor: <strong style={{ color: '#facc15' }}>{item.predictorRating}★</strong></span>}
                  {item.cutoffsRating && <span>Cutoffs: <strong style={{ color: '#facc15' }}>{item.cutoffsRating}★</strong></span>}
                  {item.aiGuidanceRating && <span>AI Assistant: <strong style={{ color: '#facc15' }}>{item.aiGuidanceRating}★</strong></span>}
                  {item.mentorshipRating && <span>Mentorship: <strong style={{ color: '#facc15' }}>{item.mentorshipRating}★</strong></span>}
                </div>
              )}

              {/* Feedback Content Sections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem' }}>
                    1. OVERALL EXPERIENCE
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                    {item.overallExperience}
                  </div>
                </div>

                {item.difficultiesFaced && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb923c', marginBottom: '0.35rem' }}>
                      2. DIFFICULTIES FACED
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                      {item.difficultiesFaced}
                    </div>
                  </div>
                )}

                {item.missingInfoReport && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={13} /> 3. MISSING OR INACCURATE INFO REPORT
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fca5a5', whiteSpace: 'pre-wrap' }}>
                      {item.missingInfoReport}
                    </div>
                  </div>
                )}

                {item.collegeInfoIssues && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <AlertTriangle size={13} /> REPORTED COLLEGE DATA ISSUES
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#fca5a5', whiteSpace: 'pre-wrap' }}>
                      {item.collegeInfoIssues}
                    </div>
                  </div>
                )}

                {item.usefulFeatures && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80', marginBottom: '0.35rem' }}>
                      4. MOST USEFUL FEATURES
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                      {item.usefulFeatures}
                    </div>
                  </div>
                )}

                {item.suggestions && (
                  <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.35rem' }}>
                      5. SUGGESTIONS FOR IMPROVEMENT
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                      {item.suggestions}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Resolution Notes */}
              <div style={{ marginTop: '0.75rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
                    Admin Review & Action Notes (visible to student in their feedback portal):
                  </label>
                  <button
                    onClick={() => handleSaveNotes(item.id)}
                    disabled={savingId === item.id}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    {savingId === item.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Save Notes
                  </button>
                </div>
                <input
                  type="text"
                  value={editingNotes[item.id] !== undefined ? editingNotes[item.id] : (item.adminNotes || '')}
                  onChange={(e) => setEditingNotes({ ...editingNotes, [item.id]: e.target.value })}
                  placeholder="e.g., Verified JoSAA Round 2 cutoff with official CSAB PDF. Updated database record."
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

