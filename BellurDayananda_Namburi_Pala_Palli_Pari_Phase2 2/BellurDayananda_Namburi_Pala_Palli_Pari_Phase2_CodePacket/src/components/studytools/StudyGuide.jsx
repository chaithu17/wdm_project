import { useState } from 'react';
import { X, Plus, Trash2, CheckCircle, Circle, Download } from 'lucide-react';

export default function StudyGuide({ onClose }) {
  const [guides, setGuides] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      topics: [
        { id: 1, title: 'Derivatives', completed: true, notes: 'Review chain rule and product rule' },
        { id: 2, title: 'Integrals', completed: false, notes: 'Practice integration by parts' },
      ]
    }
  ]);
  
  const [selectedGuide, setSelectedGuide] = useState(guides[0]?.id || null);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const currentGuide = guides.find(g => g.id === selectedGuide);

  const addGuide = () => {
    if (newSubject.trim()) {
      const newGuide = {
        id: Date.now(),
        subject: newSubject,
        topics: []
      };
      setGuides([...guides, newGuide]);
      setSelectedGuide(newGuide.id);
      setNewSubject('');
    }
  };

  const deleteGuide = (id) => {
    setGuides(guides.filter(g => g.id !== id));
    if (selectedGuide === id) {
      setSelectedGuide(guides[0]?.id || null);
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && currentGuide) {
      const newTopicObj = {
        id: Date.now(),
        title: newTopic,
        completed: false,
        notes: newNotes
      };
      const updatedGuides = guides.map(g => 
        g.id === selectedGuide 
          ? { ...g, topics: [...g.topics, newTopicObj] }
          : g
      );
      setGuides(updatedGuides);
      setNewTopic('');
      setNewNotes('');
    }
  };

  const toggleTopic = (topicId) => {
    const updatedGuides = guides.map(g => 
      g.id === selectedGuide
        ? {
            ...g,
            topics: g.topics.map(t => 
              t.id === topicId ? { ...t, completed: !t.completed } : t
            )
          }
        : g
    );
    setGuides(updatedGuides);
  };

  const deleteTopic = (topicId) => {
    const updatedGuides = guides.map(g => 
      g.id === selectedGuide
        ? { ...g, topics: g.topics.filter(t => t.id !== topicId) }
        : g
    );
    setGuides(updatedGuides);
  };

  const downloadGuide = () => {
    if (!currentGuide) return;

    let content = `STUDY GUIDE: ${currentGuide.subject}\n`;
    content += '='.repeat(50) + '\n\n';
    
    currentGuide.topics.forEach((topic, index) => {
      content += `${index + 1}. ${topic.title} ${topic.completed ? '✓' : '○'}\n`;
      if (topic.notes) {
        content += `   Notes: ${topic.notes}\n`;
      }
      content += '\n';
    });

    content += `\nProgress: ${currentGuide.topics.filter(t => t.completed).length}/${currentGuide.topics.length} topics completed\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentGuide.subject}-study-guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const progress = currentGuide 
    ? (currentGuide.topics.filter(t => t.completed).length / currentGuide.topics.length) * 100 || 0
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Study Guide Creator</h3>
            <p className="text-xs text-gray-500 mt-0.5">Organize your study topics and track progress</p>
          </div>
          <div className="flex items-center gap-2">
            {currentGuide && (
              <button
                onClick={downloadGuide}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Subjects Sidebar */}
          <div className="w-64 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-3 border-b border-gray-200 bg-white">
              <h4 className="font-semibold text-sm text-gray-900 mb-2">Subjects</h4>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGuide()}
                  placeholder="New subject..."
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded outline-none focus:border-blue-500"
                />
                <button
                  onClick={addGuide}
                  className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedGuide === guide.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => setSelectedGuide(guide.id)}
                      className="flex-1 text-left"
                    >
                      <h5 className="font-semibold text-sm text-gray-900">
                        {guide.subject}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {guide.topics.length} topics
                      </p>
                    </button>
                    <button
                      onClick={() => deleteGuide(guide.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {currentGuide ? (
              <>
                {/* Guide Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-xl text-gray-900 mb-3">
                    {currentGuide.subject}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Progress: {currentGuide.topics.filter(t => t.completed).length}/{currentGuide.topics.length} completed</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Add Topic Form */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Topic name..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Notes or key points (optional)..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 resize-none"
                      rows="2"
                    />
                    <button
                      onClick={addTopic}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Topic
                    </button>
                  </div>
                </div>

                {/* Topics List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {currentGuide.topics.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-sm">No topics yet. Add your first topic above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentGuide.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            topic.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTopic(topic.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {topic.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h5 className={`font-semibold text-sm ${
                                topic.completed ? 'text-green-900 line-through' : 'text-gray-900'
                              }`}>
                                {topic.title}
                              </h5>
                              {topic.notes && (
                                <p className="text-xs text-gray-600 mt-1">{topic.notes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => deleteTopic(topic.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-sm">No subject selected</p>
                  <p className="text-xs mt-1">Create a subject to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
