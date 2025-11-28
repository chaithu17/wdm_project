import { useState, useEffect } from 'react';
import profileService from '../../services/profileService';
import mockProfileData from '../../data/mockProfileData';
import { FaBook, FaChartLine, FaTrophy, FaFire, FaBell, FaLock, FaPalette, FaStar, FaTimes, FaPlus, FaUserCircle } from 'react-icons/fa';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useMockData, setUseMockData] = useState(true); // Toggle for dev mode
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Avatar is now an icon, not a random image
  // Session values (name/email/bio)
  const [sessionName, setSessionName] = useState('');
  const [sessionEmail, setSessionEmail] = useState('');
  const [sessionBio, setSessionBio] = useState('');

  // TODO: Get actual user ID from auth context
  const userId = '1';

  useEffect(() => {
    loadProfileData();
    // Load name/email/bio from sessionStorage (if present)
    try {
      const sName = sessionStorage.getItem('name');
      const sEmail = sessionStorage.getItem('email');
      const sBio = sessionStorage.getItem('bio');
      if (sName) setSessionName(sName);
      if (sEmail) setSessionEmail(sEmail);
      if (sBio) setSessionBio(sBio);
    } catch (e) {
      // sessionStorage may be unavailable in some environments; ignore
      console.warn('sessionStorage not available', e);
    }
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (useMockData) {
        // Use mock data for development
        setTimeout(() => {
          setProfileData(mockProfileData);
          setLoading(false);
        }, 500); // Simulate API delay
      } else {
        // Use real API
        const data = await profileService.getCompleteProfile(userId);
        setProfileData(data);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      console.error('Failed to load profile:', err);
    }
  };

  const handleSettingToggle = async (settingName, value) => {
    try {
      const updatedSettings = { ...profileData.settings, [settingName]: value };
      
      if (!useMockData) {
        await profileService.updateUserSettings(userId, { [settingName]: value });
      }
      
      setProfileData({
        ...profileData,
        settings: updatedSettings
      });
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

  const handleProfileUpdate = async (updatedUser) => {
    try {
      if (!useMockData) {
        await profileService.updateUserProfile(userId, updatedUser);
      }
      // Update profileData locally
      setProfileData({
        ...profileData,
        user: { ...profileData.user, ...updatedUser }
      });

      // Persist name/email/bio to sessionStorage when available
      try {
        if (updatedUser.name) {
          sessionStorage.setItem('name', updatedUser.name);
          setSessionName(updatedUser.name);
        }
        if (updatedUser.email) {
          sessionStorage.setItem('email', updatedUser.email);
          setSessionEmail(updatedUser.email);
        }
        if (updatedUser.bio) {
          sessionStorage.setItem('bio', updatedUser.bio);
          setSessionBio(updatedUser.bio);
        }
      } catch (e) {
        console.warn('Could not write to sessionStorage', e);
      }
      
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Error loading profile</p>
          <p className="mt-2">{error}</p>
          <button 
            onClick={loadProfileData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, statistics, progress, activity, achievements, settings } = profileData;

  // Merge session values into user display data (prefer session storage values)
  const mergedUser = {
    ...user,
    name: sessionName || user.name,
    email: sessionEmail || user.email,
    bio: sessionBio || user.bio,
  };

  // Prefer the authenticated session user (set by AuthProvider) when available
  let authUser = null;
  try {
    const raw = sessionStorage.getItem('user');
    authUser = raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('failed to read authenticated user from sessionStorage', e);
  }

  // Provide safe defaults so UI won't crash when some fields are missing
  const defaultUserValues = {
    name: '',
    email: '',
    bio: '',
    subjects: [],
    role: 'student',
    rating: 0,
    // avatar field is not used for icon
  };

  const displayUser = {
    ...defaultUserValues,
    ...(authUser || mergedUser || {}),
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* Avatar Icon */}
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              <FaUserCircle className="text-gray-400" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* User Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayUser.name}</h1>
              <p className="text-gray-600">{displayUser.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-black text-white text-sm rounded-full">
                  {displayUser.role === 'student-tutor' ? 'Student & Tutor' : displayUser.role}
                </span>
                <span className="flex items-center text-yellow-500">
                  <FaStar /> {displayUser.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-gray-700 mt-2">{displayUser.bio}</p>
              <div className="flex gap-2 mt-3">
                {displayUser.subjects.map((subject, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-sm rounded-full">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Edit Profile
          </button>
        </div>
      </div>

        {/* Tabs */}
        <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
          {['overview', 'activity', 'achievements', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center capitalize font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statistics */}
            <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={FaBook} value={statistics.totalSessions} label="Total Sessions" />
              <StatCard icon={FaChartLine} value={`${statistics.studyHours}h`} label="Study Hours" />
              <StatCard icon={FaTrophy} value={statistics.achievements} label="Achievements" />
              <StatCard icon={FaFire} value={statistics.dayStreak} label="Day Streak" />
            </div>
          </div>

            {/* Learning Progress */}
            <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Progress</h2>
            <div className="space-y-4">
              {progress.map((item) => (
                <ProgressBar
                  key={item.id}
                  subject={item.subject}
                  progress={item.progress}
                />
              ))}
            </div>
          </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activity.map((item) => (
              <ActivityItem key={item.id} activity={item} />
            ))}
          </div>
        </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBell className="text-xl" />
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>
            <div className="space-y-4">
              <SettingToggle
                label="Session Reminders"
                description="Get notified before scheduled sessions"
                checked={settings.sessionReminders}
                onChange={(value) => handleSettingToggle('sessionReminders', value)}
              />
              <SettingToggle
                label="Study Plan Updates"
                description="Receive personalized study recommendations"
                checked={settings.studyPlanUpdates}
                onChange={(value) => handleSettingToggle('studyPlanUpdates', value)}
              />
              <SettingToggle
                label="Achievement Notifications"
                description="Be notified when you unlock achievements"
                checked={settings.achievementNotifications}
                onChange={(value) => handleSettingToggle('achievementNotifications', value)}
              />
            </div>
          </div>

            {/* Privacy */}
            <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaLock className="text-xl" />
              <h2 className="text-xl font-bold text-gray-900">Privacy</h2>
            </div>
            <div className="space-y-4">
              <SettingToggle
                label="Profile Visibility"
                description="Allow other users to see your profile"
                checked={settings.profileVisibility}
                onChange={(value) => handleSettingToggle('profileVisibility', value)}
              />
              <SettingToggle
                label="Session History"
                description="Show your tutoring history to potential students"
                checked={settings.sessionHistory}
                onChange={(value) => handleSettingToggle('sessionHistory', value)}
              />
            </div>
          </div>

            {/* Appearance */}
            <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaPalette className="text-xl" />
              <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingToggle('theme', e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={displayUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}

// Edit Profile Modal Component
function EditProfileModal({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [subjects, setSubjects] = useState([...user.subjects]);
  const [newSubject, setNewSubject] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Common subject suggestions
  const subjectSuggestions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Computer Science', 'English', 'History', 'Geography',
    'Economics', 'Psychology', 'Philosophy', 'Art',
    'Music', 'Spanish', 'French', 'German'
  ].filter(s => !subjects.includes(s));

  const handleAddSubject = (subject) => {
    const trimmedSubject = subject.trim();
    if (trimmedSubject && !subjects.includes(trimmedSubject)) {
      setSubjects([...subjects, trimmedSubject]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setSubjects(subjects.filter(s => s !== subjectToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Name cannot be empty');
      return;
    }

    if (subjects.length === 0) {
      alert('Please add at least one subject');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), subjects });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Subjects Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Interests *
            </label>
            
            {/* Current Subjects */}
            <div className="flex flex-wrap gap-2 mb-3">
              {subjects.map((subject, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 text-sm rounded-full"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Subject */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubject(newSubject);
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type a subject and press Enter"
              />
              <button
                type="button"
                onClick={() => handleAddSubject(newSubject)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FaPlus /> Add
              </button>
            </div>

            {/* Subject Suggestions */}
            {subjectSuggestions.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {subjectSuggestions.slice(0, 8).map((subject, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddSubject(subject)}
                      className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-gray-200 transition"
                    >
                      + {subject}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-center">
      <Icon className="text-3xl mx-auto mb-2" />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Progress Bar Component
function ProgressBar({ subject, progress }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{subject}</span>
        <span className="text-sm font-medium text-gray-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity }) {
  const IconComponent = activity.icon;
  return (
    <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <IconComponent className="text-3xl" />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{activity.title}</h3>
        <p className="text-sm text-gray-600">{activity.getRelativeTime()}</p>
      </div>
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }) {
  const isUnlocked = achievement.isUnlocked;
  const IconComponent = achievement.icon;
  
  return (
    <div className={`p-4 rounded-lg border-2 ${
      isUnlocked 
        ? 'bg-green-50 border-green-200' 
        : 'bg-gray-50 border-gray-200 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${!isUnlocked && 'grayscale'}`}>
          <IconComponent />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">{achievement.name}</h3>
          <p className="text-sm text-gray-600">{achievement.description}</p>
          {!isUnlocked && (
            <div className="mt-2">
              <div className="text-xs text-gray-600 mb-1">
                Progress: {achievement.progress}/{achievement.target}
              </div>
              <div className="w-full bg-gray-300 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${achievement.getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Setting Toggle Component
function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div>
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-black' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
