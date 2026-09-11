import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "12345",
  database: process.env.MYSQL_DATABASE || "atom_trainer_hub",
};

async function main() {
  console.log("Connecting to MySQL on localhost:3306 with user 'root'...");
  const rootConn = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`Database '${dbConfig.database}' is ready.`);
  await rootConn.end();

  const db = await mysql.createConnection(dbConfig);

  console.log("Creating tables...");
  // 1. trainers
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

  // 2. requirements
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

  // 3. admin_users
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

  // Seed Admin user
  const [adminRows] = await db.query("SELECT COUNT(*) as count FROM admin_users WHERE email = ?", [
    "Trainerdata@atomm.in",
  ]);
  if (adminRows[0].count === 0) {
    await db.query("INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)", [
      "ATOM Administrator",
      "Trainerdata@atomm.in",
      "atom@2020",
      "Admin",
    ]);
    console.log("Admin user seeded in MySQL: Trainerdata@atomm.in");
  }

  // 4. Check trainers count
  const [trainerCount] = await db.query("SELECT COUNT(*) as count FROM trainers");
  console.log(`Current trainers in MySQL: ${trainerCount[0].count}`);

  await db.end();
  console.log("Database and tables initialized successfully!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
