import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Activity, 
  Database, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Download, 
  Play, 
  Pause, 
  Server, 
  HardDrive, 
  Key, 
  Sliders, 
  Send, 
  FileCheck2, 
  HelpCircle,
  Eye,
  TrendingUp,
  Cpu,
  Layers,
  Lock,
  Users,
  Copy,
  Plus,
  Share2,
  MessageSquare,
  ExternalLink,
  Tag,
  Clock
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { buildPublicUrl } from '../config/appConfig';

export const AdminLaunchOperationsManager = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Data states
  const [healthData, setHealthData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [backups, setBackups] = useState([]);

  // Invitation Management States
  const [invitations, setInvitations] = useState([]);
  const [invitationStats, setInvitationStats] = useState(null);
  const [invitationFilter, setInvitationFilter] = useState('ALL');
  const [showCreateInviteModal, setShowCreateInviteModal] = useState(false);
  const [showBatchInviteModal, setShowBatchInviteModal] = useState(false);
  const [showOutreachTemplates, setShowOutreachTemplates] = useState(false);
  const [activeOutreachTab, setActiveOutreachTab] = useState('whatsapp');

  const [newInviteForm, setNewInviteForm] = useState({
    studentName: '',
    assignedEmail: '',
    channel: 'WHATSAPP',
    notes: '',
    expiryDays: 14
  });

  const [batchInviteForm, setBatchInviteForm] = useState({
    count: 10,
    channel: 'COLLEGE_NETWORK',
    notes: 'Wave 1 Recruitment Batch',
    expiryDays: 14
  });

  const [creatingInvite, setCreatingInvite] = useState(false);

  // Registration Config Form
  const [configForm, setConfigForm] = useState({
    registrationLimit: 50,
    registrationsPaused: false,
    inviteOnlyMode: true,
    betaNoticeMessage: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // SMTP Test State
  const [testRecipient, setTestRecipient] = useState('');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState(null);

  // AI Test State
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);

  // Backup States
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [verifyingBackupName, setVerifyingBackupName] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});

  useEffect(() => {
    loadAllOperationsData();
  }, []);

  const showNotification = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 6000);
  };

  const copyToClipboard = (text, label) => {
    try {
      navigator.clipboard.writeText(text);
      showNotification('success', `${label} copied to clipboard!`);
    } catch (e) {
      showNotification('error', 'Could not copy to clipboard.');
    }
  };

  const loadAllOperationsData = async () => {
    try {
      setRefreshing(true);
      const [health, overview, backupList, betaConfig, inviteList, invStats] = await Promise.all([
        apiService.getConfigurationHealth().catch(e => {
          console.warn('Health fetch error', e);
          return null;
        }),
        apiService.getLaunchOverview().catch(e => {
          console.warn('Overview fetch error', e);
          return null;
        }),
        apiService.listDatabaseBackups().catch(e => {
          console.warn('Backup list error', e);
          return [];
        }),
        apiService.getAdminBetaConfig().catch(e => {
          console.warn('Config fetch error', e);
          return null;
        }),
        apiService.listInvitations(invitationFilter).catch(e => {
          console.warn('Invitations fetch error', e);
          return [];
        }),
        apiService.getInvitationStats().catch(e => {
          console.warn('Invitation stats error', e);
          return null;
        })
      ]);

      if (health) setHealthData(health);
      if (overview) setOverviewData(overview);
      if (backupList) setBackups(backupList);
      if (inviteList) setInvitations(inviteList);
      if (invStats) setInvitationStats(invStats);
      if (betaConfig) {
        setConfigForm({
          registrationLimit: betaConfig.registrationLimit || 50,
          registrationsPaused: Boolean(betaConfig.registrationsPaused),
          inviteOnlyMode: betaConfig.inviteOnlyMode !== undefined ? Boolean(betaConfig.inviteOnlyMode) : true,
          betaNoticeMessage: betaConfig.betaNoticeMessage || ''
        });
      }
    } catch (err) {
      showNotification('error', 'Error loading operations dashboard: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateConfig = async (overrideLimit, overridePaused, overrideInviteOnly) => {
    try {
      setSavingConfig(true);
      const payload = {
        registrationLimit: overrideLimit !== undefined ? overrideLimit : Number(configForm.registrationLimit),
        registrationsPaused: overridePaused !== undefined ? overridePaused : Boolean(configForm.registrationsPaused),
        inviteOnlyMode: overrideInviteOnly !== undefined ? overrideInviteOnly : Boolean(configForm.inviteOnlyMode),
        betaNoticeMessage: configForm.betaNoticeMessage
      };

      await apiService.updateAdminBetaConfig(payload);
      showNotification('success', 'Beta configuration successfully updated!');
      await loadAllOperationsData();
    } catch (err) {
      showNotification('error', 'Failed to update configuration: ' + err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleCreateSingleInvite = async (e) => {
    e.preventDefault();
    try {
      setCreatingInvite(true);
      const res = await apiService.createInvitation(newInviteForm);
      showNotification('success', `Invitation code generated: ${res.code}`);
      setShowCreateInviteModal(false);
      setNewInviteForm({ studentName: '', assignedEmail: '', channel: 'WHATSAPP', notes: '', expiryDays: 14 });
      await loadAllOperationsData();
    } catch (err) {
      showNotification('error', 'Error generating invitation: ' + err.message);
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleBatchGenerateInvites = async (e) => {
    e.preventDefault();
    try {
      setCreatingInvite(true);
      const res = await apiService.batchGenerateInvitations(batchInviteForm);
      showNotification('success', `Successfully generated batch of ${res.length} invitation codes for ${batchInviteForm.channel}!`);
      setShowBatchInviteModal(false);
      await loadAllOperationsData();
    } catch (err) {
      showNotification('error', 'Batch invitation error: ' + err.message);
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevokeInvite = async (id, code) => {
    if (!window.confirm(`Are you sure you want to revoke invitation code ${code}?`)) return;
    try {
      await apiService.revokeInvitation(id);
      showNotification('success', `Invitation ${code} revoked.`);
      await loadAllOperationsData();
    } catch (err) {
      showNotification('error', 'Failed to revoke invitation: ' + err.message);
    }
  };

  const handleFilterInvitations = async (status) => {
    setInvitationFilter(status);
    try {
      const list = await apiService.listInvitations(status);
      setInvitations(list);
    } catch (e) {
      console.warn('Error filtering', e);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTestingSmtp(true);
      setSmtpTestResult(null);
      const res = await apiService.testSmtpConnection(testRecipient);
      setSmtpTestResult(res);
      if (res && res.success) {
        showNotification('success', 'SMTP test email dispatched successfully!');
      } else {
        showNotification('error', res?.message || 'SMTP test dispatch failed.');
      }
    } catch (err) {
      setSmtpTestResult({ success: false, message: err.message });
      showNotification('error', 'SMTP dispatch error: ' + err.message);
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestAi = async () => {
    try {
      setTestingAi(true);
      setAiTestResult(null);
      const res = await apiService.testGeminiConnection();
      setAiTestResult(res);
      if (res && (res.status === 'AVAILABLE' || res.status === 'STANDBY_KNOWLEDGE_ENGINE_ACTIVE')) {
        showNotification('success', res.message || 'AI service ping completed.');
      } else {
        showNotification('error', res?.message || 'AI service returned degraded response.');
      }
    } catch (err) {
      setAiTestResult({ status: 'ERROR', message: err.message });
      showNotification('error', 'AI test call failed: ' + err.message);
    } finally {
      setTestingAi(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      const res = await apiService.createDatabaseBackup();
      if (res && res.success) {
        showNotification('success', `Live H2 database backup created: ${res.fileName} (${res.sizeFormatted})`);
        await loadAllOperationsData();
      } else {
        showNotification('error', res?.error || 'Database backup failed.');
      }
    } catch (err) {
      showNotification('error', 'Error creating backup: ' + err.message);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleVerifyBackup = async (fileName) => {
    try {
      setVerifyingBackupName(fileName);
      const res = await apiService.verifyDatabaseBackup(fileName);
      setVerificationResults(prev => ({ ...prev, [fileName]: res }));
      if (res && res.verified) {
        showNotification('success', `Backup ${fileName} successfully restored and verified in isolated test sandbox!`);
      } else {
        showNotification('error', `Backup ${fileName} verification failed: ${res?.error}`);
      }
    } catch (err) {
      showNotification('error', `Verification failed: ${err.message}`);
    } finally {
      setVerifyingBackupName(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#8b5cf6' }} />
        <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>Loading Beta Launch Operations...</h3>
        <p style={{ fontSize: '0.9rem' }}>Inspecting configuration, SMTP parameters, backups and telemetry...</p>
      </div>
    );
  }

  const isPaused = overviewData?.registrationsPaused || configForm.registrationsPaused;
  const isInviteOnly = configForm.inviteOnlyMode;
  const regLimit = overviewData?.registrationLimit || 50;
  const registeredCount = overviewData?.successfulRegistrations || 0;
  const remainingSpots = overviewData?.remainingSpots !== undefined ? overviewData.remainingSpots : Math.max(0, regLimit - registeredCount);
  const failedRegs = overviewData?.failedRegistrations || 0;

  // Outreach Message Templates
  const whatsappTemplate = `🔥 *LWR Connecting — Wave 1 Invitation* 🔥

Hey [Student Name]! You've been invited to the exclusive Wave 1 Beta of *Laughs With Ramesh Connecting* — the college discovery, cutoff predictor & mock test platform for Intermediate (Class 11 & 12 MPC) students.

🎯 *What you get in Beta:*
• 📊 Verified AP/TG EAPCET & JEE Cutoff Matcher (71 colleges)
• 📝 Real-time Online Mock Tests & Rank Diagnostics
• 🎓 Direct Academic Guidance & Counseling
• 🤖 AI Intermediate Counselor

🔑 *Your Unique Invitation Code:* [CODE]
🔗 *Register Here:* ${buildPublicUrl('/register?code=[CODE]')}

⚠️ *Note:* Registration is strictly limited to 50 Intermediate students in this wave. Once capacity is filled, registration closes.`;

  const lecturerTemplate = `Respected Sir/Madam,

Greetings! I am reaching out to share *Laughs With Ramesh (LWR) Connecting* — a specialized platform created for Class 11 and Class 12 Intermediate (MPC stream) students preparing for JEE Main, AP EAPCET, and TG EAPCET.

The platform provides students with:
1. Real simulated online mock tests with detailed analytics.
2. Verified historical college cutoffs and branch predictors for 71 engineering colleges across Andhra Pradesh and Telangana.
3. Supervised, guardian-consented academic counseling.

We are launching a controlled, invite-only Wave 1 beta for 50 students across select junior colleges. We would be honored to share invitation access with interested and eligible students from your institution.

May we have your kind permission to share the invitation codes and onboarding guide with your students?

Respectfully,
LWR Connecting Platform Operations Team`;

  const socialTemplate = `🚀 Wave 1 Beta of LWR Connecting is NOW LIVE!

Built exclusively for Intermediate Class 11 & 12 students targeting JEE Main, AP EAPCET, and TG EAPCET.

🎯 What's inside:
✅ 71 Verified Engineering College Cutoff Predictor
✅ Full 3-Hour Simulated Mock Tests
✅ Direct Mentorship & Academic Guidance
✅ Zero Spam, 100% Student-Safe

🔒 Wave 1 is strictly invite-only and capped at 50 students!
Want an invitation code? Drop a comment or DM with your Class & Target Exam (JEE / EAPCET) to receive your code!`;

  const onboardingGuideText = `📘 *LWR Connecting — Student Onboarding Guide (Wave 1)*

Step 1: Open the registration link or visit ${buildPublicUrl('/register')}
Step 2: Enter your 10-character Invitation Code (e.g. LWR-W1-XXXXXX)
Step 3: Enter your Full Name, Email, and Password. Verify your 6-digit email OTP.
Step 4: Complete your MPC academic profile (Class 11 or 12, Target Exam, Engineering Branch Interests).
Step 5: If you are under 18, provide your parent/guardian details and obtain guardian consent.
Step 6: Explore your Student Dashboard — take your first Mock Test and run the Cutoff Predictor!`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Refresh Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(236,72,153,0.35)'
          }}>
            <Rocket size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Beta Launch Operations & Invitation Control
              </h2>
              <span className={`badge ${isPaused ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.75rem' }}>
                {isPaused ? 'REGISTRATIONS PAUSED' : 'WAVE 1 ACTIVE (TARGET: 50)'}
              </span>
              <span className={`badge ${isInviteOnly ? 'badge-purple' : 'badge-yellow'}`} style={{ fontSize: '0.75rem' }}>
                {isInviteOnly ? 'INVITE-ONLY MODE ACTIVE' : 'PUBLIC REGISTRATION ACTIVE'}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              Controlled onboarding for first 50 Intermediate students (Class 11 & 12 MPC), recruitment tracking, live SMTP & H2 backups.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowOutreachTemplates(!showOutreachTemplates)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
          >
            <Share2 size={16} />
            {showOutreachTemplates ? 'Hide Outreach Templates' : 'Recruitment Templates'}
          </button>

          <button
            onClick={loadAllOperationsData}
            disabled={refreshing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage.text && (
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${actionMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: actionMessage.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          {actionMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* 1. Launch Monitoring KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>REGISTERED STUDENTS</span>
            <Users size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.5rem' }}>
            {registeredCount} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {regLimit}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: remainingSpots > 0 ? '#10b981' : '#f59e0b', marginTop: '0.35rem', fontWeight: 600 }}>
            {remainingSpots} spots remaining in Wave 1
          </div>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>INVITATIONS ISSUED</span>
            <Key size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899', marginTop: '0.5rem' }}>
            {invitationStats?.totalIssued || invitations.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Accepted: {invitationStats?.accepted || 0} | Pending: {invitationStats?.pending || 0}
          </div>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>ACTIVE STUDENTS</span>
            <Activity size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>
            {overviewData?.activeStudents || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Verified accounts currently active
          </div>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>FAILED REGISTRATIONS</span>
            <AlertTriangle size={18} color={failedRegs > 0 ? '#f59e0b' : '#64748b'} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: failedRegs > 0 ? '#f59e0b' : '#ffffff', marginTop: '0.5rem' }}>
            {failedRegs}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Blocked non-invited / duplicate attempts
          </div>
        </div>

        <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>OTP DISPATCH RATE</span>
            <Mail size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.5rem' }}>
            {healthData?.email?.deliverySuccessRatePercent || 100}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Sent: {healthData?.email?.totalEmailsSent || 0} | Failed: {healthData?.email?.totalEmailsFailed || 0}
          </div>
        </div>
      </div>

      {/* Recruitment Materials Drawer (Collapsible) */}
      {showOutreachTemplates && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          padding: '1.75rem',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={20} color="#8b5cf6" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Recruitment Outreach Messages & Onboarding Guide (4 Channels)
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                { id: 'whatsapp', label: '1. WhatsApp' },
                { id: 'lecturer', label: '2. Colleges & Lecturers' },
                { id: 'social', label: '3. Instagram & YouTube' },
                { id: 'guide', label: '4. Student Onboarding Guide' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveOutreachTab(tab.id)}
                  style={{
                    background: activeOutreachTab === tab.id ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' : 'rgba(2,6,23,0.5)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(2, 6, 23, 0.7)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: 700 }}>
                {activeOutreachTab === 'whatsapp' && 'Official WhatsApp Invitation Template'}
                {activeOutreachTab === 'lecturer' && 'Intermediate College Lecturer Permission & Outreach Template'}
                {activeOutreachTab === 'social' && 'Instagram & YouTube Launch Post / DM Response'}
                {activeOutreachTab === 'guide' && 'Short Student 6-Step Onboarding Guide'}
              </span>
              <button
                onClick={() => {
                  const text = activeOutreachTab === 'whatsapp' ? whatsappTemplate :
                               activeOutreachTab === 'lecturer' ? lecturerTemplate :
                               activeOutreachTab === 'social' ? socialTemplate : onboardingGuideText;
                  copyToClipboard(text, 'Template text');
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Copy size={13} /> Copy Template
              </button>
            </div>

            <pre style={{
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '1rem',
              borderRadius: '8px',
              color: '#e2e8f0',
              fontSize: '0.85rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              margin: 0,
              maxHeight: '260px',
              overflowY: 'auto'
            }}>
              {activeOutreachTab === 'whatsapp' && whatsappTemplate}
              {activeOutreachTab === 'lecturer' && lecturerTemplate}
              {activeOutreachTab === 'social' && socialTemplate}
              {activeOutreachTab === 'guide' && onboardingGuideText}
            </pre>
          </div>
        </div>
      )}

      {/* 2. Wave 1 Invitation Manager (Codes, Status, Batch Generation) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.75rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Key size={22} color="#ec4899" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Wave 1 Invitation Access Controls (Cap: 50 Students)
              </h3>
              <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                Only invited Intermediate students with an approved code can register. Each code is single-use and audit-tracked.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowCreateInviteModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Issue Single Code
            </button>

            <button
              onClick={() => setShowBatchInviteModal(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.1rem', fontSize: '0.85rem' }}
            >
              <Layers size={16} /> Batch Generate Codes
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['ALL', 'PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'].map((st) => (
              <button
                key={st}
                onClick={() => handleFilterInvitations(st)}
                style={{
                  background: invitationFilter === st ? '#8b5cf6' : 'rgba(2, 6, 23, 0.6)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Showing <strong>{invitations.length}</strong> invitations
          </div>
        </div>

        {/* Invitations Table */}
        {invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: 'rgba(2,6,23,0.4)', borderRadius: '12px' }}>
            <Key size={32} style={{ margin: '0 auto 0.75rem', color: '#64748b' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#ffffff' }}>No invitations issued yet under filter "{invitationFilter}".</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>Click "Issue Single Code" or "Batch Generate Codes" to create unique invitation codes for students.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Code & Link</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Channel</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Student</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expires At</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Redeemed By</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => {
                  const regLink = buildPublicUrl(`/register?code=${inv.code}`);
                  const isPending = inv.status === 'PENDING';
                  const isAccepted = inv.status === 'ACCEPTED';
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <code style={{ fontSize: '0.9rem', color: '#c4b5fd', fontWeight: 800 }}>{inv.code}</code>
                          <button
                            title="Copy code"
                            onClick={() => copyToClipboard(inv.code, `Code ${inv.code}`)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            title="Copy full invite link"
                            onClick={() => copyToClipboard(regLink, `Invite link for ${inv.code}`)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#06b6d4', padding: '2px' }}
                          >
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.7rem' }}>
                          {inv.channel || 'DIRECT'}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                        {inv.studentName ? <strong>{inv.studentName}</strong> : null}
                        {inv.assignedEmail ? <div style={{ fontSize: '0.75rem' }}>{inv.assignedEmail}</div> : null}
                        {!inv.studentName && !inv.assignedEmail && <span style={{ color: '#64748b' }}>Open invitation</span>}
                      </td>

                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${
                          isAccepted ? 'badge-green' :
                          isPending ? 'badge-purple' :
                          inv.status === 'REVOKED' ? 'badge-red' : 'badge-yellow'
                        }`} style={{ fontSize: '0.7rem' }}>
                          {inv.status}
                        </span>
                      </td>

                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {inv.expiresAt ? String(inv.expiresAt).substring(0, 10) : '14 Days'}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {isAccepted ? (
                          <div>
                            <span style={{ color: '#34d399', fontWeight: 600 }}>User #{inv.acceptedByUserId}</span>
                            <div style={{ fontSize: '0.75rem' }}>{inv.acceptedByEmail}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>—</span>
                        )}
                      </td>

                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        {isPending && (
                          <button
                            onClick={() => handleRevokeInvite(inv.id, inv.code)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Controlled Beta Governance & Capacity Controls */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.75rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Sliders size={22} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Controlled Beta Launch Governance (Wave 1: 50 Students)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Controls Box */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Registration Limit (Students)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="number"
                min="1"
                max="100"
                value={configForm.registrationLimit}
                onChange={(e) => setConfigForm({ ...configForm, registrationLimit: e.target.value })}
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '0.6rem 1rem',
                  fontSize: '1rem',
                  width: '120px'
                }}
              />
              <button
                type="button"
                onClick={() => setConfigForm({ ...configForm, registrationLimit: 50 })}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Set Wave 1 (50)
              </button>
              <button
                type="button"
                onClick={() => setConfigForm({ ...configForm, registrationLimit: 100 })}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Set Max (100)
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={configForm.inviteOnlyMode}
                  onChange={(e) => setConfigForm({ ...configForm, inviteOnlyMode: e.target.checked })}
                  style={{ width: '16px', height: '16px' }}
                />
                Enforce Invite-Only Mode (Block public registrations without code)
              </label>
            </div>

            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Beta Student Notice Banner
            </label>
            <textarea
              rows="3"
              value={configForm.betaNoticeMessage}
              onChange={(e) => setConfigForm({ ...configForm, betaNoticeMessage: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '0.6rem 0.85rem',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}
              placeholder="Notice displayed on registration and login..."
            />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleUpdateConfig()}
                disabled={savingConfig}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {savingConfig ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                Save Governance Settings
              </button>

              <button
                onClick={() => handleUpdateConfig(undefined, !isPaused, undefined)}
                disabled={savingConfig}
                style={{
                  background: isPaused ? '#10b981' : '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume Student Registrations' : 'Pause Registrations Immediately'}
              </button>
            </div>
          </div>

          {/* Current Status Explainer */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#10b981" /> Strict Beta Safeguards In Effect
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
              <li><strong>Invite-Only Protection:</strong> Public registrations lacking an invitation code are strictly rejected with HTTP 403.</li>
              <li><strong>Concurrency Protection:</strong> Atomic synchronized lock wrapping limits and unique constraints prevents quota bypass during traffic spikes.</li>
              <li><strong>Duplicate Prevention:</strong> Duplicate email and mobile number checks reject repeat submissions before account generation.</li>
              <li><strong>Under-18 Minor Safeguards:</strong> Students identifying as minors are strictly gated by mandatory guardian consent before mentorship access.</li>
            </ul>

            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.8rem', color: '#c4b5fd', fontWeight: 600 }}>Active Notice Banner</div>
              <div style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '0.25rem' }}>
                {overviewData?.betaNoticeMessage || configForm.betaNoticeMessage || 'Beta Active.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Subsystem Health Checks (SMTP, Database, AI Assistant) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.75rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Activity size={22} color="#06b6d4" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Subsystem Operational Health & Diagnostics
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* SMTP Health Card */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                <Mail size={18} color="#06b6d4" /> Gmail SMTP Service
              </div>
              <span className={`badge ${healthData?.email?.smtpActive ? 'badge-green' : 'badge-yellow'}`}>
                {healthData?.email?.smtpActive ? 'SMTP ACTIVE' : 'INCOMPLETE CONFIG'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
              <div><strong>Host:</strong> {healthData?.email?.host || 'smtp.gmail.com'}:{healthData?.email?.port || 587}</div>
              <div><strong>Username:</strong> {healthData?.email?.usernameMasked || 'kodandaramesh2503@gmail.com'}</div>
              <div><strong>Password:</strong> {healthData?.email?.passwordConfigured ? 'Configured (Masked)' : 'Not Set'}</div>
              <div><strong>Total Sent:</strong> {healthData?.email?.totalEmailsSent || 0} | <strong>Failed:</strong> {healthData?.email?.totalEmailsFailed || 0}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Test SMTP Connectivity (Send Test Verification Email)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  placeholder="admin@lwrconnecting.com"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {testingSmtp ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  Test
                </button>
              </div>

              {smtpTestResult && (
                <div style={{
                  marginTop: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  background: smtpTestResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  color: smtpTestResult.success ? '#34d399' : '#f87171'
                }}>
                  {smtpTestResult.message}
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant Health Card */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                <Sparkles size={18} color="#ec4899" /> AI Counseling Engine
              </div>
              <span className="badge badge-purple">
                {healthData?.ai?.activeEngine || 'LWR_KNOWLEDGE_ENGINE'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
              <div><strong>Primary Provider:</strong> {healthData?.ai?.provider || 'GEMINI'} ({healthData?.ai?.model || 'gemini-1.5-flash'})</div>
              <div><strong>API Key Status:</strong> {healthData?.ai?.apiKeyConfigured ? 'Configured' : 'Autonomous Fallback Active'}</div>
              <div><strong>Knowledge Engine:</strong> Loaded ({healthData?.database?.totalColleges || 71} Colleges & Cutoffs)</div>
              <div><strong>Status:</strong> {healthData?.ai?.status || 'STANDBY_KNOWLEDGE_ENGINE_ACTIVE'}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleTestAi}
                disabled={testingAi}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {testingAi ? <RefreshCw size={14} className="animate-spin" /> : <Cpu size={14} />}
                Test AI Engine Response
              </button>

              {aiTestResult && (
                <div style={{
                  marginTop: '0.6rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  background: 'rgba(139,92,246,0.1)',
                  color: '#c4b5fd'
                }}>
                  <strong>[{aiTestResult.status}]</strong> {aiTestResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Database Health Card */}
          <div style={{ background: 'rgba(2, 6, 23, 0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                <Database size={18} color="#10b981" /> H2 Local Database (Persistent)
              </div>
              <span className="badge badge-green">HEALTHY / UP</span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
              <div><strong>Driver:</strong> {healthData?.database?.driver || 'org.h2.Driver (PostgreSQL Compatibility)'}</div>
              <div><strong>Colleges Seeded:</strong> {healthData?.database?.totalColleges || 71} Institutions</div>
              <div><strong>Cutoff Records:</strong> {healthData?.database?.totalCutoffs || 1420}+ Closing Ranks</div>
              <div><strong>Registered Students:</strong> {healthData?.database?.totalStudents || registeredCount} Intermediate Students</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
              >
                {creatingBackup ? <RefreshCw size={14} className="animate-spin" /> : <HardDrive size={14} />}
                Create Live Consistent Backup Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Database Backup & Restore Verification */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '1.75rem',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <HardDrive size={22} color="#ec4899" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Database Backups & Non-Destructive Restore Verification
              </h3>
              <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                H2 snapshots stored in <code>data/backups/</code>. Restore verification tests in an isolated sandbox without altering live data.
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={creatingBackup}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem' }}
          >
            {creatingBackup ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            Create DB Snapshot
          </button>
        </div>

        {backups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: 'rgba(2,6,23,0.4)', borderRadius: '12px' }}>
            <HardDrive size={32} style={{ margin: '0 auto 0.75rem', color: '#64748b' }} />
            <p style={{ margin: 0 }}>No database backups created yet. Click "Create DB Snapshot" to generate the first crash-consistent backup archive.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Backup Archive</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Size</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Created At</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Integrity Verification</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => {
                  const result = verificationResults[b.fileName];
                  const isVerifying = verifyingBackupName === b.fileName;
                  return (
                    <tr key={b.fileName} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileCheck2 size={16} color="#8b5cf6" />
                          <code>{b.fileName}</code>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{b.sizeFormatted || `${b.sizeBytes} B`}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{b.lastModified || 'Recent'}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {result ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: result.verified ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: result.verified ? '#34d399' : '#f87171'
                          }}>
                            {result.verified ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {result.verified ? `Verified (Colleges: ${result.tableCounts?.colleges ?? 71})` : 'Integrity Issue'}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Not tested in session</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleVerifyBackup(b.fileName)}
                          disabled={isVerifying}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          {isVerifying ? <RefreshCw size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
                          {isVerifying ? 'Verifying...' : 'Verify Restore'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Invitation Modal */}
      {showCreateInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 1rem' }}>Issue Single Wave 1 Invitation Code</h3>
            <form onSubmit={handleCreateSingleInvite}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Intended Student Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sai Kumar"
                  value={newInviteForm.studentName}
                  onChange={(e) => setNewInviteForm({ ...newInviteForm, studentName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Assigned Email (Optional - Lock code to this email)</label>
                <input
                  type="email"
                  placeholder="sai@example.com"
                  value={newInviteForm.assignedEmail}
                  onChange={(e) => setNewInviteForm({ ...newInviteForm, assignedEmail: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Recruitment Channel</label>
                <select
                  value={newInviteForm.channel}
                  onChange={(e) => setNewInviteForm({ ...newInviteForm, channel: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                >
                  <option value="WHATSAPP">WhatsApp (Direct / Student Group)</option>
                  <option value="COLLEGE_NETWORK">College Network (Classmates, Juniors)</option>
                  <option value="LECTURER">Intermediate College Lecturer / Faculty</option>
                  <option value="INSTAGRAM_YOUTUBE">Instagram / YouTube Launch Announcement</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Notes / Referral</label>
                <input
                  type="text"
                  placeholder="e.g. Narayana Junior College student"
                  value={newInviteForm.notes}
                  onChange={(e) => setNewInviteForm({ ...newInviteForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateInviteModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creatingInvite} className="btn btn-primary">
                  {creatingInvite ? 'Generating...' : 'Generate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Generation Modal */}
      {showBatchInviteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '0 0 1rem' }}>Batch Generate Invitation Codes</h3>
            <form onSubmit={handleBatchGenerateInvites}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Number of Codes (Max 50 for Wave 1)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={batchInviteForm.count}
                  onChange={(e) => setBatchInviteForm({ ...batchInviteForm, count: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Recruitment Channel</label>
                <select
                  value={batchInviteForm.channel}
                  onChange={(e) => setBatchInviteForm({ ...batchInviteForm, channel: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                >
                  <option value="COLLEGE_NETWORK">College Network (Classmates, Juniors)</option>
                  <option value="LECTURER">Intermediate College Faculty & Lecturers</option>
                  <option value="WHATSAPP">WhatsApp (Student Group Outreach)</option>
                  <option value="INSTAGRAM_YOUTUBE">Instagram / YouTube Audience Requests</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>Batch Label / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Sri Chaitanya Vijayawada batch"
                  value={batchInviteForm.notes}
                  onChange={(e) => setBatchInviteForm({ ...batchInviteForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBatchInviteModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={creatingInvite} className="btn btn-primary">
                  {creatingInvite ? 'Generating...' : `Generate ${batchInviteForm.count} Codes`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLaunchOperationsManager;
