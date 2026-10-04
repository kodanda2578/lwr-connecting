import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

export const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your admin credentials.');
      return;
    }

    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin');
    } else {
      setError(res.error || 'Invalid admin credentials or unauthorized account.');
    }
  };

  return (
    <div style={{ padding: '4rem 0', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at top, rgba(139, 92, 246, 0.15) 0%, transparent 70%)' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
            }}>
              <ShieldCheck size={30} color="#ffffff" />
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>
              Laughs With Ramesh Connecting
            </div>
            <h2 style={{ fontSize: '1.75rem', color: '#ffffff', fontWeight: 800 }}>ADMIN PORTAL</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Secure management system for platform administrators & mentors
            </p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><Mail size={14} style={{ display: 'inline', marginRight: '4px' }} /> Admin Email / Username</label>
              <input 
                type="email"
                className="form-control"
                placeholder="admin@lwrconnecting.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label><Lock size={14} style={{ display: 'inline', marginRight: '4px' }} /> Password</label>
              <input 
                type="password"
                className="form-control"
                placeholder="••••••••••••"
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
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '1.25rem',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                opacity: loading ? 0.7 : 1
              }}>
              {loading ? 'Authenticating Admin...' : <>Sign in to Admin Panel <ArrowRight size={18} /></>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
