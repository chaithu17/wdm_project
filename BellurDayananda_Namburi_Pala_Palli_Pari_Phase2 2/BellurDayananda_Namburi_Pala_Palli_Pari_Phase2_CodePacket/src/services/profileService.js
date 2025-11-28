/**
 * Profile Service
 * Handles all profile-related API calls
 */

import apiClient from './api';
import { User, Statistics, LearningProgress, Activity, Achievement, Settings } from '../models';

class ProfileService {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const data = await apiClient.get(`/users/${userId}`);
      return User.fromJSON(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId, updates) {
    try {
      const data = await apiClient.patch(`/users/${userId}`, updates);
      return User.fromJSON(data);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    try {
      const data = await apiClient.get(`/users/${userId}/statistics`);
      return Statistics.fromJSON(data);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }

  /**
   * Get learning progress for all subjects
   */
  async getLearningProgress(userId) {
    try {
      const data = await apiClient.get(`/users/${userId}/progress`);
      return data.map(item => LearningProgress.fromJSON(item));
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      throw error;
    }
  }

  /**
   * Update learning progress for a subject
   */
  async updateLearningProgress(userId, subject, progress) {
    try {
      const data = await apiClient.patch(`/users/${userId}/progress/${subject}`, { progress });
      return LearningProgress.fromJSON(data);
    } catch (error) {
      console.error('Error updating learning progress:', error);
      throw error;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivity(userId, limit = 10) {
    try {
      const data = await apiClient.get(`/users/${userId}/activity`, { limit });
      return data.map(item => Activity.fromJSON(item));
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId) {
    try {
      const data = await apiClient.get(`/users/${userId}/achievements`);
      return data.map(item => Achievement.fromJSON(item));
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId) {
    try {
      const data = await apiClient.get(`/users/${userId}/settings`);
      return Settings.fromJSON(data);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId, settings) {
    try {
      const data = await apiClient.patch(`/users/${userId}/settings`, settings);
      return Settings.fromJSON(data);
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  /**
   * Get complete profile data (all sections)
   */
  async getCompleteProfile(userId) {
    try {
      const [user, statistics, progress, activity, achievements, settings] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserStatistics(userId),
        this.getLearningProgress(userId),
        this.getUserActivity(userId),
        this.getUserAchievements(userId),
        this.getUserSettings(userId),
      ]);

      return {
        user,
        statistics,
        progress,
        activity,
        achievements,
        settings,
      };
    } catch (error) {
      console.error('Error fetching complete profile:', error);
      throw error;
    }
  }
}

// Create singleton instance
const profileService = new ProfileService();

export default profileService;
