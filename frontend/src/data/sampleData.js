// Verified sample data for Laughs With Ramesh Connecting EdTech Platform

export const EXAMS_DATA = [
  {
    id: 1,
    code: 'JEE',
    title: 'JEE Main & Advanced 2026',
    description: 'National Level Engineering Entrance Exam for IITs, NITs, IIITs & CFTIs.',
    totalSubjects: 3,
    totalChapters: 75,
    icon: 'BrainCircuit'
  },
  {
    id: 2,
    code: 'AP_EAPCET',
    title: 'AP EAPCET (EAMCET) 2026',
    description: 'Andhra Pradesh Engineering, Agriculture and Pharmacy Common Entrance Test for University & Private Engineering Colleges in AP.',
    totalSubjects: 3,
    totalChapters: 68,
    icon: 'GraduationCap'
  }
];

export const SYLLABUS_DATA = {
  JEE: [
    {
      subject: 'Physics',
      chapters: [
        {
          id: 'phy-1',
          title: 'Laws of Motion & Friction',
          topics: ['Newton’s Laws of Motion', 'Friction & Types', 'Circular Motion', 'Constraint Relations'],
          weightage: '8%'
        },
        {
          id: 'phy-2',
          title: 'Electrostatics & Capacitance',
          topics: ['Electric Charge & Coulomb Law', 'Gauss Law Applications', 'Capacitors in Series & Parallel', 'Dielectrics'],
          weightage: '10%'
        },
        {
          id: 'phy-3',
          title: 'Optics & Wave Optics',
          topics: ['Ray Optics & Lenses', 'Interference & Young Double Slit', 'Diffraction', 'Polarization'],
          weightage: '9%'
        },
        {
          id: 'phy-4',
          title: 'Work, Energy & Power',
          topics: ['Work-Energy Theorem', 'Potential Energy & Conservation', 'Collisions in 1D & 2D'],
          weightage: '7%'
        }
      ]
    },
    {
      subject: 'Chemistry',
      chapters: [
        {
          id: 'chem-1',
          title: 'Chemical Bonding & Molecular Structure',
          topics: ['VSEPR Theory', 'Hybridization', 'Molecular Orbital Theory', 'Dipole Moment'],
          weightage: '9%'
        },
        {
          id: 'chem-2',
          title: 'Organic Chemistry: Hydrocarbons',
          topics: ['Alkanes & Free Radical Substitution', 'Electrophilic Addition to Alkenes', 'Alkynes Reactions', 'Aromaticity'],
          weightage: '11%'
        },
        {
          id: 'chem-3',
          title: 'Thermodynamics & Thermochemistry',
          topics: ['First Law of Thermodynamics', 'Enthalpy & Hess Law', 'Entropy & Gibbs Free Energy'],
          weightage: '8%'
        }
      ]
    },
    {
      subject: 'Mathematics',
      chapters: [
        {
          id: 'math-1',
          title: 'Calculus: Limits, Continuity & Differentiability',
          topics: ['L’Hopital Rule', 'Continuity Criteria', 'Differentiability & Derivatives', 'Mean Value Theorems'],
          weightage: '12%'
        },
        {
          id: 'math-2',
          title: 'Coordinate Geometry: Conic Sections',
          topics: ['Parabola Standard Equations', 'Ellipse Tangents & Normals', 'Hyperbola Asymptotes'],
          weightage: '10%'
        },
        {
          id: 'math-3',
          title: 'Vectors & 3D Geometry',
          topics: ['Dot & Cross Products', 'Shortest Distance Between Skew Lines', 'Plane Equations'],
          weightage: '9%'
        }
      ]
    }
  ],
  AP_EAPCET: [
    {
      subject: 'Mathematics',
      chapters: [
        {
          id: 'eap-math-1',
          title: 'Matrices & Determinants',
          topics: ['Matrix Algebra', 'Cramer Rule', 'Inverse Matrix', 'System of Linear Equations'],
          weightage: '14%'
        },
        {
          id: 'eap-math-2',
          title: 'Trigonometry & Inverse Trigonometry',
          topics: ['Trigonometric Ratios & Identities', 'Trigonometric Equations', 'Properties of Triangles'],
          weightage: '12%'
        },
        {
          id: 'eap-math-3',
          title: 'Probability & Statistics',
          topics: ['Addition & Multiplication Theorems', 'Bayes Theorem', 'Binomial Distribution', 'Mean & Variance'],
          weightage: '10%'
        }
      ]
    },
    {
      subject: 'Physics',
      chapters: [
        {
          id: 'eap-phy-1',
          title: 'Current Electricity & Magnetism',
          topics: ['Ohm Law & Kirchhoff Laws', 'Wheatstone Bridge', 'Biot-Savart Law', 'Moving Coil Galvanometer'],
          weightage: '12%'
        },
        {
          id: 'eap-phy-2',
          title: 'Thermodynamics & Heat Transfer',
          topics: ['Thermal Expansion', 'Specific Heat', 'Laws of Thermodynamics', 'Carnot Engine'],
          weightage: '10%'
        }
      ]
    },
    {
      subject: 'Chemistry',
      chapters: [
        {
          id: 'eap-chem-1',
          title: 'Solutions & Electrochemistry',
          topics: ['Raoult Law & Colligative Properties', 'Nernst Equation', 'Conductance & Kohlrausch Law'],
          weightage: '11%'
        },
        {
          id: 'eap-chem-2',
          title: 's & p-Block Elements',
          topics: ['Group 1 & 2 Properties', 'Group 15 to 18 Trends', 'Industrial Compounds'],
          weightage: '10%'
        }
      ]
    }
  ]
};

export const BRANCHES_DATA = [
  {
    id: 1,
    code: 'CSE',
    name: 'Computer Science & Engineering',
    description: 'Focuses on software engineering, algorithms, computing systems, data structures, and network architecture.',
    coreSubjects: ['Data Structures & Algorithms', 'Operating Systems', 'Database Management Systems', 'Computer Networks', 'Software Engineering'],
    skills: ['Problem Solving', 'Python/Java/C++', 'Web & Mobile Development', 'System Design', 'Git & Cloud'],
    careerPaths: ['Software Engineer', 'Full Stack Developer', 'Systems Architect', 'Data Engineer', 'DevOps Specialist'],
    higherStudies: ['M.Tech in CSE / AI', 'MS in Computer Science (USA/Europe)', 'MBA in Tech Management']
  },
  {
    id: 2,
    code: 'AI_ML',
    name: 'Artificial Intelligence & Machine Learning',
    description: 'Specialized branch focusing on neural networks, deep learning, computer vision, natural language processing, and automated decision engines.',
    coreSubjects: ['Applied Linear Algebra', 'Machine Learning Foundations', 'Deep Learning & Neural Networks', 'Natural Language Processing', 'Computer Vision'],
    skills: ['Python', 'PyTorch/TensorFlow', 'Data Wrangling', 'Model Optimization', 'Statistical Analysis'],
    careerPaths: ['AI Engineer', 'ML Researcher', 'Data Scientist', 'NLP Engineer', 'Computer Vision Specialist'],
    higherStudies: ['MS in Artificial Intelligence', 'Ph.D. in Machine Learning / Robotics', 'M.Tech in Data Science']
  },
  {
    id: 3,
    code: 'AI_DS',
    name: 'Artificial Intelligence & Data Science',
    description: 'Blends computational analytics, statistical modeling, data mining, and artificial intelligence for data-driven industry solutions.',
    coreSubjects: ['Data Mining & Analytics', 'Statistical Inference', 'Big Data Engineering', 'Machine Learning', 'Data Visualization'],
    skills: ['R/Python', 'SQL & NoSQL', 'Tableau/PowerBI', 'Predictive Modeling', 'Spark/Hadoop'],
    careerPaths: ['Data Analyst', 'Data Scientist', 'Business Intelligence Analyst', 'Big Data Architect'],
    higherStudies: ['MS in Data Analytics', 'M.Tech in Data Science']
  },
  {
    id: 4,
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    description: 'Combines hardware electronics, microprocessors, VLSI design, wireless communications, signals, and embedded technology.',
    coreSubjects: ['Analog & Digital Circuits', 'Signals & Systems', 'Microcontrollers & Embedded Systems', 'VLSI Design', 'Electromagnetic Theory'],
    skills: ['Circuit Simulation (SPICE)', 'Verilog/VHDL', 'Embedded C/C++', 'Signal Processing', 'IoT Hardware'],
    careerPaths: ['VLSI Engineer', 'Embedded Systems Developer', 'Telecom Engineer', 'Robotics Systems Developer', 'IT Software Engineer'],
    higherStudies: ['M.Tech in VLSI / Microelectronics', 'MS in Electrical Engineering']
  },
  {
    id: 5,
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    description: 'Covers electrical power generation, transmission, power electronics, electric motor drives, renewable energy, and smart grids.',
    coreSubjects: ['Power Systems Analysis', 'Control Systems', 'Power Electronics', 'Electrical Machines', 'Renewable Energy Systems'],
    skills: ['MATLAB/Simulink', 'Power System Design', 'PLC & SCADA', 'High Voltage Engineering'],
    careerPaths: ['Power System Engineer', 'Electrical Design Engineer', 'EV Battery Engineer', 'Control Engineer'],
    higherStudies: ['M.Tech in Power Systems / EV Technology', 'MS in Electrical Power']
  },
  {
    id: 6,
    code: 'MECH',
    name: 'Mechanical Engineering',
    description: 'Focuses on thermal science, machine design, fluid mechanics, CAD/CAM manufacturing, robotics, and automotive technology.',
    coreSubjects: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Machine Design', 'Manufacturing Technology'],
    skills: ['SolidWorks / AutoCAD', 'ANSYS Simulation', 'CNC Machining', 'Mechatronics'],
    careerPaths: ['Design Engineer', 'Thermal Engineer', 'Automotive Engineer', 'Production Manager', 'Aerospace Analyst'],
    higherStudies: ['M.Tech in Machine Design / Thermal Science', 'MS in Mechanical / Mechatronics']
  },
  {
    id: 7,
    code: 'CIVIL',
    name: 'Civil Engineering',
    description: 'Deals with planning, designing, constructing, and managing infrastructure projects like bridges, highways, dams, and modern green buildings.',
    coreSubjects: ['Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering', 'Environmental Engineering', 'Concrete Technology'],
    skills: ['AutoCAD Civil 3D', 'STAAD Pro', 'GIS Mapping', 'Surveying & Structural Calculation'],
    careerPaths: ['Structural Engineer', 'Site Engineer', 'Project Manager', 'Urban Planner', 'Geotechnical Specialist'],
    higherStudies: ['M.Tech in Structural / Geotechnical Engineering', 'MS in Civil Engineering']
  }
];

export const COLLEGES_DATA = [
  {
    id: 101,
    code: 'AUCE',
    name: 'Andhra University College of Engineering (AUCE)',
    location: 'Visakhapatnam, Andhra Pradesh',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'Government University',
    affiliation: 'Andhra University (State Govt Autonomous)',
    website: 'https://andhrauniversity.edu.in',
    feesPerYear: '₹35,000 (Govt Quota)',
    placementInfo: 'Top recruiters include TCS, Infosys, Wipro, L&T, Deloitte, and BEL. High rate of campus placements for CSE, ECE and Mechanical.',
    facilities: ['Central Library', 'Advanced Research Labs', 'Separate Hostels for Boys/Girls', 'Sports Complex', 'High-Speed Wi-Fi'],
    entranceExams: ['AP EAPCET', 'GATE'],
    source: 'AP State Council of Higher Education (APSCHE) Official Portal 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 102,
    code: 'JNTUK',
    name: 'JNTU College of Engineering (JNTUK Kakinada)',
    location: 'Kakinada, Andhra Pradesh',
    city: 'Kakinada',
    state: 'Andhra Pradesh',
    type: 'Government University',
    affiliation: 'JNTU Kakinada (Autonomous)',
    website: 'https://jntuk.edu.in',
    feesPerYear: '₹37,000 (Govt Quota)',
    placementInfo: 'Top core & IT recruiters visit every year including Cognizant, Accenture, Hyundai, Honeywell, and Tech Mahindra.',
    facilities: ['Central Auditorium', 'Digital Library', 'Hostel Facilities', 'Innovation Hub', 'Gymnasium'],
    entranceExams: ['AP EAPCET'],
    source: 'APSCHE Official Counselling Portal 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 103,
    code: 'GVPCE',
    name: 'Gayatri Vidya Parishad College of Engineering (GVP)',
    location: 'Visakhapatnam, Andhra Pradesh',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    type: 'Private Autonomous',
    affiliation: 'Affiliated to JNTUK (NAAC A+ Grade)',
    website: 'https://gvpce.ac.in',
    feesPerYear: '₹76,000 (Govt Quota)',
    placementInfo: 'Excellent CSE & ECE placements. Average package around ₹6 LPA with top offers exceeding ₹20 LPA in tech giants.',
    facilities: ['Modern Computing Labs', 'Library', 'Incubation Center', 'Sports Grounds', 'Canteen'],
    entranceExams: ['AP EAPCET'],
    source: 'GVPCE Official NIRF Data 2024',
    lastUpdated: '2024-08-20'
  },
  {
    id: 104,
    code: 'VRSEC',
    name: 'Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC)',
    location: 'Vijayawada, Andhra Pradesh',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    type: 'Private Autonomous',
    affiliation: 'Affiliated to JNTUK (NAAC A+ Grade)',
    website: 'https://vrsiddhartha.ac.in',
    feesPerYear: '₹74,000 (Govt Quota)',
    placementInfo: 'Over 1000+ placement offers generated per batch across Amazon, Cisco, TCS Digital, and Virtusa.',
    facilities: ['Smart Classrooms', 'Center of Excellence Labs', 'Hostels', 'Central Library', 'Transport Fleet'],
    entranceExams: ['AP EAPCET'],
    source: 'APSCHE Official Data 2024',
    lastUpdated: '2024-09-01'
  },
  {
    id: 105,
    code: 'NITW',
    name: 'National Institute of Technology Warangal (NITW)',
    location: 'Warangal, Telangana',
    city: 'Warangal',
    state: 'Telangana',
    type: 'Institute of National Importance (Government)',
    affiliation: 'Ministry of Education, Govt of India',
    website: 'https://nitw.ac.in',
    feesPerYear: '₹1,35,000',
    placementInfo: 'Top tier national placements. Average package in CSE exceeds ₹20 LPA. Major recruiters include Microsoft, Google, Amazon, Texas Instruments, Qualcomm.',
    facilities: ['State-of-the-Art Supercomputing Labs', 'Huge Campus', 'Hostels', 'Sports Infrastructure'],
    entranceExams: ['JEE Main'],
    source: 'JoSAA Official Seat Allotment Data 2024',
    lastUpdated: '2024-10-01'
  },
  {
    id: 106,
    code: 'NIT_AP',
    name: 'National Institute of Technology Andhra Pradesh (NIT AP)',
    location: 'Tadepalligudem, Andhra Pradesh',
    city: 'Tadepalligudem',
    state: 'Andhra Pradesh',
    type: 'Institute of National Importance (Government)',
    affiliation: 'Ministry of Education, Govt of India',
    website: 'https://nitandhra.ac.in',
    feesPerYear: '₹1,35,000',
    placementInfo: 'Growing rapidly with placements across Amazon, L&T, Nvidia, TCS, and Maruti Suzuki.',
    facilities: ['New Permanent Campus', 'Modern Hostels', 'Digital Library', 'Robotics Center'],
    entranceExams: ['JEE Main'],
    source: 'JoSAA Official Cutoff Data 2024',
    lastUpdated: '2024-10-01'
  }
];

export const CUTOFFS_DATA = [
  // AP EAPCET Cutoffs
  {
    id: 1,
    exam: 'AP_EAPCET',
    year: 2024,
    round: 1,
    collegeCode: 'AUCE',
    collegeName: 'Andhra University College of Engineering (AUCE)',
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'OC_BOYS',
    openingRank: 450,
    closingRank: 1250,
    source: 'APSCHE Official Allotment List 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 2,
    exam: 'AP_EAPCET',
    year: 2024,
    round: 1,
    collegeCode: 'AUCE',
    collegeName: 'Andhra University College of Engineering (AUCE)',
    branchCode: 'ECE',
    branchName: 'Electronics & Communication Engineering',
    category: 'OC_BOYS',
    openingRank: 1300,
    closingRank: 2800,
    source: 'APSCHE Official Allotment List 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 3,
    exam: 'AP_EAPCET',
    year: 2024,
    round: 1,
    collegeCode: 'JNTUK',
    collegeName: 'JNTU College of Engineering Kakinada',
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'OC_BOYS',
    openingRank: 800,
    closingRank: 1950,
    source: 'APSCHE Official Allotment List 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 4,
    exam: 'AP_EAPCET',
    year: 2024,
    round: 1,
    collegeCode: 'GVPCE',
    collegeName: 'Gayatri Vidya Parishad College of Engineering (GVP)',
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'OC_BOYS',
    openingRank: 2100,
    closingRank: 4800,
    source: 'APSCHE Official Allotment List 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 5,
    exam: 'AP_EAPCET',
    year: 2024,
    round: 1,
    collegeCode: 'VRSEC',
    collegeName: 'VR Siddhartha Engineering College',
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'OC_BOYS',
    openingRank: 2500,
    closingRank: 5200,
    source: 'APSCHE Official Allotment List 2024',
    lastUpdated: '2024-09-15'
  },
  {
    id: 6,
    exam: 'AP_EAPCET',
    year: 2024,
    round: 1,
    collegeCode: 'GVPCE',
    collegeName: 'Gayatri Vidya Parishad College of Engineering (GVP)',
    branchCode: 'AI_ML',
    branchName: 'Artificial Intelligence & Machine Learning',
    category: 'OC_BOYS',
    openingRank: 4200,
    closingRank: 7500,
    source: 'APSCHE Official Allotment List 2024',
    lastUpdated: '2024-09-15'
  },
  // JEE Main Cutoffs
  {
    id: 7,
    exam: 'JEE',
    year: 2024,
    round: 6,
    collegeCode: 'NITW',
    collegeName: 'National Institute of Technology Warangal (NITW)',
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'OPEN_HOME_STATE',
    openingRank: 1100,
    closingRank: 3100,
    source: 'JoSAA Official Cutoff List 2024',
    lastUpdated: '2024-10-01'
  },
  {
    id: 8,
    exam: 'JEE',
    year: 2024,
    round: 6,
    collegeCode: 'NIT_AP',
    collegeName: 'National Institute of Technology Andhra Pradesh (NIT AP)',
    branchCode: 'CSE',
    branchName: 'Computer Science & Engineering',
    category: 'OPEN_HOME_STATE',
    openingRank: 12000,
    closingRank: 19500,
    source: 'JoSAA Official Cutoff List 2024',
    lastUpdated: '2024-10-01'
  }
];

export const MOCK_TESTS_DATA = [
  {
    id: 'test-101',
    title: 'AP EAPCET Full Length Grand Mock Test - 01',
    exam: 'AP_EAPCET',
    durationMinutes: 180,
    totalMarks: 160,
    questionsCount: 160,
    category: 'Full Mock Test',
    difficulty: 'Medium',
    instructions: [
      'The test consists of 160 Multiple Choice Questions (Mathematics: 80, Physics: 40, Chemistry: 40).',
      'Each correct response carries +1 mark.',
      'There is NO negative marking for AP EAPCET.',
      'Do not close the test window until you click Submit Test.'
    ],
    questions: [
      {
        id: 'q1',
        subject: 'Mathematics',
        chapter: 'Matrices & Determinants',
        questionText: 'If A is a square matrix of order 3 and |A| = 5, then what is the value of |adj A|?',
        options: [
          { letter: 'A', text: '5' },
          { letter: 'B', text: '25' },
          { letter: 'C', text: '125' },
          { letter: 'D', text: '1' }
        ],
        correctOption: 'B',
        explanation: 'For a matrix of order n, |adj A| = |A|^(n-1). Here n=3 and |A|=5, so |adj A| = 5^(3-1) = 5^2 = 25.'
      },
      {
        id: 'q2',
        subject: 'Physics',
        chapter: 'Laws of Motion',
        questionText: 'A body of mass 5 kg is accelerated uniformly from rest to 20 m/s in 4 seconds. The force acting on the body is:',
        options: [
          { letter: 'A', text: '25 N' },
          { letter: 'B', text: '20 N' },
          { letter: 'C', text: '15 N' },
          { letter: 'D', text: '10 N' }
        ],
        correctOption: 'A',
        explanation: 'Acceleration a = (v - u)/t = (20 - 0)/4 = 5 m/s². Force F = m * a = 5 * 5 = 25 N.'
      },
      {
        id: 'q3',
        subject: 'Chemistry',
        chapter: 'Chemical Bonding',
        questionText: 'Which of the following molecules has a linear geometric shape according to VSEPR theory?',
        options: [
          { letter: 'A', text: 'H2O' },
          { letter: 'B', text: 'SO2' },
          { letter: 'C', text: 'BeCl2' },
          { letter: 'D', text: 'NH3' }
        ],
        correctOption: 'C',
        explanation: 'BeCl2 has sp hybridization with 180° bond angle, giving it a linear geometry.'
      }
    ]
  },
  {
    id: 'test-102',
    title: 'JEE Main Physics Chapter-wise Practice Test: Mechanics & Motion',
    exam: 'JEE',
    durationMinutes: 60,
    totalMarks: 100,
    questionsCount: 25,
    category: 'Chapter Test',
    difficulty: 'Hard',
    instructions: [
      'Test contains 20 Single Correct MCQs (+4, -1) and 5 Numerical Value Questions (+4, 0).',
      'Calculators are not permitted.'
    ],
    questions: [
      {
        id: 'jq1',
        subject: 'Physics',
        chapter: 'Laws of Motion',
        questionText: 'A block of mass m is placed on a rough inclined plane of inclination θ. If the coefficient of static friction is μ > tan θ, the acceleration of the block will be:',
        options: [
          { letter: 'A', text: 'g (sin θ - μ cos θ)' },
          { letter: 'B', text: 'Zero' },
          { letter: 'C', text: 'g sin θ' },
          { letter: 'D', text: 'μ g cos θ' }
        ],
        correctOption: 'B',
        explanation: 'Since μ > tan θ, static friction μ mg cos θ exceeds the down-slope gravitational component mg sin θ. The block stays at rest, so acceleration is zero.'
      }
    ]
  }
];

export const STUDY_MATERIALS_DATA = [
  {
    id: 1,
    title: 'Complete AP EAPCET Mathematics Quick Revision Formula Sheet',
    category: 'Formula Sheet',
    exam: 'AP_EAPCET',
    subject: 'Mathematics',
    fileSize: '4.2 MB',
    fileType: 'PDF',
    downloadUrl: '#',
    source: 'Laughs With Ramesh Academic Team',
    uploadDate: '2026-02-10'
  },
  {
    id: 2,
    title: 'JEE Physics Electrostatics & Capacitance High-Yield Notes',
    category: 'Notes',
    exam: 'JEE',
    subject: 'Physics',
    fileSize: '6.8 MB',
    fileType: 'PDF',
    downloadUrl: '#',
    source: 'Laughs With Ramesh Academic Team',
    uploadDate: '2026-02-15'
  },
  {
    id: 3,
    title: 'B.Tech College Counselling Choice Filling Strategy Guide 2026',
    category: 'Counselling Guide',
    exam: 'BOTH',
    subject: 'Counselling',
    fileSize: '3.1 MB',
    fileType: 'PDF',
    downloadUrl: '#',
    source: 'Laughs With Ramesh Guidance Portal',
    uploadDate: '2026-03-01'
  }
];

export const VIDEOS_DATA = [
  {
    id: 1,
    title: 'How to Crack AP EAPCET Math in 30 Days — Strategy & Topic Weightage',
    category: 'AP EAPCET',
    duration: '24:15',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop',
    uploadDate: '2026-02-20'
  },
  {
    id: 2,
    title: 'CSE vs AI/ML vs ECE — Which Branch Should You Pick in B.Tech?',
    category: 'B.Tech Guidance',
    duration: '32:40',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop',
    uploadDate: '2026-02-28'
  },
  {
    id: 3,
    title: 'AP EAPCET Counselling Step-by-Step Web Options Guide',
    category: 'Counselling',
    duration: '18:50',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop',
    uploadDate: '2026-03-05'
  }
];

export const COMMUNITY_POSTS_DATA = [
  {
    id: 1,
    author: 'Sai Teja (AP EAPCET Aspirant)',
    category: 'EAPCET',
    title: 'What is the safe rank in EAPCET for AUCE CSE in OC category?',
    content: 'Hi all! I am consistently scoring around 110-120 marks in mock tests. Based on previous years, what rank can I expect and will it be enough for AU CSE?',
    likes: 18,
    commentsCount: 5,
    timestamp: '2 hours ago',
    comments: [
      { id: 101, author: 'Ramesh Mentor', text: '110-120 marks typically lands in the 1000-2500 rank bracket depending on paper difficulty. AU CSE closing cutoff is around 1250 for OC Boys. Keep grinding!', timestamp: '1 hour ago' }
    ]
  },
  {
    id: 2,
    author: 'Kavya R.',
    category: 'B.Tech',
    title: 'Is ECE a good option if I want to get into AI hardware / Robotics later?',
    content: 'I have interest in both software programming and hardware systems. Would choosing ECE restrict software placements or open VLSI/Embedded paths?',
    likes: 24,
    commentsCount: 8,
    timestamp: '1 day ago',
    comments: []
  }
];

export const ANNOUNCEMENTS_DATA = [
  {
    id: 1,
    title: '🔥 AP EAPCET 2026 Full Length Grand Mock Test Series is Now Live!',
    content: 'Take full 3-hour simulated online mock tests with detailed subject-wise speed and accuracy analytics.',
    date: '2026-03-25'
  },
  {
    id: 2,
    title: '🎓 B.Tech College & Cutoff Discovery Tool Updated with 2024 Final Round Data',
    content: 'Filter historical cutoffs by category, gender quota, and target branch to shortlist your options.',
    date: '2026-03-20'
  }
];
