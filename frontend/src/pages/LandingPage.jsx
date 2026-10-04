import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Building2, 
  Compass, 
  Award, 
  BrainCircuit, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  MessageSquare, 
  Video, 
  HelpCircle, 
  Users, 
  Map, 
  Zap, 
  BarChart3, 
  FileText,
  ShieldCheck
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div style={{ overflowX: 'hidden' }}>
      
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        padding: '6rem 0 4rem 0',
        background: 'radial-gradient(ellipse at 50% -20%, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.15) 45%, transparent 80%)'
      }}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          
          <div className="badge badge-cyan" style={{ marginBottom: '1.5rem', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            <Sparkles size={16} /> Complete Guidance for Intermediate & B.Tech Admissions
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: '1.15',
            marginBottom: '1.5rem',
            color: '#ffffff'
          }}>
            LAUGHS WITH RAMESH <br />
            <span className="text-gradient">CONNECTING</span>
          </h1>

          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#38bdf8',
            marginBottom: '1.25rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            “One Platform. Complete B.Tech Guidance.”
          </div>

          <p style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
            lineHeight: '1.7'
          }}>
            From entrance exam preparation (JEE / AP EAPCET) to choosing the right B.Tech college and branch, get all the resources, mock tests, cutoff analysis, rank estimation, and AI-powered guidance in one place.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              Start Learning Now <ArrowRight size={18} />
            </Link>
            <Link to="/college-predictor" className="btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              <Building2 size={18} /> Explore Colleges & Cutoffs
            </Link>
            <Link to="/mock-tests" className="btn-accent" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              <Compass size={18} /> Take a Free Mock Test
            </Link>
          </div>

          {/* Key Stats Bar */}
          <div className="grid-4" style={{ marginTop: '4rem', textTransform: 'uppercase' }}>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#06b6d4' }}>100%</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Structured Syllabus</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>JEE & EAPCET</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Entrance Mock Engine</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>2024 CUTOFFS</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>AP & TS College Data</div>
            </div>
            <div className="glass-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ec4899' }}>LWR AI</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>24/7 Smart Assistant</div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 1: WHY LAUGHS WITH RAMESH CONNECTING */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>1. Why Us?</div>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff' }}>Why Laughs With Ramesh Connecting?</h2>
            <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0.5rem auto' }}>
              We bridge the gap between exam preparation and smart B.Tech college selection.
            </p>
          </div>

          <div className="grid-3">
            <div className="glass-card">
              <div style={{ color: '#06b6d4', marginBottom: '1rem' }}><BrainCircuit size={36} /></div>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Complete End-to-End Journey</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                From Class 11 & 12 exam prep, syllabus tracking, mock tests to cutoffs and final college seat decision.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ color: '#8b5cf6', marginBottom: '1rem' }}><Building2 size={36} /></div>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Factual Cutoffs & Analytics</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Search official historical cutoffs by rank, category, gender quota, and branch without guesswork.
              </p>
            </div>
            <div className="glass-card">
              <div style={{ color: '#10b981', marginBottom: '1rem' }}><Sparkles size={36} /></div>
              <h3 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>AI-Powered Student Guidance</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Ask LWR AI anything — from comparing CSE vs ECE to strategy for improving test accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: JEE & AP EAPCET MODULE PREVIEWS */}
      <section style={{ padding: '5rem 0', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <div className="badge badge-cyan" style={{ marginBottom: '1rem' }}>2. JEE Module</div>
              <h3 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '1rem' }}>
                JEE Main & Advanced Preparation
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Master Physics, Chemistry, and Mathematics with chapter-wise topic weightages, previous-year question papers, and full-length simulated test series.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#06b6d4" /> 75+ Chapter Topics Mapped</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#06b6d4" /> Chapter Practice & PYQ Vault</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#06b6d4" /> Simulated Computer Based Test Engine</li>
              </ul>
              <Link to="/jee" className="btn-primary">Explore JEE Hub <ArrowRight size={16} /></Link>
            </div>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>3. AP EAPCET Module</div>
              <h3 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '1rem' }}>
                AP EAPCET (EAMCET) Specialized Module
              </h3>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Dedicated preparation engineered specifically for Andhra Pradesh students. Speed practice for Mathematics (80M), Physics (40M), and Chemistry (40M).
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', color: '#cbd5e1' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#8b5cf6" /> 160-Mark Full Grand Mock Tests</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#8b5cf6" /> Zero-Negative Marking Speed Strategy</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#8b5cf6" /> State University Cutoff Data</li>
              </ul>
              <Link to="/eapcet" className="btn-accent">Explore AP EAPCET Hub <ArrowRight size={16} /></Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4, 5, 6, 7 & 8: MOCK TESTS, STUDY MATERIALS & COLLEGE DISCOVERY */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>4 to 8. Platform Modules</div>
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff' }}>All Tools Integrated Into One Seamless Platform</h2>
          </div>

          <div className="grid-3">
            
            {/* Mock Tests */}
            <div className="glass-card">
              <div style={{ color: '#38bdf8', marginBottom: '1rem' }}><Compass size={32} /></div>
              <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>4. Online Mock Test Engine</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Interactive test environment with timer, question grid navigation, mark for review, and instant detailed score analytics.
              </p>
              <Link to="/mock-tests" style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem' }}>Launch Test Engine →</Link>
            </div>

            {/* Study Materials */}
            <div className="glass-card">
              <div style={{ color: '#818cf8', marginBottom: '1rem' }}><FileText size={32} /></div>
              <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>5. Resource Library</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                High-yield formula sheets, chapter revision notes, exam strategies, and downloadable PDF study materials.
              </p>
              <Link to="/study-materials" style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}>Access Vault →</Link>
            </div>

            {/* College & Branch Discovery */}
            <div className="glass-card">
              <div style={{ color: '#34d399', marginBottom: '1rem' }}><Building2 size={32} /></div>
              <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>6 & 7. Cutoff & College Discovery</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Input your exam rank & category to discover historical college matches with source dates & neutral match ranges.
              </p>
              <Link to="/college-predictor" style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>Check College Predictor →</Link>
            </div>

            {/* Rank Estimation */}
            <div className="glass-card">
              <div style={{ color: '#f43f5e', marginBottom: '1rem' }}><BarChart3 size={32} /></div>
              <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>8. Score-to-Rank Estimator</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Enter your test marks to estimate rank ranges based on historical score trends with clear disclaimers.
              </p>
              <Link to="/rank-estimator" style={{ color: '#ec4899', fontWeight: 600, fontSize: '0.85rem' }}>Calculate Rank →</Link>
            </div>

            {/* LWR AI */}
            <div className="glass-card">
              <div style={{ color: '#fbbf24', marginBottom: '1rem' }}><Sparkles size={32} /></div>
              <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>9. LWR AI Assistant</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Get instant answers to doubt queries, branch comparisons (CSE vs ECE), study schedules, and guidance.
              </p>
              <Link to="/ai-assistant" style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem' }}>Chat with LWR AI →</Link>
            </div>

            {/* Video Learning */}
            <div className="glass-card">
              <div style={{ color: '#a78bfa', marginBottom: '1rem' }}><Video size={32} /></div>
              <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>10. Video Learning Hub</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Watch topic breakdown lectures, counselling choice-filling guides, and skill development playlists.
              </p>
              <Link to="/videos" style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.85rem' }}>Watch Videos →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 11, 12 & 13: DOUBT SUPPORT, COMMUNITY & B.TECH ROADMAP */}
      <section style={{ padding: '5rem 0', background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="grid-3">
            
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ color: '#06b6d4', marginBottom: '1rem' }}><HelpCircle size={32} /></div>
              <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '0.75rem' }}>11. Direct Doubt Support</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Message Ramesh & senior mentors directly or book 1-on-1 doubt clarification sessions for tough topics.
              </p>
              <Link to="/messages" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Message Mentor
              </Link>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ color: '#8b5cf6', marginBottom: '1rem' }}><Users size={32} /></div>
              <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '0.75rem' }}>12. Student Community</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Join moderated discussion forums with fellow JEE & EAPCET aspirants to discuss cutoffs, options, and strategy.
              </p>
              <Link to="/community" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                Join Discussion
              </Link>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ color: '#10b981', marginBottom: '1rem' }}><Map size={32} /></div>
              <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '0.75rem' }}>13. 9-Step B.Tech Roadmap</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Follow our step-by-step decision framework from rank understanding to branch shortlisting and counselling choice filling.
              </p>
              <Link to="/btech-roadmap" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                View Roadmap
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 14: COMING SOON / FUTURE FEATURES */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
            <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>14. Coming Soon</div>
            <h2 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '1rem' }}>Future Features on Our Roadmap</h2>
            <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto 2rem auto' }}>
              We are continuously innovating to bring high-impact tools to Intermediate and B.Tech students.
            </p>
            <div className="grid-3" style={{ textAlign: 'left' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>🎥 Live Group Doubt Rooms</strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Real-time interactive study rooms with senior B.Tech mentors.</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#c084fc', display: 'block', marginBottom: '0.25rem' }}>💻 First Year B.Tech Coding Prep</strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>C programming, Python, and Data Structures jumpstart modules.</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <strong style={{ color: '#34d399', display: 'block', marginBottom: '0.25rem' }}>📱 Mobile Offline App</strong>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Download PDF notes & practice tests to study offline.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{ padding: '4rem 0 2rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#ffffff', marginBottom: '1rem' }}>Ready to Start Your B.Tech Journey?</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '2rem' }}>
            Join thousands of Intermediate students preparing smarter with Laughs With Ramesh Connecting.
          </p>
          <Link to="/register" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Create Free Account Now <ArrowRight size={20} />
          </Link>
        </div>
      </section>

    </div>
  );
};
