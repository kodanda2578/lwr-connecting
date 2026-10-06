import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export default function PyqExplorerPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Expansion / Revelation state
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [userSelectedOptions, setUserSelectedOptions] = useState({});

  useEffect(() => {
    loadInitialMetadata();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedExamId, selectedSubjectId, selectedTopicId, selectedYear, selectedDifficulty]);

  useEffect(() => {
    if (selectedSubjectId || selectedExamId) {
      apiService.getTopics(selectedSubjectId, selectedExamId).then(data => {
        setTopics(data || []);
      });
    } else {
      apiService.getTopics().then(data => setTopics(data || []));
    }
  }, [selectedSubjectId, selectedExamId]);

  const loadInitialMetadata = async () => {
    setLoading(true);
    try {
      const [eData, sData] = await Promise.all([
        apiService.getExams(),
        apiService.getSubjects()
      ]);
      setExams(eData || []);
      setSubjects(sData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const filters = {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        year: selectedYear,
        difficulty: selectedDifficulty,
        search: searchTerm
      };
      const data = await apiService.getQuestions(filters);
      setQuestions(data || []);
    } catch (e) {
      console.error('Failed to load questions:', e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleExplanation = (id) => {
    setExpandedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectOption = (qId, option) => {
    setUserSelectedOptions(prev => ({ ...prev, [qId]: option }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
              <span>Verified PYQs Repository</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Previous Year Questions (PYQ) Explorer
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Solve official JEE Main, JEE Advanced, and State Engineering Entrance PYQs with step-by-step verified explanations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
              Total Questions Available: <strong className="text-cyan-400">{questions.length}</strong>
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Filter Questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            
            {/* Exam Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Exam</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Exams</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name} ({ex.type})</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Topic</label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Topics</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-3">
            <input
              type="text"
              placeholder="Search by keywords (e.g. kinematics, det(A), projectile...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              Search
            </button>
          </form>
        </div>

        {/* Question Cards List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-slate-400 text-sm">Loading verified PYQ dataset...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-lg font-semibold text-white">No PYQs Match Selected Filters</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Try adjusting your filter selection or clear search terms to view available verified PYQs.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const selectedOpt = userSelectedOptions[q.id];
              const showExp = expandedAnswers[q.id];
              const isCorrect = selectedOpt && selectedOpt === q.correctOption;

              return (
                <div
                  key={q.id}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 md:p-8 space-y-6 hover:border-slate-700/80 transition-all shadow-xl"
                >
                  {/* Card Header Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs px-3 py-1 rounded-md">
                        {q.exam?.name || 'Exam'} {q.examYear ? `(${q.examYear})` : ''}
                      </span>
                      <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-md font-medium">
                        {q.subject?.name || 'Subject'}
                      </span>
                      {q.topic && (
                        <span className="bg-slate-800/60 text-slate-400 text-xs px-3 py-1 rounded-md">
                          Topic: {q.topic.name}
                        </span>
                      )}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                        q.difficulty === 'EASY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : q.difficulty === 'HARD'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 font-mono">
                      Ref: {q.sourceReference || `PYQ #${q.id}`} | Marks: +{q.marks || 4}, -{q.negativeMarks || 1}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-3">
                    <div className="text-slate-100 font-medium text-base leading-relaxed">
                      <span className="text-cyan-400 font-bold mr-2">Q{idx + 1}.</span>
                      {q.questionText}
                    </div>

                    {q.imageUrl && (
                      <div className="pt-2">
                        <img src={q.imageUrl} alt="Question Diagram" className="max-h-60 rounded-lg border border-slate-800 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { key: 'A', text: q.optionA },
                      { key: 'B', text: q.optionB },
                      { key: 'C', text: q.optionC },
                      { key: 'D', text: q.optionD },
                    ].filter(opt => opt.text).map((opt) => {
                      const isSelected = selectedOpt === opt.key;
                      const isTargetCorrect = q.correctOption === opt.key;
                      let btnStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700';

                      if (isSelected) {
                        if (isTargetCorrect) {
                          btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                        } else {
                          btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-semibold';
                        }
                      } else if (showExp && isTargetCorrect) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold';
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => selectOption(q.id, opt.key)}
                          className={`flex items-start text-left p-3.5 rounded-xl border text-sm transition-all ${btnStyle}`}
                        >
                          <span className="font-bold mr-2.5 opacity-80">({opt.key})</span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                    <div>
                      {selectedOpt && (
                        <div className={`text-xs font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCorrect ? '✓ Correct Answer!' : `✗ Incorrect (Correct Option is ${q.correctOption})`}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => toggleExplanation(q.id)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 rounded-xl transition-all"
                    >
                      <span>{showExp ? 'Hide Answer & Explanation' : 'View Answer & Explanation'}</span>
                    </button>
                  </div>

                  {/* Explanation Drawer */}
                  {showExp && (
                    <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-5 space-y-3 mt-4 text-sm animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Correct Option: ({q.correctOption})
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Verified Solution</span>
                      </div>
                      <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                        {q.explanation || 'Step-by-step solution verified against official entrance exam answer key.'}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
