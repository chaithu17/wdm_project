import { useState, useMemo } from 'react';
import { Star, Search, X, Calendar, Clock } from 'lucide-react';

// Mock data
const mockUser = {
  subjects: ['Mathematics', 'Physics']
};

const tutors = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    specialization: 'Mathematics Expert',
    subjects: ['Calculus', 'Algebra', 'Statistics'],
    rating: 4.9,
    hourlyRate: 45,
    totalSessions: 234,
    studentsHelped: 89,
    verified: true,
    gpa: 3.9
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=2',
    specialization: 'Physics & Engineering',
    subjects: ['Physics', 'Mechanics', 'Thermodynamics'],
    rating: 4.8,
    hourlyRate: 50,
    totalSessions: 189,
    studentsHelped: 67,
    verified: true,
    gpa: 4.0
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    avatar: 'https://i.pravatar.cc/150?img=3',
    specialization: 'Computer Science',
    subjects: ['Programming', 'Data Structures', 'Algorithms'],
    rating: 4.9,
    hourlyRate: 55,
    totalSessions: 312,
    studentsHelped: 102,
    verified: true,
    gpa: 3.95
  },
  {
    id: 4,
    name: 'David Park',
    avatar: 'https://i.pravatar.cc/150?img=4',
    specialization: 'Chemistry Specialist',
    subjects: ['Organic Chemistry', 'Biochemistry', 'General Chemistry'],
    rating: 4.7,
    hourlyRate: 48,
    totalSessions: 156,
    studentsHelped: 54,
    verified: true,
    gpa: 3.85
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    specialization: 'English & Literature',
    subjects: ['Writing', 'Literature', 'Grammar'],
    rating: 4.9,
    hourlyRate: 40,
    totalSessions: 278,
    studentsHelped: 95,
    verified: true,
    gpa: 3.92
  },
  {
    id: 6,
    name: 'James Wilson',
    avatar: 'https://i.pravatar.cc/150?img=6',
    specialization: 'Biology Expert',
    subjects: ['Molecular Biology', 'Genetics', 'Anatomy'],
    rating: 4.8,
    hourlyRate: 52,
    totalSessions: 201,
    studentsHelped: 73,
    verified: true,
    gpa: 3.88
  },
  {
    id: 7,
    name: 'Maria Garcia',
    avatar: 'https://i.pravatar.cc/150?img=9',
    specialization: 'Spanish Language',
    subjects: ['Spanish', 'Latin American Literature', 'Conversation'],
    rating: 4.9,
    hourlyRate: 38,
    totalSessions: 345,
    studentsHelped: 112,
    verified: true,
    gpa: 3.94
  },
  {
    id: 8,
    name: 'Alex Kumar',
    avatar: 'https://i.pravatar.cc/150?img=12',
    specialization: 'Data Science',
    subjects: ['Machine Learning', 'Python', 'Statistics'],
    rating: 4.8,
    hourlyRate: 65,
    totalSessions: 167,
    studentsHelped: 61,
    verified: true,
    gpa: 3.96
  },
  {
    id: 9,
    name: 'Rachel Green',
    avatar: 'https://i.pravatar.cc/150?img=10',
    specialization: 'History Buff',
    subjects: ['US History', 'World History', 'European History'],
    rating: 4.7,
    hourlyRate: 42,
    totalSessions: 189,
    studentsHelped: 67,
    verified: false,
    gpa: 3.81
  },
  {
    id: 10,
    name: 'Tom Mitchell',
    avatar: 'https://i.pravatar.cc/150?img=13',
    specialization: 'Economics & Business',
    subjects: ['Microeconomics', 'Macroeconomics', 'Business Studies'],
    rating: 4.6,
    hourlyRate: 47,
    totalSessions: 143,
    studentsHelped: 52,
    verified: true,
    gpa: 3.79
  },
  {
    id: 11,
    name: 'Nina Patel',
    avatar: 'https://i.pravatar.cc/150?img=20',
    specialization: 'Psychology',
    subjects: ['Cognitive Psychology', 'Social Psychology', 'Research Methods'],
    rating: 4.9,
    hourlyRate: 44,
    totalSessions: 221,
    studentsHelped: 81,
    verified: true,
    gpa: 3.91
  },
  {
    id: 12,
    name: 'Kevin Lee',
    avatar: 'https://i.pravatar.cc/150?img=14',
    specialization: 'Web Development',
    subjects: ['HTML/CSS', 'JavaScript', 'React'],
    rating: 4.8,
    hourlyRate: 58,
    totalSessions: 198,
    studentsHelped: 69,
    verified: true,
    gpa: 3.87
  },
  {
    id: 13,
    name: 'Sophia Martinez',
    avatar: 'https://i.pravatar.cc/150?img=24',
    specialization: 'Art & Design',
    subjects: ['Digital Art', 'Graphic Design', 'Art History'],
    rating: 4.7,
    hourlyRate: 41,
    totalSessions: 176,
    studentsHelped: 63,
    verified: false,
    gpa: 3.76
  },
  {
    id: 14,
    name: 'Ryan Thompson',
    avatar: 'https://i.pravatar.cc/150?img=15',
    specialization: 'Mechanical Engineering',
    subjects: ['Statics', 'Dynamics', 'Fluid Mechanics'],
    rating: 4.8,
    hourlyRate: 53,
    totalSessions: 167,
    studentsHelped: 58,
    verified: true,
    gpa: 3.93
  },
  {
    id: 15,
    name: 'Olivia Brown',
    avatar: 'https://i.pravatar.cc/150?img=25',
    specialization: 'Music Theory',
    subjects: ['Music Theory', 'Composition', 'Piano'],
    rating: 4.9,
    hourlyRate: 39,
    totalSessions: 234,
    studentsHelped: 87,
    verified: true,
    gpa: 3.84
  },
  {
    id: 16,
    name: 'Daniel Kim',
    avatar: 'https://i.pravatar.cc/150?img=16',
    specialization: 'Electrical Engineering',
    subjects: ['Circuits', 'Signals', 'Electronics'],
    rating: 4.7,
    hourlyRate: 51,
    totalSessions: 154,
    studentsHelped: 56,
    verified: true,
    gpa: 3.89
  },
  {
    id: 17,
    name: 'Isabella Santos',
    avatar: 'https://i.pravatar.cc/150?img=26',
    specialization: 'French Language',
    subjects: ['French', 'French Literature', 'Conversation'],
    rating: 4.8,
    hourlyRate: 37,
    totalSessions: 267,
    studentsHelped: 94,
    verified: true,
    gpa: 3.82
  },
  {
    id: 18,
    name: 'Chris Evans',
    avatar: 'https://i.pravatar.cc/150?img=17',
    specialization: 'Political Science',
    subjects: ['American Politics', 'International Relations', 'Political Theory'],
    rating: 4.6,
    hourlyRate: 43,
    totalSessions: 132,
    studentsHelped: 49,
    verified: false,
    gpa: 3.77
  },
  {
    id: 19,
    name: 'Aisha Mohammed',
    avatar: 'https://i.pravatar.cc/150?img=27',
    specialization: 'Environmental Science',
    subjects: ['Ecology', 'Climate Science', 'Sustainability'],
    rating: 4.9,
    hourlyRate: 46,
    totalSessions: 189,
    studentsHelped: 71,
    verified: true,
    gpa: 3.91
  },
  {
    id: 20,
    name: 'Marcus Johnson',
    avatar: 'https://i.pravatar.cc/150?img=18',
    specialization: 'Philosophy',
    subjects: ['Ethics', 'Logic', 'Modern Philosophy'],
    rating: 4.8,
    hourlyRate: 40,
    totalSessions: 156,
    studentsHelped: 59,
    verified: true,
    gpa: 3.86
  },
  {
    id: 21,
    name: 'Hannah White',
    avatar: 'https://i.pravatar.cc/150?img=28',
    specialization: 'Accounting',
    subjects: ['Financial Accounting', 'Managerial Accounting', 'Taxation'],
    rating: 4.7,
    hourlyRate: 49,
    totalSessions: 178,
    studentsHelped: 64,
    verified: true,
    gpa: 3.83
  },
  {
    id: 22,
    name: 'Jason Wu',
    avatar: 'https://i.pravatar.cc/150?img=19',
    specialization: 'Mandarin Chinese',
    subjects: ['Mandarin', 'Chinese Culture', 'HSK Preparation'],
    rating: 4.9,
    hourlyRate: 42,
    totalSessions: 298,
    studentsHelped: 103,
    verified: true,
    gpa: 3.88
  },
  {
    id: 23,
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=29',
    specialization: 'Calculus Specialist',
    subjects: ['Calculus I', 'Calculus II', 'Calculus III'],
    rating: 4.9,
    hourlyRate: 47,
    totalSessions: 267,
    studentsHelped: 91,
    verified: true,
    gpa: 3.97
  },
  {
    id: 24,
    name: 'Tyler Brooks',
    avatar: 'https://i.pravatar.cc/150?img=21',
    specialization: 'Sports Science',
    subjects: ['Kinesiology', 'Exercise Physiology', 'Sports Nutrition'],
    rating: 4.6,
    hourlyRate: 44,
    totalSessions: 145,
    studentsHelped: 51,
    verified: false,
    gpa: 3.74
  },
  {
    id: 25,
    name: 'Zara Ali',
    avatar: 'https://i.pravatar.cc/150?img=30',
    specialization: 'Sociology',
    subjects: ['Social Theory', 'Research Methods', 'Urban Sociology'],
    rating: 4.8,
    hourlyRate: 41,
    totalSessions: 187,
    studentsHelped: 68,
    verified: true,
    gpa: 3.85
  },
  {
    id: 26,
    name: 'Lucas Schmidt',
    avatar: 'https://i.pravatar.cc/150?img=22',
    specialization: 'German Language',
    subjects: ['German', 'German Literature', 'Grammar'],
    rating: 4.7,
    hourlyRate: 38,
    totalSessions: 213,
    studentsHelped: 77,
    verified: true,
    gpa: 3.81
  },
  {
    id: 27,
    name: 'Megan Foster',
    avatar: 'https://i.pravatar.cc/150?img=31',
    specialization: 'Nursing',
    subjects: ['Anatomy & Physiology', 'Pharmacology', 'Patient Care'],
    rating: 4.9,
    hourlyRate: 52,
    totalSessions: 234,
    studentsHelped: 86,
    verified: true,
    gpa: 3.92
  },
  {
    id: 28,
    name: 'Omar Hassan',
    avatar: 'https://i.pravatar.cc/150?img=23',
    specialization: 'Civil Engineering',
    subjects: ['Structural Analysis', 'Geotechnical Engineering', 'Construction Management'],
    rating: 4.8,
    hourlyRate: 54,
    totalSessions: 169,
    studentsHelped: 62,
    verified: true,
    gpa: 3.89
  },
  {
    id: 29,
    name: 'Chloe Anderson',
    avatar: 'https://i.pravatar.cc/150?img=32',
    specialization: 'Marketing',
    subjects: ['Digital Marketing', 'Brand Strategy', 'Consumer Behavior'],
    rating: 4.7,
    hourlyRate: 46,
    totalSessions: 156,
    studentsHelped: 57,
    verified: false,
    gpa: 3.78
  },
  {
    id: 30,
    name: 'Ethan Davis',
    avatar: 'https://i.pravatar.cc/150?img=33',
    specialization: 'Linear Algebra',
    subjects: ['Linear Algebra', 'Differential Equations', 'Abstract Algebra'],
    rating: 4.8,
    hourlyRate: 48,
    totalSessions: 201,
    studentsHelped: 74,
    verified: true,
    gpa: 3.94
  },
  {
    id: 31,
    name: 'Yuki Tanaka',
    avatar: 'https://i.pravatar.cc/150?img=34',
    specialization: 'Japanese Language',
    subjects: ['Japanese', 'JLPT Preparation', 'Japanese Culture'],
    rating: 4.9,
    hourlyRate: 43,
    totalSessions: 289,
    studentsHelped: 99,
    verified: true,
    gpa: 3.87
  },
  {
    id: 32,
    name: 'Brandon Carter',
    avatar: 'https://i.pravatar.cc/150?img=35',
    specialization: 'Finance',
    subjects: ['Corporate Finance', 'Investment Analysis', 'Financial Markets'],
    rating: 4.7,
    hourlyRate: 56,
    totalSessions: 178,
    studentsHelped: 65,
    verified: true,
    gpa: 3.86
  },
  {
    id: 33,
    name: 'Amira Osman',
    avatar: 'https://i.pravatar.cc/150?img=36',
    specialization: 'Public Health',
    subjects: ['Epidemiology', 'Health Policy', 'Biostatistics'],
    rating: 4.8,
    hourlyRate: 50,
    totalSessions: 192,
    studentsHelped: 71,
    verified: true,
    gpa: 3.91
  },
  {
    id: 34,
    name: 'Connor Riley',
    avatar: 'https://i.pravatar.cc/150?img=37',
    specialization: 'Game Development',
    subjects: ['Unity', 'C#', 'Game Design'],
    rating: 4.8,
    hourlyRate: 60,
    totalSessions: 167,
    studentsHelped: 59,
    verified: true,
    gpa: 3.82
  },
  {
    id: 35,
    name: 'Fatima Khan',
    avatar: 'https://i.pravatar.cc/150?img=38',
    specialization: 'Arabic Language',
    subjects: ['Arabic', 'Islamic Studies', 'Middle Eastern History'],
    rating: 4.9,
    hourlyRate: 40,
    totalSessions: 245,
    studentsHelped: 88,
    verified: true,
    gpa: 3.84
  },
  {
    id: 36,
    name: 'Jacob Miller',
    avatar: 'https://i.pravatar.cc/150?img=39',
    specialization: 'Geology',
    subjects: ['Physical Geology', 'Mineralogy', 'Paleontology'],
    rating: 4.6,
    hourlyRate: 45,
    totalSessions: 134,
    studentsHelped: 48,
    verified: false,
    gpa: 3.75
  },
  {
    id: 37,
    name: 'Lily Chen',
    avatar: 'https://i.pravatar.cc/150?img=40',
    specialization: 'Biochemistry',
    subjects: ['Biochemistry', 'Molecular Biology', 'Cell Biology'],
    rating: 4.9,
    hourlyRate: 53,
    totalSessions: 223,
    studentsHelped: 82,
    verified: true,
    gpa: 3.95
  },
  {
    id: 38,
    name: 'Samuel Green',
    avatar: 'https://i.pravatar.cc/150?img=41',
    specialization: 'Architecture',
    subjects: ['Architectural Design', 'Building Systems', 'Urban Planning'],
    rating: 4.7,
    hourlyRate: 51,
    totalSessions: 149,
    studentsHelped: 54,
    verified: true,
    gpa: 3.80
  },
  {
    id: 39,
    name: 'Nadia Popov',
    avatar: 'https://i.pravatar.cc/150?img=42',
    specialization: 'Russian Language',
    subjects: ['Russian', 'Russian Literature', 'Slavic Studies'],
    rating: 4.8,
    hourlyRate: 39,
    totalSessions: 198,
    studentsHelped: 72,
    verified: true,
    gpa: 3.83
  },
  {
    id: 40,
    name: 'Derek Washington',
    avatar: 'https://i.pravatar.cc/150?img=43',
    specialization: 'Cybersecurity',
    subjects: ['Network Security', 'Ethical Hacking', 'Cryptography'],
    rating: 4.9,
    hourlyRate: 62,
    totalSessions: 184,
    studentsHelped: 67,
    verified: true,
    gpa: 3.93
  }
];

export default function TutorBooking() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [priceRange, setPriceRange] = useState('All');

  // Get all unique subjects
  const allSubjects = ['All', ...new Set(tutors.flatMap(t => t.subjects))].sort();

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'All' || 
      tutor.subjects.includes(selectedSubject);
    
    let matchesPrice = true;
    if (priceRange === 'under40') matchesPrice = tutor.hourlyRate < 40;
    else if (priceRange === '40-50') matchesPrice = tutor.hourlyRate >= 40 && tutor.hourlyRate <= 50;
    else if (priceRange === 'over50') matchesPrice = tutor.hourlyRate > 50;

    return matchesSearch && matchesSubject && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Your Tutor</h1>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search tutors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {allSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="All">All Prices</option>
                <option value="under40">Under $40/hr</option>
                <option value="40-50">$40 - $50/hr</option>
                <option value="over50">Over $50/hr</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-semibold mb-2">Results</label>
                <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
                  {filteredTutors.length} tutors found
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.length > 0 ? (
            filteredTutors.map((tutor) => (
              <div key={tutor.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{tutor.name}</h3>
                    <p className="text-sm text-gray-600">{tutor.specialization}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold">{tutor.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map((subject, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">${tutor.hourlyRate}</p>
                    <p className="text-xs text-gray-500">per hour</p>
                  </div>
                  <button
                    onClick={() => setSelectedTutor(tutor)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-2">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No tutors found</h3>
              <p className="text-gray-600">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedTutor && (
        <BookingModal
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
        />
      )}
    </div>
  );
}

function BookingModal({ tutor, onClose }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');

  const times = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const handleBook = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }
    alert(`✅ Booking Confirmed!\n\nTutor: ${tutor.name}\nDate: ${selectedDate}\nTime: ${selectedTime}\nDuration: ${duration} min\nCost: $${(tutor.hourlyRate * parseInt(duration) / 60).toFixed(2)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Book Session</h2>
            <p className="text-indigo-100">with {tutor.name}</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 p-2 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Calendar size={18} />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Time Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Clock size={18} />
              Select Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {times.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-3 text-sm rounded-lg transition ${
                    selectedTime === time
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Duration</label>
            <div className="flex gap-3">
              {['30', '60', '90'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded-lg transition ${
                    duration === d
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-indigo-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-medium">{selectedDate || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">{selectedTime || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium">{duration} minutes</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-indigo-200">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-indigo-600">
                  ${(tutor.hourlyRate * parseInt(duration) / 60).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Book Button */}
          <button
            onClick={handleBook}
            disabled={!selectedDate || !selectedTime}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              selectedDate && selectedTime
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}