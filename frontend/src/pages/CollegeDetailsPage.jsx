import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';

export default function CollegeDetailsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollege();
  }, [id]);

  const loadCollege = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCollegeDetails(id);
      setData(res);
    } catch (e) {
      console.error('Failed to load college details:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Loading College Details...</div>;
  }

  if (!data || !data.college) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 py-20 text-center">
        <p>College details not found.</p>
        <Link to="/colleges" className="text-indigo-400 underline mt-4 inline-block">&larr; Back to Colleges</Link>
      </div>
    );
  }

  const { college, exams, branches, cutoffs } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back Link */}
        <Link to="/colleges" className="inline-flex items-center text-xs text-indigo-400 hover:text-indigo-300">
          &larr; Back to All Colleges
        </Link>

        {/* Header Hero */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full">
              {college.state ? college.state.name : 'India'}
            </span>
            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-semibold rounded-full">
              {college.governmentStatus || 'Government'}
            </span>
            {college.isAutonomous && (
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                Autonomous
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{college.name}</h1>
          <p className="text-sm text-slate-400">{college.city}{college.district ? `, ${college.district}` : ''}</p>

          {college.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
              {college.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="block text-slate-500 font-medium">Admission Authority:</span>
              <span className="text-slate-200 font-semibold">{college.admissionAuthority || 'State Authority'}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">College Type:</span>
              <span className="text-slate-200 font-semibold">{college.collegeType || 'Engineering College'}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-medium">Official Website:</span>
              {college.website ? (
                <a href={college.website} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline line-clamp-1">
                  {college.website}
                </a>
              ) : (
                <span className="text-slate-400">Not Available</span>
              )}
            </div>
          </div>
        </div>

        {/* Admission Routes / Exams */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Admission Entrance Exams & Routes</span>
          </h2>
          {exams.length === 0 ? (
            <p className="text-xs text-slate-400">No exam routes mapped yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {exams.map(e => (
                <div key={e.id} className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-1">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded">{e.code}</span>
                  <h4 className="text-sm font-semibold text-white mt-1">{e.name}</h4>
                  <p className="text-xs text-slate-400">{e.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offered Branches */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Offered Engineering Branches</h2>
          {branches.length === 0 ? (
            <p className="text-xs text-slate-400">No branches mapped yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {branches.map(b => (
                <div key={b.id} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl">
                  <span className="text-xs font-mono text-indigo-400 font-bold">{b.code}</span>
                  <p className="text-xs text-slate-200 font-medium mt-0.5">{b.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Cutoff Benchmarks */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Historical Opening & Closing Ranks (Cutoffs)</h2>
          {cutoffs.length === 0 ? (
            <p className="text-xs text-slate-400">No cutoff records available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Exam</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Round</th>
                    <th className="py-2.5 px-3">Opening Rank</th>
                    <th className="py-2.5 px-3">Closing Rank</th>
                    <th className="py-2.5 px-3">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {cutoffs.map(c => (
                    <tr key={c.id} className="hover:bg-slate-900/60">
                      <td className="py-3 px-3 font-mono text-indigo-400">{c.exam ? c.exam.code : 'EXAM'}</td>
                      <td className="py-3 px-3 font-medium text-white">{c.branch ? c.branch.name : 'Branch'}</td>
                      <td className="py-3 px-3">{c.year}</td>
                      <td className="py-3 px-3"><span className="px-2 py-0.5 bg-slate-800 rounded font-semibold text-slate-200">{c.category}</span></td>
                      <td className="py-3 px-3">Round {c.round}</td>
                      <td className="py-3 px-3 text-emerald-400 font-mono">{c.openingRank || '-'}</td>
                      <td className="py-3 px-3 text-amber-400 font-mono font-bold">{c.closingRank || '-'}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 max-w-xs truncate">{c.sourceReference || 'Official Record'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
