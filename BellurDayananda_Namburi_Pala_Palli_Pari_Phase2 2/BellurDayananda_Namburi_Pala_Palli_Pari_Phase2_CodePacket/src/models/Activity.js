/**
 * Activity Model
 * Represents user activity/history entries
 */

export class Activity {
  constructor({
    id = null,
    userId = null,
    type = '', // 'session', 'upload', 'achievement', 'tutoring'
    title = '',
    description = '',
    icon = '',
    timestamp = new Date(),
    metadata = {}
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.title = title;
    this.description = description;
    this.icon = icon;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.userId,
      type: this.type,
      title: this.title,
      description: this.description,
      icon: this.icon,
      timestamp: this.timestamp.toISOString(),
      metadata: JSON.stringify(this.metadata)
    };
  }

  static fromJSON(json) {
    return new Activity({
      id: json.id,
      userId: json.user_id,
      type: json.type,
      title: json.title,
      description: json.description,
      icon: json.icon,
      timestamp: new Date(json.timestamp),
      metadata: typeof json.metadata === 'string' ? JSON.parse(json.metadata) : json.metadata
    });
  }

  // Helper method to get relative time
  getRelativeTime() {
    const now = new Date();
    const diff = now - this.timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
}

export default Activity;
