import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Video, 
  ExternalLink, 
  RefreshCw, 
  Send, 
  User, 
  BookOpen, 
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AdminGuidanceManager() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, scheduled: 0, completed: 0, rejected: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Schedule / Reschedule Modal State
  const [modalMode, setModalMode] = useState(null); // 'schedule' or 'reschedule'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    startTime: '10:00:00',
    endTime: '10:45:00',
    timeZone: 'Asia/Kolkata',
    meetingMethod: 'Google Meet',
    meetingUrl: '',
    notes: ''
  });
  const [schedulingSubmitting, setSchedulingSubmitting] = useState(false);
  const [schedulingError, setSchedulingError] = useState('');
  const [schedulingSuccess, setSchedulingSuccess] = useState('');

  // Admin Response / Quick Status Modal State
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [targetStatus, setTargetStatus] = useState('APPROVED');

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqList, statsData] = await Promise.all([
        apiService.getAdminGuidanceRequests(filterStatus),
        apiService.getAdminGuidanceStats()
      ]);
      setRequests(Array.isArray(reqList) ? reqList : []);
      if (statsData) setStats(statsData);
    } catch (e) {
      console.error('Failed to load guidance requests:', e);
    } finally {
      setLoading(false);
    }
  };

  const openScheduleModal = (req, mode = 'schedule') => {
    setSelectedRequest(req);
    setModalMode(mode);
    setSchedulingError('');
    setSchedulingSuccess('');
    
    const appt = req.appointment;
    if (appt && mode === 'reschedule') {
      setScheduleData({
        date: appt.date || appt.appointmentDate || '',
        startTime: appt.startTime || '10:00:00',
        endTime: appt.endTime || '10:45:00',
        timeZone: appt.timeZone || 'Asia/Kolkata',
        meetingMethod: appt.meetingMethod || 'Google Meet',
        meetingUrl: appt.meetingUrl || '',
        notes: appt.notes || ''
      });
    } else {
      // Default to preferredDate if provided
      const defaultDate = req.preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0];
      setScheduleData({
        date: defaultDate,
        startTime: '10:00:00',
        endTime: '10:45:00',
        timeZone: 'Asia/Kolkata',
        meetingMethod: 'Google Meet',
        meetingUrl: '',
        notes: 'Please keep your rank card and marks memo ready for the session.'
      });
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSchedulingSubmitting(true);
    setSchedulingError('');
    setSchedulingSuccess('');

    try {
      if (modalMode === 'reschedule' && selectedRequest.appointment?.appointmentId) {
        await apiService.rescheduleAppointment(selectedRequest.appointment.appointmentId, scheduleData);
        setSchedulingSuccess('Appointment rescheduled and notification sent to student.');
      } else {
        await apiService.scheduleAppointment(selectedRequest.id, scheduleData);
        setSchedulingSuccess('Appointment scheduled successfully! In-app notification & confirmation email dispatched.');
      }
      setTimeout(() => {
        setModalMode(null);
        loadData();
      }, 1500);
    } catch (err) {
      setSchedulingError(err.message || 'Failed to schedule appointment. Please check for conflicting time slots.');
    } finally {
      setSchedulingSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (reqId, newStatus, promptResponse = false) => {
    if (promptResponse) {
      setSelectedRequest(requests.find(r => r.id === reqId));
      setTargetStatus(newStatus);
      setResponseText('');
      setResponseModalOpen(true);
      return;
    }

    try {
      await apiService.updateGuidanceStatus(reqId, newStatus);
      loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateGuidanceStatus(selectedRequest.id, targetStatus, responseText);
      setResponseModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleRetryEmail = async (appointmentId) => {
    try {
      const res = await apiService.retryAppointmentEmail(appointmentId);
      alert(`Email dispatch re-attempted. Status: ${res.emailDeliveryStatus}`);
      loadData();
    } catch (err) {
      alert('Email retry failed: ' + err.message);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    const reason = window.prompt('Please enter cancellation reason for the student:');
    if (reason === null) return;

    try {
      await apiService.cancelAppointment(apptId, reason);
      loadData();
    } catch (err) {
      alert('Error cancelling appointment: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return <span className="badge badge-green">📅 Scheduled</span>;
      case 'APPROVED':
        return <span className="badge badge-cyan">✓ Approved</span>;
      case 'COMPLETED':
        return <span className="badge badge-purple">✓ Completed</span>;
      case 'REJECTED':
        return <span className="badge badge-red">✕ Rejected</span>;
      case 'CANCELLED':
        return <span className="badge badge-gray">Cancelled</span>;
      default:
        return <span className="badge badge-yellow">⏳ Pending Review</span>;
    }
  };

  return (
    <div>
      {/* Top Metrics Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Pending Review
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
            {stats.pending || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scheduled Sessions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
            {stats.scheduled || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completed Sessions
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc', marginTop: '0.25rem' }}>
            {stats.completed || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Requests
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22d3ee', marginTop: '0.25rem' }}>
            {stats.total || 0}
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'SCHEDULED', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={filterStatus === st ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.775rem', padding: '0.35rem 0.85rem' }}
            >
              {st}
            </button>
          ))}
        </div>

        <button onClick={loadData} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          <RefreshCw size={14} className={loading ? 'spinning' : ''} /> Refresh Queue
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="state-box">
          <div className="loading-spinner"></div>
          <div className="state-box-title">Loading Guidance Requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="state-box">
          <div className="state-box-icon">
            <Inbox size={28} />
          </div>
          <div className="state-box-title">No Requests Found</div>
          <div className="state-box-desc">
            No student guidance requests match the selected status filter ({filterStatus}).
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {requests.map(req => {
            const appt = req.appointment;
            return (
              <div key={req.id} className="glass-panel" style={{ padding: '1.75rem', borderColor: req.status === 'PENDING' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)' }}>
                
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-purple" style={{ fontFamily: 'monospace' }}>#{req.requestId || req.id}</span>
                      <h3 style={{ color: '#ffffff', fontSize: '1.2rem', margin: 0 }}>
                        {req.studentName}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>({req.studentEmail})</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                      {req.educationLevel} • Exam: <strong style={{ color: '#06b6d4' }}>{req.targetExam}</strong> • Category: <strong>{req.subjectCategory}</strong>
                      {req.phone && <span> • Phone: {req.phone}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getStatusBadge(req.status)}
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(req.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Doubt Question */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#f1f5f9', lineHeight: 1.6 }}>
                  <strong style={{ color: '#38bdf8', display: 'block', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Student's Problem / Request:</strong>
                  "{req.doubtDescription}"
                  {req.preferredDate && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      Preferred Slot by Student: <strong style={{ color: '#ffffff' }}>{req.preferredDate}</strong> ({req.preferredTimeSlot || 'Not specified'})
                    </div>
                  )}
                </div>

                {/* Admin Response Note */}
                {req.adminResponse && (
                  <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <strong style={{ color: '#06b6d4' }}>Ramesh's Response / Instructions:</strong> {req.adminResponse}
                  </div>
                )}

                {/* Confirmed Appointment Details if Scheduled */}
                {appt && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} /> Scheduled Appointment Details
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#ffffff' }}>
                        <strong>Date:</strong> {appt.date || appt.appointmentDate} | <strong>Time:</strong> {appt.startTime} – {appt.endTime} ({appt.timeZone || 'Asia/Kolkata'})
                      </div>
                      {appt.meetingUrl && (
                        <div style={{ fontSize: '0.8rem', color: '#22d3ee', marginTop: '0.25rem' }}>
                          <strong>Meeting:</strong> <a href={appt.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#22d3ee', textDecoration: 'underline' }}>{appt.meetingUrl}</a>
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: appt.emailDeliveryStatus === 'SENT' ? '#10b981' : '#f59e0b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Email Confirmation: {appt.emailDeliveryStatus === 'SENT' ? '✓ Sent to Student' : `⚠️ Status: ${appt.emailDeliveryStatus || 'FAILED'}`}</span>
                        {appt.emailDeliveryStatus !== 'SENT' && (
                          <button
                            onClick={() => handleRetryEmail(appt.appointmentId)}
                            className="btn-secondary"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.7rem', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.4)' }}
                            title="Retry dispatching confirmation email"
                          >
                            Retry Sending Email
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => openScheduleModal(req, 'reschedule')} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Reschedule
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appt.appointmentId)} 
                        className="btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', flexWrap: 'wrap' }}>
                  {req.status === 'PENDING' && (
                    <>
                      <button 
                        onClick={() => openScheduleModal(req, 'schedule')} 
                        className="btn-primary" 
                        style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
                      >
                        <Calendar size={14} /> Schedule Session
                      </button>

                      <button 
                        onClick={() => handleQuickStatusChange(req.id, 'APPROVED', true)} 
                        className="btn-secondary" 
                        style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem', color: '#22d3ee', borderColor: 'rgba(6, 182, 212, 0.4)' }}
                      >
                        Approve & Reply
                      </button>

                      <button 
                        onClick={() => handleQuickStatusChange(req.id, 'REJECTED', true)} 
                        className="btn-secondary" 
                        style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === 'APPROVED' && !appt && (
                    <button 
                      onClick={() => openScheduleModal(req, 'schedule')} 
                      className="btn-primary" 
                      style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
                    >
                      <Calendar size={14} /> Schedule Slot
                    </button>
                  )}

                  {req.status === 'SCHEDULED' && (
                    <button 
                      onClick={() => handleQuickStatusChange(req.id, 'COMPLETED')} 
                      className="btn-secondary" 
                      style={{ fontSize: '0.825rem', padding: '0.45rem 0.9rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                    >
                      <CheckCircle2 size={14} /> Mark Completed
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Schedule / Reschedule Appointment */}
      {modalMode && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>
                  {modalMode === 'reschedule' ? 'Reschedule Appointment' : 'Schedule Guidance Session'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Student: {selectedRequest.studentName} (#{selectedRequest.requestId || selectedRequest.id})
                </span>
              </div>
              <button 
                onClick={() => setModalMode(null)} 
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.25rem' }}>
                ✕
              </button>
            </div>

            {schedulingError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} /> {schedulingError}
              </div>
            )}

            {schedulingSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} /> {schedulingSuccess}
              </div>
            )}

            <form onSubmit={handleScheduleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="sched-date">Session Date *</label>
                  <input 
                    id="sched-date"
                    type="date" 
                    className="form-control" 
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sched-tz">Time Zone</label>
                  <input 
                    id="sched-tz"
                    type="text" 
                    className="form-control" 
                    value={scheduleData.timeZone}
                    onChange={(e) => setScheduleData({ ...scheduleData, timeZone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="sched-start">Start Time *</label>
                  <input 
                    id="sched-start"
                    type="time" 
                    step="1"
                    className="form-control" 
                    value={scheduleData.startTime}
                    onChange={(e) => setScheduleData({ ...scheduleData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sched-end">End Time *</label>
                  <input 
                    id="sched-end"
                    type="time" 
                    step="1"
                    className="form-control" 
                    value={scheduleData.endTime}
                    onChange={(e) => setScheduleData({ ...scheduleData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="sched-method">Meeting Method</label>
                  <select 
                    id="sched-method"
                    className="form-control form-select"
                    value={scheduleData.meetingMethod}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingMethod: e.target.value })}
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Phone Call">Direct Phone Call</option>
                    <option value="In-Person Office">In-Person Office</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sched-url">Meeting URL (Only if configured)</label>
                  <input 
                    id="sched-url"
                    type="url" 
                    className="form-control" 
                    placeholder="https://meet.google.com/xyz-abc"
                    value={scheduleData.meetingUrl}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sched-notes">Instructions / Notes for Student (Will be included in confirmation email)</label>
                <textarea 
                  id="sched-notes"
                  className="form-control"
                  rows="3"
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setModalMode(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={schedulingSubmitting} className="btn-primary">
                  {schedulingSubmitting ? 'Validating & Scheduling...' : (modalMode === 'reschedule' ? 'Confirm Reschedule' : 'Confirm & Dispatch Confirmation Email')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin Response / Rejection / Notes */}
      {responseModalOpen && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Update Request to: {targetStatus}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Student: {selectedRequest.studentName} ({selectedRequest.studentEmail})
            </p>

            <form onSubmit={handleResponseSubmit}>
              <div className="form-group">
                <label>Admin Note / Reason (Sent to Student via Notification):</label>
                <textarea 
                  className="form-control"
                  rows="4"
                  placeholder="Enter guidance instructions or reason..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setResponseModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Status & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
