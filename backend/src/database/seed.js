import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('pass123', 10);

    // Insert default subjects
    const subjectsQuery = `
      INSERT INTO subjects (name, category, description) VALUES
      ('Mathematics', 'STEM', 'Advanced mathematics including calculus and algebra'),
      ('Physics', 'STEM', 'Classical and modern physics'),
      ('Chemistry', 'STEM', 'Organic and inorganic chemistry'),
      ('Computer Science', 'STEM', 'Programming and algorithms'),
      ('English', 'Language', 'English language and literature'),
      ('Biology', 'STEM', 'Life sciences and biology'),
      ('History', 'Humanities', 'World and regional history'),
      ('Economics', 'Social Science', 'Micro and macroeconomics'),
      ('Statistics', 'STEM', 'Statistical analysis and probability'),
      ('Spanish', 'Language', 'Spanish language'),
      ('French', 'Language', 'French language'),
      ('Philosophy', 'Humanities', 'Philosophy and logic')
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `;

    const subjectsResult = await pool.query(subjectsQuery);
    console.log(`✅ Inserted ${subjectsResult.rowCount} subjects`);

    // Insert admin user
    const adminQuery = `
      INSERT INTO users (email, password_hash, full_name, role, bio, is_verified, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `;

    const adminResult = await pool.query(adminQuery, [
      'admin@email.com',
      adminPassword,
      'System Administrator',
      'admin',
      'Platform administrator',
      true,
      true
    ]);

    if (adminResult.rowCount > 0) {
      console.log('✅ Created admin user (admin@email.com / pass123)');
    }

    // Insert sample students
    const studentQuery = `
      INSERT INTO users (email, password_hash, full_name, role, bio, is_verified, is_active)
      VALUES
      ($1, $2, 'John Student', 'student', 'Computer Science student', true, true),
      ($3, $4, 'Jane Learner', 'student', 'Mathematics enthusiast', true, true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `;

    const studentResult = await pool.query(studentQuery, [
      'student@email.com',
      hashedPassword,
      'student2@email.com',
      hashedPassword
    ]);

    console.log(`✅ Created ${studentResult.rowCount} student users`);

    // Insert sample tutors
    const tutorQuery = `
      INSERT INTO users (email, password_hash, full_name, role, bio, is_verified, is_active)
      VALUES
      ($1, $2, 'Dr. Sarah Smith', 'tutor', 'Mathematics PhD with 10 years of teaching experience', true, true),
      ($3, $4, 'Prof. Michael Chen', 'tutor', 'Computer Science professor specializing in AI', true, true),
      ($5, $6, 'Emma Williams', 'both', 'Physics tutor and lifelong learner', true, true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email;
    `;

    const tutorResult = await pool.query(tutorQuery, [
      'tutor@email.com',
      hashedPassword,
      'tutor2@email.com',
      hashedPassword,
      'both@email.com',
      hashedPassword
    ]);

    console.log(`✅ Created ${tutorResult.rowCount} tutor users`);

    // Create tutor profiles for tutors
    if (tutorResult.rows.length > 0) {
      for (const tutor of tutorResult.rows) {
        await pool.query(`
          INSERT INTO tutor_profiles (user_id, hourly_rate, rating, total_reviews, years_experience, is_verified, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (user_id) DO NOTHING
        `, [tutor.id, 25.00, 4.8, 15, 5, true, 'approved']);
      }
      console.log('✅ Created tutor profiles');
    }

    // Insert sample achievements
    const achievementsQuery = `
      INSERT INTO achievements (name, description, icon, criteria) VALUES
      ('First Session', 'Completed your first tutoring session', 'star', '{"sessions": 1}'),
      ('Quick Learner', 'Completed 10 sessions', 'trophy', '{"sessions": 10}'),
      ('Dedicated Student', 'Studied for 50 hours', 'book', '{"hours": 50}'),
      ('Top Performer', 'Maintained 90% average', 'medal', '{"average": 90}'),
      ('Consistent Learner', '30 day streak', 'fire', '{"streak_days": 30}')
      ON CONFLICT DO NOTHING
      RETURNING id;
    `;

    const achievementsResult = await pool.query(achievementsQuery);
    console.log(`✅ Created ${achievementsResult.rowCount} achievements`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@email.com / pass123');
    console.log('   Student: student@email.com / password123');
    console.log('   Tutor: tutor@email.com / password123');
    console.log('   Both: both@email.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
