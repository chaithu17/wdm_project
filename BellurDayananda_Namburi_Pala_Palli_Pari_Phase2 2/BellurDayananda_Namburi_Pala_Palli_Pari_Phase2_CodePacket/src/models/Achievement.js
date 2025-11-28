/**
 * Achievement Model
 * Represents user achievements/badges
 */

export class Achievement {
  constructor({
    id = null,
    name = '',
    description = '',
    icon = '',
    category = '', // 'tutoring', 'learning', 'streak', 'milestone'
    requirement = '',
    isUnlocked = false,
    unlockedDate = null,
    progress = 0, // Current progress towards unlocking
    target = 100 // Target value to unlock
  } = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.category = category;
    this.requirement = requirement;
    this.isUnlocked = isUnlocked;
    this.unlockedDate = unlockedDate;
    this.progress = progress;
    this.target = target;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      category: this.category,
      requirement: this.requirement,
      is_unlocked: this.isUnlocked,
      unlocked_date: this.unlockedDate ? this.unlockedDate.toISOString() : null,
      progress: this.progress,
      target: this.target
    };
  }

  static fromJSON(json) {
    return new Achievement({
      id: json.id,
      name: json.name,
      description: json.description,
      icon: json.icon,
      category: json.category,
      requirement: json.requirement,
      isUnlocked: json.is_unlocked,
      unlockedDate: json.unlocked_date ? new Date(json.unlocked_date) : null,
      progress: json.progress,
      target: json.target
    });
  }

  // Calculate progress percentage
  getProgressPercentage() {
    return Math.min(100, Math.round((this.progress / this.target) * 100));
  }
}

export default Achievement;
