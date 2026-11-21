import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Video, 
  MapPin, 
  AlertCircle, 
  Clock3, 
  ExternalLink,
  Sparkles,
  UserCheck,
  RefreshCw,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

export const DoubtSessionPage = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [myRequests, setMyRequests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const [formData, setFormData] = useState({
    studentName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.mobileNumber || '',
    educationLevel: 'Intermediate 2nd Year',
    targetExam: 'AP_EAPCET',
    subjectCategory: 'College Cutoffs & Predictor',
    doubtDescription: '',
    preferredDate: '',
    preferredTimeSlot: '10:00 AM - 11:00 AM'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        studentName: user.fullName || prev.studentName,
        email: user.email || prev.email,
        phone: user.mobileNumber || prev.phone
      }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadMyRequests();
    }
  }, [activeTab]);

  const loadMyRequests = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiService.getMyGuidanceRequests();
      setMyRequests(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Failed to load guidance requests:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!consentGiven) {
      setSubmitError('Please review and check the privacy & student consent declaration before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiService.submitGuidanceRequest({
        ...formData,
        studentName: formData.studentName || user?.fullName || 'Student',
        email: formData.email || user?.email
      });
      setSubmitSuccess(res);
      setConsentGiven(false);
      setFormData(prev => ({
        ...prev,
        doubtDescription: '',
        preferredDate: ''
      }));
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit guidance request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="badge badge-green" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>📅 Scheduled</span>;
      case 'RESCHEDULED':
        return <span className="badge badge-cyan" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.4)' }}>🔄 Rescheduled</span>;
      case 'RESCHEDULE_REQUESTED':
        return <span className="badge badge-amber" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>🕒 Reschedule Requested</span>;
      case 'APPROVED':
        return <span className="badge badge-cyan" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.4)' }}>✓ Approved</span>;
      case 'COMPLETED':
        return <span className="badge badge-purple" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.4)' }}>✓ Completed</span>;
      case 'REJECTED':
        return <span className="badge badge-red" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>✕ Not Accepted</span>;
      case 'CANCELLED':
        return <span className="badge badge-gray" style={{ background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.4)' }}>Cancelled</span>;
      default:
        return <span className="badge badge-yellow" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>⏳ Pending Review</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '850px' }}>
        
        {/* Page Hero Header */}
        <div className="page-hero" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="page-hero-badge" style={{ margin: '0 auto 1rem auto' }}>
            <Sparkles size={14} /> 1-on-1 Student Guidance Workflow
          </div>
          <h1 className="page-hero-title">
            Connect with Ramesh
          </h1>
          <p className="page-hero-subtitle" style={{ maxWidth: '680px', margin: '0 auto' }}>
            Get direct personalized guidance from Ramesh on Intermediate study schedules, AP EAPCET / JEE Main rank strategy, college cutoffs, and centralized web options counselling.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('new')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'new' ? '2px solid #06b6d4' : '2px solid transparent',
              color: activeTab === 'new' ? '#06b6d4' : '#94a3b8',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} /> Request Guidance Session
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #06b6d4' : '2px solid transparent',
              color: activeTab === 'history' ? '#06b6d4' : '#94a3b8',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Clock3 size={16} /> My Requests & Appointments
            {myRequests.length > 0 && (
              <span style={{ background: '#06b6d4', color: '#000', fontSize: '0.75rem', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                {myRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: New Guidance Request */}
        {activeTab === 'new' && (
          <div>
            {submitSuccess ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1.25rem auto' }} />
                <h2 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.75rem' }}>
                  Guidance Request Submitted Successfully!
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 1.5rem auto' }}>
                  Your request has been saved with <strong>Request ID #{submitSuccess.requestId || submitSuccess.id}</strong>. Ramesh and the academic guidance team will review your query, schedule your session, and send an email confirmation.
                </p>

                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  maxWidth: '480px',
                  margin: '0 auto 2rem auto',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Request ID:</span>
                    <strong style={{ color: '#06b6d4' }}>#{submitSuccess.requestId || submitSuccess.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Status:</span>
                    {getStatusBadge(submitSuccess.status)}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Category:</span>
                    <span style={{ color: '#e2e8f0' }}>{submitSuccess.subjectCategory}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => { setSubmitSuccess(null); setActiveTab('history'); }} 
                    className="btn-primary">
                    View My Requests & Status
                  </button>
                  <button 
                    onClick={() => setSubmitSuccess(null)} 
                    className="btn-secondary">
                    Submit Another Query
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '0.85rem 1.25rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={18} /> {submitError}
                    </div>
                  )}

                  <div className="grid-2">
                    <div className="form-group">
                      <label htmlFor="req-name">Student Full Name *</label>
                      <input 
                        id="req-name"
                        type="text"
                        className="form-control"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="req-email">Account Email *</label>
                      <input 
                        id="req-email"
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label htmlFor="req-phone">Mobile / WhatsApp Number (Optional)</label>
                      <input 
                        id="req-phone"
                        type="tel"
                        className="form-control"
                        placeholder="e.g. 9848012345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="req-edu">Education Level *</label>
                      <select 
                        id="req-edu"
                        className="form-control form-select"
                        value={formData.educationLevel}
                        onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value })}
                        required
                      >
                        <option value="Intermediate 2nd Year">Intermediate 2nd Year / Class 12</option>
                        <option value="Intermediate 1st Year">Intermediate 1st Year / Class 11</option>
                        <option value="Diploma / Polytechnic">Diploma / Polytechnic (Lateral Entry)</option>
                        <option value="Long Term Repeater">Long Term / Repeater</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label htmlFor="req-exam">Primary Entrance Exam Context *</label>
                      <select 
                        id="req-exam"
                        className="form-control form-select"
                        value={formData.targetExam}
                        onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                        required
                      >
                        <option value="AP_EAPCET">AP EAPCET (Engineering)</option>
                        <option value="TG_EAPCET">TG EAPCET / TS EAMCET</option>
                        <option value="JEE_MAIN">JEE Main</option>
                        <option value="JEE_ADVANCED">JEE Advanced</option>
                        <option value="BITSAT">BITSAT</option>
                        <option value="OTHER_STATE">Other State Technical Board</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="req-cat">Guidance Subject / Topic *</label>
                      <select 
                        id="req-cat"
                        className="form-control form-select"
                        value={formData.subjectCategory}
                        onChange={(e) => setFormData({ ...formData, subjectCategory: e.target.value })}
                        required
                      >
                        <option value="College Cutoffs & Predictor">College Cutoffs & Rank Predictor</option>
                        <option value="Web Options & Counselling Order">Centralized Web Options & Counselling Order</option>
                        <option value="Exam Strategy & Daily Timetable">Exam Strategy & High-Yield Timetable</option>
                        <option value="Branch Selection (CSE vs ECE etc.)">Branch Selection (CSE vs ECE etc.)</option>
                        <option value="Subject Doubts (Maths / Physics / Chemistry)">Subject Concept Doubts</option>
                        <option value="Other Personal Guidance">Other Personal Guidance</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="req-desc">Detailed Problem / Guidance Description *</label>
                    <textarea 
                      id="req-desc"
                      className="form-control" 
                      rows="4" 
                      placeholder="Explain your expected/actual rank, target colleges (AUCE, JNTUK, KL University, CBIT, IIT/NIT), preferred branches, or specific concept doubts..."
                      value={formData.doubtDescription}
                      onChange={(e) => setFormData({ ...formData, doubtDescription: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label htmlFor="req-date">Preferred Session Date (Optional)</label>
                      <input 
                        id="req-date"
                        type="date" 
                        className="form-control" 
                        value={formData.preferredDate} 
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="req-slot">Preferred Time Slot</label>
                      <select 
                        id="req-slot"
                        className="form-control form-select" 
                        value={formData.preferredTimeSlot} 
                        onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}>
                        <option value="10:00 AM - 11:00 AM">Morning: 10:00 AM - 11:00 AM</option>
                        <option value="02:00 PM - 03:00 PM">Afternoon: 02:00 PM - 03:00 PM</option>
                        <option value="06:00 PM - 07:00 PM">Evening: 06:00 PM - 07:00 PM</option>
                        <option value="08:00 PM - 09:00 PM">Night: 08:00 PM - 09:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Privacy Notice & Student Consent */}
                  <div style={{
                    margin: '1.25rem 0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="checkbox"
                      id="consent-checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      required
                      style={{ marginTop: '0.2rem', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="consent-checkbox" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5, cursor: 'pointer' }}>
                      <strong style={{ color: '#ffffff' }}>Privacy Notice & Student Consent:</strong> I authorize LWR Connecting to process my educational and contact details strictly for scheduling 1-on-1 guidance with Ramesh. Your information is never sold, shared with third parties, or used for commercial marketing.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={submitting || !consentGiven}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '0.9rem', fontSize: '1rem' }}
                  >
                    {submitting ? 'Submitting Request...' : 'Submit Guidance Request to Ramesh'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: My Requests & Appointment History */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Showing all submitted guidance requests and confirmed appointments.
              </div>
              <button 
                onClick={loadMyRequests} 
                className="btn-secondary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                title="Refresh requests"
              >
                <RefreshCw size={14} className={loadingHistory ? 'spinning' : ''} /> Refresh
              </button>
            </div>

            {loadingHistory ? (
              <div className="state-box">
                <div className="loading-spinner"></div>
                <div className="state-box-title">Loading Your Guidance Requests...</div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="state-box">
                <div className="state-box-icon">
                  <HelpCircle size={28} />
                </div>
                <div className="state-box-title">No Guidance Requests Yet</div>
                <div className="state-box-desc">
                  You haven't requested any guidance sessions. Click "Request Guidance Session" to get personalized advice from Ramesh.
                </div>
                <button onClick={() => setActiveTab('new')} className="btn-primary" style={{ marginTop: '1.25rem' }}>
                  Request Your First Session
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myRequests.map((req) => {
                  const appt = req.appointment;
                  return (
                    <div key={req.id} className="glass-panel" style={{ padding: '2rem' }}>
                      
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                              #{req.requestId || req.id}
                            </span>
                            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.15rem' }}>
                              {req.subjectCategory}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                            Target Exam: <strong style={{ color: '#06b6d4' }}>{req.targetExam}</strong> • {req.educationLevel} • Submitted: {new Date(req.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>

                      {/* Request Lifecycle Timeline */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        margin: '0.75rem 0 1.25rem 0',
                        padding: '0.65rem 1rem',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle2 size={13} /> 1. Submitted
                        </div>
                        <div style={{ color: ['APPROVED', 'SCHEDULED', 'RESCHEDULED', 'COMPLETED'].includes(req.status) ? '#10b981' : req.status === 'REJECTED' || req.status === 'CANCELLED' ? '#94a3b8' : '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {['APPROVED', 'SCHEDULED', 'RESCHEDULED', 'COMPLETED'].includes(req.status) ? <CheckCircle2 size={13} /> : '●'} 2. Under Review
                        </div>
                        <div style={{ color: ['SCHEDULED', 'RESCHEDULED', 'COMPLETED'].includes(req.status) ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {['SCHEDULED', 'RESCHEDULED', 'COMPLETED'].includes(req.status) ? <CheckCircle2 size={13} /> : '○'} 3. Scheduled
                        </div>
                        <div style={{ color: req.status === 'COMPLETED' ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {req.status === 'COMPLETED' ? <CheckCircle2 size={13} /> : '○'} 4. Completed
                        </div>
                      </div>

                      {/* Doubt Body */}
                      <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.25rem',
                        color: '#cbd5e1',
                        fontSize: '0.9rem',
                        lineHeight: 1.6
                      }}>
                        <strong style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Your Question / Topic:</strong>
                        {req.doubtDescription}
                      </div>

                      {/* Admin Response if available */}
                      {req.adminResponse && (
                        <div style={{
                          background: 'rgba(6, 182, 212, 0.05)',
                          border: '1px solid rgba(6, 182, 212, 0.2)',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '1.25rem',
                          color: '#e2e8f0',
                          fontSize: '0.9rem'
                        }}>
                          <strong style={{ color: '#06b6d4', display: 'block', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                            💬 Ramesh's Response / Instructions:
                          </strong>
                          {req.adminResponse}
                        </div>
                      )}

                      {/* Confirmed Appointment Banner */}
                      {appt && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '10px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>
                            <Calendar size={18} /> Confirmed Session Details
                          </div>

                          <div className="grid-3" style={{ fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ color: '#94a3b8', display: 'block' }}>Date:</span>
                              <strong style={{ color: '#ffffff' }}>{appt.appointmentDate || appt.date}</strong>
                            </div>

                            <div>
                              <span style={{ color: '#94a3b8', display: 'block' }}>Time:</span>
                              <strong style={{ color: '#ffffff' }}>{appt.startTime} – {appt.endTime}</strong>
                            </div>

                            <div>
                              <span style={{ color: '#94a3b8', display: 'block' }}>Time Zone:</span>
                              <span style={{ color: '#ffffff' }}>{appt.timeZone || 'Asia/Kolkata'}</span>
                            </div>
                          </div>

                          {appt.meetingUrl && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22d3ee', fontSize: '0.85rem' }}>
                                <Video size={16} /> Meeting Link Configured
                              </div>
                              <a 
                                href={appt.meetingUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-primary" 
                                style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
                              >
                                Join Session <ExternalLink size={13} />
                              </a>
                            </div>
                          )}

                          {appt.emailDeliveryStatus && (
                            <div style={{ fontSize: '0.75rem', color: appt.emailDeliveryStatus === 'SENT' ? '#10b981' : '#f59e0b' }}>
                              Email Confirmation: {appt.emailDeliveryStatus === 'SENT' ? '✓ Dispatched to your email' : '⚠️ Pending dispatch'}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default DoubtSessionPage;
