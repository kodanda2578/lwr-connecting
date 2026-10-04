import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BookOpen, 
  Compass, 
  Building2, 
  BarChart3, 
  HelpCircle, 
  ArrowRight, 
  Bookmark, 
  CheckCircle2, 
  Award,
  Clock,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user, savedResources } = useAuth();
  const profile = user?.profile || {};

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        
        {/* WELCOME BANNER */}
        <div className="glass-panel" style={{
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          borderColor: 'rgba(6, 182, 212, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                Welcome back, {user?.fullName || 'Student'} 👋
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Target Exam: <strong style={{ color: '#38bdf8' }}>{profile.targetExam === 'AP_EAPCET' ? 'AP EAPCET (EAMCET)' : profile.targetExam}</strong> | 
                Target Branch: <strong style={{ color: '#c084fc' }}>{profile.targetBranch || 'CSE'}</strong> | 
                Location: <strong style={{ color: '#34d399' }}>{profile.preferredLocation || 'Visakhapatnam'}</strong>
              </p>
            </div>

            <Link to="/ai-assistant" className="btn-accent" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>
              <Sparkles size={18} /> Ask LWR AI Guidance
            </Link>
          </div>
        </div>

        {/* OVERVIEW STATS ROW */}
        <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
          
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Overall Prep</span>
              <BookOpen size={18} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>42%</div>
            <div className="progress-bar-bg" style={{ marginTop: '0.5rem' }}>
              <div className="progress-bar-fill" style={{ width: '42%' }}></div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>14 of 32 Chapters Done</div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Best Mock Score</span>
              <Award size={18} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>118 / 160</div>
            <div className="badge badge-purple" style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>Accuracy: 78%</div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Target Rank</span>
              <TrendingUp size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {profile.targetRank ? `< ${profile.targetRank}` : '< 2000'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.4rem' }}>On Track for AUCE / JNTU</div>
          </div>

          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Saved Resources</span>
              <Bookmark size={18} color="#ec4899" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>{savedResources.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>Notes & Formula Sheets</div>
          </div>

        </div>

        {/* 6 MAIN DASHBOARD CARDS */}
        <h3 style={{ fontSize: '1.3rem', color: '#ffffff', marginBottom: '1.25rem' }}>Quick Action Center</h3>
        
        <div className="grid-3" style={{ marginBottom: '3rem' }}>
          
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#06b6d4', marginBottom: '0.75rem' }}><BookOpen size={28} /></div>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>1. Continue Preparation</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Pick up where you left off in Mathematics: Matrices & Determinants.
            </p>
            <Link to="/syllabus" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
              Resume Learning <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#8b5cf6', marginBottom: '0.75rem' }}><Compass size={28} /></div>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>2. Take Mock Test</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Test your exam readiness with AP EAPCET Grand Test 01.
            </p>
            <Link to="/mock-tests" className="btn-accent" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
              Start Test <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#10b981', marginBottom: '0.75rem' }}><Building2 size={28} /></div>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>3. Explore Colleges</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Discover Top B.Tech colleges in AP & Telangana with seat matrix.
            </p>
            <Link to="/colleges" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
              View Colleges <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#f59e0b', marginBottom: '0.75rem' }}><BarChart3 size={28} /></div>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>4. Check Cutoffs</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Match your estimated rank against 2024 category closing cutoffs.
            </p>
            <Link to="/college-predictor" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
              Predict Options <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#ec4899', marginBottom: '0.75rem' }}><Sparkles size={28} /></div>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>5. Ask LWR AI</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Get instant study plans, branch advice, and solution breakdowns.
            </p>
            <Link to="/ai-assistant" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
              Launch Chatbot <ArrowRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ color: '#3b82f6', marginBottom: '0.75rem' }}><HelpCircle size={28} /></div>
            <h4 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.4rem' }}>6. Ask Mentor Doubt</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Directly message Ramesh & senior academic mentors for help.
            </p>
            <Link to="/messages" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}>
              Message Ramesh <ArrowRight size={16} />
            </Link>
          </div>

        </div>

        {/* TWO COLUMN RECENT ACTIVITY & RECOMMENDED */}
        <div className="grid-2">
          
          {/* Recent Activity & Next Steps */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#06b6d4" /> Recent Activity & Next Steps
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                <CheckCircle2 size={18} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>Completed Practice: Physics Vectors</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Score: 18/20 Correct • Yesterday</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px' }}>
                <Compass size={18} color="#8b5cf6" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>Attempted Mock Test 01</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Scored 118/160 • 3 days ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommended Resources */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#8b5cf6" /> AI Recommended Next Step
            </h4>

            <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                📌 Recommended: AP EAPCET Math Formula Sheet
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                Revise Trigonometry & Calculus formulas to boost your mock score by an estimated +15 marks.
              </p>
              <Link to="/study-materials" style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                Open Formula Vault →
              </Link>
            </div>
          </div>

        </div>

        {/* STUDENT EMAIL PREFERENCES SECTION (SECTION 18) */}
        <div className="glass-panel" style={{ padding: '2rem', marginTop: '2.5rem' }}>
          <h3 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚙️ Notification & Email Preferences
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Manage which updates you would like to receive via email. Essential account & security alerts cannot be disabled.
          </p>

          <div className="grid-3" style={{ gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> ☑ New Mock Tests
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> ☑ New Study Materials
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> ☑ New Educational Videos
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> ☑ Important Announcements
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> ☑ Mentor Replies
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.9rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> ☑ Doubt Session Updates
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
