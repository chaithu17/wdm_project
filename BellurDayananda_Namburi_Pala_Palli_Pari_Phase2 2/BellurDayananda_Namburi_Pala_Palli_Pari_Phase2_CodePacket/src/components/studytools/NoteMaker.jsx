import { useState, useRef } from 'react';
import { X, Save, Download, Bold, Italic, List, ListOrdered } from 'lucide-react';

export default function NoteMaker({ onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const contentRef = useRef(null);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      const newNote = {
        id: Date.now(),
        title: title || 'Untitled Note',
        content,
        timestamp: new Date().toLocaleString()
      };
      setSavedNotes([newNote, ...savedNotes]);
      setTitle('');
      setContent('');
      alert('Note saved successfully!');
    }
  };

  const handleDownload = () => {
    if (!title.trim() && !content.trim()) {
      alert('Nothing to download!');
      return;
    }

    const noteText = `${title}\n${'='.repeat(title.length)}\n\n${content}\n\nCreated: ${new Date().toLocaleString()}`;
    const blob = new Blob([noteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const applyFormatting = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  const handleLoadNote = (note) => {
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDeleteNote = (id) => {
    setSavedNotes(savedNotes.filter(note => note.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg text-gray-900">Note Maker</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Title Input */}
            <div className="p-4 border-b border-gray-200">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title..."
                className="w-full text-2xl font-bold text-gray-900 placeholder-gray-400 outline-none"
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => applyFormatting('bold')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormatting('italic')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button
                onClick={() => applyFormatting('insertUnorderedList')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFormatting('insertOrderedList')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your notes here..."
                className="w-full h-full text-gray-900 placeholder-gray-400 outline-none resize-none"
                style={{ minHeight: '300px' }}
              />
            </div>
          </div>

          {/* Saved Notes Sidebar */}
          {savedNotes.length > 0 && (
            <div className="w-64 border-l border-gray-200 overflow-y-auto bg-gray-50">
              <div className="p-3 border-b border-gray-200 bg-white">
                <h4 className="font-semibold text-sm text-gray-900">Saved Notes</h4>
              </div>
              <div className="p-2 space-y-2">
                {savedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <button
                      onClick={() => handleLoadNote(note)}
                      className="w-full text-left"
                    >
                      <h5 className="font-semibold text-sm text-gray-900 truncate">
                        {note.title}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">{note.timestamp}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {note.content}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="mt-2 text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
