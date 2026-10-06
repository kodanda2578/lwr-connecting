import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function CollegePredictorPage() {
  const [exams, setExams] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedExam, setSelectedExam] = useState('');
  const [userRank, setUserRank] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('OC');
  const [selectedBranch, setSelectedBranch] = useState('');
  
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [exList, brList] = await Promise.all([
        apiService.getExams(),
        apiService.getBranchesList()
      ]);
      setExams(exList || []);
      setBranches(brList || []);
      if (exList && exList.length > 0) {
        setSelectedExam(exList[0].id);
      }
    } catch (e) {
      console.error('Error loading predictor options:', e);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!userRank || !selectedExam) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await apiService.predictCollegesList(selectedExam, userRank, selectedCategory, selectedBranch);
      setResults(res || []);
    } catch (e) {
      console.error('Prediction query failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Verified Rank Matching
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            College Predictor & Rank Eligibility
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Find engineering colleges and branches matching your entrance exam rank based strictly on official historical closing rank cutoffs.
          </p>
        </div>

        {/* Predictor Form */}
        <form onSubmit={handlePredict} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Entrance Exam *</label>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">-- Select Exam --</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Your Rank *</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={userRank}
                onChange={(e) => setUserRank(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="OC">OC / Open / GM</option>
                <option value="BC_A">BC-A / OBC</option>
                <option value="BC_B">BC-B</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Preferred Branch (Optional)</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Evaluating Rank Eligibility...' : 'Find Eligible Colleges & Branches'}
            </button>
          </div>
        </form>

        {/* Prediction Results */}
        {searched && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Eligible College Matches ({results.length})</h2>

            {results.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                No historical cutoff matches found for Rank {userRank} in the selected category.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                        item.chanceCategory === 'Strong Chance' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        item.chanceCategory === 'Possible' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                      }`}>
                        {item.chanceCategory}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Prev Closing: <strong className="text-white">{item.closingRank}</strong>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white">{item.college?.name}</h3>
                      <p className="text-xs text-indigo-400 font-medium">{item.branch?.name}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 border-t border-slate-850 pt-2 flex justify-between">
                      <span>Category: {item.category} ({item.year})</span>
                      <span className="truncate max-w-[200px]">Ref: {item.sourceReference}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
