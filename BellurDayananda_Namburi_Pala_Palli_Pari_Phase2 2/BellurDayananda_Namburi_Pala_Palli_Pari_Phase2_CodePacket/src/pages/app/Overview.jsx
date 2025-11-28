import { useState } from 'react';
import { useAuth } from '../../app/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Users,
  FileText,
  Star,
  MessageSquare,
  HelpCircle,
  Upload,
  Calendar,
  UserSearch,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Plus,
  X,
  Check
} from 'lucide-react';


export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Demo data
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Calculus Ch. 5', status: 'todo', priority: 'high' },
    { id: 2, title: 'Physics formulas', status: 'inprogress', priority: 'medium' },
    { id: 3, title: 'Chemistry problems', status: 'done', priority: 'low' },
    { id: 4, title: 'Biology quiz prep', status: 'todo', priority: 'high' },
    { id: 5, title: 'CS textbook Ch. 3', status: 'inprogress', priority: 'medium' },
  ]);
  const [sessions] = useState([
    { id: 1, subject: 'Math', tutor: 'Sarah Chen', duration: '45 min', rating: 5, timeAgo: '2h ago' },
    { id: 2, subject: 'Physics', tutor: 'Dr. Martinez', duration: '60 min', rating: 4, timeAgo: '1d ago' },
    { id: 3, subject: 'Chemistry', tutor: 'Alex Kim', duration: '30 min', rating: 5, timeAgo: '3d ago' },
  ]);
  const stats = [
    { icon: Clock, value: '24h', label: 'Study', color: 'bg-blue-100 text-blue-600' },
    { icon: Users, value: '12', label: 'Sessions', color: 'bg-green-100 text-green-600' },
    { icon: FileText, value: '8', label: 'Docs', color: 'bg-purple-100 text-purple-600' },
    { icon: Star, value: '4.8', label: 'Rating', color: 'bg-yellow-100 text-yellow-600' },
  ];
  const quickActions = [
    { icon: Upload, label: 'Upload', color: 'bg-blue-50 text-blue-600', route: '/app/documents' },
    { icon: UserSearch, label: 'Find Tutor', color: 'bg-purple-50 text-purple-600', route: '/app/tutors' },
    { icon: GraduationCap, label: 'Grade', color: 'bg-red-50 text-red-600', route: '/app/planner' },
    { icon: TrendingUp, label: 'Progress', color: 'bg-indigo-50 text-indigo-600', route: '/app/profile' },
  ];

  // Kanban status columns
  const statusColumns = [
    { key: 'todo', label: 'To Do', color: 'border-blue-400' },
    { key: 'inprogress', label: 'In Progress', color: 'border-yellow-400' },
    { key: 'done', label: 'Done', color: 'border-green-400' },
  ];

  // Move task between columns
  const moveTask = (id, direction) => {
    setTasks(tasks => tasks.map(task => {
      if (task.id !== id) return task;
      const order = ['todo', 'inprogress', 'done'];
      let idx = order.indexOf(task.status) + direction;
      if (idx < 0) idx = 0;
      if (idx > 2) idx = 2;
      return { ...task, status: order[idx] };
    }));
  };

  // Priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Hero Card */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col items-center text-center">
          <GraduationCap className="w-12 h-12 text-blue-500 mb-2" />
          <h1 className="text-2xl font-bold mb-1">Hello, {user?.name ?? 'Learner'}!</h1>
          <p className="text-gray-500 mb-2">"Success is the sum of small efforts, repeated day in and day out."</p>
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">Student & Tutor</span>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="flex gap-4 overflow-x-auto pb-2 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`min-w-[120px] flex-1 bg-white rounded-xl shadow p-4 flex flex-col items-center ${stat.color}`}>
            <stat.icon className="w-7 h-7 mb-1" />
            <span className="text-xl font-bold">{stat.value}</span>
            <span className="text-xs text-gray-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kanban Board */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Study Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusColumns.map(col => (
              <div key={col.key} className={`bg-white rounded-xl border-2 ${col.color} p-4 min-h-[220px]`}>
                <h3 className="font-bold text-sm mb-3 text-gray-700">{col.label}</h3>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === col.key).map(task => (
                    <div key={task.id} className="flex items-center gap-2 bg-gray-50 rounded p-2">
                      <span className={`px-2 py-1 text-xs text-white rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      <span className="flex-1 text-gray-700 font-medium">{task.title}</span>
                      {col.key !== 'todo' && (
                        <button onClick={() => moveTask(task.id, -1)} className="text-blue-400 hover:text-blue-600 text-xs">◀</button>
                      )}
                      {col.key !== 'done' && (
                        <button onClick={() => moveTask(task.id, 1)} className="text-blue-400 hover:text-blue-600 text-xs">▶</button>
                      )}
                    </div>
                  ))}
                  {tasks.filter(t => t.status === col.key).length === 0 && (
                    <div className="text-xs text-gray-400">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sessions Timeline */}
          <h2 className="text-lg font-semibold mt-10 mb-4 text-blue-700">Recent Sessions</h2>
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                <Users className="w-8 h-8 text-blue-400" />
                <div className="flex-1">
                  <div className="font-bold text-gray-700">{session.subject}</div>
                  <div className="text-xs text-gray-500">{session.tutor} • {session.duration}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 text-yellow-500 text-sm"><Star className="w-4 h-4" />{session.rating}</span>
                  <span className="text-xs text-gray-400">{session.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Study Assistant Chat Bubble */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <span className="font-semibold text-gray-700">Study Assistant</span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-3">
              <div className="flex gap-2 items-start">
                <HelpCircle className="w-5 h-5 text-blue-400 mt-1" />
                <span className="text-sm text-blue-900">"Try focusing on practice problems for your next calculus exam!"</span>
              </div>
            </div>
            <button onClick={() => navigate('/app/chat')} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Chat Now</button>
          </div>

          {/* Quick Actions Grid */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <button key={idx} onClick={() => navigate(action.route)} className={`flex flex-col items-center justify-center gap-1 py-3 rounded-lg shadow-sm hover:shadow-md transition ${action.color}`}>
                  <action.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Achievement Badge Minimal */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6 shadow flex flex-col items-center">
            <GraduationCap className="w-10 h-10 text-yellow-600 mb-2" />
            <span className="font-bold text-yellow-900 mb-1">Achievement!</span>
            <span className="text-xs text-yellow-800">12 tutoring sessions completed this month</span>
          </div>
        </div>
      </div>
    </div>
  );
}