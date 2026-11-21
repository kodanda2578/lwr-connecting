import React, { useState, useEffect } from 'react';
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
  Bell,
  Calendar,
  CheckCircle2,
  MessageSquarePlus
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { BetaFeedbackModal } from './BetaFeedbackModal';

export const Navbar = () => {
  const { user, adminUser, logout, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ROLE_ADMIN') {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const res = await apiService.getUnreadNotificationCount();
      if (res && typeof res.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (e) {
      // silently fallback
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const list = await apiService.getNotifications();
      setNotifications(list || []);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

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
                LWR CONNECTING <span className="admin-title-badge" style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.3)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.5)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>ADMIN PORTAL</span>
              </div>
              <div className="admin-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Platform Administration & Mentor System
              </div>
            </div>
          </Link>

          {activeAdmin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="admin-greeting" style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
                👋 {activeAdmin.fullName || 'Admin'}
              </span>

              <Link to="/admin" className="btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
                Dashboard
              </Link>

              <button
                onClick={() => { adminLogout(); navigate('/admin/login'); }}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
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
            <div className="brand-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              LAUGHS WITH RAMESH <span className="text-gradient">CONNECTING</span>
            </div>
            <div className="brand-subtitle" style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
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
            to="/pyqs"
            style={{
              color: isActive('/pyqs') ? '#06b6d4' : '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <BookOpen size={16} /> PYQ Explorer
          </Link>

          <Link
            to="/exam-syllabus"
            style={{
              color: isActive('/exam-syllabus') ? '#06b6d4' : '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Compass size={16} /> Syllabus & Weightage
          </Link>

          <Link
            to="/state-exams"
            style={{
              color: isActive('/state-exams') ? '#06b6d4' : '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Award size={16} /> State Exams
          </Link>

          <Link
            to="/colleges"
            style={{
              color: isActive('/colleges') ? '#06b6d4' : '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Building2 size={16} /> Colleges
          </Link>

          <Link
            to="/cutoffs"
            style={{
              color: isActive('/cutoffs') ? '#06b6d4' : '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
            <Compass size={16} /> Cutoffs
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
            <Building2 size={16} /> Predictor
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
            to="/doubt-sessions"
            style={{
              color: isActive('/doubt-sessions') ? '#06b6d4' : '#f8fafc',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '0.35rem 0.75rem',
              borderRadius: '8px'
            }}>
            <Calendar size={15} color="#06b6d4" /> Connect with Ramesh
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
                  onClick={handleToggleNotifications}
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
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      minWidth: '18px',
                      height: '18px',
                      backgroundColor: '#ef4444',
                      borderRadius: '9px',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '340px',
                    padding: '1.25rem',
                    zIndex: 1050,
                    maxHeight: '420px',
                    overflowY: 'auto',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.85)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Bell size={16} color="#06b6d4" /> Notifications ({unreadCount} unread)
                      </div>
                      {unreadCount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }} onClick={handleMarkAllRead}>
                          Mark all read
                        </span>
                      )}
                    </div>

                    {loadingNotifications ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
                        No notifications right now. You're all caught up!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {notifications.slice(0, 8).map((notif) => {
                          const isGuidance = notif.title?.includes('Guidance') || notif.message?.includes('Ramesh') || notif.linkUrl?.includes('doubt-sessions');
                          const targetUrl = notif.linkUrl || (isGuidance ? '/doubt-sessions' : '/dashboard');

                          return (
                            <Link
                              key={notif.id}
                              to={targetUrl}
                              onClick={() => {
                                setShowNotifications(false);
                                apiService.markNotificationRead(notif.id);
                              }}
                              style={{
                                display: 'block',
                                fontSize: '0.8rem',
                                color: '#cbd5e1',
                                background: notif.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(6, 182, 212, 0.08)',
                                border: notif.isRead ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(6, 182, 212, 0.25)',
                                padding: '0.65rem 0.75rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease'
                              }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                                <strong style={{ color: isGuidance ? '#06b6d4' : '#c084fc', fontSize: '0.825rem' }}>
                                  {notif.title}
                                </strong>
                                {!notif.isRead && (
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#06b6d4' }}></span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                {notif.message}
                              </p>
                              {notif.createdAt && (
                                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                                  {new Date(notif.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Student Action Buttons */}
              <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  onClick={() => setShowFeedbackModal(true)} 
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.35)',
                    borderRadius: '8px',
                    color: '#c4b5fd',
                    padding: '0.45rem 0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                  title="Give Beta Feedback"
                >
                  <MessageSquarePlus size={15} color="#a78bfa" />
                  <span className="feedback-btn-text">Feedback</span>
                </button>

                {/* Student Dashboard button */}
                <Link 
                  to="/dashboard" 
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem' }}>
                  <User size={15} /> Dashboard
                </Link>

                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.45rem'
                  }}
                  title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
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
              display: 'none',
              padding: '6px'
            }}
            className="mobile-toggle"
            aria-label="Toggle navigation menu">
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
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
          background: 'rgba(6, 9, 19, 0.98)',
          maxHeight: 'calc(100vh - 90px)',
          overflowY: 'auto'
        }}>
          {user ? (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: '#06b6d4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.12)', borderRadius: '6px' }}>
              <User size={16} color="#06b6d4" /> My Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary" style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.85rem' }}>
                Create Profile
              </Link>
            </>
          )}

          <Link to="/doubt-sessions" onClick={() => setMobileMenuOpen(false)} style={{ color: '#06b6d4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '6px' }}>
            <Calendar size={16} color="#06b6d4" /> Connect with Ramesh
          </Link>
          <Link to="/state-exams" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/state-exams') ? '#06b6d4' : '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Award size={16} color="#06b6d4" /> State Exams
          </Link>
          <Link to="/colleges" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/colleges') ? '#06b6d4' : '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Building2 size={16} color="#06b6d4" /> Colleges Directory
          </Link>
          <Link to="/cutoffs" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/cutoffs') ? '#06b6d4' : '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Compass size={16} color="#06b6d4" /> Cutoff Explorer
          </Link>
          <Link to="/college-predictor" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/college-predictor') ? '#06b6d4' : '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Building2 size={16} color="#06b6d4" /> College Predictor
          </Link>
          <Link to="/compare" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/compare') ? '#06b6d4' : '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <GitCompare size={16} color="#06b6d4" /> Compare Colleges
          </Link>
          <Link to="/mock-tests" onClick={() => setMobileMenuOpen(false)} style={{ color: isActive('/mock-tests') ? '#06b6d4' : '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Compass size={16} color="#06b6d4" /> Mock Tests
          </Link>
          <Link to="/ai-assistant" onClick={() => setMobileMenuOpen(false)} style={{ color: '#06b6d4', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Sparkles size={16} color="#8b5cf6" /> LWR AI Assistant
          </Link>
          <Link to="/jee" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <BookOpen size={16} /> JEE Prep
          </Link>
          <Link to="/eapcet" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Award size={16} /> AP EAPCET
          </Link>
          <Link to="/exam-syllabus" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <Compass size={16} /> Syllabus & Weightage
          </Link>
          <Link to="/pyqs" onClick={() => setMobileMenuOpen(false)} style={{ color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <BookOpen size={16} /> PYQ Explorer
          </Link>
          <button
            type="button"
            onClick={() => { setMobileMenuOpen(false); setShowFeedbackModal(true); }}
            style={{
              color: '#c4b5fd',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              background: 'rgba(139, 92, 246, 0.15)',
              borderRadius: '6px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <MessageSquarePlus size={16} color="#a78bfa" /> Give Beta Feedback
          </button>
          <Link to="/privacy" onClick={() => setMobileMenuOpen(false)} style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
            <ShieldCheck size={14} /> Privacy & Minor Safety
          </Link>
          {user && (
            <button 
              type="button" 
              onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }} 
              style={{ 
                color: '#f87171', 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.5rem', 
                background: 'rgba(239, 68, 68, 0.1)', 
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </div>
      )}

      {/* Beta Feedback Modal */}
      <BetaFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <style>{`
        @media (max-width: 1180px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
        @media (max-width: 860px) {
          .desktop-auth { display: none !important; }
          .admin-subtitle { display: none !important; }
          .admin-greeting { display: none !important; }
          .admin-title-badge { display: none !important; }
        }
      `}</style>
    </header>
  );
};
