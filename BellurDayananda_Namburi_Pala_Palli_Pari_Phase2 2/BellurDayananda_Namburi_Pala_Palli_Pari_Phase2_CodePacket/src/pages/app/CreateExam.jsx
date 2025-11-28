import { useState } from 'react';
import { 
  HiDocumentText, 
  HiPlus, 
  HiClock, 
  HiBookOpen, 
  HiEye, 
  HiDuplicate, 
  HiCog,
  HiChevronDown,
  HiSave,
  HiPaperAirplane,
  HiExclamationCircle,
  HiX
} from 'react-icons/hi';

export default function CreateExam() {
  const [activeTab, setActiveTab] = useState('details'); // details, questions, settings
  const [examData, setExamData] = useState({
    title: '',
    description: '',
    subject: '',
    duration: 60,
    allowRetakes: false,
    showCorrectAnswers: true,
    randomizeQuestions: false
  });
  const [questions, setQuestions] = useState([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [isDraft, setIsDraft] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    text: '',
    points: 5,
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'History',
    'Geography',
    'Economics',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setExamData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    // TODO: Implement save draft functionality
    console.log('Saving draft:', examData, questions);
  };

  const handlePublishExam = () => {
    if (!examData.title || !examData.subject) {
      alert('Please fill in exam title and subject before publishing');
      return;
    }
    setIsDraft(false);
    // TODO: Implement publish functionality
    console.log('Publishing exam:', examData, questions);
  };

  const handleDuplicateExam = () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicating exam:', examData, questions);
    alert('Exam duplicated! (Feature coming soon)');
  };

  const handleAdvancedSettings = () => {
    // TODO: Implement advanced settings
    console.log('Opening advanced settings');
    alert('Advanced settings coming soon!');
  };

  const handleAddQuestion = () => {
    setEditingQuestionIndex(null);
    setCurrentQuestion({
      type: 'multiple-choice',
      text: '',
      points: 5,
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    setShowAddQuestionModal(true);
  };

  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    setCurrentQuestion({ ...questions[index] });
    setShowAddQuestionModal(true);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSaveQuestion = () => {
    if (!currentQuestion.text.trim()) {
      alert('Please enter a question');
      return;
    }

    if (currentQuestion.type === 'multiple-choice') {
      const filledOptions = currentQuestion.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        alert('Please provide at least 2 answer options');
        return;
      }
    }

    if (editingQuestionIndex !== null) {
      // Update existing question
      setQuestions(prev => prev.map((q, i) => i === editingQuestionIndex ? currentQuestion : q));
    } else {
      // Add new question
      setQuestions(prev => [...prev, currentQuestion]);
    }

    setShowAddQuestionModal(false);
    setCurrentQuestion({
      type: 'multiple-choice',
      text: '',
      points: 5,
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
        correctAnswer: prev.correctAnswer >= index && prev.correctAnswer > 0 
          ? prev.correctAnswer - 1 
          : prev.correctAnswer
      }));
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <HiDocumentText className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-bold text-gray-900">Create Exam</h1>
              </div>
              <p className="text-sm text-gray-600">Design and publish exams for your students</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 bg-white transition-colors text-sm"
              >
                <HiSave className="w-3.5 h-3.5" />
                Save Draft
              </button>
              <button 
                onClick={handlePublishExam}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm"
              >
                <HiPaperAirplane className="w-3.5 h-3.5" />
                Publish Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-5 border border-gray-200">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Exam Details
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'questions'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Questions ({questions.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 px-5 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5">
                {/* Exam Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-5">
                    <h2 className="text-base font-semibold text-gray-900 mb-3">Basic Information</h2>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Exam Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={examData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter exam title"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={examData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe the exam content and expectations"
                        rows="3"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={examData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none text-sm"
                          >
                            <option value="">Select subject</option>
                            {subjects.map(subject => (
                              <option key={subject} value={subject}>{subject}</option>
                            ))}
                          </select>
                          <HiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={examData.duration}
                          onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                          min="1"
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions Tab */}
                {activeTab === 'questions' && (
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-base font-semibold text-gray-900">Exam Questions</h2>
                      <button 
                        onClick={handleAddQuestion}
                        className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        <HiPlus className="w-3.5 h-3.5" />
                        Add Question
                      </button>
                    </div>

                    {questions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mb-3">
                          <HiDocumentText className="w-7 h-7 text-blue-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900 mb-2">No questions added yet</h3>
                        <p className="text-sm text-gray-500 mb-5">Start building your exam by adding questions</p>
                        <button 
                          onClick={handleAddQuestion}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                          <HiPlus className="w-4 h-4" />
                          Add First Question
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((question, index) => (
                          <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-xs font-medium text-gray-500">Q{index + 1}</span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    {question.type === 'multiple-choice' ? 'Multiple Choice' : 
                                     question.type === 'true-false' ? 'True/False' : 'Short Answer'}
                                  </span>
                                  <span className="text-xs text-gray-500">{question.points} points</span>
                                </div>
                                <p className="text-sm text-gray-900 mb-1.5">{question.text}</p>
                                {question.options && question.type === 'multiple-choice' && (
                                  <div className="space-y-0.5 ml-3">
                                    {question.options.filter(opt => opt.trim()).map((option, optIdx) => (
                                      <div key={optIdx} className={`text-xs ${optIdx === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                        {String.fromCharCode(65 + optIdx)}. {option}
                                        {optIdx === question.correctAnswer && ' ✓'}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                <button 
                                  onClick={() => handleEditQuestion(index)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit question"
                                >
                                  <HiCog className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteQuestion(index)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete question"
                                >
                                  <HiX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className="space-y-5">
                    <h2 className="text-base font-semibold text-gray-900 mb-3">Exam Settings</h2>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-0.5">Allow Retakes</h3>
                          <p className="text-xs text-gray-500">Students can retake this exam</p>
                        </div>
                        <button
                          onClick={() => handleInputChange('allowRetakes', !examData.allowRetakes)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                            examData.allowRetakes ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              examData.allowRetakes ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-0.5">Show Correct Answers</h3>
                          <p className="text-xs text-gray-500">Display correct answers after submission</p>
                        </div>
                        <button
                          onClick={() => handleInputChange('showCorrectAnswers', !examData.showCorrectAnswers)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                            examData.showCorrectAnswers ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              examData.showCorrectAnswers ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 mb-0.5">Randomize Questions</h3>
                          <p className="text-xs text-gray-500">Present questions in random order</p>
                        </div>
                        <button
                          onClick={() => handleInputChange('randomizeQuestions', !examData.randomizeQuestions)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                            examData.randomizeQuestions ? 'bg-gray-900' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              examData.randomizeQuestions ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Exam Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-5 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Exam Summary</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 bg-blue-50 rounded-lg">
                    <HiDocumentText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{questions.length}</p>
                    <p className="text-xs text-gray-500">questions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 bg-purple-50 rounded-lg">
                    <HiClock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{examData.duration}</p>
                    <p className="text-xs text-gray-500">minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-9 h-9 bg-green-50 rounded-lg">
                    <HiBookOpen className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{totalPoints}</p>
                    <p className="text-xs text-gray-500">total points</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-1.5">
                    <HiExclamationCircle className="w-3.5 h-3.5 text-orange-500" />
                    <span className={`text-xs font-medium ${isDraft ? 'text-orange-600' : 'text-green-600'}`}>
                      {isDraft ? 'Draft' : 'Published'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t space-y-2">
                <h3 className="text-xs font-semibold text-gray-900 mb-2">Quick Actions</h3>
                
                <button 
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                >
                  <HiEye className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-gray-700">Preview Exam</span>
                </button>

                <button 
                  onClick={handleDuplicateExam}
                  className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                >
                  <HiDuplicate className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-gray-700">Duplicate Exam</span>
                </button>

                <button 
                  onClick={handleAdvancedSettings}
                  className="w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors text-xs"
                >
                  <HiCog className="w-3.5 h-3.5 text-gray-600" />
                  <span className="text-gray-700">Advanced Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Question Modal - Placeholder */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
              </h3>
              <button 
                onClick={() => setShowAddQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Question Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Question Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuestionChange('type', 'multiple-choice')}
                    className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                      currentQuestion.type === 'multiple-choice'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Multiple Choice
                  </button>
                  <button
                    onClick={() => handleQuestionChange('type', 'true-false')}
                    className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                      currentQuestion.type === 'true-false'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    True/False
                  </button>
                  <button
                    onClick={() => handleQuestionChange('type', 'short-answer')}
                    className={`px-3 py-2 border rounded-lg text-xs font-medium transition-colors ${
                      currentQuestion.type === 'short-answer'
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    Short Answer
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={currentQuestion.text}
                  onChange={(e) => handleQuestionChange('text', e.target.value)}
                  placeholder="Enter your question here"
                  rows="3"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none resize-none text-sm"
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Points
                </label>
                <input
                  type="number"
                  value={currentQuestion.points}
                  onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 0)}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Multiple Choice Options */}
              {currentQuestion.type === 'multiple-choice' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Answer Options <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-answer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => handleQuestionChange('correctAnswer', index)}
                          className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-sm"
                        />
                        {currentQuestion.options.length > 2 && (
                          <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {currentQuestion.options.length < 6 && (
                    <button
                      onClick={addOption}
                      className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <HiPlus className="w-3 h-3" />
                      Add Option
                    </button>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>
              )}

              {/* True/False Options */}
              {currentQuestion.type === 'true-false' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Correct Answer
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuestionChange('correctAnswer', 0)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        currentQuestion.correctAnswer === 0
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      True
                    </button>
                    <button
                      onClick={() => handleQuestionChange('correctAnswer', 1)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        currentQuestion.correctAnswer === 1
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      False
                    </button>
                  </div>
                </div>
              )}

              {/* Short Answer Note */}
              {currentQuestion.type === 'short-answer' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Short answer questions will need to be graded manually.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t">
              <button 
                onClick={() => setShowAddQuestionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveQuestion}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                {editingQuestionIndex !== null ? 'Update Question' : 'Add Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-5 py-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Exam Preview</h3>
                <p className="text-xs text-gray-500">How your exam will look to students</p>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="text-xl" />
              </button>
            </div>
            
            <div className="p-5">
              {/* Preview Header */}
              <div className="mb-5 p-5 bg-blue-50 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {examData.title || 'Untitled Exam'}
                </h2>
                {examData.description && (
                  <p className="text-sm text-gray-600 mb-3">{examData.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs">
                  {examData.subject && (
                    <div className="flex items-center gap-1.5">
                      <HiBookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-700">{examData.subject}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <HiClock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-700">{examData.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiDocumentText className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-gray-700">{questions.length} questions</span>
                  </div>
                  {totalPoints > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-700">Total: {totalPoints} points</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Questions */}
              {questions.length > 0 ? (
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-900">Questions</h3>
                  {questions.map((question, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">Question {index + 1}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            {question.type === 'multiple-choice' ? 'Multiple Choice' : 
                             question.type === 'true-false' ? 'True/False' : 'Short Answer'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{question.points} points</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{question.text}</p>
                      {question.options && (
                        <div className="space-y-1.5">
                          {question.options.map((option, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                name={`question-${index}`} 
                                className="w-3.5 h-3.5"
                                disabled
                              />
                              <label className="text-xs text-gray-700">
                                {String.fromCharCode(65 + optIdx)}. {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <HiDocumentText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No questions added yet</p>
                </div>
              )}

              {/* Preview Footer */}
              <div className="mt-6 pt-5 border-t">
                <button 
                  onClick={() => setShowPreview(false)}
                  className="w-full px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
