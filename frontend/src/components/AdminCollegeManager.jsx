import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function AdminCollegeManager() {
  const [colleges, setColleges] = useState([]);
  const [branches, setBranches] = useState([]);
  const [states, setStates] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('colleges');

  // Form states for College
  const [collegeForm, setCollegeForm] = useState({
    code: '',
    name: '',
    stateId: '',
    city: '',
    district: '',
    website: '',
    admissionAuthority: '',
    governmentStatus: 'Government',
    collegeType: 'Autonomous College',
    isAutonomous: true,
    description: '',
    sourceReference: ''
  });

  // Form states for Branch
  const [branchForm, setBranchForm] = useState({
    code: '',
    name: '',
    description: ''
  });

  // Form states for Cutoff
  const [cutoffForm, setCutoffForm] = useState({
    examId: '',
    collegeId: '',
    branchId: '',
    year: 2024,
    category: 'OC',
    gender: 'ALL',
    quota: 'STATE_QUOTA',
    round: 1,
    openingRank: '',
    closingRank: '',
    sourceReference: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [colList, brList, stList, exList] = await Promise.all([
        apiService.adminGetColleges(),
        apiService.getBranchesList(),
        apiService.getStates(),
        apiService.getExams()
      ]);
      setColleges(colList || []);
      setBranches(brList || []);
      setStates(stList || []);
      setExams(exList || []);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        code: collegeForm.code,
        name: collegeForm.name,
        state: collegeForm.stateId ? { id: collegeForm.stateId } : null,
        city: collegeForm.city,
        district: collegeForm.district,
        website: collegeForm.website,
        admissionAuthority: collegeForm.admissionAuthority,
        governmentStatus: collegeForm.governmentStatus,
        collegeType: collegeForm.collegeType,
        isAutonomous: collegeForm.isAutonomous,
        description: collegeForm.description,
        sourceReference: collegeForm.sourceReference
      };
      const res = await apiService.adminCreateCollege(payload);
      if (res) {
        setMessage('College created successfully!');
        setCollegeForm({ code: '', name: '', stateId: '', city: '', district: '', website: '', admissionAuthority: '', governmentStatus: 'Government', collegeType: 'Autonomous College', isAutonomous: true, description: '', sourceReference: '' });
        loadAllAdminData();
      }
    } catch (err) {
      setMessage('Failed to create college.');
    }
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await apiService.adminCreateBranch(branchForm);
      if (res) {
        setMessage('Branch created successfully!');
        setBranchForm({ code: '', name: '', description: '' });
        loadAllAdminData();
      }
    } catch (err) {
      setMessage('Failed to create branch.');
    }
  };

  const handleCreateCutoff = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = {
        exam: { id: cutoffForm.examId },
        college: { id: cutoffForm.collegeId },
        branch: { id: cutoffForm.branchId },
        year: Number(cutoffForm.year),
        category: cutoffForm.category,
        gender: cutoffForm.gender,
        quota: cutoffForm.quota,
        round: Number(cutoffForm.round),
        openingRank: cutoffForm.openingRank ? Number(cutoffForm.openingRank) : null,
        closingRank: cutoffForm.closingRank ? Number(cutoffForm.closingRank) : null,
        sourceReference: cutoffForm.sourceReference
      };
      const res = await apiService.adminCreateCutoff(payload);
      if (res) {
        setMessage('Cutoff benchmark created successfully!');
        setCutoffForm({ examId: '', collegeId: '', branchId: '', year: 2024, category: 'OC', gender: 'ALL', quota: 'STATE_QUOTA', round: 1, openingRank: '', closingRank: '', sourceReference: '' });
      }
    } catch (err) {
      setMessage('Failed to create cutoff record.');
    }
  };

  return (
    <div className="space-y-6 text-slate-100">

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('colleges')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeSubTab === 'colleges' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Manage Colleges
        </button>
        <button
          onClick={() => setActiveSubTab('branches')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeSubTab === 'branches' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Manage Branches
        </button>
        <button
          onClick={() => setActiveSubTab('cutoffs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${activeSubTab === 'cutoffs' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
        >
          Add Cutoff Benchmarks
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium">
          {message}
        </div>
      )}

      {/* Colleges Tab */}
      {activeSubTab === 'colleges' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateCollege} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Engineering College</h3>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">College Code *</label>
              <input type="text" placeholder="e.g. RVCE, COEP" value={collegeForm.code} onChange={e => setCollegeForm({...collegeForm, code: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">College Name *</label>
              <input type="text" placeholder="Full Official Name" value={collegeForm.name} onChange={e => setCollegeForm({...collegeForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">State</label>
                <select value={collegeForm.stateId} onChange={e => setCollegeForm({...collegeForm, stateId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white">
                  <option value="">Select State</option>
                  {states.filter(s => s.code !== 'ALL_INDIA').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">City</label>
                <input type="text" placeholder="e.g. Pune" value={collegeForm.city} onChange={e => setCollegeForm({...collegeForm, city: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Admission Authority</label>
              <input type="text" placeholder="e.g. KEA, APSCHE, MHT-CET" value={collegeForm.admissionAuthority} onChange={e => setCollegeForm({...collegeForm, admissionAuthority: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Govt Status</label>
                <select value={collegeForm.governmentStatus} onChange={e => setCollegeForm({...collegeForm, governmentStatus: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white">
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Govt-Aided">Govt-Aided</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Autonomous?</label>
                <select value={collegeForm.isAutonomous ? 'true' : 'false'} onChange={e => setCollegeForm({...collegeForm, isAutonomous: e.target.value === 'true'})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white">
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Official Reference / Source URL</label>
              <input type="text" placeholder="e.g. Official Seat Matrix URL" value={collegeForm.sourceReference} onChange={e => setCollegeForm({...collegeForm, sourceReference: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
            </div>

            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-lg text-white">
              Save College
            </button>
          </form>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3 overflow-x-auto">
            <h3 className="text-sm font-bold text-white">Registered Colleges ({colleges.length})</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-2">Code</th>
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">State</th>
                  <th className="py-2 px-2">City</th>
                  <th className="py-2 px-2">Govt/Private</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {colleges.map(c => (
                  <tr key={c.id}>
                    <td className="py-2 px-2 font-mono text-indigo-400">{c.code}</td>
                    <td className="py-2 px-2 font-medium text-white">{c.name}</td>
                    <td className="py-2 px-2">{c.state ? c.state.name : '-'}</td>
                    <td className="py-2 px-2">{c.city}</td>
                    <td className="py-2 px-2">{c.governmentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Branches Tab */}
      {activeSubTab === 'branches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCreateBranch} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Engineering Branch</h3>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Branch Code *</label>
              <input type="text" placeholder="e.g. CSE, ECE, MECH" value={branchForm.code} onChange={e => setBranchForm({...branchForm, code: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Full Branch Name *</label>
              <input type="text" placeholder="e.g. Computer Science & Engineering" value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required />
            </div>

            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-lg text-white">
              Save Branch
            </button>
          </form>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-white">Active Engineering Branches ({branches.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {branches.map(b => (
                <div key={b.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                  <span className="font-mono text-indigo-400 font-bold text-xs">{b.code}</span>
                  <p className="text-xs text-white font-medium mt-0.5">{b.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cutoffs Tab */}
      {activeSubTab === 'cutoffs' && (
        <form onSubmit={handleCreateCutoff} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 max-w-3xl">
          <h3 className="text-sm font-bold text-white">Add Verified Historical Cutoff Benchmark</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Exam *</label>
              <select value={cutoffForm.examId} onChange={e => setCutoffForm({...cutoffForm, examId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required>
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">College *</label>
              <select value={cutoffForm.collegeId} onChange={e => setCutoffForm({...cutoffForm, collegeId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required>
                <option value="">Select College</option>
                {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Branch *</label>
              <select value={cutoffForm.branchId} onChange={e => setCutoffForm({...cutoffForm, branchId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Year</label>
              <input type="number" value={cutoffForm.year} onChange={e => setCutoffForm({...cutoffForm, year: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Category</label>
              <input type="text" placeholder="e.g. OC, BC_A, GM" value={cutoffForm.category} onChange={e => setCutoffForm({...cutoffForm, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Opening Rank</label>
              <input type="number" placeholder="e.g. 150" value={cutoffForm.openingRank} onChange={e => setCutoffForm({...cutoffForm, openingRank: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Closing Rank</label>
              <input type="number" placeholder="e.g. 1200" value={cutoffForm.closingRank} onChange={e => setCutoffForm({...cutoffForm, closingRank: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Official Reference / Source Tag *</label>
            <input type="text" placeholder="e.g. KEA Official KCET 2023 Round 1 PDF" value={cutoffForm.sourceReference} onChange={e => setCutoffForm({...cutoffForm, sourceReference: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white" required />
          </div>

          <button type="submit" className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl text-white">
            Save Verified Cutoff
          </button>
        </form>
      )}

    </div>
  );
}
