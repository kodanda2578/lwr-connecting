import React, { useState } from 'react';
import { HelpCircle, Calendar, Clock, BookOpen, CheckCircle2 } from 'lucide-react';

export const DoubtSessionPage = () => {
  const [formData, setFormData] = useState({
    topic: '',
    exam: 'AP_EAPCET',
    description: '',
    preferredDate: '',
    preferredTime: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <HelpCircle size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Request a Doubt Session</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Book a 1-on-1 scheduled doubt clarification session with senior subject mentors.
          </p>
        </div>

        {submitted ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>Session Request Submitted!</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Our academic team will confirm your preferred slot via email and mobile notification.
            </p>
            <button onClick={() => setSubmitted(false)} className="btn-secondary">Request Another Session</button>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Topic / Concept Name *</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Integration by Parts or VSEPR"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Entrance Exam Context</label>
                  <select className="form-control" value={formData.exam} onChange={(e) => setFormData({ ...formData, exam: e.target.value })}>
                    <option value="AP_EAPCET">AP EAPCET</option>
                    <option value="JEE">JEE Main</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Detailed Problem Description *</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  placeholder="Describe where you get stuck or attach question details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={formData.preferredDate} 
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time Slot *</label>
                  <select 
                    className="form-control" 
                    value={formData.preferredTime} 
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })} 
                    required>
                    <option value="">Select Time Slot</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', padding: '0.85rem' }}>
                Submit Doubt Session Request
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
