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
  }
};
