import { COLLEGES_DATA, CUTOFFS_DATA, BRANCHES_DATA, MOCK_TESTS_DATA, STUDY_MATERIALS_DATA, VIDEOS_DATA, COMMUNITY_POSTS_DATA } from '../data/sampleData';

const BASE_URL = '/api';

const getAuthHeader = () => {
  try {
    const saved = localStorage.getItem('lwr_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.token) {
        return { 'Authorization': `Bearer ${parsed.token}` };
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
    const res = await fetch(`${BASE_URL}${url}`, { ...options, headers });
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
  sendAiQuery: async (prompt, history = []) => {
    const lower = prompt.toLowerCase();
    let responseText = '';

    if (lower.includes('cse') || lower.includes('ece') || lower.includes('branch')) {
      responseText = `**CSE vs ECE Insight:**\n- **Computer Science & Engineering (CSE)** focuses on software engineering, algorithms, system design, and AI. High industry demand across top tech companies.\n- **Electronics & Communication (ECE)** bridges hardware circuits, microprocessors, signal processing, and communication networks. It offers flexibility into both core VLSI/Embedded systems and software IT roles.\n\n*Based on verified platform data. Source: LWR Branch Repository 2026.*`;
    } else if (lower.includes('eapcet') || lower.includes('prepare') || lower.includes('math')) {
      responseText = `**AP EAPCET Preparation Roadmap:**\n1. **Focus on Mathematics (80 Marks)**: High-weightage topics include Matrices (14%), Trigonometry (12%), and Vectors & 3D.\n2. **Physics & Chemistry (40 Marks each)**: Practice speed-solving formulas. AP EAPCET has no negative marking, so accuracy and speed are key.\n3. Take full 3-hour grand mock tests twice a week on our platform.`;
    } else if (lower.includes('college') || lower.includes('au') || lower.includes('jntu')) {
      responseText = `**College Insight:**\n- **Andhra University College of Engineering (AUCE)**: Premier Govt State University in Visakhapatnam. 2024 OC CSE closing rank was ~1250.\n- **JNTU Kakinada**: Renowned Govt University in Kakinada. 2024 OC CSE closing rank was ~1950.\n\n*Note: Historical cutoff data should be used for reference. Please check official APSCHE counselling notifications for final admissions.*`;
    } else {
      responseText = `Hello! I am **LWR AI**, your dedicated B.Tech & Entrance Exam Assistant.\n\nI can help you with:\n- High-weightage topics in JEE & AP EAPCET\n- Comparing branches (CSE, AI/ML, ECE, Mechanical)\n- Finding colleges matching your target rank\n- Strategy to improve your mock test scores!\n\nWhat would you like to explore today?`;
    }

    const payload = { response: responseText };

    return safeFetch('/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history })
    }, payload);
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

  predictCollegesList: async (examId, rank, category = '', branchId = '') => {
    const params = new URLSearchParams({ examId, rank });
    if (category) params.append('category', category);
    if (branchId) params.append('branchId', branchId);
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
  }
};
