import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  BookOpen, 
  Building2, 
  Compass, 
  Award,
  MessageSquare,
  ShieldCheck,
  Bell
} from 'lucide-react';

export const Navbar = () => {
  const { user, adminUser, logout, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const activeAdmin = adminUser || (user && user.role === 'ROLE_ADMIN' ? user : null);

  const isActive = (path) => location.pathname === path;

  // Dedicated Admin Header view when on Admin pages or logged in as Admin
  if (isAdminRoute || activeAdmin) {
    return (
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(15, 10, 30, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          
          <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
            }}>
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                LWR CONNECTING <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.3)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.5)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>ADMIN PORTAL</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Platform Administration & Mentor System
              </div>
            </div>
          </Link>

          {activeAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                👋 {activeAdmin.fullName || 'Admin'}
              </span>

              <Link to="/admin" className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                Dashboard
              </Link>

              <button 
                onClick={() => { adminLogout(); navigate('/admin/login'); }}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                title="Admin Logout">
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <Link to="/admin/login" className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}>
              Sign In to Admin
            </Link>
          )}

        </div>
      </header>
    );
  }

  // Standard Student Navbar (No Admin links exposed)
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(6, 9, 19, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
          }}>
            <GraduationCap size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              LAUGHS WITH RAMESH <span className="text-gradient">CONNECTING</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
              One Platform. Complete B.Tech Guidance.
            </div>
          </div>
        </Link>

        {/* Student Desktop Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <Link 
            to="/jee" 
            style={{ 
              color: isActive('/jee') ? '#06b6d4' : '#cbd5e1', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <BookOpen size={16} /> JEE Prep
          </Link>

          <Link 
            to="/eapcet" 
            style={{ 
              color: isActive('/eapcet') ? '#06b6d4' : '#cbd5e1', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Award size={16} /> AP EAPCET
          </Link>

          <Link 
            to="/college-predictor" 
            style={{ 
              color: isActive('/college-predictor') ? '#06b6d4' : '#cbd5e1', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Building2 size={16} /> College Predictor
          </Link>

          <Link 
            to="/mock-tests" 
            style={{ 
              color: isActive('/mock-tests') ? '#06b6d4' : '#cbd5e1', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Compass size={16} /> Mock Tests
          </Link>

          <Link 
            to="/ai-assistant" 
            className="badge badge-purple"
            style={{ 
              padding: '0.4rem 0.8rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}>
            <Sparkles size={14} /> LWR AI
          </Link>

          <Link 
            to="/community" 
            style={{ 
              color: isActive('/community') ? '#06b6d4' : '#cbd5e1', 
              fontWeight: 600, 
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <MessageSquare size={16} /> Community
          </Link>
        </nav>

        {/* Student Account / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              
              {/* Notifications Center */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f8fafc',
                    cursor: 'pointer'
                  }}>
                  <Bell size={18} />
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#06b6d4',
                    borderRadius: '50%'
                  }}></span>
                </button>

                {showNotifications && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '320px',
                    padding: '1.25rem',
                    zIndex: 1050
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                        Notifications Center
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#06b6d4', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>
                        Mark all read
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <Link to="/mock-tests" onClick={() => setShowNotifications(false)} style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                        <strong style={{ color: '#06b6d4', display: 'block' }}>📝 New Mock Test Published</strong>
                        AP EAPCET 2026 Full Length Grand Mock Test 01 is now live!
                      </Link>

                      <Link to="/study-materials" onClick={() => setShowNotifications(false)} style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                        <strong style={{ color: '#8b5cf6', display: 'block' }}>📚 New Study Material Added</strong>
                        AP EAPCET Mathematics Quick Revision Formula Sheet 2026.
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Student Dashboard button */}
              <Link 
                to="/dashboard" 
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <User size={16} /> Dashboard
              </Link>

              <button 
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
                title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'none'
            }}
            className="mobile-toggle">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px'
        }}>
          <Link to="/jee" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>JEE Prep</Link>
          <Link to="/eapcet" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>AP EAPCET</Link>
          <Link to="/college-predictor" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>College Predictor</Link>
          <Link to="/mock-tests" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>Mock Tests</Link>
          <Link to="/branches" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>Branch Discovery</Link>
          <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} style={{ color: '#06b6d4', fontWeight: 700 }}>LWR AI Assistant</Link>
          <Link to="/community" onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', fontWeight: 600 }}>Community</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};
