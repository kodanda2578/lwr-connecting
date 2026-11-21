import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  Mail, 
  HeartHandshake,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

export const PrivacyPolicyPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    typeof window !== 'undefined' && window.location.pathname.includes('/terms') ? 'terms' : 'privacy'
  );
  const [deletionReason, setDeletionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletionSubmitted, setDeletionSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestDeletion = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await apiService.requestDataDeletion(deletionReason || 'Student/Guardian requested deletion via Privacy Policy page');
      setDeletionSubmitted(true);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit deletion request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem 0', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        
        {/* Page Header */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldCheck size={32} color="#ffffff" />
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            Intermediate Student Beta v1
          </div>

          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            {activeTab === 'terms' ? 'Intermediate Beta Terms of Service' : 'Privacy Policy & Minor Safeguards'}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '640px', margin: '0 auto 1.25rem auto' }}>
            {activeTab === 'terms' 
              ? 'Guidelines, student eligibility, and guardian terms for the 100-student controlled beta.'
              : 'LWR Connecting is dedicated to providing a secure, transparent, and age-appropriate educational guidance platform for Class 11 and Class 12 students.'}
          </p>

          <div style={{ display: 'inline-flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setActiveTab('privacy')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'privacy' ? '#06b6d4' : 'transparent',
                color: activeTab === 'privacy' ? '#ffffff' : '#94a3b8'
              }}
            >
              Privacy & Minor Safeguards
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'terms' ? '#8b5cf6' : 'transparent',
                color: activeTab === 'terms' ? '#ffffff' : '#94a3b8'
              }}
            >
              Beta Terms of Service
            </button>
          </div>
        </div>

        {activeTab === 'terms' ? (
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#8b5cf6" /> 1. Beta Cohort Scope & Target Students
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                The LWR Connecting Beta is a controlled preview environment strictly designed for <strong>Intermediate Class 11 and Class 12 students</strong> pursuing MPC (Mathematics, Physics, Chemistry) and preparing for JEE Main, JEE Advanced, AP EAPCET, and TG EAPCET. Registration is strictly capped at a configurable limit (maximum 100 students).
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#06b6d4" /> 2. Minor Safety & Guardian Supervision
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Because high school students may be minors under 18 years of age:
              </p>
              <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                <li>Parental or legal guardian consent is mandatory prior to completing onboarding.</li>
                <li>All student guidance requests and mentorship interactions are routed through verified platform administrators and recorded group webinars.</li>
                <li><strong>No private unmonitored backchannels</strong> or unsupervised one-on-one personal interactions between minors and external adults are allowed on the platform.</li>
              </ul>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} color="#10b981" /> 3. Educational Integrity & Fair Use
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Platform materials, mock question sets, and cutoff prediction tools are provided solely for non-commercial, personal study by enrolled students. Automated scraping, unauthorized redistribution, or sharing credentials is strictly prohibited.
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} color="#f59e0b" /> 4. Academic Guidance & Cutoff Disclaimers
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Historical opening and closing cutoffs (APSCHE and JoSAA) are published for informational guidance only. Seat allocations fluctuate annually based on candidate performance, reservation rules, and normalization. Historical data does not guarantee future college admission.
              </p>
            </div>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={20} color="#ef4444" /> 5. Account Termination & Right to Data Deletion
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                Students and legal guardians may discontinue beta participation at any time and request permanent deletion of their account, test attempts, and profile records using the automated deletion tool in the Privacy section.
              </p>
            </div>
          </div>
        ) : (
        <>
        {/* Core Commitments Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#38bdf8' }}>
              <Lock size={20} />
              <strong style={{ color: '#ffffff' }}>Zero Sensitive PII</strong>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              We never collect Aadhaar numbers, PAN cards, banking credentials, or unnecessary personal documentation.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#4ade80' }}>
              <UserCheck size={20} />
              <strong style={{ color: '#ffffff' }}>Guardian Consent for Minors</strong>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              All students under 18 require parent or legal guardian acknowledgement prior to accessing platform resources.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', color: '#c084fc' }}>
              <HeartHandshake size={20} />
              <strong style={{ color: '#ffffff' }}>Supervised Mentorship Only</strong>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              Unsupervised private 1-on-1 backchannels between minors and mentors are strictly prohibited.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1 */}
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#06b6d4" /> 1. Information We Collect & Why
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              We adhere strictly to the principle of minimal data collection. We only ask for information strictly required to power your personalized engineering admissions journey:
            </p>
            <ul style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
              <li><strong style={{ color: '#f8fafc' }}>Account Identity:</strong> Student Full Name and verified Email address (used for secure OTP login, test result scorecards, and account recovery).</li>
              <li><strong style={{ color: '#f8fafc' }}>Academic Stage:</strong> Intermediate Class (11 or 12), Study Stream (MPC), and Education Board (used to configure syllabus milestones and past question banks).</li>
              <li><strong style={{ color: '#f8fafc' }}>Target Entrance Exams:</strong> AP EAPCET, TG EAPCET, JEE Main, or JEE Advanced (calibrates past cutoff closing ranks and personalized college predictor algorithms).</li>
              <li><strong style={{ color: '#f8fafc' }}>Engineering Interests:</strong> Desired specializations such as CSE, AI/DS, or ECE (customizes branch-wise cutoff explorer results).</li>
              <li><strong style={{ color: '#f8fafc' }}>Guardian Contact (for Minors):</strong> Parent or legal guardian name and contact number to verify parental consent and share mentorship updates.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#8b5cf6" /> 2. Minor Protection & Mentorship Safeguards
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Because high school and intermediate students preparing for entrance exams may be minors, LWR Connecting enforces strict child safety protocols:
            </p>
            <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              color: '#cbd5e1',
              fontSize: '0.88rem',
              lineHeight: 1.6
            }}>
              <strong style={{ color: '#c4b5fd', display: 'block', marginBottom: '0.35rem' }}>
                🛡️ Zero Unsupervised Backchannels Policy:
              </strong>
              No mentor, counselor, or administrator is permitted to engage in unmonitored private direct messaging with minor students outside verified platform channels. All mentorship sessions with Ramesh Sir or guest faculty are conducted in recorded group webinars or with guardian notifications.
            </div>
          </div>

          {/* Section 3 */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={20} color="#10b981" /> 3. Data Storage & Privacy Shield
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              Your academic records, test attempts, and profile information are stored securely with password hashing (BCrypt) and role-based access control. LWR Connecting does not sell, rent, or trade student data with commercial coaching institutes, marketing aggregators, or private college brokers.
            </p>
          </div>

          {/* Section 4: Account & Data Deletion Request */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={20} color="#ef4444" /> 4. Student & Guardian Right to Data Deletion
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Students and their legal guardians retain full ownership of their data. You can request complete deletion of your profile, test history, and mentorship logs at any time.
            </p>

            {user ? (
              deletionSubmitted ? (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: '#4ade80'
                }}>
                  <CheckCircle2 size={24} />
                  <div>
                    <strong style={{ display: 'block', color: '#86efac', fontSize: '0.95rem' }}>
                      Account Deletion Request Recorded
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Your request has been submitted to the platform administrator. Your account and associated records will be permanently expunged within 48 hours.
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestDeletion} style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <strong style={{ color: '#f87171', display: 'block', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    Request Account & Data Deletion
                  </strong>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
                    Signed in as: <strong>{user.fullName || user.email}</strong>. Submitting this request will schedule your account and all associated test attempts for permanent removal.
                  </p>

                  {errorMessage && (
                    <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                      {errorMessage}
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                      Optional Reason for Deletion
                    </label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Completed intermediate exams / privacy request"
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-secondary"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderColor: '#ef4444',
                      color: '#fca5a5',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    Submit Deletion Request
                  </button>
                </form>
              )
            ) : (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1.25rem',
                fontSize: '0.88rem',
                color: '#cbd5e1'
              }}>
                To request automated account deletion, please <Link to="/login" style={{ color: '#06b6d4', fontWeight: 600 }}>Sign In</Link> to your student account, or email our Data Privacy Officer at <strong style={{ color: '#38bdf8' }}>privacy@lwrconnecting.edu.in</strong> with your registered student email address.
              </div>
            )}
          </div>

          {/* Section 5: Grievance Contact */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={20} color="#06b6d4" /> 5. Data Protection Officer Contact
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              If you or your guardian have any questions, concerns, or requests regarding student privacy and data security, contact our team at:
            </p>
            <div style={{ marginTop: '0.75rem', color: '#38bdf8', fontSize: '0.9rem', fontWeight: 600 }}>
              📧 privacy@lwrconnecting.edu.in • support@lwrconnecting.edu.in
            </div>
          </div>

        </div>
        </>
        )}

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Back to Home <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </div>
  );
};

