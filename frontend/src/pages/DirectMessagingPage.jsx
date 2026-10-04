import React, { useState } from 'react';
import { MessageSquare, Send, User, CheckCircle2, Paperclip } from 'lucide-react';

export const DirectMessagingPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'mentor',
      senderName: 'Ramesh Mentor',
      text: 'Hi Rahul! How is your AP EAPCET Mathematics preparation coming along? Let me know if you need help with Matrices or Integration.',
      timestamp: '10:30 AM'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'student',
      senderName: 'Rahul',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Simulate mentor reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'mentor',
          senderName: 'Ramesh Mentor',
          text: 'Got your message! I will review your query and send over detailed guidance shorty.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        
        {/* Header */}
        <div className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', color: '#ffffff', margin: 0 }}>Message Laughs With Ramesh</h1>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Direct Mentor Support Line</span>
            </div>
          </div>
          <span className="badge badge-green">Mentor Active</span>
        </div>

        {/* Message Container */}
        <div className="glass-panel" style={{ height: '420px', padding: '1.5rem', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m) => (
            <div key={m.id} style={{
              alignSelf: m.sender === 'student' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', textAlign: m.sender === 'student' ? 'right' : 'left' }}>
                {m.senderName} • {m.timestamp}
              </div>
              <div style={{
                background: m.sender === 'student' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'rgba(30, 41, 59, 0.85)',
                border: m.sender === 'student' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '0.85rem 1.15rem',
                borderRadius: m.sender === 'student' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                color: '#ffffff',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Type your doubt or message for Ramesh..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
          />
          <button type="submit" className="btn-primary" style={{ padding: '0 1.5rem' }}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};
