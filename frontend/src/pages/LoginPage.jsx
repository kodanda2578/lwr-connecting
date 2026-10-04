import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';

export const LoginPage = () => {
  const { login, verifyLoginOtp, sendLoginOtp } = useAuth();
  const navigate = useNavigate();

  // Form & Step States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Login OTP Verification States
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [loginUserId, setLoginUserId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // STEP 1: Submit Credentials
  const handleSubmitCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.requiresLoginOtp) {
      // Transition to Login OTP Screen
      setLoginUserId(res.userId);
      setMaskedEmail(res.maskedEmail || email);
      setShowOtpStep(true);
      setCooldown(60);
      setInfo(res.message || 'Verification code sent to ' + (res.maskedEmail || email));
    } else if (res.success) {
      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else if (res.requiresOnboarding) {
      let targetStep = 2;
      if (res.nextStep === 'PROFILE_COMPLETION') targetStep = 3;

      setInfo(res.message || 'Verification required. Redirecting to onboarding...');
      setTimeout(() => {
        navigate('/register', {
          state: {
            resumeStep: targetStep,
            userId: res.userId,
            email: res.email,
            mobileNumber: res.mobileNumber
          }
        });
      }, 1000);
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  // STEP 2: Submit Login OTP
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!loginOtp || loginOtp.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyLoginOtp(loginUserId, loginOtp);
    setLoading(false);

    if (res.success) {
      if (res.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Invalid OTP code. Please check and try again.');
    }
  };

  // Resend Login OTP
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setInfo('');

    const res = await sendLoginOtp(loginUserId);
    if (res.success) {
      setCooldown(60);
      setInfo('New login verification OTP sent to ' + (res.maskedEmail || maskedEmail));
    } else {
      setError(res.error || 'Unable to resend OTP right now.');
    }
  };

  // Back to Email/Password form
  const handleBackToLogin = () => {
    setShowOtpStep(false);
    setLoginOtp('');
    setError('');
    setInfo('');
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setInfo('');
    setLoading(true);
    if (role === 'ADMIN') {
      setEmail('admin@lwr.com');
      setPassword('Admin@123');
      const res = await login('admin@lwr.com', 'Admin@123');
      setLoading(false);
      if (res.success) navigate('/admin');
      else setError(res.error || 'Admin login failed');
    } else {
      setEmail('student.demo@lwrconnecting.com');
      setPassword('Password123!');
      const res = await login('student.demo@lwrconnecting.com', 'Password123!');
      setLoading(false);
      if (res.requiresLoginOtp) {
        setLoginUserId(res.userId);
        setMaskedEmail(res.maskedEmail || 'student.demo@lwrconnecting.com');
        setShowOtpStep(true);
        setCooldown(60);
        setInfo('Verification code sent for Student Demo.');
      } else if (res.success) {
        navigate('/dashboard');
      } else if (res.requiresOnboarding) {
        let targetStep = 2;
        if (res.nextStep === 'PROFILE_COMPLETION') targetStep = 3;
        navigate('/register', { state: { resumeStep: targetStep, userId: res.userId, email: res.email } });
      } else setError(res.error || 'Student login failed');
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <GraduationCap size={28} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#ffffff' }}>
              {showOtpStep ? 'Verify Email to Continue 📧' : 'Welcome Back'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {showOtpStep 
                ? `Enter the 6-digit code sent to ${maskedEmail}` 
                : 'Sign in to access your B.Tech guidance & mock test dashboard'}
            </p>
          </div>

          {/* Alert Messages */}
          {info && (
            <div style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              color: '#38bdf8',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              {info}
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              {error}
            </div>
          )}

          {/* LOGIN STEP 2: LOGIN OTP VERIFICATION FORM */}
          {showOtpStep ? (
            <div>
              <form onSubmit={handleVerifyOtpSubmit}>
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <label style={{ marginBottom: '0.75rem' }}>6-Digit Login Verification Code</label>
                  <input 
                    type="text"
                    maxLength="6"
                    className="form-control"
                    placeholder="• • • • • •"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '0.35em', fontWeight: 800 }}
                    disabled={loading}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginBottom: '1rem' }}>
                  {loading ? 'Verifying Code...' : <>Verify & Continue <CheckCircle2 size={18} /></>}
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={handleBackToLogin}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                  <ArrowLeft size={14} /> Back
                </button>

                <button 
                  type="button"
                  onClick={handleResendOtp} 
                  disabled={cooldown > 0 || loading} 
                  className="btn-secondary" 
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', opacity: cooldown > 0 ? 0.6 : 1 }}>
                  <RefreshCw size={14} /> {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN STEP 1: EMAIL & PASSWORD FORM */
            <form onSubmit={handleSubmitCredentials}>
              <div className="form-group">
                <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Email Address</label>
                <input 
                  type="email"
                  className="form-control"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#06b6d4' }}>Forgot?</Link>
                </div>
                <input 
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.85rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Authenticating...' : <>Continue to Email Verification <ArrowRight size={18} /></>}
              </button>
            </form>
          )}

          {/* Quick Demo Logins */}
          {!showOtpStep && (
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Instant Demo Single Sign-On
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin('STUDENT')}
                  className="btn-secondary" 
                  disabled={loading}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.6rem', justifyContent: 'center' }}>
                  <User size={14} /> Student Demo
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin('ADMIN')}
                  className="btn-secondary" 
                  disabled={loading}
                  style={{ flex: 1, fontSize: '0.8rem', padding: '0.6rem', justifyContent: 'center', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                  <ShieldCheck size={14} color="#8b5cf6" /> Admin Demo
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
            Don't have an account? <Link to="/register" style={{ color: '#06b6d4', fontWeight: 600 }}>Create Profile</Link>
          </div>

        </div>
      </div>
    </div>
  );
};
