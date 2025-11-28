import { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Download, 
  BarChart3, 
  Eye, 
  Send, 
  PenSquare,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function GradeExams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showExamDropdown, setShowExamDropdown] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingData, setGradingData] = useState(null);

  // Mock data for exam submissions
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      student: { name: 'Emily Chen', email: 'emily.chen@email.com', avatar: 'E' },
      exam: 'Calculus Midterm Exam',
      submitted: '2h ago',
      duration: '85m',
      status: 'submitted',
      score: null
    },
    {
      id: 2,
      student: { name: 'Marcus Johnson', email: 'marcus.j@email.com', avatar: 'M' },
      exam: 'Calculus Midterm Exam',
      submitted: '5h ago',
      duration: '92m',
      status: 'graded',
      score: { points: 87, total: 100 }
    },
    {
      id: 3,
      student: { name: 'Sarah Wilson', email: 'sarah.w@email.com', avatar: 'S' },
      exam: 'Physics Chapter 5 Quiz',
      submitted: '1d ago',
      duration: '45m',
      status: 'returned',
      score: { points: 92, total: 50 }
    }
  ]);

  // Calculate statistics
  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'submitted').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    returned: submissions.filter(s => s.status === 'returned').length,
    avgScore: submissions
      .filter(s => s.score)
      .reduce((acc, s) => acc + (s.score.points / s.score.total) * 100, 0) / 
      submissions.filter(s => s.score).length || 0
  };

  // Get unique exam titles
  const examTitles = [...new Set(submissions.map(s => s.exam))];

  // Filter submissions
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.exam.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesExam = examFilter === 'all' || sub.exam === examFilter;
    return matchesSearch && matchesStatus && matchesExam;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <Clock className="w-3 h-3" />;
      case 'graded': return <CheckCircle className="w-3 h-3" />;
      case 'returned': return <CheckCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleExportGrades = () => {
    // Check if there are any filtered submissions
    if (filteredSubmissions.length === 0) {
      alert('No submissions to export. Please adjust your filters.');
      return;
    }

    // Only export submissions that have been graded (have a score)
    const gradedSubmissions = filteredSubmissions.filter(sub => sub.score);
    
    if (gradedSubmissions.length === 0) {
      alert('No graded submissions to export. Please grade submissions first.');
      return;
    }

    // Prepare data for export (only filtered and graded submissions)
    const exportData = gradedSubmissions.map(sub => ({
      'Student Name': sub.student.name,
      'Student Email': sub.student.email,
      'Exam': sub.exam,
      'Submitted': sub.submitted,
      'Duration': sub.duration,
      'Status': sub.status.charAt(0).toUpperCase() + sub.status.slice(1),
      'Score': `${sub.score.points}/${sub.score.total}`,
      'Percentage': `${((sub.score.points / sub.score.total) * 100).toFixed(1)}%`
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0]);
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exam_grades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    // Initialize grading data with mock questions
    setGradingData({
      questions: [
        {
          id: 1,
          question: 'Calculate the derivative of f(x) = 3x² + 2x - 5',
          maxPoints: 5,
          studentAnswer: "f'(x) = 6x + 2",
          pointsAwarded: 0,
          feedback: ''
        },
        {
          id: 2,
          question: 'Solve for x: 2x + 5 = 15',
          maxPoints: 5,
          studentAnswer: 'x = 5',
          pointsAwarded: 0,
          feedback: ''
        },
        {
          id: 3,
          question: 'Find the integral of ∫(4x³)dx',
          maxPoints: 5,
          studentAnswer: 'x⁴ + C',
          pointsAwarded: 0,
          feedback: ''
        }
      ],
      generalFeedback: ''
    });
    setShowGradeModal(true);
  };

  const handleQuestionScoreChange = (questionId, points) => {
    setGradingData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, pointsAwarded: Math.min(Math.max(0, points), q.maxPoints) } : q
      )
    }));
  };

  const handleQuestionFeedbackChange = (questionId, feedback) => {
    setGradingData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, feedback } : q
      )
    }));
  };

  const handleGeneralFeedbackChange = (feedback) => {
    setGradingData(prev => ({
      ...prev,
      generalFeedback: feedback
    }));
  };

  const calculateTotalScore = () => {
    if (!gradingData) return { earned: 0, total: 0 };
    const earned = gradingData.questions.reduce((sum, q) => sum + (q.pointsAwarded || 0), 0);
    const total = gradingData.questions.reduce((sum, q) => sum + q.maxPoints, 0);
    return { earned, total };
  };

  const handleSubmitGrade = () => {
    const { earned, total } = calculateTotalScore();
    
    // Update the submission with the new grade
    setSubmissions(prevSubmissions => 
      prevSubmissions.map(sub => 
        sub.id === selectedSubmission.id
          ? {
              ...sub,
              status: 'graded',
              score: { points: earned, total },
              gradingDetails: {
                questions: gradingData.questions,
                generalFeedback: gradingData.generalFeedback,
                gradedAt: new Date().toISOString()
              }
            }
          : sub
      )
    );

    console.log('Grade submitted successfully:', {
      submission: selectedSubmission,
      score: { points: earned, total },
      percentage: ((earned / total) * 100).toFixed(1) + '%',
      questions: gradingData.questions,
      generalFeedback: gradingData.generalFeedback
    });
    
    // Here you would typically send this data to your backend
    // await api.submitGrade(selectedSubmission.id, { ... });
    
    closeGradeModal();
  };

  const closeGradeModal = () => {
    setShowGradeModal(false);
    setSelectedSubmission(null);
    setGradingData(null);
  };

  const closeModal = () => {
    setShowViewModal(false);
    setSelectedSubmission(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Grade Exams</h1>
        </div>
        <p className="text-gray-600">Review and grade student exam submissions</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Submissions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600 mt-1">Pending Grading</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.graded}</div>
          <div className="text-sm text-gray-600 mt-1">Graded</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.returned}</div>
          <div className="text-sm text-gray-600 mt-1">Returned</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.avgScore.toFixed(1)}%</div>
          <div className="text-sm text-gray-600 mt-1">Average Score</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name or exam title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-gray-700">
                {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
              </span>
              <span className="text-gray-400">▼</span>
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  All Status
                  {statusFilter === 'all' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => { setStatusFilter('submitted'); setShowStatusDropdown(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  Submitted
                  {statusFilter === 'submitted' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => { setStatusFilter('graded'); setShowStatusDropdown(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  Graded
                  {statusFilter === 'graded' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </button>
                <button
                  onClick={() => { setStatusFilter('returned'); setShowStatusDropdown(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  Returned
                  {statusFilter === 'returned' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Exam Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExamDropdown(!showExamDropdown)}
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-gray-700 truncate">
                {examFilter === 'all' ? 'All Exams' : examFilter}
              </span>
              <span className="text-gray-400">▼</span>
            </button>
            {showExamDropdown && (
              <div className="absolute top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { setExamFilter('all'); setShowExamDropdown(false); }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  All Exams
                  {examFilter === 'all' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </button>
                {examTitles.map((exam) => (
                  <button
                    key={exam}
                    onClick={() => { setExamFilter(exam); setShowExamDropdown(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="truncate">{exam}</span>
                    {examFilter === exam && <CheckCircle className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleExportGrades}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Grades</span>
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Exam Submissions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {submission.student.avatar}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{submission.student.name}</div>
                        <div className="text-sm text-gray-500">{submission.student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{submission.exam}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.submitted}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      <span>{getStatusIcon(submission.status)}</span>
                      <span className="capitalize">{submission.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.score ? `${submission.score.points}/${submission.score.total}` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {submission.status === 'submitted' && (
                        <button 
                          onClick={() => handleGradeSubmission(submission)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                        >
                          <PenSquare className="w-4 h-4" />
                          <span>Grade</span>
                        </button>
                      )}
                      {submission.status === 'graded' && (
                        <button 
                          onClick={() => handleViewSubmission(submission)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      )}
                      {submission.status === 'returned' && (
                        <button 
                          onClick={() => handleViewSubmission(submission)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <div>No exam submissions found</div>
          </div>
        )}
      </div>

      {/* View Grade Modal */}
      {showViewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Exam Submission Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Student Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Student Information</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                    {selectedSubmission.student.avatar}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{selectedSubmission.student.name}</div>
                    <div className="text-sm text-gray-600">{selectedSubmission.student.email}</div>
                  </div>
                </div>
              </div>

              {/* Exam Details */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Exam Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Exam Title</div>
                    <div className="font-medium text-gray-900">{selectedSubmission.exam}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                        <span>{getStatusIcon(selectedSubmission.status)}</span>
                        <span className="capitalize">{selectedSubmission.status}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Submitted</div>
                    <div className="font-medium text-gray-900">{selectedSubmission.submitted}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-medium text-gray-900">{selectedSubmission.duration}</div>
                  </div>
                </div>
              </div>

              {/* Score */}
              {selectedSubmission.score && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Score</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-4xl font-bold text-blue-600">
                        {selectedSubmission.score.points}/{selectedSubmission.score.total}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Points Earned</div>
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-purple-600">
                        {((selectedSubmission.score.points / selectedSubmission.score.total) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Percentage</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mock Exam Responses */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Exam Responses</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">Question 1: Calculate the derivative of f(x) = 3x² + 2x - 5</div>
                      <span className="text-green-600 font-semibold">5/5</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Answer:</span> f'(x) = 6x + 2
                    </div>
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Correct</span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">Question 2: Solve for x: 2x + 5 = 15</div>
                      <span className="text-green-600 font-semibold">5/5</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Answer:</span> x = 5
                    </div>
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Correct</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-gray-900">Question 3: Find the integral of ∫(4x³)dx</div>
                      <span className="text-yellow-600 font-semibold">3/5</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Answer:</span> x⁴ + C
                    </div>
                    <div className="text-xs text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Partially correct (missing coefficient)</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Correct answer: x⁴ + C</div>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Instructor Feedback</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-700">
                    Excellent work overall! Your understanding of derivatives and basic algebra is solid. 
                    For question 3, remember to include the coefficient when integrating. 
                    The integral of 4x³ is x⁴ + C (the 4 is absorbed into the constant of integration in indefinite integrals, 
                    but for definite understanding, it should be noted).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              {selectedSubmission.status === 'graded' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Return to Student
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && gradingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Grade Exam Submission</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSubmission.student.name} - {selectedSubmission.exam}
                </p>
              </div>
              <button
                onClick={closeGradeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Score Summary Card */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Score</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {calculateTotalScore().earned}/{calculateTotalScore().total}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Percentage</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {calculateTotalScore().total > 0 
                        ? ((calculateTotalScore().earned / calculateTotalScore().total) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Questions & Answers</h3>
                
                {gradingData.questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded mb-2">
                            Question {index + 1}
                          </span>
                          <div className="font-medium text-gray-900">{question.question}</div>
                        </div>
                        <div className="ml-4 text-sm text-gray-500">
                          Max: {question.maxPoints} pts
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">Student's Answer:</div>
                        <div className="text-gray-900 font-medium">{question.studentAnswer}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Points Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points Awarded
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={question.maxPoints}
                            value={question.pointsAwarded}
                            onChange={(e) => handleQuestionScoreChange(question.id, parseFloat(e.target.value) || 0)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-600">/ {question.maxPoints}</span>
                          <div className="flex gap-1 ml-auto">
                            <button
                              onClick={() => handleQuestionScoreChange(question.id, question.maxPoints)}
                              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Full Credit
                            </button>
                            <button
                              onClick={() => handleQuestionScoreChange(question.id, 0)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              No Credit
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Feedback Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quick Feedback
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleQuestionFeedbackChange(question.id, 'Correct! Well done.')}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            ✓ Correct
                          </button>
                          <button
                            onClick={() => handleQuestionFeedbackChange(question.id, 'Partially correct. Review the concept.')}
                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            ~ Partial
                          </button>
                          <button
                            onClick={() => handleQuestionFeedbackChange(question.id, 'Incorrect. Please review this topic.')}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            ✗ Incorrect
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Feedback Textarea */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback for this question
                      </label>
                      <textarea
                        value={question.feedback}
                        onChange={(e) => handleQuestionFeedbackChange(question.id, e.target.value)}
                        placeholder="Provide specific feedback for this answer..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* General Feedback */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Overall Feedback</h3>
                <textarea
                  value={gradingData.generalFeedback}
                  onChange={(e) => handleGeneralFeedbackChange(e.target.value)}
                  placeholder="Provide general feedback about the student's overall performance..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">
                  {calculateTotalScore().earned}/{calculateTotalScore().total} points
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={closeGradeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitGrade}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Grade</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
