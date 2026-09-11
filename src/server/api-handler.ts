/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from "mysql2/promise";
import {
  dbConfig,
  getDbPool,
  initializeDatabase,
  mapTrainerFromDb,
  insertTrainerRow,
} from "../lib/db";
import { TRAINERS, type Trainer } from "../lib/trainers";

export async function handleApiRequest(
  method: string,
  urlPath: string,
  body: any,
): Promise<{ status: number; data: any; headers?: Record<string, string> }> {
  try {
    await initializeDatabase();
    const db = getDbPool();

    const cleanPath = urlPath.split("?")[0];

    // 1. Health check
    if (cleanPath === "/api/health") {
      const [rows]: [any[], any] = await db.query("SELECT COUNT(*) as count FROM trainers");
      return {
        status: 200,
        data: {
          status: "connected",
          database: dbConfig.database,
          host: dbConfig.host,
          user: dbConfig.user,
          trainerCount: rows[0]?.count || 0,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // 2. Auth Login
    if (cleanPath === "/api/auth/login" && method === "POST") {
      const { email, password } = body || {};
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPass = (password || "").trim();

      const [rows]: [any[], any] = await db.query(
        "SELECT id, name, email, role FROM admin_users WHERE LOWER(email) = ? AND password = ?",
        [cleanEmail, cleanPass],
      );

      if (rows.length > 0) {
        return {
          status: 200,
          data: {
            success: true,
            user: {
              name: rows[0].name,
              email: rows[0].email,
              role: rows[0].role,
            },
          },
        };
      }
      return {
        status: 401,
        data: { success: false, error: "Invalid username or password" },
      };
    }

    // 3. Trainers CRUD
    if (cleanPath === "/api/trainers" && method === "GET") {
      const [rows]: [any[], any] = await db.query(
        "SELECT * FROM trainers ORDER BY created_at DESC",
      );
      const trainers = rows.map(mapTrainerFromDb);
      return { status: 200, data: trainers };
    }

    if (cleanPath === "/api/trainers" && method === "POST") {
      const data = body as Omit<Trainer, "id" | "code"> & { id?: string; code?: string };
      const [countRows]: [any[], any] = await db.query("SELECT COUNT(*) as count FROM trainers");
      const nextCount = (countRows[0]?.count || 0) + 1;

      const nextId = data.id || String(Date.now());
      const nextCode = data.code || `ATM-T-${String(nextCount).padStart(3, "0")}`;

      const newTrainer: Trainer = {
        ...data,
        id: nextId,
        code: nextCode,
        status: data.status || "Active",
        rating: data.rating || 4.5,
        projectsCompleted: data.projectsCompleted || 0,
        addedOn: data.addedOn || new Date().toISOString().split("T")[0],
        photo:
          data.photo ||
          `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(data.name)}`,
        modes: data.modes || ["Online", "Offline"],
        tags: data.tags || [],
        skills: data.skills || [],
        softSkills: data.softSkills || [],
        education: data.education || [],
        certifications: data.certifications || [],
        trainings: data.trainings || [],
        notes: data.notes || [],
        documents: data.documents || [],
        sectors: data.sectors || ["College", "Corporate"],
      };

      await insertTrainerRow(db, newTrainer);

      // Log activity
      await db.query(
        "INSERT INTO activity_logs (id, user_name, role, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "act-" + Date.now(),
          "ATOM Administrator",
          "Admin",
          "Trainer Added",
          `Added trainer ${newTrainer.name} (${newTrainer.designation}) to MySQL`,
          "Just now",
        ],
      );

      return { status: 201, data: newTrainer };
    }

    // Bulk Trainers Import
    if (cleanPath === "/api/trainers/bulk" && method === "POST") {
      const items = Array.isArray(body) ? body : body?.trainers || [];
      const [countRows]: [any[], any] = await db.query("SELECT COUNT(*) as count FROM trainers");
      let currentCount = countRows[0]?.count || 0;

      const savedTrainers: Trainer[] = [];

      for (let i = 0; i < items.length; i++) {
        const data = items[i];
        currentCount++;
        const nextId = data.id || `bulk-${Date.now()}-${i}`;
        const nextCode = data.code || `ATM-T-${String(currentCount).padStart(3, "0")}`;

        const newTrainer: Trainer = {
          ...data,
          id: nextId,
          code: nextCode,
          status: data.status || "Active",
          rating: data.rating || 4.5,
          projectsCompleted: data.projectsCompleted || 0,
          addedOn: data.addedOn || new Date().toISOString().split("T")[0],
          photo:
            data.photo ||
            `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(data.name)}`,
          modes: data.modes || ["Online", "Offline"],
          tags: data.tags || ["Bulk Import"],
          skills: data.skills || [],
          softSkills: data.softSkills || [],
          education: data.education || [],
          certifications: data.certifications || [],
          trainings: data.trainings || [],
          notes: data.notes || [],
          documents: data.documents || [],
          sectors: data.sectors || ["College", "Corporate"],
        };

        await insertTrainerRow(db, newTrainer);
        savedTrainers.push(newTrainer);
      }

      // Log bulk import activity
      if (savedTrainers.length > 0) {
        await db.query(
          "INSERT INTO activity_logs (id, user_name, role, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
          [
            "act-" + Date.now(),
            "ATOM Administrator",
            "Admin",
            "Bulk Trainer Import",
            `Bulk imported ${savedTrainers.length} trainer profiles into MySQL database`,
            "Just now",
          ],
        );
      }

      return {
        status: 201,
        data: { success: true, count: savedTrainers.length, trainers: savedTrainers },
      };
    }

    // Single trainer operations: /api/trainers/:id/...
    const trainerSubMatch = cleanPath.match(
      /^\/api\/trainers\/([^/]+)(\/(rating|availability|notes|documents))?$/,
    );
    if (trainerSubMatch) {
      const trainerId = decodeURIComponent(trainerSubMatch[1]);
      const subAction = trainerSubMatch[3];

      // GET single trainer
      if (!subAction && method === "GET") {
        const [rows]: [any[], any] = await db.query("SELECT * FROM trainers WHERE id = ?", [
          trainerId,
        ]);
        if (rows.length === 0) {
          return { status: 404, data: { error: "Trainer not found" } };
        }
        return { status: 200, data: mapTrainerFromDb(rows[0]) };
      }

      // DELETE trainer
      if (!subAction && method === "DELETE") {
        await db.query("DELETE FROM trainers WHERE id = ?", [trainerId]);
        return {
          status: 200,
          data: { success: true, message: `Trainer ${trainerId} deleted from MySQL` },
        };
      }

      // PUT update trainer
      if (!subAction && method === "PUT") {
        const updates = body as Partial<Trainer>;
        const [rows]: [any[], any] = await db.query("SELECT * FROM trainers WHERE id = ?", [
          trainerId,
        ]);
        if (rows.length === 0) {
          return { status: 404, data: { error: "Trainer not found" } };
        }
        const current = mapTrainerFromDb(rows[0]);
        const merged: Trainer = { ...current, ...updates, id: trainerId };
        await insertTrainerRow(db, merged);
        return { status: 200, data: merged };
      }

      // POST /api/trainers/:id/rating
      if (subAction === "rating" && method === "POST") {
        const rating = body;
        const [rows]: [any[], any] = await db.query("SELECT * FROM trainers WHERE id = ?", [
          trainerId,
        ]);
        if (rows.length === 0) {
          return { status: 404, data: { error: "Trainer not found" } };
        }
        const target = mapTrainerFromDb(rows[0]);
        const currentTotal = target.rating * target.projectsCompleted;
        const nextCompleted = target.projectsCompleted + 1;
        const nextRating = Number(((currentTotal + rating.overall) / nextCompleted).toFixed(2));

        const newTrainingEntry = {
          client: rating.project || "ATOM Client Project",
          program: rating.project || "Corporate Training",
          tech: target.skills
            .slice(0, 2)
            .map((s) => s.name)
            .join(", "),
          students: 35,
          days: 5,
          location: target.city,
          mode: target.modes[0] || "Offline",
          year: new Date().getFullYear(),
          rating: rating.overall,
        };

        const updatedTrainings = [newTrainingEntry, ...target.trainings];
        const updatedNotes = rating.comments
          ? [
              {
                note: `[Project Feedback - ${rating.project}]: ${rating.comments} (Rating: ${rating.overall}/5)`,
                by: "Admin",
                date: new Date().toISOString().split("T")[0],
              },
              ...target.notes,
            ]
          : target.notes;

        const updatedTrainer: Trainer = {
          ...target,
          rating: nextRating,
          projectsCompleted: nextCompleted,
          trainings: updatedTrainings,
          notes: updatedNotes,
        };

        await insertTrainerRow(db, updatedTrainer);
        return { status: 200, data: updatedTrainer };
      }

      // PUT /api/trainers/:id/availability
      if (subAction === "availability" && method === "PUT") {
        const { availability, dates } = body || {};
        const [rows]: [any[], any] = await db.query("SELECT * FROM trainers WHERE id = ?", [
          trainerId,
        ]);
        if (rows.length === 0) {
          return { status: 404, data: { error: "Trainer not found" } };
        }
        const target = mapTrainerFromDb(rows[0]);
        const updatedTrainer: Trainer = {
          ...target,
          availability: availability || target.availability,
          availableFrom: dates?.from !== undefined ? dates.from : target.availableFrom,
          availableUntil: dates?.until !== undefined ? dates.until : target.availableUntil,
        };

        await insertTrainerRow(db, updatedTrainer);
        return { status: 200, data: updatedTrainer };
      }

      // POST /api/trainers/:id/notes
      if (subAction === "notes" && method === "POST") {
        const { note } = body || {};
        const [rows]: [any[], any] = await db.query("SELECT * FROM trainers WHERE id = ?", [
          trainerId,
        ]);
        if (rows.length === 0) {
          return { status: 404, data: { error: "Trainer not found" } };
        }
        const target = mapTrainerFromDb(rows[0]);
        const date = new Date().toISOString().split("T")[0];
        const updatedTrainer: Trainer = {
          ...target,
          notes: [{ note: String(note || "").trim(), by: "Admin", date }, ...target.notes],
        };
        await insertTrainerRow(db, updatedTrainer);
        return { status: 200, data: updatedTrainer };
      }
    }

    // 4. Requirements CRUD
    if (cleanPath === "/api/requirements" && method === "GET") {
      const [rows]: [any[], any] = await db.query(
        "SELECT * FROM requirements ORDER BY created_at DESC",
      );
      const reqs = rows.map((r: any) => ({
        id: String(r.id),
        code: r.code,
        title: r.title,
        client: r.client,
        skills: typeof r.skills === "string" ? JSON.parse(r.skills) : r.skills || [],
        minExperience: Number(r.min_experience) || 0,
        location: r.location,
        mode: r.mode,
        requiredTrainers: Number(r.required_trainers) || 1,
        startDate: r.start_date || "",
        endDate: r.end_date || "",
        dailyHours: Number(r.daily_hours) || 6,
        sector: r.sector,
        status: r.status || "Open",
        assignedTrainerIds:
          typeof r.assigned_trainer_ids === "string"
            ? JSON.parse(r.assigned_trainer_ids)
            : r.assigned_trainer_ids || [],
        notes: r.notes || "",
        createdOn: r.created_on || new Date().toISOString().split("T")[0],
      }));
      return { status: 200, data: reqs };
    }

    if (cleanPath === "/api/requirements" && method === "POST") {
      const r = body;
      const [countRows]: [any[], any] = await db.query(
        "SELECT COUNT(*) as count FROM requirements",
      );
      const count = (countRows[0]?.count || 0) + 1;
      const id = r.id || "req-" + Date.now();
      const code = r.code || `REQ-${new Date().getFullYear()}-${String(count).padStart(3, "0")}`;
      const createdOn = r.createdOn || new Date().toISOString().split("T")[0];

      await db.query(
        `INSERT INTO requirements (
          id, code, title, client, skills, min_experience, location, mode,
          required_trainers, start_date, end_date, daily_hours, sector, status,
          assigned_trainer_ids, notes, created_on
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          client = VALUES(client),
          skills = VALUES(skills),
          min_experience = VALUES(min_experience),
          location = VALUES(location),
          mode = VALUES(mode),
          required_trainers = VALUES(required_trainers),
          start_date = VALUES(start_date),
          end_date = VALUES(end_date),
          daily_hours = VALUES(daily_hours),
          sector = VALUES(sector),
          status = VALUES(status),
          assigned_trainer_ids = VALUES(assigned_trainer_ids),
          notes = VALUES(notes)`,
        [
          id,
          code,
          r.title,
          r.client,
          JSON.stringify(r.skills || []),
          r.minExperience || 0,
          r.location || "Bangalore",
          r.mode || "Offline",
          r.requiredTrainers || 1,
          r.startDate || "",
          r.endDate || "",
          r.dailyHours || 6,
          r.sector || "College",
          r.status || "Open",
          JSON.stringify(r.assignedTrainerIds || []),
          r.notes || "",
          createdOn,
        ],
      );

      return {
        status: 201,
        data: {
          ...r,
          id,
          code,
          createdOn,
        },
      };
    }

    // 5. Activity logs
    if (cleanPath === "/api/activity" && method === "GET") {
      const [rows]: [any[], any] = await db.query(
        "SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50",
      );
      const logs = rows.map((l: any) => ({
        id: String(l.id),
        user: l.user_name,
        role: l.role,
        action: l.action,
        details: l.details,
        timestamp: l.timestamp,
      }));
      return { status: 200, data: logs };
    }

    return { status: 404, data: { error: `Endpoint ${cleanPath} not found` } };
  } catch (error: any) {
    console.error("API error:", error);
    return { status: 500, data: { error: error.message || "Internal server error" } };
  }
}
