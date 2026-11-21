import React, { useState, useEffect } from 'react';
import { 
  MessageSquarePlus, 
  Star, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock, 
  ChevronRight, 
  Send,
  Building,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';

export const BetaFeedbackModal = ({ isOpen, onClose }) => {
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
    if (isOpen && activeTab === 'history' && user) {
      loadMyFeedback();
    }
  }, [isOpen, activeTab, user]);

  if (!isOpen) return null;

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
      setErrorMessage('Please wait 10 seconds before submitting another feedback entry.');
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
        bugSeverity: category === 'BUG' ? bugSeverity : 'LOW'
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
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit feedback. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 15, 0.78)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem'
    }} onClick={onClose}>
      <div 
        style={{
          background: '#0d1322',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquarePlus size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.15rem', fontWeight: 700 }}>
                LWR Beta Launch Feedback
              </h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                Your insights shape the official B.Tech counseling release!
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button
            onClick={() => { setActiveTab('new'); setSubmitSuccess(false); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: activeTab === 'new' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === 'new' ? '#a78bfa' : '#94a3b8',
              border: 'none',
              borderBottom: activeTab === 'new' ? '2px solid #8b5cf6' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => { setActiveTab('history'); loadMyFeedback(); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: activeTab === 'history' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              color: activeTab === 'history' ? '#a78bfa' : '#94a3b8',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #8b5cf6' : '2px solid transparent',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            My Previous Submissions
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1
        }}>
          {activeTab === 'new' ? (
            submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <CheckCircle size={32} />
                </div>
                <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Thank you for your valuable feedback!
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Ramesh Sir and the technical team review every report to verify college cutoffs and optimize your exam experience.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                  >
                    Submit Another Report
                  </button>
                  <button
                    onClick={onClose}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {errorMessage && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Rating & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Overall Rating *
                    </label>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            color: star <= rating ? '#eab308' : '#475569',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Star size={24} fill={star <= rating ? '#eab308' : 'none'} />
                        </button>
                      ))}
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Needs Work' : 'Poor'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Topic Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '0.85rem'
                      }}
                    >
                      <option value="GENERAL">General Platform Experience</option>
                      <option value="MOCK_TEST">Mock Tests & Question Quality</option>
                      <option value="COLLEGE_DATA">College Data & Cutoff Ranks</option>
                      <option value="AI_ASSISTANT">LWR AI Guidance</option>
                      <option value="COUNSELLING">Connect with Ramesh / Mentorship</option>
                      <option value="BUG">Technical Bug / Issue</option>
                    </select>
                  </div>
                </div>

                {/* Bug Severity Selector (Shown when BUG is selected) */}
                {category === 'BUG' && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem'
                  }}>
                    <label style={{ display: 'block', color: '#fca5a5', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Bug Severity Level *
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setBugSeverity(sev)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            border: bugSeverity === sev ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                            background: bugSeverity === sev ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                            color: bugSeverity === sev ? '#fca5a5' : '#94a3b8',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}>
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature-Specific 5-Star Ratings */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.6rem' }}>
                    Feature Ratings (1 to 5 Stars)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { label: 'Mock Tests & CBT', val: mockTestsRating, set: setMockTestsRating },
                      { label: 'College Predictor', val: predictorRating, set: setPredictorRating },
                      { label: 'Cutoff Explorer', val: cutoffsRating, set: setCutoffsRating },
                      { label: 'AI Assistant', val: aiGuidanceRating, set: setAiGuidanceRating },
                      { label: 'Mentorship', val: mentorshipRating, set: setMentorshipRating }
                    ].map((feat) => (
                      <div key={feat.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>{feat.label}:</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => feat.set(s)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '1px',
                                color: s <= feat.val ? '#eab308' : '#475569'
                              }}>
                              <Star size={14} fill={s <= feat.val ? '#eab308' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Experience */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    1. Overall Experience *
                  </label>
                  <textarea
                    rows={2}
                    value={overallExperience}
                    onChange={(e) => setOverallExperience(e.target.value)}
                    placeholder="How was your experience exploring colleges and taking mock tests?"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>

                {/* Difficulties Faced */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    2. Difficulties Faced (if any)
                  </label>
                  <textarea
                    rows={2}
                    value={difficultiesFaced}
                    onChange={(e) => setDifficultiesFaced(e.target.value)}
                    placeholder="Did you encounter any confusion, slow page loading, or UI issues?"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Missing College or Syllabus Information Report */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    3. Missing or Inaccurate Information (Colleges, Cutoffs, or Syllabus)
                  </label>
                  <textarea
                    rows={2}
                    value={missingInfoReport}
                    onChange={(e) => setMissingInfoReport(e.target.value)}
                    placeholder="Notice any missing colleges, inaccurate cutoff closing ranks, or syllabus topics?"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Useful Features */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    4. Features You Found Most Useful
                  </label>
                  <textarea
                    rows={2}
                    value={usefulFeatures}
                    onChange={(e) => setUsefulFeatures(e.target.value)}
                    placeholder="e.g. College Predictor, Cutoff Explorer, JEE Mock Engine, AI Escalation..."
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Suggestions */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    5. Suggestions for Improvement
                  </label>
                  <textarea
                    rows={2}
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="What additions would make this platform even more helpful for intermediate students?"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Submit Beta Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            <div>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ margin: 0 }}>Loading your feedback history...</p>
                </div>
              ) : historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                  <HelpCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: 600, color: '#cbd5e1' }}>No feedback submitted yet</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Click "Submit Feedback" above to report findings from your testing session.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {historyList.map((item) => (
                    <div 
                      key={item.id}
                      style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: item.status === 'RESOLVED' ? 'rgba(34, 197, 94, 0.15)' : item.status === 'IN_REVIEW' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: item.status === 'RESOLVED' ? '#4ade80' : item.status === 'IN_REVIEW' ? '#fde047' : '#60a5fa'
                            }}>
                              {item.status}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                              #{item.id} • {item.category}
                            </span>
                            {item.bugSeverity && item.category === 'BUG' && (
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: item.bugSeverity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : item.bugSeverity === 'HIGH' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                color: item.bugSeverity === 'CRITICAL' ? '#f87171' : item.bugSeverity === 'HIGH' ? '#fb923c' : '#fde047'
                              }}>
                                {item.bugSeverity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[...Array(item.overallRating || 5)].map((_, i) => (
                            <Star key={i} size={14} fill="#eab308" color="#eab308" />
                          ))}
                        </div>
                      </div>

                      <div style={{ color: '#f1f5f9', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>
                        {item.overallExperience}
                      </div>

                      {item.missingInfoReport && (
                        <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '0.35rem' }}>
                          <strong>Missing Info Report:</strong> {item.missingInfoReport}
                        </div>
                      )}

                      {item.collegeInfoIssues && (
                        <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '0.35rem' }}>
                          <strong>College Info Issue:</strong> {item.collegeInfoIssues}
                        </div>
                      )}

                      {item.adminNotes && (
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '6px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.25)',
                          fontSize: '0.8rem',
                          color: '#c4b5fd'
                        }}>
                          <strong>Admin Response:</strong> {item.adminNotes}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        <Clock size={12} />
                        <span>Submitted {new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

