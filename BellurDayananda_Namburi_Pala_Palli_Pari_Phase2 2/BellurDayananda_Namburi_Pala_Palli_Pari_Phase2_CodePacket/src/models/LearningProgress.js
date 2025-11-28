/**
 * Learning Progress Model
 * Represents progress in different subjects
 */

export class LearningProgress {
  constructor({
    id = null,
    userId = null,
    subject = '',
    progress = 0, // 0-100 percentage
    lastUpdated = new Date()
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.subject = subject;
    this.progress = Math.min(100, Math.max(0, progress)); // Ensure 0-100
    this.lastUpdated = lastUpdated;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      subject: this.subject,
      progress: this.progress,
      last_updated: this.lastUpdated.toISOString()
    };
  }

  static fromJSON(json) {
    return new LearningProgress({
      id: json.id,
      userId: json.user_id,
      subject: json.subject,
      progress: json.progress,
      lastUpdated: new Date(json.last_updated)
    });
  }
}

export default LearningProgress;
