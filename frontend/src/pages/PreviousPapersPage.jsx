import React, { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';

export const PreviousPapersPage = () => {
  const papers = [
    { id: 1, title: 'AP EAPCET 2024 Engineering Shift 1 Official Question Paper with Answer Key', exam: 'AP_EAPCET', year: 2024, subject: 'MPC', source: 'APSCHE Official Released Key', date: '2024-05-25' },
    { id: 2, title: 'AP EAPCET 2024 Engineering Shift 2 Official Question Paper with Answer Key', exam: 'AP_EAPCET', year: 2024, subject: 'MPC', source: 'APSCHE Official Released Key', date: '2024-05-25' },
    { id: 3, title: 'JEE Main 2024 January Session Shift 1 Physics, Chemistry & Math Paper', exam: 'JEE', year: 2024, subject: 'PCM', source: 'NTA Official Paper Repository', date: '2024-01-30' },
    { id: 4, title: 'AP EAPCET 2023 Grand Previous Paper with Detailed Explanations', exam: 'AP_EAPCET', year: 2023, subject: 'MPC', source: 'APSCHE Official Archive', date: '2023-05-20' }
  ];

  const [selectedExam, setSelectedExam] = useState('ALL');

  const filtered = papers.filter(p => selectedExam === 'ALL' || p.exam === selectedExam);

  return (
    <div style={{ padding: '3rem 0 5rem 0' }}>
      <div className="container">
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
          <div className="badge badge-cyan" style={{ marginBottom: '0.5rem' }}>Verified PYQ Repository</div>
          <h1 style={{ fontSize: '2rem', color: '#ffffff' }}>Previous Year Question Papers (PYQs)</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '750px', marginTop: '0.25rem' }}>
            Download legally usable official entrance question papers with answer keys and source attribution.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => setSelectedExam('ALL')} className={selectedExam === 'ALL' ? 'btn-primary' : 'btn-secondary'}>All Exams</button>
            <button onClick={() => setSelectedExam('AP_EAPCET')} className={selectedExam === 'AP_EAPCET' ? 'btn-accent' : 'btn-secondary'}>AP EAPCET</button>
            <button onClick={() => setSelectedExam('JEE')} className={selectedExam === 'JEE' ? 'btn-primary' : 'btn-secondary'}>JEE Main</button>
          </div>
        </div>

        <div className="grid-2">
          {filtered.map(paper => (
            <div key={paper.id} className="glass-panel" style={{ padding: '1.75rem' }}>
              <span className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>{paper.exam} ({paper.year})</span>
              <h3 style={{ color: '#ffffff', fontSize: '1.15rem', marginBottom: '0.75rem' }}>{paper.title}</h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
                Source: {paper.source} | Date: {paper.date}
              </div>
              <button onClick={() => alert(`Downloading paper: ${paper.title}`)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                <Download size={16} /> Download PDF & Answer Key
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
