/**
 * Mock Data for Profile Page
 * Use this for development and testing before connecting to real database
 */

import { User, Statistics, LearningProgress, Activity, Achievement, Settings } from '../models';
import { FaBook, FaFileAlt, FaTrophy, FaUsers, FaBullseye, FaHandshake, FaFire, FaBookOpen, FaStar, FaDumbbell } from 'react-icons/fa';

// Mock User Data
export const mockUser = new User({
  id: '1',
  name: 'Alex Johnson',
  email: 'sd@gmail.com',
  avatar: null,
  role: 'student-tutor',
  rating: 4.8,
  bio: 'Passionate about helping others learn and grow!',
  subjects: ['Mathematics', 'Physics', 'Computer Science'],
  joinedDate: new Date('2024-01-15'),
  lastActive: new Date()
});

// Mock Statistics Data
export const mockStatistics = new Statistics({
  userId: '1',
  totalSessions: 47,
  studyHours: 156,
  achievements: 12,
  dayStreak: 15,
  lastUpdated: new Date()
});

// Mock Learning Progress Data
export const mockLearningProgress = [
  new LearningProgress({
    id: '1',
    userId: '1',
    subject: 'Mathematics',
    progress: 85,
    lastUpdated: new Date()
  }),
  new LearningProgress({
    id: '2',
    userId: '1',
    subject: 'Physics',
    progress: 72,
    lastUpdated: new Date()
  }),
  new LearningProgress({
    id: '3',
    userId: '1',
    subject: 'Computer Science',
    progress: 91,
    lastUpdated: new Date()
  })
];

// Mock Activity Data
export const mockActivity = [
  new Activity({
    id: '1',
    userId: '1',
    type: 'session',
    title: 'Completed Math tutoring with Sarah',
    description: '2 hours ago',
    icon: FaBook,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { subject: 'Mathematics', duration: 60 }
  }),
  new Activity({
    id: '2',
    userId: '1',
    type: 'upload',
    title: 'Uploaded Chemistry notes',
    description: '1 day ago',
    icon: FaFileAlt,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    metadata: { fileName: 'chemistry_chapter_3.pdf' }
  }),
  new Activity({
    id: '3',
    userId: '1',
    type: 'achievement',
    title: 'Unlocked "Helper" achievement',
    description: '2 days ago',
    icon: FaTrophy,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    metadata: { achievementId: '2' }
  }),
  new Activity({
    id: '4',
    userId: '1',
    type: 'tutoring',
    title: 'Tutored Physics to 3 students',
    description: '3 days ago',
    icon: FaUsers,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    metadata: { studentCount: 3, subject: 'Physics' }
  })
];

// Mock Achievements Data
export const mockAchievements = [
  new Achievement({
    id: '1',
    name: 'First Steps',
    description: 'Completed your first tutoring session',
    icon: FaBullseye,
    category: 'milestone',
    requirement: 'Complete 1 tutoring session',
    isUnlocked: true,
    unlockedDate: new Date('2024-01-20'),
    progress: 1,
    target: 1
  }),
  new Achievement({
    id: '2',
    name: 'Helper',
    description: 'Helped 10 students as a tutor',
    icon: FaHandshake,
    category: 'tutoring',
    requirement: 'Help 10 students',
    isUnlocked: true,
    unlockedDate: new Date('2024-03-15'),
    progress: 10,
    target: 10
  }),
  new Achievement({
    id: '3',
    name: 'Study Streak',
    description: '7 days of consistent studying',
    icon: FaFire,
    category: 'streak',
    requirement: 'Study for 7 consecutive days',
    isUnlocked: true,
    unlockedDate: new Date('2024-05-01'),
    progress: 7,
    target: 7
  }),
  new Achievement({
    id: '4',
    name: 'Knowledge Seeker',
    description: 'Completed 25 study sessions',
    icon: FaBookOpen,
    category: 'learning',
    requirement: 'Complete 25 study sessions',
    isUnlocked: false,
    unlockedDate: null,
    progress: 18,
    target: 25
  }),
  new Achievement({
    id: '5',
    name: 'Master Tutor',
    description: 'Maintain 4.5+ rating for 20 sessions',
    icon: FaStar,
    category: 'tutoring',
    requirement: 'Maintain 4.5+ rating for 20 sessions',
    isUnlocked: false,
    unlockedDate: null,
    progress: 15,
    target: 20
  }),
  new Achievement({
    id: '6',
    name: 'Dedicated Learner',
    description: '30-day study streak',
    icon: FaDumbbell,
    category: 'streak',
    requirement: 'Study for 30 consecutive days',
    isUnlocked: false,
    unlockedDate: null,
    progress: 15,
    target: 30
  })
];

// Mock Settings Data
export const mockSettings = new Settings({
  userId: '1',
  sessionReminders: true,
  studyPlanUpdates: true,
  achievementNotifications: false,
  profileVisibility: true,
  sessionHistory: true,
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  lastUpdated: new Date()
});

// Complete Mock Profile Data
export const mockProfileData = {
  user: mockUser,
  statistics: mockStatistics,
  progress: mockLearningProgress,
  activity: mockActivity,
  achievements: mockAchievements,
  settings: mockSettings
};

export default mockProfileData;
