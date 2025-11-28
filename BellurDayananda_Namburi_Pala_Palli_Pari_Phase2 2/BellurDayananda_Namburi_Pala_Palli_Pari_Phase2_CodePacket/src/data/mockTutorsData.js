/**
 * Mock Tutors Data
 * 20 mock tutors with profile images, subjects, stats, and expertise
 */

const tutors = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    avatar: 'https://i.pravatar.cc/150?img=1',
    subjects: ['Mathematics', 'Statistics', 'Calculus'],
    specialization: 'Advanced Mathematics',
    rating: 4.9,
    totalSessions: 342,
    studentsHelped: 156,
    gpa: 4.0,
    hourlyRate: 45,
    responseTime: '< 1 hour',
    bio: 'PhD in Mathematics with 8 years of teaching experience. Passionate about making complex concepts simple.',
    availability: 'Mon-Fri, 9 AM - 6 PM',
    languages: ['English', 'Mandarin'],
    verified: true,
    badges: ['Top Rated', 'Expert', 'Quick Response'],
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=12',
    subjects: ['Physics', 'Chemistry', 'Engineering'],
    specialization: 'Physical Sciences',
    rating: 4.8,
    totalSessions: 287,
    studentsHelped: 134,
    gpa: 3.95,
    hourlyRate: 40,
    responseTime: '< 2 hours',
    bio: 'Engineering graduate specializing in physics and chemistry. Love helping students understand real-world applications.',
    availability: 'Mon-Sat, 10 AM - 8 PM',
    languages: ['English', 'Spanish'],
    verified: true,
    badges: ['Top Rated', 'Patient Teacher'],
  },
  {
    id: '3',
    name: 'Emily Watson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    subjects: ['Computer Science', 'Programming', 'Web Development'],
    specialization: 'Software Development',
    rating: 4.9,
    totalSessions: 421,
    studentsHelped: 198,
    gpa: 3.98,
    hourlyRate: 50,
    responseTime: '< 30 min',
    bio: 'Full-stack developer and CS educator. Specializing in Python, JavaScript, and web technologies.',
    availability: 'Flexible',
    languages: ['English'],
    verified: true,
    badges: ['Top Rated', 'Expert', 'Quick Response', 'Student Favorite'],
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://i.pravatar.cc/150?img=13',
    subjects: ['Biology', 'Chemistry', 'Organic Chemistry'],
    specialization: 'Life Sciences',
    rating: 4.7,
    totalSessions: 198,
    studentsHelped: 89,
    gpa: 3.92,
    hourlyRate: 38,
    responseTime: '< 3 hours',
    bio: 'Medical student with extensive biology and chemistry tutoring experience.',
    availability: 'Evenings & Weekends',
    languages: ['English', 'Korean'],
    verified: true,
    badges: ['Rising Star', 'Patient Teacher'],
  },
  {
    id: '5',
    name: 'Priya Patel',
    avatar: 'https://i.pravatar.cc/150?img=9',
    subjects: ['Economics', 'Business', 'Statistics'],
    specialization: 'Business & Economics',
    rating: 4.8,
    totalSessions: 256,
    studentsHelped: 112,
    gpa: 3.94,
    hourlyRate: 42,
    responseTime: '< 1 hour',
    bio: 'MBA graduate with focus on economics and quantitative analysis. Making business concepts accessible.',
    availability: 'Mon-Fri, 2 PM - 10 PM',
    languages: ['English', 'Hindi', 'Gujarati'],
    verified: true,
    badges: ['Top Rated', 'Expert'],
  },
  {
    id: '6',
    name: 'James Anderson',
    avatar: 'https://i.pravatar.cc/150?img=14',
    subjects: ['English', 'Literature', 'Writing'],
    specialization: 'English & Humanities',
    rating: 4.9,
    totalSessions: 312,
    studentsHelped: 167,
    gpa: 3.97,
    hourlyRate: 35,
    responseTime: '< 2 hours',
    bio: 'Published author and English teacher. Helping students find their voice through writing.',
    availability: 'Mon-Thu, 9 AM - 5 PM',
    languages: ['English'],
    verified: true,
    badges: ['Top Rated', 'Student Favorite', 'Patient Teacher'],
  },
  {
    id: '7',
    name: 'Sofia Martinez',
    avatar: 'https://i.pravatar.cc/150?img=10',
    subjects: ['Spanish', 'French', 'Languages'],
    specialization: 'Foreign Languages',
    rating: 4.8,
    totalSessions: 389,
    studentsHelped: 178,
    gpa: 3.89,
    hourlyRate: 32,
    responseTime: '< 1 hour',
    bio: 'Polyglot and language educator. Native Spanish speaker with fluency in 5 languages.',
    availability: 'Flexible',
    languages: ['English', 'Spanish', 'French', 'Portuguese'],
    verified: true,
    badges: ['Top Rated', 'Quick Response'],
  },
  {
    id: '8',
    name: 'Alexander Ivanov',
    avatar: 'https://i.pravatar.cc/150?img=15',
    subjects: ['Mathematics', 'Computer Science', 'Algorithms'],
    specialization: 'Computational Mathematics',
    rating: 4.9,
    totalSessions: 267,
    studentsHelped: 124,
    gpa: 4.0,
    hourlyRate: 48,
    responseTime: '< 2 hours',
    bio: 'PhD candidate in Computer Science. Specializing in algorithms and mathematical modeling.',
    availability: 'Tue-Sat, 1 PM - 9 PM',
    languages: ['English', 'Russian'],
    verified: true,
    badges: ['Expert', 'Top Rated'],
  },
  {
    id: '9',
    name: 'Olivia Thompson',
    avatar: 'https://i.pravatar.cc/150?img=20',
    subjects: ['History', 'Social Studies', 'Political Science'],
    specialization: 'Social Sciences',
    rating: 4.7,
    totalSessions: 234,
    studentsHelped: 98,
    gpa: 3.91,
    hourlyRate: 33,
    responseTime: '< 3 hours',
    bio: 'History professor bringing the past to life. Engaging storyteller and passionate educator.',
    availability: 'Mon-Wed-Fri, 10 AM - 6 PM',
    languages: ['English'],
    verified: true,
    badges: ['Patient Teacher', 'Rising Star'],
  },
  {
    id: '10',
    name: 'Raj Sharma',
    avatar: 'https://i.pravatar.cc/150?img=33',
    subjects: ['Data Science', 'Machine Learning', 'Python'],
    specialization: 'AI & Data Science',
    rating: 4.9,
    totalSessions: 178,
    studentsHelped: 87,
    gpa: 3.96,
    hourlyRate: 55,
    responseTime: '< 1 hour',
    bio: 'Data scientist and ML engineer. Teaching cutting-edge AI technologies and data analysis.',
    availability: 'Evenings & Weekends',
    languages: ['English', 'Hindi'],
    verified: true,
    badges: ['Expert', 'Top Rated', 'Quick Response'],
  },
  {
    id: '11',
    name: 'Isabella Garcia',
    avatar: 'https://i.pravatar.cc/150?img=24',
    subjects: ['Art', 'Design', 'Art History'],
    specialization: 'Visual Arts',
    rating: 4.8,
    totalSessions: 156,
    studentsHelped: 73,
    gpa: 3.88,
    hourlyRate: 30,
    responseTime: '< 4 hours',
    bio: 'Professional artist and art educator. Helping students discover their creative potential.',
    availability: 'Flexible',
    languages: ['English', 'Spanish', 'Italian'],
    verified: true,
    badges: ['Creative', 'Patient Teacher'],
  },
  {
    id: '12',
    name: 'Thomas Brown',
    avatar: 'https://i.pravatar.cc/150?img=51',
    subjects: ['Accounting', 'Finance', 'Business Math'],
    specialization: 'Finance & Accounting',
    rating: 4.7,
    totalSessions: 212,
    studentsHelped: 95,
    gpa: 3.93,
    hourlyRate: 40,
    responseTime: '< 2 hours',
    bio: 'CPA with 10 years experience. Making accounting and finance understandable and practical.',
    availability: 'Mon-Fri, 6 PM - 10 PM',
    languages: ['English'],
    verified: true,
    badges: ['Top Rated', 'Professional'],
  },
  {
    id: '13',
    name: 'Yuki Tanaka',
    avatar: 'https://i.pravatar.cc/150?img=28',
    subjects: ['Japanese', 'Asian Studies', 'Culture'],
    specialization: 'Japanese Language & Culture',
    rating: 4.9,
    totalSessions: 298,
    studentsHelped: 134,
    gpa: 3.90,
    hourlyRate: 35,
    responseTime: '< 1 hour',
    bio: 'Native Japanese speaker and cultural ambassador. Teaching language through cultural immersion.',
    availability: 'Mon-Sat, 8 AM - 4 PM',
    languages: ['English', 'Japanese'],
    verified: true,
    badges: ['Top Rated', 'Cultural Expert', 'Quick Response'],
  },
  {
    id: '14',
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?img=52',
    subjects: ['Music Theory', 'Piano', 'Music History'],
    specialization: 'Music Education',
    rating: 4.8,
    totalSessions: 187,
    studentsHelped: 82,
    gpa: 3.87,
    hourlyRate: 38,
    responseTime: '< 3 hours',
    bio: 'Professional musician and music educator. Bringing the joy of music to every student.',
    availability: 'Afternoons & Evenings',
    languages: ['English'],
    verified: true,
    badges: ['Creative', 'Patient Teacher'],
  },
  {
    id: '15',
    name: 'Amelia Wilson',
    avatar: 'https://i.pravatar.cc/150?img=16',
    subjects: ['Psychology', 'Sociology', 'Research Methods'],
    specialization: 'Behavioral Sciences',
    rating: 4.8,
    totalSessions: 223,
    studentsHelped: 101,
    gpa: 3.95,
    hourlyRate: 37,
    responseTime: '< 2 hours',
    bio: 'Clinical psychologist and researcher. Making psychology accessible and relatable.',
    availability: 'Mon-Fri, 9 AM - 5 PM',
    languages: ['English'],
    verified: true,
    badges: ['Top Rated', 'Empathetic'],
  },
  {
    id: '16',
    name: 'Carlos Mendoza',
    avatar: 'https://i.pravatar.cc/150?img=59',
    subjects: ['Environmental Science', 'Geography', 'Earth Science'],
    specialization: 'Earth Sciences',
    rating: 4.7,
    totalSessions: 145,
    studentsHelped: 67,
    gpa: 3.89,
    hourlyRate: 34,
    responseTime: '< 3 hours',
    bio: 'Environmental scientist passionate about sustainability and earth sciences education.',
    availability: 'Weekends & Evenings',
    languages: ['English', 'Spanish'],
    verified: true,
    badges: ['Eco-Warrior', 'Rising Star'],
  },
  {
    id: '17',
    name: 'Zara Ahmed',
    avatar: 'https://i.pravatar.cc/150?img=44',
    subjects: ['Philosophy', 'Logic', 'Ethics'],
    specialization: 'Philosophy & Critical Thinking',
    rating: 4.9,
    totalSessions: 176,
    studentsHelped: 89,
    gpa: 3.98,
    hourlyRate: 36,
    responseTime: '< 2 hours',
    bio: 'Philosophy PhD teaching critical thinking and logical reasoning. Questions are my specialty.',
    availability: 'Tue-Thu, 11 AM - 7 PM',
    languages: ['English', 'Arabic', 'Urdu'],
    verified: true,
    badges: ['Top Rated', 'Deep Thinker'],
  },
  {
    id: '18',
    name: 'Liam O\'Connor',
    avatar: 'https://i.pravatar.cc/150?img=56',
    subjects: ['Electrical Engineering', 'Electronics', 'Circuit Design'],
    specialization: 'Electrical Engineering',
    rating: 4.8,
    totalSessions: 201,
    studentsHelped: 94,
    gpa: 3.94,
    hourlyRate: 44,
    responseTime: '< 2 hours',
    bio: 'Electronics engineer with hands-on teaching approach. Making circuits and systems understandable.',
    availability: 'Mon-Wed-Fri, 3 PM - 9 PM',
    languages: ['English'],
    verified: true,
    badges: ['Top Rated', 'Hands-On'],
  },
  {
    id: '19',
    name: 'Aisha Osman',
    avatar: 'https://i.pravatar.cc/150?img=38',
    subjects: ['Arabic', 'Middle Eastern Studies', 'Islamic Studies'],
    specialization: 'Arabic Language & Culture',
    rating: 4.9,
    totalSessions: 267,
    studentsHelped: 122,
    gpa: 3.92,
    hourlyRate: 33,
    responseTime: '< 1 hour',
    bio: 'Native Arabic speaker and cultural educator. Teaching language through cultural understanding.',
    availability: 'Flexible',
    languages: ['English', 'Arabic', 'French'],
    verified: true,
    badges: ['Top Rated', 'Cultural Expert', 'Quick Response'],
  },
  {
    id: '20',
    name: 'Nathan Park',
    avatar: 'https://i.pravatar.cc/150?img=68',
    subjects: ['Robotics', 'Mechanical Engineering', 'CAD'],
    specialization: 'Robotics & Mechatronics',
    rating: 4.8,
    totalSessions: 134,
    studentsHelped: 61,
    gpa: 3.96,
    hourlyRate: 46,
    responseTime: '< 3 hours',
    bio: 'Robotics engineer and maker. Teaching the future of automation and mechanical design.',
    availability: 'Weekends & Evenings',
    languages: ['English', 'Korean'],
    verified: true,
    badges: ['Innovative', 'Tech Expert'],
  },
];

/**
 * Get AI-recommended tutors based on student interests
 * @param {Array<string>} studentInterests - Array of subjects the student is interested in
 * @param {number} limit - Number of tutors to return (default: 5)
 * @returns {Array} - Array of recommended tutors
 */
export const getRecommendedTutors = (studentInterests = [], limit = 5) => {
  // Score tutors based on subject match and rating
  const scoredTutors = tutors.map(tutor => {
    let score = tutor.rating * 10; // Base score from rating
    
    // Add points for matching subjects
    const matchingSubjects = tutor.subjects.filter(subject =>
      studentInterests.some(interest =>
        subject.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(subject.toLowerCase())
      )
    );
    
    score += matchingSubjects.length * 20;
    
    // Bonus for verified and badges
    if (tutor.verified) score += 5;
    score += tutor.badges.length * 2;
    
    // Factor in experience
    score += (tutor.totalSessions / 100) * 3;
    
    return { ...tutor, matchScore: score, matchingSubjects };
  });
  
  // Sort by match score and return top tutors
  return scoredTutors
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

/**
 * Filter tutors by subject
 * @param {string} subject - Subject to filter by
 * @returns {Array} - Array of tutors teaching the subject
 */
export const getTutorsBySubject = (subject) => {
  return tutors.filter(tutor =>
    tutor.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))
  );
};

/**
 * Get tutor by ID
 * @param {string} id - Tutor ID
 * @returns {Object|null} - Tutor object or null if not found
 */
export const getTutorById = (id) => {
  return tutors.find(tutor => tutor.id === id) || null;
};

/**
 * Get all unique subjects from all tutors
 * @returns {Array<string>} - Array of unique subjects
 */
export const getAllSubjects = () => {
  const subjects = new Set();
  tutors.forEach(tutor => {
    tutor.subjects.forEach(subject => subjects.add(subject));
  });
  return Array.from(subjects).sort();
};

export default tutors;
