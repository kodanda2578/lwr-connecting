import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function CollegeDiscoveryPage() {
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('examId') || '';

  const [colleges, setColleges] = useState([]);
  const [states, setStates] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedState, setSelectedState] = useState('');
  const [selectedExam, setSelectedExam] = useState(initialExamId);
  const [selectedGovStatus, setSelectedGovStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [selectedState, selectedExam, selectedGovStatus, searchQuery]);

  const loadFilters = async () => {
    try {
      const [stList, exList] = await Promise.all([
        apiService.getStates(),
        apiService.getExams()
      ]);
      setStates(stList || []);
      setExams(exList || []);
    } catch (e) {
      console.error('Error loading filters:', e);
    }
  };

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const list = await apiService.getCollegesList({
        stateId: selectedState,
        examId: selectedExam,
        govStatus: selectedGovStatus,
        search: searchQuery
      });
      setColleges(list || []);
    } catch (e) {
      console.error('Error fetching colleges:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            India-Wide College Finder
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineering College Discovery
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Discover top government and private engineering colleges, admission authorities, branches, and verified entrance exam cutoffs across India.
          </p>
        </div>

        {/* Multi-Filter Bar */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Search College Name / Code</label>
            <input
              type="text"
              placeholder="e.g. RVCE, COEP, AUCE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All States</option>
              {states.filter(s => s.code !== 'ALL_INDIA').map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Entrance Exam / Route</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Exams / Routes</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Government / Private</label>
            <select
              value={selectedGovStatus}
              onChange={(e) => setSelectedGovStatus(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Government">Government</option>
              <option value="Private">Private</option>
              <option value="Govt-Aided">Government-Aided</option>
            </select>
          </div>
        </div>

        {/* Colleges Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading Engineering Colleges...</div>
        ) : colleges.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <p className="text-slate-400">No engineering colleges found matching the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college) => (
              <div key={college.id} className="bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg">
                      {college.state ? college.state.name : 'India'}
                    </span>
                    {college.isAutonomous && (
                      <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg">
                        Autonomous
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white line-clamp-1">{college.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{college.city}{college.district ? `, ${college.district}` : ''}</p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <p><span className="text-slate-500">Status:</span> {college.governmentStatus || 'University'}</p>
                    <p><span className="text-slate-500">Authority:</span> {college.admissionAuthority || 'State Authority'}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    to={`/colleges/${college.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    View Branches & Cutoffs &rarr;
                  </Link>
                  <Link
                    to={`/compare-colleges?c1=${college.id}`}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Compare
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
