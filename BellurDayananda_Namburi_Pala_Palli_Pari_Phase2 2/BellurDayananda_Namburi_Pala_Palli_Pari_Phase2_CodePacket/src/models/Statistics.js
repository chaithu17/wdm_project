/**
 * Statistics Model
 * Represents user learning statistics
 */

export class Statistics {
  constructor({
    userId = null,
    totalSessions = 0,
    studyHours = 0,
    achievements = 0,
    dayStreak = 0,
    lastUpdated = new Date()
  } = {}) {
    this.userId = userId;
    this.totalSessions = totalSessions;
    this.studyHours = studyHours;
    this.achievements = achievements;
    this.dayStreak = dayStreak;
    this.lastUpdated = lastUpdated;
  }

  toJSON() {
    return {
      user_id: this.userId,
      total_sessions: this.totalSessions,
      study_hours: this.studyHours,
      achievements: this.achievements,
      day_streak: this.dayStreak,
      last_updated: this.lastUpdated.toISOString()
    };
  }

  static fromJSON(json) {
    return new Statistics({
      userId: json.user_id,
      totalSessions: json.total_sessions,
      studyHours: json.study_hours,
      achievements: json.achievements,
      dayStreak: json.day_streak,
      lastUpdated: new Date(json.last_updated)
    });
  }
}

export default Statistics;
