/**
 * User Model
 * Represents a user profile in the peer tutoring platform
 */

export class User {
  constructor({
    id = null,
    name = '',
    email = '',
    avatar = null,
    role = 'student', // 'student', 'tutor', 'student-tutor'
    rating = 0,
    bio = '',
    subjects = [],
    joinedDate = new Date(),
    lastActive = new Date()
  } = {}) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.avatar = avatar;
    this.role = role;
    this.rating = rating;
    this.bio = bio;
    this.subjects = subjects;
    this.joinedDate = joinedDate;
    this.lastActive = lastActive;
  }

  // Convert to database format
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      role: this.role,
      rating: this.rating,
      bio: this.bio,
      subjects: this.subjects,
      joined_date: this.joinedDate.toISOString(),
      last_active: this.lastActive.toISOString()
    };
  }

  // Create from database format
  static fromJSON(json) {
    return new User({
      id: json.id,
      name: json.name,
      email: json.email,
      avatar: json.avatar,
      role: json.role,
      rating: json.rating,
      bio: json.bio,
      subjects: json.subjects || [],
      joinedDate: new Date(json.joined_date),
      lastActive: new Date(json.last_active)
    });
  }
}

export default User;
