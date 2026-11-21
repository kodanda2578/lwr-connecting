import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { buildApiUrl } from '../config/appConfig';
import { 
  GraduationCap, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  Target, 
  BookOpen, 
  Building2, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Info,
  Key
} from 'lucide-react';

export const RegisterPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 6-Step Registration Flow:
  // Step 1: Basic Personal Details
  // Step 2: Email OTP Verification
  // Step 3: Academic Details
  // Step 4: Location
  // Step 5: Profile Summary
  // Step 6: Registration Complete
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    intermediateYear: 2,
    intermediateClass: 12,
    studyStream: 'MPC',
    board: 'BIEAP',
    targetExam: 'AP_EAPCET',
    targetBranch: 'CSE',
    engineeringInterests: 'Computer Science & AI / Data Science',
    state: 'Andhra Pradesh',
    city: 'Visakhapatnam',
    isMinor: true,
    guardianName: '',
    guardianEmail: '',
    guardianPhone: '',
    guardianConsentGiven: false,
    inviteCode: ''
  });

  const [userId, setUserId] = useState(null);
  const [betaStatus, setBetaStatus] = useState(null);
  const [inviteValidation, setInviteValidation] = useState(null);
  const [checkingInvite, setCheckingInvite] = useState(false);

  // Email OTP States
  const [emailOtp, setEmailOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Fetch Beta Access Status and check invite in URL
  useEffect(() => {
    apiService.getBetaStatus()
      .then((status) => {
        if (status) setBetaStatus(status);
      })
      .catch(() => {});

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlInvite = searchParams.get('invite') || searchParams.get('code');
      if (urlInvite) {
        const clean = urlInvite.trim().toUpperCase();
        setFormData(prev => ({ ...prev, inviteCode: clean }));
        validateInviteCodeLive(clean);
      }
    } catch (e) {}
  }, []);

  const validateInviteCodeLive = async (code) => {
    if (!code || code.trim().length < 4) {
      setInviteValidation(null);
      return;
    }
    try {
      setCheckingInvite(true);
      const res = await apiService.validateInviteCode(code.trim().toUpperCase(), formData.email);
      setInviteValidation(res);
    } catch (e) {
      setInviteValidation({ valid: false, reason: 'Error checking code' });
    } finally {
      setCheckingInvite(false);
    }
  };

  // Resume Onboarding if redirected from Login or ProtectedRoute
  useEffect(() => {
    if (location.state) {
      if (location.state.resumeStep) {
        setStep(location.state.resumeStep);
      }
      if (location.state.userId) {
        setUserId(location.state.userId);
      }
      if (location.state.email || location.state.mobileNumber) {
        setFormData(prev => ({
          ...prev,
          email: location.state.email || prev.email,
          mobileNumber: location.state.mobileNumber || prev.mobileNumber
        }));
      }
    }
  }, [location]);

  // Cooldown Countdown Timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // STEP 1: Submit Basic Personal Details
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields (Full Name, Email, Password).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (betaStatus?.inviteOnlyMode && (!formData.inviteCode || formData.inviteCode.trim().length === 0)) {
      setError('LWR Connecting Wave 1 is strictly invite-only. Please enter your 10-character invitation code (e.g. LWR-W1-XXXXXX).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber || '',
          password: formData.password,
          inviteCode: formData.inviteCode ? formData.inviteCode.trim().toUpperCase() : ''
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        setError(data.error || 'This email is already registered. Please Sign In instead.');
      } else if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
      } else {
        setUserId(data.userId);
        setStep(2); // Move to Email OTP step
        setCooldown(60);
        setInfoMessage('Verification code sent to ' + formData.email);
      }
    } catch (err) {
      setError('Unable to connect to backend server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Email OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(buildApiUrl('/auth/verify-email-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.toString(), otp: emailOtp })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP code.');
      } else {
        setStep(3); // Move to Academic Details step
        setInfoMessage('Email verified successfully! Now complete your academic details.');
      }
    } catch (err) {
      setError('Unable to verify OTP right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendEmailOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setInfoMessage('');

    try {
      const res = await fetch(buildApiUrl('/auth/send-email-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (res.status === 429) {
        setError(data.error || 'Please wait before requesting a new code.');
        setCooldown(60);
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Unable to send OTP.');
        return;
      }
      setCooldown(60);
      setInfoMessage('New verification OTP sent to ' + formData.email);
    } catch (err) {
      setError('Unable to resend OTP code.');
    }
  };

  // STEP 3: Submit Academic Details
  const handleStep3Submit = (e) => {
    e.preventDefault();
    setStep(4); // Move to Location & Guardian step
  };

  // STEP 4: Submit Location Details & Guardian Consent
  const handleStep4Submit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.isMinor) {
      if (!formData.guardianName?.trim() || !formData.guardianPhone?.trim()) {
        setError('Parent or Legal Guardian name and contact number are required for students under 18.');
        return;
      }
      if (!formData.guardianConsentGiven) {
        setError('Parent or Guardian consent is required for minor students to access the beta platform.');
        return;
      }
    }

    setStep(5); // Move to Profile Summary step
  };

  // STEP 5: Complete Profile (Submit Profile Summary)
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(buildApiUrl('/auth/complete-profile'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          collegeName: formData.collegeName,
          intermediateYear: formData.intermediateYear,
          intermediateClass: Number(formData.intermediateClass),
          studyStream: formData.studyStream,
          board: formData.board,
          targetExam: formData.targetExam,
          targetBranch: formData.targetBranch,
          engineeringInterests: formData.engineeringInterests,
          state: formData.state,
          city: formData.city,
          isMinor: formData.isMinor,
          guardianName: formData.guardianName,
          guardianEmail: formData.guardianEmail,
          guardianPhone: formData.guardianPhone,
          guardianConsentGiven: formData.guardianConsentGiven
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setUser({
          id: data.userId,
          fullName: data.fullName,
          email: data.email,
          mobileNumber: data.mobileNumber,
          role: data.role,
          token: data.token,
          accountStatus: 'ACTIVE',
          emailVerified: true,
          mobileVerified: true,
          profileCompleted: true,
          profile: data.profile
        });
        setStep(6); // Profile ready / Complete screen
      } else {
        setError(data.error || 'Failed to complete profile. Please try again.');
      }
    } catch (err) {
      setError('Unable to complete profile right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem 0', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '680px' }}>

        {/* Beta Notice & Capacity Banner */}
        {betaStatus && (() => {
          const spotsLeft = betaStatus.remainingSpots ?? betaStatus.spotsRemaining ?? 0;
          const registered = betaStatus.registeredStudents ?? betaStatus.currentBetaCount ?? 0;
          const limit = betaStatus.maxStudentsLimit ?? betaStatus.registrationLimit ?? 100;
          const isPaused = Boolean(betaStatus.registrationsPaused);
          const isFull = spotsLeft <= 0;

          return (
            <div style={{
              background: isPaused || isFull
                ? 'rgba(239, 68, 68, 0.12)'
                : 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
              border: isPaused || isFull
                ? '1px solid rgba(239, 68, 68, 0.3)'
                : '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: isPaused ? '#ef4444' : '#06b6d4',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {isPaused ? 'Beta Paused' : 'Controlled Beta v1'}
                  </span>
                  <strong style={{ color: '#ffffff' }}>
                    Intermediate MPC Cohort (Class 11 & 12)
                  </strong>
                </div>
                <div style={{ color: (!isFull && !isPaused) ? '#38bdf8' : '#f87171', fontWeight: 600, fontSize: '0.82rem' }}>
                  {registered} / {limit} Registered ({spotsLeft} spots left)
                </div>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.82rem', margin: '0 0 0.4rem 0', lineHeight: 1.5 }}>
                {betaStatus.betaNoticeMessage || 'Welcome to the LWR Connecting Beta for Intermediate Class 11 and Class 12 students.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.76rem' }}>
                <ShieldCheck size={14} />
                <span>Safety & Privacy First: No Aadhaar or PAN required. Supervised mentorship with guardian consent.</span>
              </div>
            </div>
          );
        })()}
        
        {/* Step Indicator Header */}
        <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <GraduationCap size={26} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>
            {step === 1 && 'Step 1: Create your LWR Account'}
            {step === 2 && 'Step 2: Verify your Email 📧'}
            {step === 3 && 'Step 3: Academic Details & Interests 🎓'}
            {step === 4 && 'Step 4: Location & Guardian Consent 🛡️'}
            {step === 5 && 'Step 5: Profile Summary 📋'}
            {step === 6 && "Step 6: You're All Set! 🎉"}
          </h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div 
                key={st}
                style={{
                  height: '6px',
                  width: st === step ? '28px' : '12px',
                  borderRadius: '9999px',
                  background: st <= step ? 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Error / Alert Banners */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>{error}</div>
            {(error.includes('already registered') || error.includes('already exists')) && (
              <Link to="/login" className="btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ffffff' }}>
                Go to Sign In
              </Link>
            )}
          </div>
        )}

        {infoMessage && !error && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            {infoMessage}
          </div>
        )}

        {/* STEP 1 FORM: BASIC DETAILS */}
        {step === 1 && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleStep1Submit}>
              {/* Beta Wave 1 Invitation Code Input */}
              <div className="form-group" style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <label style={{ margin: 0, fontWeight: 700, color: '#c4b5fd', fontSize: '0.85rem' }}>
                    <Key size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    Wave 1 Beta Invitation Code {betaStatus?.inviteOnlyMode && '*'}
                  </label>
                  {betaStatus?.inviteOnlyMode && (
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                      INVITE-ONLY (CAPACITY: 50)
                    </span>
                  )}
                </div>
                <input 
                  type="text"
                  name="inviteCode"
                  className="form-control"
                  placeholder="e.g. LWR-W1-7K9P2X"
                  value={formData.inviteCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setFormData(prev => ({ ...prev, inviteCode: val }));
                    validateInviteCodeLive(val);
                  }}
                  required={Boolean(betaStatus?.inviteOnlyMode)}
                  style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}
                />
                {checkingInvite && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    Checking invitation code...
                  </div>
                )}
                {inviteValidation && !checkingInvite && (
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginTop: '0.35rem',
                    color: inviteValidation.valid ? '#34d399' : '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    {inviteValidation.valid ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                    {inviteValidation.valid ? 'Verified Wave 1 Invitation Code' : inviteValidation.reason}
                  </div>
                )}
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  LWR Connecting Wave 1 is limited to 50 Intermediate students. Request an invite via your college representative or mentor network.
                </div>
              </div>

              <div className="form-group">
                <label><User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Full Name *</label>
                <input 
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder="e.g. Sai Kumar"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email Address *</label>
                  <input 
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="sai@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Mobile Number (Optional)</label>
                  <input 
                    type="tel"
                    name="mobileNumber"
                    className="form-control"
                    placeholder="+91 9876543210"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password *</label>
                  <input 
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || (betaStatus && (Boolean(betaStatus.registrationsPaused) || (betaStatus.remainingSpots ?? betaStatus.spotsRemaining ?? 1) <= 0))} 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  marginTop: '1.25rem', 
                  padding: '0.85rem',
                  opacity: (betaStatus && (Boolean(betaStatus.registrationsPaused) || (betaStatus.remainingSpots ?? betaStatus.spotsRemaining ?? 1) <= 0)) ? 0.5 : 1,
                  cursor: (betaStatus && (Boolean(betaStatus.registrationsPaused) || (betaStatus.remainingSpots ?? betaStatus.spotsRemaining ?? 1) <= 0)) ? 'not-allowed' : 'pointer'
                }}>
                {loading ? 'Starting Registration...' : (
                  Boolean(betaStatus?.registrationsPaused) 
                    ? 'Beta Registrations Paused' 
                    : ((betaStatus?.remainingSpots ?? betaStatus?.spotsRemaining ?? 1) <= 0 ? 'Beta Limit Reached (100 Students)' : 'Continue to Email Verification')
                )} <ArrowRight size={18} />
              </button>
            </form>

            {Boolean(betaStatus?.registrationsPaused) && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>
                ⚠️ Beta registrations are temporarily paused by the administration.
              </div>
            )}
            {betaStatus && !Boolean(betaStatus.registrationsPaused) && (betaStatus.remainingSpots ?? betaStatus.spotsRemaining ?? 1) <= 0 && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.75rem', textAlign: 'center' }}>
                ⚠️ The initial 100-student beta limit has been reached. Please check back soon or sign in if you already registered.
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
              Already registered? <Link to="/login" style={{ color: '#06b6d4', fontWeight: 600 }}>Sign In</Link>
            </div>
          </div>
        )}

        {/* STEP 2 FORM: EMAIL OTP VERIFICATION */}
        {step === 2 && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              We have sent a 6-digit verification code to <strong>{formData.email}</strong>.
            </p>

            <form onSubmit={handleVerifyEmailOtp}>
              <div className="form-group" style={{ maxWidth: '300px', margin: '0 auto 1.5rem auto' }}>
                <label>Enter 6-Digit Email OTP</label>
                <input 
                  type="text"
                  maxLength="6"
                  className="form-control"
                  placeholder="• • • • • •"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 800 }}
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginBottom: '1rem' }}>
                {loading ? 'Verifying Code...' : 'Verify Email & Continue'} <CheckCircle2 size={18} />
              </button>
            </form>

            <div style={{ marginTop: '1rem' }}>
              <button 
                type="button"
                onClick={handleResendEmailOtp} 
                disabled={cooldown > 0} 
                className="btn-secondary" 
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: cooldown > 0 ? 0.6 : 1 }}>
                <RefreshCw size={14} /> {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 FORM: ACADEMIC DETAILS */}
        {step === 3 && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '0.4rem' }}>Academic Details & Engineering Goals</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                We use this information strictly to configure syllabus milestones, mock test patterns, and previous year cutoff predictions.
              </p>
            </div>

            <form onSubmit={handleStep3Submit}>
              <div className="form-group">
                <label><Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Current Junior College / School Name *</label>
                <input 
                  type="text"
                  name="collegeName"
                  className="form-control"
                  placeholder="e.g. Narayana Junior College / Sri Chaitanya / Govt Junior College"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} /> Intermediate Class *</label>
                  <select 
                    name="intermediateClass"
                    className="form-control"
                    value={formData.intermediateClass}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFormData(prev => ({ 
                        ...prev, 
                        intermediateClass: val, 
                        intermediateYear: val === 11 ? 1 : 2 
                      }));
                    }}>
                    <option value={11}>Class 11 (Intermediate 1st Year)</option>
                    <option value={12}>Class 12 (Intermediate 2nd Year)</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    Used to adjust difficulty of test questions and syllabus coverage.
                  </small>
                </div>

                <div className="form-group">
                  <label>Study Stream *</label>
                  <select 
                    name="studyStream"
                    className="form-control"
                    value={formData.studyStream}
                    onChange={handleChange}>
                    <option value="MPC">MPC (Mathematics, Physics, Chemistry) — Recommended</option>
                    <option value="Other">Other Stream (BiPC / MEC / Vocational)</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    Required for engineering entrance preparation (JEE & EAPCET).
                  </small>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Education Board</label>
                  <select 
                    name="board"
                    className="form-control"
                    value={formData.board}
                    onChange={handleChange}>
                    <option value="BIEAP">BIEAP (Andhra Pradesh)</option>
                    <option value="TSBIE">TSBIE (Telangana)</option>
                    <option value="CBSE">CBSE</option>
                    <option value="Other">Other Board</option>
                  </select>
                </div>

                <div className="form-group">
                  <label><Target size={14} style={{ display: 'inline', marginRight: '4px' }} /> Target Entrance Exam *</label>
                  <select 
                    name="targetExam"
                    className="form-control"
                    value={formData.targetExam}
                    onChange={handleChange}>
                    <option value="AP_EAPCET">AP EAPCET (Andhra Pradesh Engineering)</option>
                    <option value="TG_EAPCET">TG EAPCET (Telangana Engineering)</option>
                    <option value="JEE_MAIN">JEE Main (National NITs/IIITs)</option>
                    <option value="JEE_ADV">JEE Advanced (IITs)</option>
                    <option value="BOTH">Both JEE Main + State EAPCET</option>
                  </select>
                  <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                    Configures test format, past cutoffs, and college predictor engine.
                  </small>
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Engineering Specializations / Interests *</label>
                <select 
                  name="engineeringInterests"
                  className="form-control"
                  value={formData.engineeringInterests}
                  onChange={handleChange}>
                  <option value="Computer Science & AI / Data Science">Computer Science & AI / Data Science</option>
                  <option value="Electronics & Communication (ECE / VLSI)">Electronics & Communication (ECE / VLSI)</option>
                  <option value="Electrical & Electronics (EEE)">Electrical & Electronics (EEE)</option>
                  <option value="Mechanical & Automation / Robotics">Mechanical & Automation / Robotics</option>
                  <option value="Civil & Infrastructure Engineering">Civil & Infrastructure Engineering</option>
                  <option value="Information Technology & Cybersecurity">Information Technology & Cybersecurity</option>
                  <option value="Chemical / Biotechnology">Chemical / Biotechnology</option>
                </select>
                <small style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginTop: '4px' }}>
                  Filters relevant branch cutoffs and college placement comparisons.
                </small>
              </div>

              {/* Privacy Notice Box */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                margin: '1rem 0',
                fontSize: '0.78rem',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <ShieldCheck size={16} color="#06b6d4" />
                <span>
                  <strong>Privacy Safeguard:</strong> LWR Connecting will never ask for Aadhaar, PAN, banking details, or passwords outside login.
                </span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}>
                Continue to Location & Guardian Consent <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 4 FORM: LOCATION & GUARDIAN SAFEGUARDS */}
        {step === 4 && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '0.4rem' }}>Location & Minor Safety Safeguards</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Because many Intermediate students are minors, we follow strict safety policies and guardian consent procedures.
              </p>
            </div>

            <form onSubmit={handleStep4Submit}>
              <div className="grid-2">
                <div className="form-group">
                  <label><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> State *</label>
                  <select 
                    name="state"
                    className="form-control"
                    value={formData.state}
                    onChange={handleChange}>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>City / Town *</label>
                  <input 
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. Vijayawada, Visakhapatnam, Hyderabad"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Minor & Guardian Consent Card */}
              <div style={{
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginTop: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <ShieldCheck size={20} color="#06b6d4" />
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>Parent / Legal Guardian Consent (For Students Under 18)</strong>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: '#e2e8f0' }}>
                    <input 
                      type="checkbox"
                      checked={formData.isMinor}
                      onChange={(e) => setFormData(prev => ({ ...prev, isMinor: e.target.checked }))}
                      style={{ accentColor: '#06b6d4', width: '16px', height: '16px' }}
                    />
                    I am an Intermediate student under 18 years old (Minor)
                  </label>
                </div>

                {formData.isMinor && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="grid-2">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem' }}>Parent / Guardian Full Name *</label>
                        <input 
                          type="text"
                          name="guardianName"
                          className="form-control"
                          placeholder="e.g. S. Venkat Rao"
                          value={formData.guardianName}
                          onChange={handleChange}
                          required={formData.isMinor}
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem' }}>Guardian Contact Mobile Number *</label>
                        <input 
                          type="tel"
                          name="guardianPhone"
                          className="form-control"
                          placeholder="+91 9876543210"
                          value={formData.guardianPhone}
                          onChange={handleChange}
                          required={formData.isMinor}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.8rem' }}>Guardian Email Address (Optional)</label>
                      <input 
                        type="email"
                        name="guardianEmail"
                        className="form-control"
                        placeholder="parent@example.com"
                        value={formData.guardianEmail}
                        onChange={handleChange}
                      />
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '0.85rem',
                      fontSize: '0.78rem',
                      color: '#cbd5e1',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.3rem' }}>
                        🛡️ Child & Minor Safety Policy
                      </div>
                      LWR Connecting strictly prohibits unsupervised private backchannels between mentors and minors. All mentorship sessions are conducted in verified group/supervised formats with guardian notification. Students or guardians may request account and data deletion at any time.
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.84rem', color: '#e2e8f0', marginTop: '0.25rem' }}>
                      <input 
                        type="checkbox"
                        checked={formData.guardianConsentGiven}
                        onChange={(e) => setFormData(prev => ({ ...prev, guardianConsentGiven: e.target.checked }))}
                        style={{ accentColor: '#06b6d4', width: '18px', height: '18px', marginTop: '2px' }}
                        required={formData.isMinor}
                      />
                      <span>
                        <strong>I confirm parent/guardian consent:</strong> My parent or legal guardian has reviewed and consented to my participation in the LWR Connecting educational beta, including mock tests, college discovery, and supervised mentorship interactions. *
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setStep(3)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Back to Academics
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.85rem' }}>
                  Review Profile Summary <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5 FORM: PROFILE SUMMARY */}
        {step === 5 && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto'
              }}>
                <FileText size={24} color="#06b6d4" />
              </div>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>Review Your Student Profile</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                Please review your details below before completing registration.
              </p>
            </div>

            {/* Summary Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Student Name:</span>
                <strong style={{ color: '#ffffff' }}>{formData.fullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Email Address:</span>
                <strong style={{ color: '#10b981' }}>{formData.email} (Verified ✓)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Mobile Number:</span>
                <strong style={{ color: '#cbd5e1' }}>{formData.mobileNumber || 'Not provided'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Junior College:</span>
                <strong style={{ color: '#38bdf8' }}>{formData.collegeName || 'Not specified'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Intermediate Class:</span>
                <strong style={{ color: '#cbd5e1' }}>Class {formData.intermediateClass} ({formData.studyStream} Stream, {formData.board})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Exam:</span>
                <strong style={{ color: '#c084fc' }}>{formData.targetExam}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Engineering Interest:</span>
                <strong style={{ color: '#38bdf8' }}>{formData.engineeringInterests}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Location:</span>
                <strong style={{ color: '#cbd5e1' }}>{formData.city}, {formData.state}</strong>
              </div>
              {formData.isMinor && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#94a3b8' }}>Guardian Safeguard:</span>
                  <strong style={{ color: '#10b981' }}>{formData.guardianName} (Consent Verified ✓)</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleCompleteProfile}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(3)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Edit Details
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.85rem' }}>
                  {loading ? 'Completing Profile...' : 'Complete Profile & Finish'} <Sparkles size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 6 SUMMARY SCREEN: REGISTRATION COMPLETE */}
        {step === 6 && (
          <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={36} color="#ffffff" />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Your LWR Connecting profile is ready! 🎉
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Your account has been fully verified, registered, and authorized for the Beta Cohort.
            </p>

            {/* Profile Summary Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Student Name:</span>
                <strong style={{ color: '#ffffff' }}>{formData.fullName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Email Address:</span>
                <strong style={{ color: '#10b981' }}>{formData.email} (Verified ✓)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Class & Stream:</span>
                <strong style={{ color: '#cbd5e1' }}>Class {formData.intermediateClass} ({formData.studyStream} Stream)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Exam:</span>
                <strong style={{ color: '#c084fc' }}>{formData.targetExam}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Engineering Interest:</span>
                <strong style={{ color: '#38bdf8' }}>{formData.engineeringInterests}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Location:</span>
                <strong style={{ color: '#cbd5e1' }}>{formData.city}, {formData.state}</strong>
              </div>
              {formData.isMinor && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Guardian Safeguard:</span>
                  <strong style={{ color: '#10b981' }}>{formData.guardianName} (Consent Verified ✓)</strong>
                </div>
              )}
            </div>

            <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}>
              Continue to Student Dashboard <ArrowRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
