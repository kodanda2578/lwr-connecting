import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function CutoffExplorerPage() {
  const [cutoffs, setCutoffs] = useState([]);
  const [exams, setExams] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);

  // Filters
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchCutoffs();
  }, [selectedExam, selectedCollege, selectedBranch, selectedCategory, selectedYear]);

  const loadFilters = async () => {
    try {
      const [exList, colList, brList] = await Promise.all([
        apiService.getExams(),
        apiService.getCollegesList(),
        apiService.getBranchesList()
      ]);
      setExams(exList || []);
      setColleges(colList || []);
      setBranches(brList || []);
    } catch (e) {
      console.error('Error loading cutoff filters:', e);
    }
  };

  const fetchCutoffs = async () => {
    setLoading(true);
    try {
      const list = await apiService.getCutoffsList({
        examId: selectedExam,
        collegeId: selectedCollege,
        branchId: selectedBranch,
        category: selectedCategory,
        year: selectedYear
      });
      setCutoffs(list || []);
    } catch (e) {
      console.error('Error fetching cutoffs:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Verified Benchmarks
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Cutoff Explorer & Historical Ranks
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Explore verified opening & closing ranks across state entrance exams, colleges, branches, and categories.
          </p>
        </div>

        {/* Multi-Filter Bar */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Entrance Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Exams</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Colleges</option>
              {colleges.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="OC">OC / Open</option>
              <option value="GM">GM</option>
              <option value="BC_A">BC-A</option>
              <option value="BC_B">BC-B</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        {/* Cutoff Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading Cutoffs...</div>
        ) : cutoffs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <p className="text-slate-400">No cutoff records found matching the selected filters.</p>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Exam</th>
                  <th className="py-3 px-3">College</th>
                  <th className="py-3 px-3">Branch</th>
                  <th className="py-3 px-3">Year</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Opening Rank</th>
                  <th className="py-3 px-3">Closing Rank</th>
                  <th className="py-3 px-3">Source Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {cutoffs.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-indigo-400 font-bold">{c.exam ? c.exam.code : 'EXAM'}</td>
                    <td className="py-3 px-3 font-medium text-white">{c.college ? c.college.name : 'College'}</td>
                    <td className="py-3 px-3">{c.branch ? c.branch.name : 'Branch'}</td>
                    <td className="py-3 px-3">{c.year}</td>
                    <td className="py-3 px-3"><span className="px-2 py-0.5 bg-slate-800 rounded font-semibold text-slate-200">{c.category}</span></td>
                    <td className="py-3 px-3 text-emerald-400 font-mono">{c.openingRank || '-'}</td>
                    <td className="py-3 px-3 text-amber-400 font-mono font-bold">{c.closingRank || '-'}</td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 max-w-xs truncate">{c.sourceReference || 'Official Release'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
