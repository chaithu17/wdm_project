/**
 * Settings Model
 * Represents user preferences and settings
 */

export class Settings {
  constructor({
    userId = null,
    // Notifications
    sessionReminders = true,
    studyPlanUpdates = true,
    achievementNotifications = true,
    // Privacy
    profileVisibility = true,
    sessionHistory = true,
    // Appearance
    theme = 'system', // 'light', 'dark', 'system'
    // Other
    language = 'en',
    timezone = 'UTC',
    lastUpdated = new Date()
  } = {}) {
    this.userId = userId;
    this.sessionReminders = sessionReminders;
    this.studyPlanUpdates = studyPlanUpdates;
    this.achievementNotifications = achievementNotifications;
    this.profileVisibility = profileVisibility;
    this.sessionHistory = sessionHistory;
    this.theme = theme;
    this.language = language;
    this.timezone = timezone;
    this.lastUpdated = lastUpdated;
  }

  toJSON() {
    return {
      user_id: this.userId,
      session_reminders: this.sessionReminders,
      study_plan_updates: this.studyPlanUpdates,
      achievement_notifications: this.achievementNotifications,
      profile_visibility: this.profileVisibility,
      session_history: this.sessionHistory,
      theme: this.theme,
      language: this.language,
      timezone: this.timezone,
      last_updated: this.lastUpdated.toISOString()
    };
  }

  static fromJSON(json) {
    return new Settings({
      userId: json.user_id,
      sessionReminders: json.session_reminders,
      studyPlanUpdates: json.study_plan_updates,
      achievementNotifications: json.achievement_notifications,
      profileVisibility: json.profile_visibility,
      sessionHistory: json.session_history,
      theme: json.theme,
      language: json.language,
      timezone: json.timezone,
      lastUpdated: new Date(json.last_updated)
    });
  }
}

export default Settings;
