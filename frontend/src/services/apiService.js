import { COLLEGES_DATA, CUTOFFS_DATA, BRANCHES_DATA, MOCK_TESTS_DATA, STUDY_MATERIALS_DATA, VIDEOS_DATA, COMMUNITY_POSTS_DATA } from '../data/sampleData';
import { API_BASE_URL, buildApiUrl } from '../config/appConfig';

export { API_BASE_URL, buildApiUrl };

// Centralized API fetch helper that guarantees normalized dynamic backend URL routing
export const apiFetch = (endpoint, options = {}) => {
  return fetch(buildApiUrl(endpoint), options);
};

export const getAuthHeader = () => {
  try {
    const saved = localStorage.getItem('lwr_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.token) {
        return { 'Authorization': `Bearer ${parsed.token}` };
      }
    }
    const savedAdmin = localStorage.getItem('lwr_admin_user');
    if (savedAdmin) {
      const parsedAdmin = JSON.parse(savedAdmin);
      if (parsedAdmin && parsedAdmin.token) {
        return { 'Authorization': `Bearer ${parsedAdmin.token}` };
      }
    }
  } catch (e) {}
  return {};
};

// Helper to attempt backend fetch or fallback to local sample data
const safeFetch = async (url, options = {}, fallbackData = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {})
    };
    const res = await apiFetch(url, { ...options, headers });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    // Return local fallback data gracefully when backend server is offline
    return fallbackData;
  }
};

export const apiService = {
  // College Discovery / Predictor
  predictColleges: async ({ exam, rank, category, branch, location }) => {
    const mockMatches = CUTOFFS_DATA.filter((record) => {
      const examMatch = !exam || record.exam === exam;
      const rankMatch = rank ? rank <= record.closingRank * 1.3 : true;
      const branchMatch = !branch || record.branchCode === branch;
      return examMatch && rankMatch && branchMatch;
    }).map((match) => {
      const collegeDetail = COLLEGES_DATA.find((c) => c.code === match.collegeCode) || {};
      let status = 'Historical Match';
      if (rank <= match.closingRank * 0.8) {
        status = 'Above Previous Closing Rank';
      } else if (rank <= match.closingRank) {
        status = 'Within Previous Cutoff Range';
      } else {
        status = 'Below Previous Closing Rank';
      }

      return {
        ...match,
        collegeDetail,
        matchStatus: status
      };
    });

    return safeFetch('/college-predictor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam, rank, category, branch, location })
    }, mockMatches);
  },

  // Rank Estimation Engine
  estimateRank: async ({ exam, score }) => {
    let minRank = 100;
    let maxRank = 500;
    
    if (exam === 'AP_EAPCET') {
      // AP EAPCET out of 160 marks
      if (score >= 140) { minRank = 50; maxRank = 300; }
      else if (score >= 120) { minRank = 301; maxRank = 1200; }
      else if (score >= 100) { minRank = 1201; maxRank = 3500; }
      else if (score >= 80) { minRank = 3501; maxRank = 9000; }
      else if (score >= 60) { minRank = 9001; maxRank = 22000; }
      else { minRank = 22001; maxRank = 60000; }
    } else {
      // JEE Main out of 300 marks
      if (score >= 250) { minRank = 100; maxRank = 1200; }
      else if (score >= 200) { minRank = 1201; maxRank = 5000; }
      else if (score >= 160) { minRank = 5001; maxRank = 18000; }
      else if (score >= 120) { minRank = 18001; maxRank = 45000; }
      else { minRank = 45001; maxRank = 120000; }
    }

    const result = {
      exam,
      score,
      estimatedMinRank: minRank,
      estimatedMaxRank: maxRank,
      disclaimer: 'Estimated Rank — Not Official. Based on previous year score vs rank trends.'
    };

    return safeFetch('/rank-estimator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exam, score })
    }, result);
  },

  // LWR AI Assistant Chat Service
  sendAiQuery: async (prompt, history = [], studentContext = {}) => {
    const fallbackPayload = {
      response: "Hi! 👋 Welcome to Laughs With Ramesh Connecting. I'm your LWR AI study and B.Tech guidance assistant. Are you studying Intermediate 1st year or 2nd year? And are you preparing for AP EAPCET, TG EAPCET, JEE Main, or another entrance exam?",
      provider: "LWR_KNOWLEDGE_ENGINE",
      suggestedChips: ["I'm in Intermediate 1st year", "I'm in Intermediate 2nd year", "AP EAPCET", "JEE Main"],
      studentContext: studentContext
    };

    return safeFetch('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history, studentContext })
    }, fallbackPayload);
  },

  // Exam Content System APIs
  getExams: async (type = '') => {
    const url = type ? `/exams?type=${encodeURIComponent(type)}` : '/exams';
    return safeFetch(url, { method: 'GET' }, []);
  },

  getStates: async () => {
    return safeFetch('/states', { method: 'GET' }, []);
  },

  getSubjects: async () => {
    return safeFetch('/subjects', { method: 'GET' }, []);
  },

  getTopics: async (subjectId = '', examId = '') => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (examId) params.append('examId', examId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetch(`/topics${query}`, { method: 'GET' }, []);
  },

  getSubTopics: async (topicId = '') => {
    const query = topicId ? `?topicId=${topicId}` : '';
    return safeFetch(`/subtopics${query}`, { method: 'GET' }, []);
  },

  getExamYears: async (examId) => {
    return safeFetch(`/exams/${examId}/years`, { method: 'GET' }, []);
  },

  getQuestions: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetch(`/questions${query}`, { method: 'GET' }, []);
  },

  getQuestionById: async (id) => {
    return safeFetch(`/questions/${id}`, { method: 'GET' }, null);
  },

  // Admin CRUD APIs
  adminCreateQuestion: async (questionData) => {
    return safeFetch('/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    }, null);
  },

  adminUpdateQuestion: async (id, questionData) => {
    return safeFetch(`/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    }, null);
  },

  adminDeleteQuestion: async (id) => {
    return safeFetch(`/admin/questions/${id}`, {
      method: 'DELETE'
    }, null);
  },

  adminCreateTopic: async (topicData) => {
    return safeFetch('/admin/topics', {
      method: 'POST',
      body: JSON.stringify(topicData)
    }, null);
  },

  adminUpdateTopic: async (id, topicData) => {
    return safeFetch(`/admin/topics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(topicData)
    }, null);
  },

  adminDeleteTopic: async (id) => {
    return safeFetch(`/admin/topics/${id}`, {
      method: 'DELETE'
    }, null);
  },

  adminCreateExam: async (examData) => {
    return safeFetch('/admin/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    }, null);
  },

  // --- College Discovery & Predictor APIs ---
  getCollegesList: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetch(`/colleges${query}`, { method: 'GET' }, COLLEGES_DATA);
  },

  getCollegeDetails: async (id) => {
    return safeFetch(`/colleges/${id}`, { method: 'GET' }, null);
  },

  getCollegeBranches: async (id) => {
    return safeFetch(`/colleges/${id}/branches`, { method: 'GET' }, []);
  },

  getCollegeCutoffs: async (id) => {
    return safeFetch(`/colleges/${id}/cutoffs`, { method: 'GET' }, []);
  },

  getBranchesList: async () => {
    return safeFetch('/branches', { method: 'GET' }, BRANCHES_DATA);
  },

  getCutoffsList: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return safeFetch(`/cutoffs${query}`, { method: 'GET' }, CUTOFFS_DATA);
  },

  predictCollegesList: async (examId, rank, category = '', branchId = '', homeState = '', gender = '', page = 0, size = 12) => {
    const params = new URLSearchParams({ examId, rank });
    if (category) params.append('category', category);
    if (branchId) params.append('branchId', branchId);
    if (homeState) params.append('homeState', homeState);
    if (gender) params.append('gender', gender);
    if (page != null) params.append('page', page);
    if (size != null) params.append('size', size);
    return safeFetch(`/cutoffs/predict?${params.toString()}`, { method: 'GET' }, []);
  },

  // --- Admin College & Cutoff Manager APIs ---
  adminGetColleges: async () => {
    return safeFetch('/admin/colleges', { method: 'GET' }, []);
  },

  adminCreateCollege: async (data) => {
    return safeFetch('/admin/colleges', {
      method: 'POST',
      body: JSON.stringify(data)
    }, null);
  },

  adminUpdateCollege: async (id, data) => {
    return safeFetch(`/admin/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, null);
  },

  adminDeleteCollege: async (id) => {
    return safeFetch(`/admin/colleges/${id}`, {
      method: 'DELETE'
    }, null);
  },

  adminCreateBranch: async (data) => {
    return safeFetch('/admin/branches', {
      method: 'POST',
      body: JSON.stringify(data)
    }, null);
  },

  adminMapCollegeExam: async (collegeId, examId, notes = '') => {
    const query = notes ? `?notes=${encodeURIComponent(notes)}` : '';
    return safeFetch(`/admin/colleges/${collegeId}/map-exam/${examId}${query}`, {
      method: 'POST'
    }, null);
  },

  adminMapCollegeBranch: async (collegeId, branchId, intake = 60) => {
    const query = intake ? `?intake=${intake}` : '';
    return safeFetch(`/admin/colleges/${collegeId}/map-branch/${branchId}${query}`, {
      method: 'POST'
    }, null);
  },

  adminCreateCutoff: async (data) => {
    return safeFetch('/admin/cutoffs', {
      method: 'POST',
      body: JSON.stringify(data)
    }, null);
  },

  adminUpdateCutoff: async (id, data) => {
    return safeFetch(`/admin/cutoffs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, null);
  },

  adminDeleteCutoff: async (id) => {
    return safeFetch(`/admin/cutoffs/${id}`, {
      method: 'DELETE'
    }, null);
  },

  // Mock Tests & CBT Engine
  getMockTests: async (examId = null, testType = 'ALL') => {
    let url = '/mock-tests?';
    if (examId) url += `examId=${examId}&`;
    if (testType && testType !== 'ALL') url += `testType=${testType}&`;
    return safeFetch(url, {}, []);
  },

  getMockTestById: async (id) => {
    return safeFetch(`/mock-tests/${id}`, {}, null);
  },

  getMyAttempts: async () => {
    return safeFetch('/mock-tests/my-attempts', {}, []);
  },

  generateMockTest: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/mock-tests/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  generateGrandTest: async (examId, title = '') => {
    const headers = {
      ...getAuthHeader()
    };
    const query = title ? `&title=${encodeURIComponent(title)}` : '';
    const res = await apiFetch(`/api/mock-tests/grand-test/generate?examId=${examId}${query}`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  startTestAttempt: async (testId) => {
    const headers = {
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/mock-tests/${testId}/start`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  submitTestAttempt: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/mock-tests/submit', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getTestResult: async (attemptId) => {
    const headers = {
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/mock-tests/attempts/${attemptId}/result`, {
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  // Student Guidance Requests & Appointments
  submitGuidanceRequest: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/guidance-requests', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getMyGuidanceRequests: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/guidance-requests/my-requests', { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  getMyGuidanceRequestById: async (id) => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch(`/api/guidance-requests/my-requests/${id}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // Admin Guidance Request Management
  getAdminGuidanceRequests: async (status = '') => {
    const headers = { ...getAuthHeader() };
    const url = status && status !== 'ALL' ? `/api/admin/guidance-requests?status=${status}` : '/api/admin/guidance-requests';
    const res = await apiFetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  getAdminGuidanceStats: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/admin/guidance-requests/stats', { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  updateGuidanceStatus: async (id, status, adminResponse = '') => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/admin/guidance-requests/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status, adminResponse })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  scheduleAppointment: async (requestId, payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/admin/guidance-requests/${requestId}/schedule`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  rescheduleAppointment: async (appointmentId, payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/admin/guidance-requests/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  cancelAppointment: async (appointmentId, reason = '') => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/admin/guidance-requests/appointments/${appointmentId}/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  // Notifications
  getNotifications: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/notifications', { headers });
    if (!res.ok) return [];
    return await res.json();
  },

  getUnreadNotificationCount: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/notifications/unread-count', { headers });
    if (!res.ok) return { unreadCount: 0 };
    return await res.json();
  },

  markNotificationRead: async (id) => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers
    });
    return res.ok;
  },

  markAllNotificationsRead: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/notifications/read-all', {
      method: 'POST',
      headers
    });
    return res.ok;
  },

  // College Suggestions & Data Ingestion
  getCollegeSuggestions: async (query) => {
    const res = await apiFetch(`/api/colleges/suggestions?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  },

  getDataIngestionStatus: async () => {
    const res = await apiFetch('/api/data-ingestion/status');
    if (!res.ok) return null;
    return await res.json();
  },

  onlineCollegeSearch: async (query) => {
    try {
      const res = await apiFetch(`/api/colleges/online-search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return {
        query,
        count: 0,
        results: [],
        searchAvailable: false,
        message: 'Online verified registry lookup is temporarily unavailable.'
      };
    }
  },

  adminDataImportPreview: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/admin/data-import/preview', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  adminDataImportCommit: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/admin/data-import/commit', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  retryAppointmentEmail: async (appointmentId) => {
    const headers = {
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/admin/guidance-requests/appointments/${appointmentId}/retry-email`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  // Beta Feedback Workflow
  submitBetaFeedback: async (feedbackData) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/feedback', {
      method: 'POST',
      headers,
      body: JSON.stringify(feedbackData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getMyBetaFeedback: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/feedback/my', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getAdminBetaFeedback: async (status = '', category = '', severity = '') => {
    const headers = { ...getAuthHeader() };
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (severity) params.append('severity', severity);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/api/admin/feedback${query}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getAdminBetaFeedbackStats: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/admin/feedback/stats', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  updateAdminBetaFeedback: async (id, payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  deleteAdminBetaFeedback: async (id) => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch(`/api/admin/feedback/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  // Beta Access & Registration Controls
  getBetaStatus: async () => {
    try {
      const res = await apiFetch('/api/beta/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return {
        betaActive: true,
        registrationLimit: 100,
        currentBetaCount: 50,
        spotsRemaining: 50,
        registrationsOpen: true,
        registrationsPaused: false,
        betaNoticeMessage: 'Welcome to the LWR Connecting Beta for Intermediate Class 11 and Class 12 students. Limited to 100 students.',
        targetAudienceNotice: 'Class 11 & Class 12 Intermediate (MPC) Engineering Aspirants',
        guardianConsentRequired: true
      };
    }
  },

  getAdminBetaConfig: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/config', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  updateAdminBetaConfig: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/config', {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getAdminBetaAnalytics: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/analytics', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  requestDataDeletion: async (reason = 'Student or Guardian request') => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/request-deletion', {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  // Beta Launch Operations & Diagnostics
  getLaunchOverview: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/launch-overview', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getConfigurationHealth: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/health', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  testSmtpConnection: async (recipient) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/health/test-smtp', {
      method: 'POST',
      headers,
      body: JSON.stringify({ recipient })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  testGeminiConnection: async () => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/health/test-gemini', {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  createDatabaseBackup: async () => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/backup/create', {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  listDatabaseBackups: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/backup/list', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  verifyDatabaseBackup: async (fileName) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/backup/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify({ fileName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getPendingDeletionRequests: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/deletion-requests', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  processAccountDeletion: async (userId, notes = 'Approved and expunged') => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/beta/admin/deletion-requests/${userId}/process`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  // Wave 1 Invitation Management
  validateInviteCode: async (code, email = '') => {
    const url = `/api/beta/validate-invite?code=${encodeURIComponent(code)}${email ? `&email=${encodeURIComponent(email)}` : ''}`;
    const res = await apiFetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { valid: false, reason: err.error || err.message || `HTTP ${res.status}` };
    }
    return await res.json();
  },

  listInvitations: async (status = 'ALL') => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch(`/api/beta/admin/invitations?status=${encodeURIComponent(status)}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  getInvitationStats: async () => {
    const headers = { ...getAuthHeader() };
    const res = await apiFetch('/api/beta/admin/invitations/stats', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  createInvitation: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/invitations/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  batchGenerateInvitations: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch('/api/beta/admin/invitations/batch', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  },

  revokeInvitation: async (id) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    };
    const res = await apiFetch(`/api/beta/admin/invitations/${id}/revoke`, {
      method: 'POST',
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `HTTP ${res.status}`);
    }
    return await res.json();
  }
};

