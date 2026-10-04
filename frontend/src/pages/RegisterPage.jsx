import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  FileText
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
    board: 'BIEAP',
    targetExam: 'AP_EAPCET',
    targetBranch: 'CSE',
    state: 'Andhra Pradesh',
    city: 'Visakhapatnam'
  });

  const [userId, setUserId] = useState(null);

  // Email OTP States
  const [emailOtp, setEmailOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

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

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber || '',
          password: formData.password
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
      const res = await fetch('/api/auth/verify-email-otp', {
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
      const res = await fetch('/api/auth/send-email-otp', {
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
    setStep(4); // Move to Location step
  };

  // STEP 4: Submit Location Details
  const handleStep4Submit = (e) => {
    e.preventDefault();
    setStep(5); // Move to Profile Summary step
  };

  // STEP 5: Complete Profile (Submit Profile Summary)
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          collegeName: formData.collegeName,
          intermediateYear: formData.intermediateYear,
          board: formData.board,
          targetExam: formData.targetExam,
          targetBranch: formData.targetBranch,
          state: formData.state,
          city: formData.city
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
            {step === 3 && 'Step 3: Academic Details 🎓'}
            {step === 4 && 'Step 4: Location Details 📍'}
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

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}>
                {loading ? 'Starting Registration...' : 'Continue to Email Verification'} <ArrowRight size={18} />
              </button>
            </form>

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
            <form onSubmit={handleStep3Submit}>
              <div className="form-group">
                <label><Building2 size={14} style={{ display: 'inline', marginRight: '4px' }} /> Current College / Junior College / School Name *</label>
                <input 
                  type="text"
                  name="collegeName"
                  className="form-control"
                  placeholder="e.g. Narayana / Sri Chaitanya / Govt Junior College"
                  value={formData.collegeName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label><BookOpen size={14} style={{ display: 'inline', marginRight: '4px' }} /> Intermediate Year</label>
                  <select 
                    name="intermediateYear"
                    className="form-control"
                    value={formData.intermediateYear}
                    onChange={handleChange}>
                    <option value={1}>1st Year (Class 11)</option>
                    <option value={2}>2nd Year (Class 12 / Appearing)</option>
                    <option value={3}>Intermediate Passed / Long Term</option>
                  </select>
                </div>

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
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label><Target size={14} style={{ display: 'inline', marginRight: '4px' }} /> Target Entrance Exam</label>
                  <select 
                    name="targetExam"
                    className="form-control"
                    value={formData.targetExam}
                    onChange={handleChange}>
                    <option value="AP_EAPCET">AP EAPCET (EAMCET)</option>
                    <option value="JEE_MAIN">JEE Main</option>
                    <option value="JEE_ADV">JEE Advanced</option>
                    <option value="BOTH">Both JEE + AP EAPCET</option>
                    <option value="Other">Other Exam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target B.Tech Branch</label>
                  <select 
                    name="targetBranch"
                    className="form-control"
                    value={formData.targetBranch}
                    onChange={handleChange}>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="AI_DS">AI & Data Science (AI/DS)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="EEE">Electrical (EEE)</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="Other">Other Branch</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}>
                Continue to Location <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 4 FORM: LOCATION DETAILS */}
        {step === 4 && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleStep4Submit}>
              <div className="grid-2">
                <div className="form-group">
                  <label><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> State</label>
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
                    placeholder="e.g. Vijayawada, Visakhapatnam"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}>
                Continue to Profile Summary <ArrowRight size={18} />
              </button>
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
                <span style={{ color: '#94a3b8' }}>College / School:</span>
                <strong style={{ color: '#38bdf8' }}>{formData.collegeName || 'Not specified'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Intermediate Year:</span>
                <strong style={{ color: '#cbd5e1' }}>Year {formData.intermediateYear} ({formData.board})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Exam & Branch:</span>
                <strong style={{ color: '#c084fc' }}>{formData.targetExam} — {formData.targetBranch}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Location:</span>
                <strong style={{ color: '#cbd5e1' }}>{formData.city}, {formData.state}</strong>
              </div>
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
              Your account has been fully verified and registered with email OTP.
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
                <span style={{ color: '#94a3b8' }}>Mobile Number:</span>
                <strong style={{ color: '#cbd5e1' }}>{formData.mobileNumber || 'Not provided'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Current College:</span>
                <strong style={{ color: '#38bdf8' }}>{formData.collegeName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Intermediate Year:</span>
                <strong style={{ color: '#cbd5e1' }}>Year {formData.intermediateYear} ({formData.board})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>Target Exam & Branch:</span>
                <strong style={{ color: '#c084fc' }}>{formData.targetExam} — {formData.targetBranch}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Location:</span>
                <strong style={{ color: '#cbd5e1' }}>{formData.city}, {formData.state}</strong>
              </div>
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
