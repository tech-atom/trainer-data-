/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from "mysql2/promise";
import { TRAINERS, type Trainer } from "./trainers";

export const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "12345",
  database: process.env.MYSQL_DATABASE || "atom_trainer_hub",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: mysql.Pool | null = null;
let isInitialized = false;

export function getDbPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function initializeDatabase() {
  if (isInitialized) return;

  try {
    // 1. Ensure database exists
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await rootConn.end();

    const db = getDbPool();

    // 2. Create trainers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS trainers (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255) NOT NULL,
        photo TEXT,
        phone VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50),
        email VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        organization VARCHAR(255),
        experience DECIMAL(4,1) DEFAULT 0,
        training_experience DECIMAL(4,1) DEFAULT 0,
        trainer_type VARCHAR(100) NOT NULL DEFAULT 'Technical Trainer',
        employment VARCHAR(50) NOT NULL DEFAULT 'Freelance',
        modes JSON,
        availability VARCHAR(50) NOT NULL DEFAULT 'available',
        available_from VARCHAR(50),
        available_until VARCHAR(50),
        rating DECIMAL(3,2) DEFAULT 4.5,
        projects_completed INT DEFAULT 0,
        bio TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Active',
        tags JSON,
        skills JSON,
        soft_skills JSON,
        education JSON,
        certifications JSON,
        trainings JSON,
        notes JSON,
        documents JSON,
        sectors JSON,
        added_on VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Create requirements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS requirements (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        client VARCHAR(255) NOT NULL,
        skills JSON,
        min_experience INT DEFAULT 0,
        location VARCHAR(100) NOT NULL,
        mode VARCHAR(50) NOT NULL,
        required_trainers INT DEFAULT 1,
        start_date VARCHAR(50),
        end_date VARCHAR(50),
        daily_hours INT DEFAULT 6,
        sector VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Open',
        assigned_trainer_ids JSON,
        notes TEXT,
        created_on VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create admin_users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create skill_categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS skill_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        skills JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Create activity_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(100) PRIMARY KEY,
        user_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        action VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        timestamp VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);


    // Check if admin user exists; if not, seed admin
    const [adminRows]: [any[], any] = await db.query(
      "SELECT COUNT(*) as count FROM admin_users WHERE email = ?",
      ["Trainerdata@atomm.in"],
    );
    if (adminRows[0].count === 0) {
      await db.query("INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)", [
        "ATOM Administrator",
        "Trainerdata@atomm.in",
        "atom@2020",
        "Admin",
      ]);
      console.log("Seeded Admin user into MySQL (Trainerdata@atomm.in / atom@2020).");
    }

    isInitialized = true;
    console.log("MySQL Database atom_trainer_hub initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize MySQL Database:", error);
    throw error;
  }
}

export function mapTrainerFromDb(row: any): Trainer {
  return {
    id: String(row.id),
    code: row.code,
    name: row.name,
    designation: row.designation,
    photo:
      row.photo ||
      `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(row.name)}`,
    phone: row.phone,
    whatsapp: row.whatsapp || row.phone,
    email: row.email,
    city: row.city,
    state: row.state,
    country: row.country || "India",
    organization: row.organization || "",
    experience: Number(row.experience) || 0,
    trainingExperience: Number(row.training_experience) || 0,
    trainerType: row.trainer_type,
    employment: row.employment,
    modes:
      typeof row.modes === "string" ? JSON.parse(row.modes) : row.modes || ["Online", "Offline"],
    availability: row.availability || "available",
    availableFrom: row.available_from || undefined,
    availableUntil: row.available_until || undefined,
    rating: Number(row.rating) || 4.5,
    projectsCompleted: Number(row.projects_completed) || 0,
    bio: row.bio || "",
    status: row.status || "Active",
    tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags || [],
    skills: typeof row.skills === "string" ? JSON.parse(row.skills) : row.skills || [],
    softSkills:
      typeof row.soft_skills === "string" ? JSON.parse(row.soft_skills) : row.soft_skills || [],
    education: typeof row.education === "string" ? JSON.parse(row.education) : row.education || [],
    certifications:
      typeof row.certifications === "string"
        ? JSON.parse(row.certifications)
        : row.certifications || [],
    trainings: typeof row.trainings === "string" ? JSON.parse(row.trainings) : row.trainings || [],
    notes: typeof row.notes === "string" ? JSON.parse(row.notes) : row.notes || [],
    documents: typeof row.documents === "string" ? JSON.parse(row.documents) : row.documents || [],
    sectors:
      typeof row.sectors === "string"
        ? JSON.parse(row.sectors)
        : row.sectors || ["College", "Corporate"],
    addedOn: row.added_on || new Date().toISOString().split("T")[0],
  };
}

export async function insertTrainerRow(db: mysql.Pool | mysql.Connection, t: Trainer) {
  const query = `
    INSERT INTO trainers (
      id, code, name, designation, photo, phone, whatsapp, email,
      city, state, country, organization, experience, training_experience,
      trainer_type, employment, modes, availability, available_from, available_until,
      rating, projects_completed, bio, status, tags, skills, soft_skills,
      education, certifications, trainings, notes, documents, sectors, added_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      designation = VALUES(designation),
      phone = VALUES(phone),
      whatsapp = VALUES(whatsapp),
      email = VALUES(email),
      city = VALUES(city),
      state = VALUES(state),
      organization = VALUES(organization),
      experience = VALUES(experience),
      training_experience = VALUES(training_experience),
      trainer_type = VALUES(trainer_type),
      employment = VALUES(employment),
      modes = VALUES(modes),
      availability = VALUES(availability),
      available_from = VALUES(available_from),
      available_until = VALUES(available_until),
      rating = VALUES(rating),
      projects_completed = VALUES(projects_completed),
      bio = VALUES(bio),
      status = VALUES(status),
      tags = VALUES(tags),
      skills = VALUES(skills),
      soft_skills = VALUES(soft_skills),
      education = VALUES(education),
      certifications = VALUES(certifications),
      trainings = VALUES(trainings),
      notes = VALUES(notes),
      documents = VALUES(documents),
      sectors = VALUES(sectors)
  `;

  const values = [
    t.id,
    t.code,
    t.name,
    t.designation,
    t.photo,
    t.phone,
    t.whatsapp || t.phone,
    t.email,
    t.city,
    t.state || "Karnataka",
    t.country || "India",
    t.organization || "",
    t.experience || 0,
    t.trainingExperience || 0,
    t.trainerType || "Technical Trainer",
    t.employment || "Freelance",
    JSON.stringify(t.modes || ["Online", "Offline"]),
    t.availability || "available",
    t.availableFrom || null,
    t.availableUntil || null,
    t.rating || 4.5,
    t.projectsCompleted || 0,
    t.bio || "",
    t.status || "Active",
    JSON.stringify(t.tags || []),
    JSON.stringify(t.skills || []),
    JSON.stringify(t.softSkills || []),
    JSON.stringify(t.education || []),
    JSON.stringify(t.certifications || []),
    JSON.stringify(t.trainings || []),
    JSON.stringify(t.notes || []),
    JSON.stringify(t.documents || []),
    JSON.stringify(t.sectors || ["College", "Corporate"]),
    t.addedOn || new Date().toISOString().split("T")[0],
  ];

  await db.query(query, values);
}
