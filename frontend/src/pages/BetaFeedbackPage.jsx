import React, { useState, useEffect } from 'react';
import { 
  MessageSquarePlus, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock, 
  Send,
  Building,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Bug,
  Lightbulb,
  FileQuestion,
  History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

export const BetaFeedbackPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'

  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('GENERAL');
  const [overallExperience, setOverallExperience] = useState('');
  const [difficultiesFaced, setDifficultiesFaced] = useState('');
  const [collegeInfoIssues, setCollegeInfoIssues] = useState('');
  const [missingInfoReport, setMissingInfoReport] = useState('');
  const [usefulFeatures, setUsefulFeatures] = useState('');
  const [suggestions, setSuggestions] = useState('');

  // Feature-specific ratings (1-5)
  const [mockTestsRating, setMockTestsRating] = useState(5);
  const [predictorRating, setPredictorRating] = useState(5);
  const [cutoffsRating, setCutoffsRating] = useState(5);
  const [aiGuidanceRating, setAiGuidanceRating] = useState(5);
  const [mentorshipRating, setMentorshipRating] = useState(5);

  // Bug Severity
  const [bugSeverity, setBugSeverity] = useState('MEDIUM');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === 'history' && user) {
      loadMyFeedback();
    }
  }, [activeTab, user]);

  const loadMyFeedback = async () => {
    setLoadingHistory(true);
    try {
      const data = await apiService.getMyBetaFeedback();
      setHistoryList(data || []);
    } catch (err) {
      console.error('Failed to load feedback history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!user) {
      setErrorMessage('Please sign in as a student to submit beta feedback.');
      return;
    }

    const now = Date.now();
    if (now - lastSubmitTime < 10000) {
      setErrorMessage('Please wait 10 seconds before submitting another feedback entry to prevent accidental duplicates.');
      return;
    }

    if (!overallExperience.trim()) {
      setErrorMessage('Please provide a brief description of your overall experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitBetaFeedback({
        overallRating: rating,
        category,
        overallExperience: overallExperience.trim(),
        difficultiesFaced: difficultiesFaced.trim(),
        collegeInfoIssues: collegeInfoIssues.trim(),
        missingInfoReport: missingInfoReport.trim(),
        usefulFeatures: usefulFeatures.trim(),
        suggestions: suggestions.trim(),
        mockTestsRating,
        predictorRating,
        cutoffsRating,
        aiGuidanceRating,
        mentorshipRating,
        bugSeverity: category === 'BUG' ? bugSeverity : (bugSeverity || 'LOW')
      });

      setLastSubmitTime(now);
      setSubmitSuccess(true);
      // Reset form fields
      setOverallExperience('');
      setDifficultiesFaced('');
      setCollegeInfoIssues('');
      setMissingInfoReport('');
      setUsefulFeatures('');
      setSuggestions('');
      setRating(5);
      setCategory('GENERAL');
      setBugSeverity('MEDIUM');

      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('history');
      }, 2500);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating, setRatingFn, label) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{label}</span>
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatingFn(star)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: star <= currentRating ? '#f59e0b' : '#475569',
              padding: '2px',
              transition: 'transform 0.15s ease'
            }}
          >
            <Star size={18} fill={star <= currentRating ? '#f59e0b' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '3rem 0 5rem 0', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        
        {/* Header */}
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
            <MessageSquarePlus size={30} color="#ffffff" />
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.2rem 0.75rem',
            borderRadius: '9999px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#38bdf8',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.75rem'
          }}>
            Beta Cohort Voice (Class 11 & 12)
          </div>

          <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Student Beta Feedback & Bug Reporting
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '620px', margin: '0 auto' }}>
            Your experiences, bug reports, and suggestions directly shape LWR Connecting before our statewide launch for JEE and EAPCET aspirants.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('new')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'new' ? 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' : 'rgba(15, 23, 42, 0.7)',
              color: '#ffffff',
              border: activeTab === 'new' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageSquarePlus size={16} /> Submit New Feedback
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              background: activeTab === 'history' ? 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)' : 'rgba(15, 23, 42, 0.7)',
              color: '#ffffff',
              border: activeTab === 'history' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <History size={16} /> My Previous Submissions & Status
          </button>
        </div>

        {/* TAB 1: NEW FEEDBACK */}
        {activeTab === 'new' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {submitSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#10b981',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle size={22} />
                <div>
                  <strong>Feedback submitted successfully!</strong>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                    Thank you for helping Ramesh and the team improve LWR Connecting. Switching to your submission history...
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#f87171',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.88rem'
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Category Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  Feedback Type / Category *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { id: 'GENERAL', label: 'General Experience', icon: Sparkles },
                    { id: 'BUG', label: 'Bug / Technical Issue', icon: Bug },
                    { id: 'COLLEGE_DATA', label: 'College Info / Cutoff', icon: Building },
                    { id: 'MOCK_TEST', label: 'Mock Test Engine', icon: FileQuestion },
                    { id: 'SUGGESTION', label: 'Feature Suggestion', icon: Lightbulb }
                  ].map(cat => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '8px',
                          border: category === cat.id ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)',
                          background: category === cat.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                          color: category === cat.id ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <IconComp size={16} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bug Severity (if Category is BUG) */}
              {category === 'BUG' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#f87171', marginBottom: '0.4rem' }}>
                    Bug Severity Level *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {[
                      { id: 'LOW', label: 'Low (Typo/Visual)' },
                      { id: 'MEDIUM', label: 'Medium (Minor Glitch)' },
                      { id: 'HIGH', label: 'High (Feature Blocked)' },
                      { id: 'CRITICAL', label: 'Critical (Crash/Data Lost)' }
                    ].map(sev => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setBugSeverity(sev.id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: bugSeverity === sev.id ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                          background: bugSeverity === sev.id ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                          color: bugSeverity === sev.id ? '#ffffff' : '#94a3b8',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Rating */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '0.92rem', display: 'block' }}>Overall Platform Experience Rating</strong>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>How would you rate your beta testing journey so far?</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= rating ? '#f59e0b' : '#475569',
                          padding: '2px'
                        }}
                      >
                        <Star size={24} fill={star <= rating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature-Specific Ratings Accordion */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <strong style={{ color: '#ffffff', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>
                  Feature-Specific Ratings (1 - 5 Stars)
                </strong>
                {renderStars(mockTestsRating, setMockTestsRating, 'JEE & EAPCET Mock Tests Engine')}
                {renderStars(predictorRating, setPredictorRating, 'College & Cutoff Predictor')}
                {renderStars(cutoffsRating, setCutoffsRating, 'Historical Cutoffs Explorer')}
                {renderStars(aiGuidanceRating, setAiGuidanceRating, 'LWR AI Study Assistant')}
                {renderStars(mentorshipRating, setMentorshipRating, 'Mentorship with Ramesh Sir')}
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  Overall Experience Description *
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={overallExperience}
                  onChange={(e) => setOverallExperience(e.target.value)}
                  placeholder="Share what worked well, what was smooth, or what caught your attention..."
                  required
                />
              </div>

              {/* Difficulties / Bug Report */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  Bug Report or Difficulties Encountered (Optional)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={difficultiesFaced}
                  onChange={(e) => setDifficultiesFaced(e.target.value)}
                  placeholder="Describe any bugs, errors, slow loading times, or navigation confusion..."
                />
              </div>

              {/* Missing Information Report */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  Missing Information Report (Colleges, Cutoffs, or Syllabus)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={missingInfoReport}
                  onChange={(e) => setMissingInfoReport(e.target.value)}
                  placeholder="Tell us if a specific college, branch cutoff, question topic, or exam syllabus was missing..."
                />
              </div>

              {/* Suggestions */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.4rem' }}>
                  Suggestions for Improvements or New Features
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="What would make LWR Connecting even better for your Class 11/12 engineering preparation?"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ padding: '0.85rem', justifyContent: 'center', fontSize: '0.95rem', marginTop: '0.5rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting Beta Feedback...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Beta Feedback
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MY SUBMISSION HISTORY */}
        {activeTab === 'history' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '1.25rem' }}>
              Your Feedback Submissions & Ramesh's Resolution Notes
            </h3>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                Loading your feedback history...
              </div>
            ) : historyList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                <MessageSquarePlus size={36} color="#06b6d4" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ margin: 0, fontSize: '0.95rem' }}>You haven't submitted any beta feedback yet.</p>
                <button 
                  onClick={() => setActiveTab('new')} 
                  className="btn-secondary" 
                  style={{ marginTop: '1rem', fontSize: '0.85rem' }}
                >
                  Submit Your First Feedback Entry
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {historyList.map(item => (
                  <div 
                    key={item.id} 
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: item.status === 'RESOLVED' ? 'rgba(34, 197, 94, 0.2)' : (item.status === 'IN_REVIEW' || item.status === 'IN_PROGRESS') ? 'rgba(234, 179, 8, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                          color: item.status === 'RESOLVED' ? '#86efac' : (item.status === 'IN_REVIEW' || item.status === 'IN_PROGRESS') ? '#fde047' : '#67e8f9',
                          border: item.status === 'RESOLVED' ? '1px solid #22c55e' : (item.status === 'IN_REVIEW' || item.status === 'IN_PROGRESS') ? '1px solid #eab308' : '1px solid #06b6d4'
                        }}>
                          {item.status || 'NEW'}
                        </span>
                        <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>Feedback #{item.id}</strong>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>[{item.category || 'GENERAL'}]</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                        {[...Array(item.overallRating || 5)].map((_, i) => (
                          <Star key={i} size={14} fill="#f59e0b" />
                        ))}
                      </div>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                      "{item.overallExperience}"
                    </p>

                    {item.difficultiesFaced && (
                      <div style={{ fontSize: '0.8rem', color: '#f87171', marginBottom: '0.35rem' }}>
                        <strong>Reported Bug/Glitch:</strong> {item.difficultiesFaced}
                      </div>
                    )}

                    {item.missingInfoReport && (
                      <div style={{ fontSize: '0.8rem', color: '#facc15', marginBottom: '0.35rem' }}>
                        <strong>Missing Info:</strong> {item.missingInfoReport}
                      </div>
                    )}

                    {item.suggestions && (
                      <div style={{ fontSize: '0.8rem', color: '#93c5fd', marginBottom: '0.35rem' }}>
                        <strong>Suggestion:</strong> {item.suggestions}
                      </div>
                    )}

                    {/* Admin Response & Resolution Notes */}
                    {item.adminNotes ? (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(139, 92, 246, 0.12)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        fontSize: '0.82rem'
                      }}>
                        <strong style={{ color: '#c084fc', display: 'block', marginBottom: '0.2rem' }}>
                          💬 Platform Admin / Ramesh's Response:
                        </strong>
                        <p style={{ margin: 0, color: '#f8fafc' }}>{item.adminNotes}</p>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.5rem' }}>
                        Under review by Ramesh and LWR Connecting academic engineering team.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

