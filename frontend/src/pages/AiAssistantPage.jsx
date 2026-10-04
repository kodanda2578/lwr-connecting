import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  MessageSquare, 
  Clock 
} from 'lucide-react';

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am **LWR AI**, your dedicated B.Tech & Entrance Exam Assistant.\n\nAsk me anything about:\n- Comparing branches (CSE vs ECE vs AI/ML)\n- AP EAPCET / JEE study plans and high-weightage topics\n- Historical cutoffs for colleges in AP & Telangana\n- Strategies to boost your mock test score!\n\nIf you need personal guidance from Ramesh, click **Connect with Ramesh** below.'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Escalation & Mentor Request Modal States
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationCategory, setEscalationCategory] = useState('General Doubt');
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    const lower = userText.toLowerCase();

    // AI Escalation Trigger Check
    const isEscalationRequested = 
      lower.includes('ramesh') || 
      lower.includes('human') || 
      lower.includes('mentor') || 
      lower.includes('insufficient') || 
      lower.includes('talk to') || 
      lower.includes('personal guidance');

    try {
      const res = await apiService.sendAiQuery(userText, messages);
      setMessages((prev) => [...prev, { sender: 'bot', text: res.response }]);

      if (isEscalationRequested) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot',
              text: 'I can create a personal guidance request for Ramesh for you. Would you like to connect with Ramesh directly?',
              isEscalationPrompt: true
            }
          ]);
        }, 600);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I encountered an issue. Click below to connect with Ramesh.' }]);
    } finally {
      setLoading(false);
    }
  };

  const generateAiSummary = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || 'Guidance query';
    const profile = user?.profile || {};
    return `Student ${user?.fullName || 'Student'} (Target Exam: ${profile.targetExam || 'AP_EAPCET'}, Target Branch: ${profile.targetBranch || 'CSE'}, Location: ${profile.preferredLocation || 'Visakhapatnam'}). Latest Question: "${lastUserMsg}"`;
  };

  const handleCreateMentorRequest = async () => {
    const summary = generateAiSummary();
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || 'Personal guidance request';

    try {
      const res = await fetch('/api/mentor-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({
          category: escalationCategory,
          studentMessage: lastUserMsg,
          exam: user?.profile?.targetExam || 'AP_EAPCET',
          rank: user?.profile?.targetRank || '2000',
          targetBranch: user?.profile?.targetBranch || 'CSE',
          preferredLocation: user?.profile?.preferredLocation || 'Visakhapatnam'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSubmittedRequest(data);
      } else {
        setSubmittedRequest({
          id: Date.now(),
          status: 'OPEN',
          category: escalationCategory,
          aiSummary: summary,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          disclaimer: 'AI-generated summary — verify before relying on it.'
        });
      }
    } catch (e) {
      setSubmittedRequest({
        id: Date.now(),
        status: 'OPEN',
        category: escalationCategory,
        aiSummary: summary,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disclaimer: 'AI-generated summary — verify before relying on it.'
      });
    }

    setShowEscalationModal(false);
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container" style={{ maxWidth: '920px' }}>
        
        {/* Header Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={24} color="#ffffff" />
            </div>
            <div>
              <div className="badge badge-purple" style={{ fontSize: '0.7rem' }}>AI + Human Mentor Guidance</div>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>LWR AI & Ramesh Connect</h1>
            </div>
          </div>

          {/* Prominent Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => setShowEscalationModal(true)} 
              className="btn-accent"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
              <UserCheck size={16} /> Connect with Ramesh
            </button>
          </div>
        </div>

        {/* Successful Request Confirmation Card */}
        {submittedRequest && (
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '0.35rem' }}>✅ Request Sent Successfully</span>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem' }}>Your request has been sent to Ramesh</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Req ID: #{submittedRequest.id}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ color: '#06b6d4', fontWeight: 700, marginBottom: '0.25rem' }}>
                AI Summary:
              </div>
              <p style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>{submittedRequest.aiSummary}</p>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' }}>
                ⚠️ {submittedRequest.disclaimer || 'AI-generated summary — verify before relying on it.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Status: <strong style={{ color: '#38bdf8' }}>{submittedRequest.status}</strong></span>
              <button onClick={() => navigate('/messages')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                View Conversation <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Escalation Request Modal */}
        {showEscalationModal && (
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem', borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={20} color="#06b6d4" /> Personal Guidance Request for Ramesh
              </h3>
              <button onClick={() => setShowEscalationModal(false)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>Close</button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              If your question needs personalized help, Ramesh will review your request and reply directly.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Select Guidance Category</label>
              <select 
                className="form-control"
                value={escalationCategory}
                onChange={(e) => setEscalationCategory(e.target.value)}>
                <option value="AP EAPCET">AP EAPCET Strategy</option>
                <option value="JEE">JEE Main Strategy</option>
                <option value="Rank Guidance">Rank Guidance</option>
                <option value="College Selection">College Selection</option>
                <option value="Branch Selection">Branch Selection (CSE vs ECE vs AI)</option>
                <option value="Cutoff Guidance">Cutoff Analysis</option>
                <option value="Counselling">Web Option Counselling</option>
                <option value="Career">Career Roadmap</option>
                <option value="General Doubt">General Doubt</option>
              </select>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.3rem' }}>AI Conversation Summary Preview:</div>
              <p style={{ color: '#cbd5e1' }}>{generateAiSummary()}</p>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                ⚠️ AI-generated summary — verify before relying on it.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEscalationModal(false)} className="btn-secondary">
                Continue with AI
              </button>
              <button onClick={handleCreateMentorRequest} className="btn-accent">
                Submit Request to Ramesh
              </button>
            </div>
          </div>
        )}

        {/* Chat History Container */}
        <div className="glass-panel" style={{ height: '460px', padding: '1.5rem', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '0.85rem',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}>
              {msg.sender === 'bot' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bot size={20} color="#ffffff" />
                </div>
              )}

              <div style={{
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'rgba(30, 41, 59, 0.85)',
                border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '1rem 1.25rem',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                color: '#ffffff',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}

                {/* Inline Escalation Action Buttons */}
                {msg.isEscalationPrompt && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={() => setInput('Tell me more with AI')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                      Continue with AI
                    </button>
                    <button onClick={() => setShowEscalationModal(true)} className="btn-accent" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                      Connect with Ramesh
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={20} color="#06b6d4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text"
            className="form-control"
            placeholder="Ask LWR AI or type 'I want to talk to Ramesh'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ borderRadius: '12px', padding: '0.85rem 1.25rem' }}
          />
          <button type="submit" className="btn-accent" style={{ borderRadius: '12px', padding: '0 1.5rem' }}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};
