import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function CollegeComparePage() {
  const [searchParams] = useSearchParams();
  const c1Id = searchParams.get('c1') || '';
  const c2Id = searchParams.get('c2') || '';

  const [collegesList, setCollegesList] = useState([]);
  const [college1, setCollege1] = useState(null);
  const [college2, setCollege2] = useState(null);

  const [selectedC1, setSelectedC1] = useState(c1Id);
  const [selectedC2, setSelectedC2] = useState(c2Id);

  useEffect(() => {
    loadCollegesList();
  }, []);

  useEffect(() => {
    if (selectedC1) fetchCollegeData(selectedC1, setCollege1);
  }, [selectedC1]);

  useEffect(() => {
    if (selectedC2) fetchCollegeData(selectedC2, setCollege2);
  }, [selectedC2]);

  const loadCollegesList = async () => {
    try {
      const list = await apiService.getCollegesList();
      setCollegesList(list || []);
    } catch (e) {
      console.error('Error loading colleges list:', e);
    }
  };

  const fetchCollegeData = async (id, setter) => {
    try {
      const res = await apiService.getCollegeDetails(id);
      setter(res);
    } catch (e) {
      console.error('Error fetching college details:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-wider">
            Side-by-Side Analysis
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Compare Engineering Colleges
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Select two engineering colleges to compare state, government status, admission authority, offered branches, and closing rank cutoffs.
          </p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Select First College</label>
            <select
              value={selectedC1}
              onChange={(e) => setSelectedC1(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose College 1 --</option>
              {collegesList.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Select Second College</label>
            <select
              value={selectedC2}
              onChange={(e) => setSelectedC2(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose College 2 --</option>
              {collegesList.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        {college1 && college2 && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4 w-1/4">Feature</th>
                  <th className="py-3 px-4 w-3/8 text-indigo-400 font-bold text-sm">{college1.college.name}</th>
                  <th className="py-3 px-4 w-3/8 text-indigo-400 font-bold text-sm">{college2.college.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-400">State & City</td>
                  <td className="py-3 px-4">{college1.college.state?.name}, {college1.college.city}</td>
                  <td className="py-3 px-4">{college2.college.state?.name}, {college2.college.city}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-400">Government Status</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-800 rounded">{college1.college.governmentStatus || 'Government'}</span></td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-800 rounded">{college2.college.governmentStatus || 'Government'}</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-400">Admission Authority</td>
                  <td className="py-3 px-4">{college1.college.admissionAuthority}</td>
                  <td className="py-3 px-4">{college2.college.admissionAuthority}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-400">Autonomous Status</td>
                  <td className="py-3 px-4">{college1.college.isAutonomous ? 'Autonomous' : 'Affiliated'}</td>
                  <td className="py-3 px-4">{college2.college.isAutonomous ? 'Autonomous' : 'Affiliated'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-400">Entrance Exams Accepted</td>
                  <td className="py-3 px-4">{college1.exams.map(e => e.name).join(', ') || 'State Exam'}</td>
                  <td className="py-3 px-4">{college2.exams.map(e => e.name).join(', ') || 'State Exam'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-400">Offered Branches</td>
                  <td className="py-3 px-4">{college1.branches.map(b => b.code).join(', ')}</td>
                  <td className="py-3 px-4">{college2.branches.map(b => b.code).join(', ')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
