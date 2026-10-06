import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function ExamSyllabusPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [selectedExamId, selectedSubjectId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [exRes, subRes] = await Promise.all([
        apiService.getExams(),
        apiService.getSubjects()
      ]);
      setExams(exRes || []);
      setSubjects(subRes || []);
      if (exRes && exRes.length > 0) {
        setSelectedExamId(exRes[0].id);
      }
      if (subRes && subRes.length > 0) {
        setSelectedSubjectId(subRes[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    if (!selectedExamId && !selectedSubjectId) return;
    try {
      const tData = await apiService.getTopics(selectedSubjectId, selectedExamId);
      setTopics(tData || []);
      const stData = await apiService.getSubTopics();
      setSubTopics(stData || []);
    } catch (e) {
      console.error('Failed to load topics:', e);
    }
  };

  const selectedExam = exams.find(e => e.id === Number(selectedExamId));
  const selectedSubject = subjects.find(s => s.id === Number(selectedSubjectId));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <span>Database-Driven Official Syllabus</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
            Exam Syllabus & Topic Weightages
          </h1>
          <p className="mt-2 text-slate-400 text-sm max-w-2xl">
            Explore official topic structures, weightage percentages, subtopic breakdowns, and source references stored in our database.
          </p>
        </div>

        {/* Selector Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          {/* Exam Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Entrance Exam</label>
            <div className="flex flex-wrap gap-3">
              {exams.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExamId(ex.id)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                    Number(selectedExamId) === ex.id
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {ex.name} <span className="text-xs opacity-75 font-normal">({ex.type})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Subject</label>
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`px-5 py-2 font-bold text-sm transition-all border-b-2 ${
                    Number(selectedSubjectId) === s.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Topics List with Subtopics */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-slate-400 text-sm">Loading syllabus data...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No topic weightage structure found for {selectedExam?.name} - {selectedSubject?.name}.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {selectedExam?.name} • {selectedSubject?.name} Topics ({topics.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((t) => {
                const topicSubTopics = subTopics.filter(st => st.topic?.id === t.id);

                return (
                  <div
                    key={t.id}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-slate-700/80 transition-all shadow-xl flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-slate-100">{t.name}</h3>
                        {t.weightagePercentage && (
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs px-3 py-1 rounded-full whitespace-nowrap">
                            ~{t.weightagePercentage}% Weightage
                          </span>
                        )}
                      </div>

                      {t.sourceReference && (
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                          <span>Ref:</span> {t.sourceReference}
                        </p>
                      )}

                      {/* Subtopics */}
                      {topicSubTopics.length > 0 && (
                        <div className="pt-2 space-y-2 border-t border-slate-800/60">
                          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Subtopic Breakdown:</span>
                          <ul className="space-y-1.5">
                            {topicSubTopics.map(st => (
                              <li key={st.id} className="text-xs text-slate-300 flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                <span className="font-medium">{st.name}</span>
                                {st.description && <span className="text-slate-500 text-xs">({st.description})</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-500">
                      <span>Status: Active Syllabus</span>
                      <span>Verified Standard</span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
