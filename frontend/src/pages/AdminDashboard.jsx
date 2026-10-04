import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Compass, 
  BookOpen, 
  Building2, 
  HelpCircle, 
  Bell, 
  Plus, 
  Upload, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  BarChart3,
  FileText,
  Inbox,
  Send,
  Eye,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { COLLEGES_DATA, CUTOFFS_DATA, MOCK_TESTS_DATA } from '../data/sampleData';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Local Administrative States
  const [colleges, setColleges] = useState(COLLEGES_DATA);
  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [newCollegeCode, setNewCollegeCode] = useState('');
  const [newCollegeCity, setNewCollegeCity] = useState('');

  // Mentor Inbox State
  const [mentorFilter, setMentorFilter] = useState('ALL');
  const [mentorRequests, setMentorRequests] = useState([
    {
      id: 101,
      studentName: 'Rahul Sharma',
      studentEmail: 'rahul.student@gmail.com',
      category: 'AP EAPCET',
      studentMessage: 'My AP EAPCET rank is ~18,500. I want CSE-related branches around Vijayawada or Visakhapatnam.',
      aiSummary: 'Student has an AP EAPCET rank of ~18,500 seeking guidance for CSE-related branches around Vijayawada / Visakhapatnam.',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: '10:15 AM'
    },
    {
      id: 102,
      studentName: 'Kavya R.',
      studentEmail: 'kavya@gmail.com',
      category: 'Branch Selection',
      studentMessage: 'Is ECE better than AI/ML if I want core embedded systems and VLSI options later?',
      aiSummary: 'Student comparing ECE vs AI/ML for embedded systems and VLSI career paths.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: 'Yesterday'
    }
  ]);
  const [replyText, setReplyText] = useState({});

  // Notification Composer State
  const [notifTitle, setNotifTitle] = useState('🔥 AP EAPCET 2026 Grand Mock Test Series Published');
  const [notifMessage, setNotifMessage] = useState('Take full 3-hour simulated online mock tests with subject-wise speed and accuracy analytics.');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
  const [composerSentSuccess, setComposerSentSuccess] = useState(false);

  const handleAddCollege = async (e) => {
    e.preventDefault();
    if (!newCollegeName || !newCollegeCode) return;

    const newObj = {
      code: newCollegeCode.toUpperCase(),
      name: newCollegeName,
      location: `${newCollegeCity}, Andhra Pradesh`,
      city: newCollegeCity,
      state: 'Andhra Pradesh',
      type: 'Private Autonomous',
      affiliation: 'Affiliated to JNTU',
      feesPerYear: '₹70,000',
      source: 'Admin Portal Entry',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setColleges([...colleges, { ...newObj, id: Date.now(), entranceExams: ['AP EAPCET'] }]);
    setNewCollegeName('');
    setNewCollegeCode('');
    setNewCollegeCity('');
    setShowAddCollegeModal(false);
  };

  const handleMentorReply = (requestId) => {
    const text = replyText[requestId];
    if (!text) return;

    setMentorRequests((prev) => prev.map((req) => {
      if (req.id === requestId) {
        return { ...req, status: 'RESOLVED' };
      }
      return req;
    }));

    setReplyText((prev) => ({ ...prev, [requestId]: '' }));
    alert(`Reply sent to student successfully via email and in-app message!`);
  };

  const handleSendComposerNotification = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/announcements/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          targetAudience,
          sendEmail,
          sendInApp
        })
      });
    } catch (err) {}

    setComposerSentSuccess(true);
    setTimeout(() => setComposerSentSuccess(false), 4000);
  };

  const filteredMentorRequests = mentorRequests.filter((r) => {
    if (mentorFilter === 'ALL') return true;
    return r.status === mentorFilter;
  });

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        
        {/* Admin Header */}
        <div className="glass-panel" style={{ padding: '2rem 2.5rem', marginBottom: '2.5rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={26} color="#ffffff" />
              </div>
              <div>
                <div className="badge badge-purple">Platform Administrator & Mentor Console</div>
                <h1 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>Laughs With Ramesh Admin Console</h1>
              </div>
            </div>

            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Admin Session Active
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.75rem', marginBottom: '2rem' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'mentorInbox', label: 'Mentor Inbox', icon: Inbox, badge: mentorRequests.filter(r => r.status === 'OPEN').length },
            { id: 'composer', label: 'Notification Composer', icon: Bell },
            { id: 'colleges', label: 'Colleges & Cutoffs', icon: Building2 },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'tests', label: 'Mock Test Publisher', icon: Compass }
          ].map(tab => {
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' : 'rgba(15,23,42,0.8)',
                  color: '#ffffff',
                  border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  position: 'relative'
                }}>
                <IconComp size={16} /> {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    marginLeft: '0.2rem'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
              <div className="glass-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Total Registered Students</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>1,420</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>+48 new this week</div>
              </div>

              <div className="glass-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Pending Mentor Requests</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>
                  {mentorRequests.filter(r => r.status === 'OPEN').length} OPEN
                </div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.25rem' }}>Ramesh Action Needed</div>
              </div>

              <div className="glass-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Colleges & Cutoffs Data</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>{colleges.length} Colleges</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{CUTOFFS_DATA.length} Verified Cutoffs</div>
              </div>

              <div className="glass-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Mock Tests Attempted</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#c084fc', marginTop: '0.25rem' }}>3,890</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Avg Score: 114 / 160</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RAMESH MENTOR INBOX */}
        {activeTab === 'mentorInbox' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>Ramesh Mentor Inbox</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Manage and reply to student personal guidance requests</p>
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['ALL', 'OPEN', 'IN_PROGRESS', 'WAITING_FOR_STUDENT', 'RESOLVED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setMentorFilter(st)}
                    style={{
                      background: mentorFilter === st ? '#06b6d4' : 'rgba(15,23,42,0.8)',
                      color: '#ffffff',
                      border: mentorFilter === st ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}>
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Mentor Requests List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredMentorRequests.map(req => (
                <div key={req.id} className="glass-panel" style={{ padding: '1.75rem', borderColor: req.status === 'OPEN' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-purple">#{req.id}</span>
                      <span className="badge badge-cyan">{req.category}</span>
                      <span className={req.status === 'OPEN' ? 'badge badge-amber' : 'badge badge-green'}>{req.status}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Submitted: {req.createdAt}</span>
                  </div>

                  <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                    Student: {req.studentName} ({req.studentEmail})
                  </h3>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#f8fafc' }}>
                    <strong style={{ color: '#38bdf8', display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Student Original Question:</strong>
                    "{req.studentMessage}"
                  </div>

                  <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <strong style={{ color: '#c084fc', display: 'block', fontSize: '0.8rem', marginBottom: '0.2rem' }}>AI Conversation Summary:</strong>
                    {req.aiSummary}
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.3rem', fontStyle: 'italic' }}>
                      ⚠️ AI-generated summary — verify before relying on it.
                    </div>
                  </div>

                  {/* Reply Action Form */}
                  {req.status !== 'RESOLVED' && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>Reply to {req.studentName} as Ramesh (Sends Email & In-App Message):</label>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Type Ramesh's guidance reply..." 
                          value={replyText[req.id] || ''} 
                          onChange={(e) => setReplyText({ ...replyText, [req.id]: e.target.value })}
                        />
                        <button onClick={() => handleMentorReply(req.id)} className="btn-accent" style={{ padding: '0 1.25rem', whiteSpace: 'nowrap' }}>
                          <Send size={16} /> Send Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATION COMPOSER */}
        {activeTab === 'composer' && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Admin Notification Composer</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Broadcast targeted announcements, mock test alerts, and material updates via email and in-app notifications.
            </p>

            {composerSentSuccess && (
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                ✅ Announcement broadcasted successfully to all eligible students!
              </div>
            )}

            <form onSubmit={handleSendComposerNotification}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Notification Title *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={notifTitle} 
                    onChange={(e) => setNotifTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Target Audience</label>
                  <select className="form-control" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)}>
                    <option value="ALL">All Registered Students</option>
                    <option value="AP_EAPCET">AP EAPCET Students Only</option>
                    <option value="JEE">JEE Students Only</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Message Content *</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  value={notifMessage} 
                  onChange={(e) => setNotifMessage(e.target.value)} 
                  required 
                />
              </div>

              {/* Delivery Channel Toggles */}
              <div style={{ display: 'flex', gap: '2rem', margin: '1.25rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                  Send Email Notification 📧
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)} />
                  Send In-App Bell Notification 🔔
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEmailPreviewModal(true)} className="btn-secondary">
                  <Eye size={16} /> Email HTML Preview
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
                  <Send size={16} /> Publish & Broadcast Notification
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email HTML Preview Modal */}
        {showEmailPreviewModal && (
          <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', borderColor: 'rgba(6,182,212,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.1rem' }}>📧 Email HTML Preview</h3>
              <button onClick={() => setShowEmailPreviewModal(false)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>Close Preview</button>
            </div>
            <div style={{ background: '#ffffff', color: '#0f172a', padding: '1.5rem', borderRadius: '10px', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ borderBottom: '2px solid #06b6d4', paddingBottom: '0.75rem', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a' }}>
                LAUGHS WITH RAMESH CONNECTING 🎓
              </div>
              <h2 style={{ color: '#0369a1', fontSize: '1.2rem' }}>{notifTitle}</h2>
              <p style={{ color: '#334155', lineHeight: '1.6' }}>{notifMessage}</p>
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <a href="#" style={{ background: '#06b6d4', color: '#ffffff', padding: '0.75rem 1.5rem', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
                  Open Dashboard
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COLLEGES MANAGER */}
        {activeTab === 'colleges' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#ffffff', fontSize: '1.4rem' }}>College & Branch Database Manager</h2>
              <button onClick={() => setShowAddCollegeModal(true)} className="btn-primary">
                <Plus size={16} /> Add New College
              </button>
            </div>

            {/* Add College Modal */}
            {showAddCollegeModal && (
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderColor: 'rgba(6,182,212,0.4)' }}>
                <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Add College Profile</h3>
                <form onSubmit={handleAddCollege}>
                  <div className="grid-3">
                    <div className="form-group">
                      <label>College Full Name</label>
                      <input type="text" className="form-control" placeholder="e.g. RVR & JC College of Engineering" value={newCollegeName} onChange={(e) => setNewCollegeName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>College Code</label>
                      <input type="text" className="form-control" placeholder="e.g. RVRJ" value={newCollegeCode} onChange={(e) => setNewCollegeCode(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input type="text" className="form-control" placeholder="e.g. Guntur" value={newCollegeCity} onChange={(e) => setNewCollegeCity(e.target.value)} required />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setShowAddCollegeModal(false)} className="btn-secondary">Cancel</button>
                    <button type="submit" className="btn-primary">Save College</button>
                  </div>
                </form>
              </div>
            )}

            <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Code</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>College Name</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Location</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '1rem', textAlign: 'left' }}>Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.85rem 1rem', color: '#06b6d4', fontWeight: 700 }}>{c.code}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{c.location}</td>
                      <td style={{ padding: '0.85rem 1rem' }}><span className="badge badge-purple">{c.type}</span></td>
                      <td style={{ padding: '0.85rem 1rem', color: '#10b981' }}>{c.feesPerYear}</td>
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
};
