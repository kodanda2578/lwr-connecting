import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Filter, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { apiService } from '../services/apiService';

export default function AdminQuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showTopicModal, setShowTopicModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    examId: '',
    subjectId: '',
    topicId: '',
    subtopicId: '',
    examYear: '2024',
    questionText: '',
    imageUrl: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    difficulty: 'MEDIUM',
    questionType: 'SINGLE_CHOICE',
    marks: 4,
    negativeMarks: 1,
    explanation: '',
    sourceReference: ''
  });

  // Topic Form State
  const [topicForm, setTopicForm] = useState({
    subjectId: '',
    examId: '',
    name: '',
    weightagePercentage: '',
    sourceReference: ''
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filterExam, filterSubject, filterTopic, filterYear, filterDifficulty]);

  useEffect(() => {
    if (formData.subjectId || formData.examId) {
      apiService.getTopics(formData.subjectId, formData.examId).then(data => setTopics(data || []));
    }
  }, [formData.subjectId, formData.examId]);

  const loadMetadata = async () => {
    setLoading(true);
    try {
      const [eData, sData, tData] = await Promise.all([
        apiService.getExams(),
        apiService.getSubjects(),
        apiService.getTopics()
      ]);
      setExams(eData || []);
      setSubjects(sData || []);
      setTopics(tData || []);
      if (eData && eData.length > 0) {
        setFormData(prev => ({ ...prev, examId: eData[0].id }));
        setTopicForm(prev => ({ ...prev, examId: eData[0].id }));
      }
      if (sData && sData.length > 0) {
        setFormData(prev => ({ ...prev, subjectId: sData[0].id }));
        setTopicForm(prev => ({ ...prev, subjectId: sData[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const filters = {
        examId: filterExam,
        subjectId: filterSubject,
        topicId: filterTopic,
        year: filterYear,
        difficulty: filterDifficulty,
        search: searchQuery
      };
      const qData = await apiService.getQuestions(filters);
      setQuestions(qData || []);
    } catch (e) {
      console.error('Failed to load questions:', e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFormData({
      examId: exams.length > 0 ? exams[0].id : '',
      subjectId: subjects.length > 0 ? subjects[0].id : '',
      topicId: '',
      subtopicId: '',
      examYear: '2024',
      questionText: '',
      imageUrl: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      difficulty: 'MEDIUM',
      questionType: 'SINGLE_CHOICE',
      marks: 4,
      negativeMarks: 1,
      explanation: '',
      sourceReference: ''
    });
    setShowQuestionModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      examId: q.exam ? q.exam.id : '',
      subjectId: q.subject ? q.subject.id : '',
      topicId: q.topic ? q.topic.id : '',
      subtopicId: q.subTopic ? q.subTopic.id : '',
      examYear: q.examYear || 2024,
      questionText: q.questionText || '',
      imageUrl: q.imageUrl || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctOption: q.correctOption || 'A',
      difficulty: q.difficulty || 'MEDIUM',
      questionType: q.questionType || 'SINGLE_CHOICE',
      marks: q.marks || 4,
      negativeMarks: q.negativeMarks || 1,
      explanation: q.explanation || '',
      sourceReference: q.sourceReference || ''
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await apiService.adminUpdateQuestion(editingQuestion.id, formData);
        showNotif('Question updated successfully!');
      } else {
        await apiService.adminCreateQuestion(formData);
        showNotif('New PYQ Question created & published to students!');
      }
      setShowQuestionModal(false);
      fetchQuestions();
    } catch (err) {
      alert('Error saving question: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this question?')) return;
    try {
      await apiService.adminDeleteQuestion(id);
      showNotif('Question deactivated.');
      fetchQuestions();
    } catch (err) {
      alert('Error deactivating question: ' + err.message);
    }
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    try {
      await apiService.adminCreateTopic(topicForm);
      showNotif('Topic added to Exam Syllabus!');
      setShowTopicModal(false);
      const tData = await apiService.getTopics();
      setTopics(tData || []);
    } catch (err) {
      alert('Error saving topic: ' + err.message);
    }
  };

  const showNotif = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">

      {/* Action Notification Banner */}
      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-cyan-400" size={22} />
            Question Repository & Exam Syllabus Manager
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Add, edit, filter, and manage verified JEE Main, JEE Advanced, and State Exam PYQs & Topic Weightages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowTopicModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <Layers size={16} /> Add Topic / Weightage
          </button>

          <button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
          >
            <Plus size={16} /> Add Verified Question (PYQ)
          </button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Filter size={14} /> Question Filters
          </span>
          <span className="text-xs text-cyan-400 font-semibold">{questions.length} Questions Found</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Exam Filter */}
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Exams</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Topic Filter */}
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Topics</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          {/* Year Filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Search questions by text or reference (e.g. Kinematics, det(A)...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5"
          >
            <Search size={14} /> Search
          </button>
        </form>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading questions dataset...</div>
      ) : questions.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No questions found matching your filter criteria. Click "Add Verified Question" to create one.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID / Exam</th>
                  <th className="px-4 py-3">Subject & Topic</th>
                  <th className="px-4 py-3">Question Preview</th>
                  <th className="px-4 py-3">Correct Opt</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {questions.map(q => (
                  <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      <div className="font-bold text-white">#{q.id} • {q.exam?.name}</div>
                      <div className="text-slate-400 text-[11px]">{q.examYear} | {q.questionType}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-cyan-400">{q.subject?.name}</div>
                      <div className="text-slate-400 text-[11px]">{q.topic?.name || 'General Topic'}</div>
                    </td>

                    <td className="px-4 py-3 max-w-md">
                      <div className="line-clamp-2 text-slate-200">{q.questionText}</div>
                      {q.sourceReference && <div className="text-[11px] text-slate-400 mt-0.5">Ref: {q.sourceReference}</div>}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded border border-emerald-500/20">
                        {q.correctOption}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        q.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        q.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(q)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition-all"
                          title="Edit Question"
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-lg transition-all"
                          title="Deactivate Question"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingQuestion ? `Edit Question #${editingQuestion.id}` : 'Add New Verified Entrance PYQ'}
              </h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              
              {/* Row 1: Exam, Subject, Topic, Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Exam *</label>
                  <select
                    required
                    value={formData.examId}
                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subject *</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Topic</label>
                  <select
                    value={formData.topicId}
                    onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="">Select Topic</option>
                    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Exam Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.examYear}
                    onChange={(e) => setFormData({ ...formData, examYear: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Question Text *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter complete question statement..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={formData.optionA}
                    onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={formData.optionB}
                    onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Option C *</label>
                  <input
                    type="text"
                    required
                    value={formData.optionC}
                    onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Option D *</label>
                  <input
                    type="text"
                    required
                    value={formData.optionD}
                    onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Row: Correct Option, Difficulty, Type, Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Correct Option *</label>
                  <select
                    value={formData.correctOption}
                    onChange={(e) => setFormData({ ...formData, correctOption: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Question Type</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  >
                    <option value="SINGLE_CHOICE">Single Choice (MCQ)</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="NUMERICAL">Numerical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Marks (+ / -)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="Marks"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                    <input
                      type="number"
                      placeholder="Neg"
                      value={formData.negativeMarks}
                      onChange={(e) => setFormData({ ...formData, negativeMarks: e.target.value })}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Source Ref & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Source / Official Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. JEE Main 2024 Shift 1 Jan 27 Q12"
                    value={formData.sourceReference}
                    onChange={(e) => setFormData({ ...formData, sourceReference: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Optional Diagram Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Step-by-Step Explanation / Solution</label>
                <textarea
                  rows={3}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Detailed solution steps..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold px-6 py-2 rounded-xl shadow-lg"
                >
                  {editingQuestion ? 'Update Question' : 'Publish Question'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TOPIC MODAL */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Topic / Syllabus Weightage</h3>
              <button onClick={() => setShowTopicModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subject *</label>
                <select
                  required
                  value={topicForm.subjectId}
                  onChange={(e) => setTopicForm({ ...topicForm, subjectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topic Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrostatics & Capacitance"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Weightage % (Optional)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 8.5"
                  value={topicForm.weightagePercentage}
                  onChange={(e) => setTopicForm({ ...topicForm, weightagePercentage: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Source Reference</label>
                <input
                  type="text"
                  placeholder="NCERT Physics Class 12 Ch 1"
                  value={topicForm.sourceReference}
                  onChange={(e) => setTopicForm({ ...topicForm, sourceReference: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="bg-slate-800 text-slate-300 font-bold px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
