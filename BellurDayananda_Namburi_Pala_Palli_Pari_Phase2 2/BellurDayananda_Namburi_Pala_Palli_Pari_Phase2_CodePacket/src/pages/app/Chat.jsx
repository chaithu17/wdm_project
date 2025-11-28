import { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  Mic, 
  Send,
  HelpCircle,
  Calculator as CalculatorIcon,
  FileText,
  BookOpen,
  Clock
} from 'lucide-react';
import { Calculator, NoteMaker, StudyGuide, PomodoroTimer } from '../../components/studytools';
import peers from '../../data/mockPeersData';

export default function Chat() {
  const STORAGE_KEY = 'peer-tutoring:messages';
  // derive current user's display name from sessionStorage (AuthProvider stores 'user')
  const getSessionUserName = () => {
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name) return parsed.name;
      }
    } catch (e) {
      // ignore
    }
    try {
      const n = sessionStorage.getItem('name');
      if (n) return n;
    } catch (e) {}
    return 'Student';
  };

  const sessionUserName = getSessionUserName();

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migration: replace old hardcoded name occurrences ("Alex Johnson") with current session user name
        const migrated = parsed.map(m => {
          const copy = { ...m };
          try {
            if (typeof copy.content === 'string') {
              copy.content = copy.content.replace(/Alex Johnson/g, sessionUserName);
            }
            if (copy.senderName && typeof copy.senderName === 'string') {
              copy.senderName = copy.senderName === 'Alex Johnson' ? sessionUserName : copy.senderName;
            }
          } catch (e) {
            // ignore any malformed message entries
          }
          return copy;
        });
        return migrated;
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 1,
        conversationId: 'assistant',
        type: 'ai',
        content: `Hello ${sessionUserName}! I'm your study assistant. I'm here to help you with your studies, create personalized study plans, answer questions, and provide learning guidance. How can I assist you today?`,
        timestamp: '10:21 PM'
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [activeToolId, setActiveToolId] = useState(null);
  // stable id generator for messages (init from stored messages)
  const nextMessageId = useRef(1);
  // refs for scrolling and input focus
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  // keep track of timeouts to clear on unmount
  const pendingTimeouts = useRef([]);

  const quickSuggestions = [
    { id: 1, text: 'Help me create a study schedule', icon: HelpCircle },
    { id: 2, text: 'Explain calculus derivatives', icon: HelpCircle },
    { id: 3, text: 'Quiz me on physics formulas', icon: HelpCircle },
    { id: 4, text: 'Study tips for better retention', icon: HelpCircle },
    { id: 5, text: 'How to prepare for exams?', icon: HelpCircle }
  ];

  const studyTools = [
    { id: 1, name: 'Calculator', icon: CalculatorIcon, component: 'calculator' },
    { id: 2, name: 'Note Maker', icon: FileText, component: 'noteMaker' },
    { id: 3, name: 'Study Guide', icon: BookOpen, component: 'studyGuide' },
    { id: 4, name: 'Pomodoro Timer', icon: Clock, component: 'pomodoroTimer' }
  ];

  const recentTopics = [
    'Calculus derivatives',
    'Physics formulas',
    'Study scheduling',
    'Exam preparation'
  ];

  // Peers selection state
  const [activePeer, setActivePeer] = useState(null);

  // Accept an optional text argument so callers (like quick suggestions) can submit immediately.
  const handleSendMessage = (text) => {
    const content = typeof text === 'string' ? text : inputValue;
    if (content && content.trim()) {
      const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const conversationId = activePeer ? `peer-${activePeer.id}` : 'assistant';

      // Add the user's message using stable id and conversationId
      setMessages(prev => {
        const newMessage = {
          id: nextMessageId.current++,
          conversationId,
          type: 'user',
          content,
          timestamp
        };
        return [...prev, newMessage];
      });

      // Clear input box
      setInputValue('');

      // Simulate AI/peer response and store timeout id so we can clear it on unmount
      if (activePeer) {
        const t = setTimeout(() => {
          setMessages(prev => {
            const peerResponse = {
              id: nextMessageId.current++,
              conversationId,
              type: 'peer',
              senderId: activePeer.id,
              senderName: activePeer.name,
              senderInitials: activePeer.initials,
              content: `Hi, this is ${activePeer.name}. I think ${content.slice(0, 120)}...`,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            };
            return [...prev, peerResponse];
          });
        }, 900);
        pendingTimeouts.current.push(t);
      } else {
        const t = setTimeout(() => {
          setMessages(prev => {
            const aiResponse = {
              id: nextMessageId.current++,
              conversationId,
              type: 'ai',
              content: "I understand your question. Let me help you with that...",
              timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            };
            return [...prev, aiResponse];
          });
        }, 1000);
        pendingTimeouts.current.push(t);
      }
    }
  };

  const handleKeyPress = (e) => {
    // retained for backward compatibility; prefer using form onSubmit and onKeyDown
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleSuggestionClick = (suggestionText) => {
    // Insert suggestion into input and submit immediately
    setInputValue(suggestionText);
    // Call send with the suggestion text so it gets submitted right away
    handleSendMessage(suggestionText);
  };

  const startPeerChat = (peer) => {
    setActivePeer(peer);
    // focus the input for faster reply
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const leavePeerChat = () => {
    setActivePeer(null);
  };

  const openTool = (toolId) => {
    setActiveToolId(toolId);
  };

  const closeTool = () => {
    setActiveToolId(null);
  };

  const chatWithAI = () => {
    // Clear active peer only, no system message
    if (activePeer) {
      setActivePeer(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // initialize nextMessageId from existing messages
  useEffect(() => {
    const maxId = messages.reduce((max, m) => Math.max(max, Number(m.id || 0)), 0);
    nextMessageId.current = maxId + 1;
  }, []); // run once on mount

  // persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      // ignore storage errors
    }
  }, [messages]);

  // clear pending timeouts on unmount
  useEffect(() => {
    return () => {
      pendingTimeouts.current.forEach(t => clearTimeout(t));
      pendingTimeouts.current = [];
    };
  }, []);

  return (
  <div className="flex flex-1 min-h-0 bg-gray-50">
      {/* Study Tools Modals */}
      {activeToolId === 1 && <Calculator onClose={closeTool} />}
      {activeToolId === 2 && <NoteMaker onClose={closeTool} />}
      {activeToolId === 3 && <StudyGuide onClose={closeTool} />}
      {activeToolId === 4 && <PomodoroTimer onClose={closeTool} />}
      {/* Main Chat Area */}
  <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {activePeer ? activePeer.initials : 'SA'}
            </div>
            <div>
              <h2 className="font-semibold text-sm text-gray-900">{activePeer ? activePeer.name : 'Study Assistant'}</h2>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${activePeer ? (activePeer.status === 'online' ? 'bg-green-500' : 'bg-gray-300') : 'bg-green-500'}`}></span>
                <span className="text-xs text-green-600 font-medium">{activePeer ? activePeer.status.charAt(0).toUpperCase() + activePeer.status.slice(1) : 'Online'}</span>
              </div>
            </div>
            {activePeer && (
              <button onClick={leavePeerChat} className="ml-auto text-xs text-red-600 hover:text-red-700">Leave</button>
            )}
          </div>
        </div>

  {/* Messages Area */}
  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-atomic="false">
          <div className="max-w-3xl mx-auto space-y-4">
            {(messages.filter(m => {
              const convId = activePeer ? `peer-${activePeer.id}` : 'assistant';
              return (m.conversationId || 'assistant') === convId;
            })).map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                    message.type === 'ai' ? 'bg-blue-500 text-white' : (message.type === 'peer' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-700')
                  }`}>
                    {message.type === 'ai' ? 'SA' : (message.type === 'peer' ? (message.senderInitials || 'P') : 'U')}
                  </div>
                  
                  {/* Message Content */}
                  <div>
                    <div className={`rounded-2xl px-3 py-2 ${
                      message.type === 'ai' 
                        ? 'bg-gray-200 text-gray-900' 
                        : (message.type === 'peer' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                    }`}>
                      <p className="text-xs leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 px-1.5">{message.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

  {/* Input Area */}
  <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0 z-10">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              
              
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  // Enter to send, Shift+Enter for newline
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about your studies..."
                aria-label="Message input"
                rows={1}
                className="flex-1 resize-none bg-transparent border-none outline-none text-xs text-gray-900 placeholder-gray-500"
              />
              
          
              
              <button 
                type="submit"
                aria-label="Send message"
                className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg p-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 bg-white border-l border-gray-200 flex flex-col">
        <div className="overflow-y-auto flex-1">
        
        {/* Peers */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Peers</h3>
          <div className="space-y-2">
            {peers.map((peer) => (
              <div key={peer.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${peer.status === 'online' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                    {peer.initials}
                  </div>
                  <div className="text-xs text-gray-700">{peer.name}</div>
                </div>
                <div>
                  <button onClick={() => startPeerChat(peer)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100">Chat</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Quick Suggestions</h3>
          <div className="space-y-1.5">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
              >
                <suggestion.icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Study Tools */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Study Tools</h3>
          <div className="space-y-1.5">
            {studyTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => openTool(tool.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
              >
                <tool.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span>{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Topics */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Recent Topics</h3>
          <div className="space-y-1">
            {recentTopics.map((topic, index) => (
              <button
                key={index}
                className="w-full text-left px-1.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
              >
                • {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
