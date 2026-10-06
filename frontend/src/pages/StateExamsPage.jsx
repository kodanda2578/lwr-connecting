import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function StateExamsPage() {
  const [exams, setExams] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [examList, stateList] = await Promise.all([
        apiService.getExams('STATE'),
        apiService.getStates()
      ]);
      setExams(examList || []);
      setStates(stateList || []);
    } catch (e) {
      console.error('Failed to load state exams:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const stateMatch = !selectedState || (exam.state && String(exam.state.id) === String(selectedState));
    const searchMatch = !searchTerm ||
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.state && exam.state.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return stateMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            India-Wide Engineering Admissions
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            State Engineering Entrance Exams
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Explore state-specific entrance exams, admission authorities, and eligible engineering colleges across India.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-medium text-slate-400 mb-1">Search Exam or State</label>
            <input
              type="text"
              placeholder="e.g. AP EAPCET, KCET, MHT-CET, WBJEE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-xs font-medium text-slate-400 mb-1">Filter by State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">All States in India</option>
              {states.filter(s => s.code !== 'ALL_INDIA').map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exam Cards Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading State Entrance Exams...</div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <p className="text-slate-400">No state entrance exams found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                      {exam.state ? exam.state.name : 'State Level'}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-lg">
                      {exam.code}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{exam.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {exam.description || 'Official State Engineering Admission Pathway'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={`/colleges?examId=${exam.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View Colleges ({exam.name}) &rarr;
                  </Link>
                  <Link
                    to={`/cutoffs?examId=${exam.id}`}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cutoffs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
