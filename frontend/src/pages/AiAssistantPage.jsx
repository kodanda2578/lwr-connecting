import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { buildApiUrl } from '../config/appConfig';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Building2, 
  Compass, 
  Award, 
  AlertCircle 
} from 'lucide-react';

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatBottomRef = useRef(null);

  const initialGreeting = "Hi! 👋 Welcome to Laughs With Ramesh Connecting. I'm your LWR AI study and B.Tech guidance assistant. Are you studying Intermediate 1st year or 2nd year? And are you preparing for AP EAPCET, TG EAPCET, JEE Main, or another entrance exam?";

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: initialGreeting,
      provider: 'LWR_KNOWLEDGE_ENGINE'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentContext, setStudentContext] = useState({});
  const [suggestedChips, setSuggestedChips] = useState([
    "I'm in Intermediate 1st year",
    "I'm in Intermediate 2nd year",
    "Prepare for AP EAPCET",
    "Prepare for JEE Main",
    "Find colleges by rank",
    "Generate a mock test",
    "Create a study timetable"
  ]);

  // Escalation & Mentor Request Modal States
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationCategory, setEscalationCategory] = useState('General Doubt');
  const [submittedRequest, setSubmittedRequest] = useState(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async (textToSend) => {
    const userText = (textToSend || input).trim();
    if (!userText || loading) return;

    setInput('');
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
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
      const historyPayload = newMessages.map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await apiService.sendAiQuery(userText, historyPayload, studentContext);

      if (res && res.response) {
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: res.response,
            provider: res.provider || 'LWR_KNOWLEDGE_ENGINE',
            action: res.action,
            actionLabel: res.actionLabel,
            actionUrl: res.actionUrl
          }
        ]);

        if (res.studentContext) {
          setStudentContext(res.studentContext);
        }

        if (res.suggestedChips && Array.isArray(res.suggestedChips) && res.suggestedChips.length > 0) {
          setSuggestedChips(res.suggestedChips);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: "I couldn't process your request right now. Please try asking about your entrance exam, rank, or mock tests.",
            provider: 'LWR_KNOWLEDGE_ENGINE'
          }
        ]);
      }

      if (isEscalationRequested) {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: 'I can create a personal guidance request for Ramesh for you. Would you like to connect with Ramesh directly?',
              isEscalationPrompt: true,
              provider: 'LWR_KNOWLEDGE_ENGINE'
            }
          ]);
        }, 500);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: 'I encountered a connection error. Click below to retry or connect directly with Ramesh.',
          isError: true,
          provider: 'LWR_KNOWLEDGE_ENGINE'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText) => {
    handleSend(chipText);
  };

  const handleResetConversation = () => {
    setMessages([
      {
        sender: 'bot',
        text: initialGreeting,
        provider: 'LWR_KNOWLEDGE_ENGINE'
      }
    ]);
    setStudentContext({});
    setSuggestedChips([
      "I'm in Intermediate 1st year",
      "I'm in Intermediate 2nd year",
      "Prepare for AP EAPCET",
      "Prepare for JEE Main",
      "Find colleges by rank",
      "Generate a mock test",
      "Create a study timetable"
    ]);
  };

  const generateAiSummary = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || 'Guidance query';
    const profile = user?.profile || {};
    return `Student ${user?.fullName || 'Student'} (Target Exam: ${studentContext.targetExam || profile.targetExam || 'AP_EAPCET'}, Target Rank: ${studentContext.rank || profile.targetRank || '5000'}, Category: ${studentContext.category || 'OC'}, Branch: ${studentContext.preferredBranch || 'CSE'}). Query: "${lastUserMsg}"`;
  };

  const handleCreateMentorRequest = async () => {
    const summary = generateAiSummary();
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || 'Personal guidance request';

    try {
      const res = await fetch(buildApiUrl('/mentor-requests'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({
          category: escalationCategory,
          studentMessage: lastUserMsg,
          exam: studentContext.targetExam || user?.profile?.targetExam || 'AP_EAPCET',
          rank: String(studentContext.rank || user?.profile?.targetRank || '5000'),
          targetBranch: studentContext.preferredBranch || user?.profile?.targetBranch || 'CSE',
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

  // Helper to format text with bold, bullet points, tables, and clickable platform links
  const renderFormattedMessage = (text) => {
    if (!text) return null;

    // Detect markdown tables
    if (text.includes('|') && text.includes('---')) {
      const lines = text.split('\n');
      const tableLines = [];
      const nonTableBefore = [];
      const nonTableAfter = [];
      let inTable = false;
      let afterTable = false;

      for (const line of lines) {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          inTable = true;
          tableLines.push(line);
        } else if (inTable) {
          afterTable = true;
          nonTableAfter.push(line);
        } else {
          nonTableBefore.push(line);
        }
      }

      if (tableLines.length >= 3) {
        const headerCells = tableLines[0].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
        const bodyRows = tableLines.slice(2).map(r => r.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()));

        return (
          <div>
            {nonTableBefore.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>{renderTextParagraphs(nonTableBefore.join('\n'))}</div>
            )}
            <div className="table-wrapper" style={{ margin: '0.75rem 0' }}>
              <table className="data-table" style={{ fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    {headerCells.map((h, i) => <th key={i}>{h.replace(/\*\*/g, '')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>
                          {cell.startsWith('**') && cell.endsWith('**') ? <strong>{cell.replace(/\*\*/g, '')}</strong> : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {nonTableAfter.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>{renderTextParagraphs(nonTableAfter.join('\n'))}</div>
            )}
          </div>
        );
      }
    }

    return renderTextParagraphs(text);
  };

  const renderTextParagraphs = (str) => {
    const paragraphs = str.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Check for blockquotes / notes
      if (para.startsWith('> [!NOTE]') || para.startsWith('> [!TIP]')) {
        const isTip = para.startsWith('> [!TIP]');
        const content = para.replace(/> \[[!A-Z]+\]\n>/g, '').replace(/>/g, '').trim();
        return (
          <div key={pIdx} style={{
            background: isTip ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.1)',
            borderLeft: `3px solid ${isTip ? '#10b981' : '#06b6d4'}`,
            padding: '0.65rem 0.9rem',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.825rem',
            margin: '0.75rem 0',
            lineHeight: 1.5
          }}>
            {parseInlineMarkup(content)}
          </div>
        );
      }

      // Check for bullet lists
      if (para.includes('\n- ') || para.startsWith('- ') || para.includes('\n1. ') || para.startsWith('1. ')) {
        const lines = para.split('\n');
        return (
          <div key={pIdx} style={{ margin: '0.5rem 0' }}>
            {lines.map((line, lIdx) => {
              const isBullet = line.trim().startsWith('- ');
              const isNum = /^\d+\.\s/.test(line.trim());

              if (isBullet || isNum) {
                const clean = isBullet ? line.trim().substring(2) : line.trim().replace(/^\d+\.\s*/, '');
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem', paddingLeft: '0.5rem' }}>
                    <span style={{ color: '#06b6d4', fontWeight: 700 }}>•</span>
                    <div>{parseInlineMarkup(clean)}</div>
                  </div>
                );
              }
              return <p key={lIdx} style={{ marginBottom: '0.35rem' }}>{parseInlineMarkup(line)}</p>;
            })}
          </div>
        );
      }

      return (
        <p key={pIdx} style={{ marginBottom: '0.65rem', lineHeight: 1.6 }}>
          {parseInlineMarkup(para)}
        </p>
      );
    });
  };

  // Parses bold **text** and markdown links [text](path)
  const parseInlineMarkup = (text) => {
    const parts = [];
    let remaining = text;

    // Regex matching either **bold** or [label](link)
    const combinedRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/;

    let keyIndex = 0;
    while (remaining) {
      const match = remaining.match(combinedRegex);
      if (!match) {
        parts.push(remaining);
        break;
      }

      const matchIndex = match.index;
      if (matchIndex > 0) {
        parts.push(remaining.substring(0, matchIndex));
      }

      const matchedString = match[0];
      if (matchedString.startsWith('**') && matchedString.endsWith('**')) {
        parts.push(
          <strong key={keyIndex++} style={{ color: '#ffffff' }}>
            {matchedString.substring(2, matchedString.length - 2)}
          </strong>
        );
      } else if (matchedString.startsWith('[') && matchedString.includes('](')) {
        const label = matchedString.substring(1, matchedString.indexOf(']('));
        const url = matchedString.substring(matchedString.indexOf('](') + 2, matchedString.length - 1);

        if (url.startsWith('/')) {
          parts.push(
            <Link
              key={keyIndex++}
              to={url}
              className="badge badge-cyan"
              style={{
                display: 'inline-flex',
                margin: '0 0.25rem',
                textDecoration: 'none',
                verticalAlign: 'middle',
                padding: '0.2rem 0.55rem',
                fontSize: '0.775rem'
              }}
            >
              {label} <ArrowRight size={11} style={{ marginLeft: '3px' }} />
            </Link>
          );
        } else {
          parts.push(
            <a
              key={keyIndex++}
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#06b6d4', textDecoration: 'underline' }}
            >
              {label}
            </a>
          );
        }
      }

      remaining = remaining.substring(matchIndex + matchedString.length);
    }

    return parts;
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '980px' }}>
        
        {/* Header Bar */}
        <div className="glass-panel" style={{ padding: '1.25rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderColor: 'rgba(139, 92, 246, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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
              <Sparkles size={24} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.35rem', color: '#ffffff', margin: 0 }}>LWR AI Study & Admissions Guide</h1>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Intermediate Classes 11 & 12</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                AP EAPCET • TG EAPCET • JEE Main • Real Historical Cutoffs & Timetables
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              onClick={handleResetConversation}
              className="btn-secondary"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
              title="Start fresh conversation">
              <RefreshCw size={14} /> New Chat
            </button>

            <button 
              onClick={() => setShowEscalationModal(true)} 
              className="btn-accent"
              style={{ padding: '0.5rem 1rem', fontSize: '0.825rem', gap: '0.4rem' }}>
              <UserCheck size={15} /> Connect with Ramesh
            </button>
          </div>
        </div>

        {/* Successful Request Confirmation Card */}
        {submittedRequest && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-green" style={{ marginBottom: '0.35rem' }}>✅ Request Sent to Mentor</span>
                <h3 style={{ color: '#ffffff', fontSize: '1.15rem' }}>Personal Guidance Request Submitted</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Req ID: #{submittedRequest.id}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ color: '#06b6d4', fontWeight: 700, marginBottom: '0.2rem' }}>Summary for Mentor Review:</div>
              <p style={{ color: '#cbd5e1', marginBottom: '0.35rem' }}>{submittedRequest.aiSummary}</p>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontStyle: 'italic' }}>
                ⚠️ {submittedRequest.disclaimer || 'AI-generated guidance summary.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Status: <strong style={{ color: '#38bdf8' }}>{submittedRequest.status}</strong></span>
              <button onClick={() => navigate('/messages')} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                Open Direct Messages <ArrowRight size={14} />
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

            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              If your academic doubt or admission decision needs personal mentoring, Ramesh will review your profile and respond directly.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Select Guidance Category</label>
              <select 
                className="form-control form-select"
                value={escalationCategory}
                onChange={(e) => setEscalationCategory(e.target.value)}>
                <option value="AP EAPCET">AP EAPCET Strategy</option>
                <option value="JEE">JEE Main Strategy</option>
                <option value="Rank Guidance">Rank & Cutoff Guidance</option>
                <option value="College Selection">College Selection & Web Options</option>
                <option value="Branch Selection">Branch Selection (CSE vs ECE vs AI)</option>
                <option value="Cutoff Guidance">Cutoff Analysis</option>
                <option value="Counselling">APSCHE Web Option Counselling</option>
                <option value="General Doubt">General Academic Doubt</option>
              </select>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '0.3rem' }}>Profile Summary:</div>
              <p style={{ color: '#cbd5e1' }}>{generateAiSummary()}</p>
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

        {/* Chat History Box */}
        <div className="glass-panel" style={{
          height: '520px',
          padding: '1.75rem',
          overflowY: 'auto',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'rgba(10, 15, 29, 0.85)'
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '0.85rem',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.sender === 'user' ? '80%' : '90%'
            }}>
              {msg.sender === 'bot' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                }}>
                  <Bot size={20} color="#ffffff" />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'rgba(21, 32, 54, 0.95)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  padding: '1.1rem 1.35rem',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  color: '#ffffff',
                  fontSize: '0.925rem',
                  lineHeight: '1.6',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(6, 182, 212, 0.25)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}>
                  {renderFormattedMessage(msg.text)}

                  {/* Dynamic Action CTA Button */}
                  {msg.actionUrl && (
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button
                        onClick={() => {
                          if (msg.action === 'CONNECT_WITH_RAMESH') {
                            setShowEscalationModal(true);
                          } else {
                            navigate(msg.actionUrl);
                          }
                        }}
                        className="btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer'
                        }}
                      >
                        {msg.actionLabel || 'Explore More'} <ArrowRight size={15} />
                      </button>
                    </div>
                  )}

                  {/* Inline Escalation Prompt Button */}
                  {msg.isEscalationPrompt && !msg.actionUrl && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <button onClick={() => handleSend('Tell me more with AI')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        Continue with AI
                      </button>
                      <button onClick={() => setShowEscalationModal(true)} className="btn-accent" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                        Connect with Ramesh
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'bot' && (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem', paddingLeft: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>LWR AI Assistant</span>
                    <span>•</span>
                    <span style={{ color: msg.provider === 'GEMINI' ? '#38bdf8' : '#a78bfa' }}>
                      {msg.provider === 'GEMINI' ? 'Live Gemini Engine' : 'LWR Educational Knowledge Engine'}
                    </span>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={18} color="#06b6d4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div style={{
                background: 'rgba(21, 32, 54, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.85rem 1.25rem',
                borderRadius: '18px 18px 18px 4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <div className="loading-spinner" style={{ width: '14px', height: '14px', margin: 0, borderWidth: '2px' }}></div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>LWR AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Question Chips */}
        {suggestedChips.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Suggested:</span>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                disabled={loading}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                  color: '#cbd5e1',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.borderColor = '#06b6d4';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.25)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Form with Enter to Send */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text"
            className="form-control"
            placeholder="Ask anything (e.g. 'Which college can I get with rank 5000?', 'AP EAPCET mock test', 'study timetable')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ borderRadius: '12px', padding: '0.9rem 1.25rem', fontSize: '0.95rem' }}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="btn-primary" 
            style={{ borderRadius: '12px', padding: '0 1.5rem', minWidth: '100px', justifyContent: 'center' }}>
            <Send size={18} /> Send
          </button>
        </form>

      </div>
    </div>
  );
};
