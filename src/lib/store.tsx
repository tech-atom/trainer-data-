import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  TRAINERS as INITIAL_TRAINERS,
  SKILL_ALIASES as INITIAL_ALIASES,
  type Trainer,
  type Availability,
  type TrainerType,
  type Mode,
} from "./trainers";

export interface ProjectRequirement {
  id: string;
  code: string;
  title: string;
  client: string;
  skills: string[];
  minExperience: number;
  location: string;
  mode: Mode;
  requiredTrainers: number;
  startDate: string;
  endDate: string;
  dailyHours: number;
  sector: "College" | "University" | "Corporate" | "School" | "Government";
  status: "Open" | "In Progress" | "Fulfilled" | "Closed";
  assignedTrainerIds: string[];
  notes?: string;
  createdOn: string;
}

export interface SkillCategory {
  category: string;
  skills: { name: string; aliases: string[]; description?: string }[];
}

export const INITIAL_SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Programming & Backend",
    skills: [
      { name: "Java", aliases: ["core java", "java se", "java ee"] },
      { name: "Spring Boot", aliases: ["spring", "spring mvc", "spring cloud"] },
      { name: "Python", aliases: ["py", "python3"] },
      { name: "Django", aliases: ["django rest", "drf"] },
      { name: "C", aliases: ["ansi c"] },
      { name: "C++", aliases: ["cpp", "modern cpp"] },
      { name: "Node.js", aliases: ["node", "express", "backend js"] },
      { name: "SQL", aliases: ["mysql", "postgresql", "oracle", "rdbms"] },
      { name: "Microservices", aliases: ["distributed systems", "rest api"] },
    ],
  },
  {
    category: "Frontend & Full Stack",
    skills: [
      { name: "JavaScript", aliases: ["js", "ecmascript", "vanilla js"] },
      { name: "React", aliases: ["reactjs", "react.js", "next.js"] },
      { name: "Angular", aliases: ["angularjs", "angular 17", "ng"] },
      { name: "MERN", aliases: ["mongo", "express", "react", "node"] },
      { name: "MEAN", aliases: ["mongo", "express", "angular", "node"] },
      { name: "DSA", aliases: ["data structures", "algorithms", "problem solving"] },
    ],
  },
  {
    category: "AI, ML & Data Science",
    skills: [
      { name: "Machine Learning", aliases: ["ml", "scikit-learn"] },
      { name: "AI", aliases: ["artificial intelligence", "deep learning", "gen ai"] },
      { name: "Data Science", aliases: ["data analytics", "data mining"] },
      { name: "Pandas", aliases: ["data manipulation"] },
      { name: "TensorFlow", aliases: ["keras", "pytorch", "deep learning"] },
      { name: "Power BI", aliases: ["business intelligence", "tableau"] },
    ],
  },
  {
    category: "Cloud, DevOps & Security",
    skills: [
      { name: "Cloud", aliases: ["cloud computing"] },
      { name: "AWS", aliases: ["amazon web services", "ec2", "s3", "lambda"] },
      { name: "Azure", aliases: ["microsoft azure", "cloud architecture"] },
      { name: "DevOps", aliases: ["docker", "kubernetes", "ci/cd", "jenkins"] },
      { name: "Cybersecurity", aliases: ["ethical hacking", "infosec", "soc"] },
      { name: "Networking", aliases: ["ccna", "network security", "tcp/ip"] },
      { name: "Linux", aliases: ["redhat", "ubuntu", "shell scripting"] },
    ],
  },
  {
    category: "Core Engineering & Design",
    skills: [
      { name: "VLSI", aliases: ["verilog", "vhdl", "fpga", "asic"] },
      { name: "Embedded Systems", aliases: ["microcontrollers", "arm", "iot"] },
      { name: "MATLAB", aliases: ["simulink", "dsp"] },
      { name: "Simulink", aliases: ["model based design"] },
      { name: "AutoCAD", aliases: ["cad", "2d drawing"] },
      { name: "CATIA", aliases: ["3d cad", "aerospace design"] },
      { name: "SolidWorks", aliases: ["mechanical design", "parametric modeling"] },
      { name: "GD&T", aliases: ["geometric dimensioning", "tolerancing"] },
    ],
  },
  {
    category: "Soft Skills & Employability",
    skills: [
      { name: "Aptitude", aliases: ["quantitative aptitude", "logical reasoning", "math"] },
      { name: "Soft Skills", aliases: ["personality development", "corporate etiquette"] },
      { name: "Communication", aliases: ["business communication", "verbal ability", "english"] },
      { name: "Leadership", aliases: ["team management", "mentorship"] },
      { name: "Interview Skills", aliases: ["mock interviews", "resume building", "gd"] },
    ],
  },
];

export const INITIAL_REQUIREMENTS: ProjectRequirement[] = [
  {
    id: "req-1",
    code: "REQ-2026-001",
    title: "Java Full Stack Bootcamp",
    client: "ABC University",
    skills: ["Java", "Spring Boot", "SQL", "DSA"],
    minExperience: 5,
    location: "Bangalore",
    mode: "Offline",
    requiredTrainers: 3,
    startDate: "2026-09-20",
    endDate: "2026-10-02",
    dailyHours: 6,
    sector: "University",
    status: "Open",
    assignedTrainerIds: ["1"],
    notes: "300 final year engineering students. Need hands-on project mentoring.",
    createdOn: "2026-09-01",
  },
  {
    id: "req-2",
    code: "REQ-2026-002",
    title: "AI/ML & Data Engineering Masterclass",
    client: "TechNova Corp",
    skills: ["Python", "Machine Learning", "Data Science", "SQL"],
    minExperience: 6,
    location: "Mysore",
    mode: "Hybrid",
    requiredTrainers: 2,
    startDate: "2026-09-25",
    endDate: "2026-10-05",
    dailyHours: 4,
    sector: "Corporate",
    status: "In Progress",
    assignedTrainerIds: ["2"],
    notes: "Upskilling corporate analytics associates.",
    createdOn: "2026-09-03",
  },
  {
    id: "req-3",
    code: "REQ-2026-003",
    title: "Campus Placement Readiness & Aptitude",
    client: "RV College of Engineering",
    skills: ["Aptitude", "Interview Skills", "Communication", "Soft Skills"],
    minExperience: 4,
    location: "Bangalore",
    mode: "Offline",
    requiredTrainers: 2,
    startDate: "2026-10-01",
    endDate: "2026-10-10",
    dailyHours: 8,
    sector: "College",
    status: "Open",
    assignedTrainerIds: ["6"],
    notes: "Pre-placement training for IT branches.",
    createdOn: "2026-09-05",
  },
  {
    id: "req-4",
    code: "REQ-2026-004",
    title: "Cloud & DevOps Architecture Workshop",
    client: "Infosource Global",
    skills: ["AWS", "DevOps", "Linux"],
    minExperience: 8,
    location: "Hyderabad",
    mode: "Online",
    requiredTrainers: 1,
    startDate: "2026-09-18",
    endDate: "2026-09-22",
    dailyHours: 5,
    sector: "Corporate",
    status: "Fulfilled",
    assignedTrainerIds: ["4"],
    notes: "Live online hands-on AWS pipelines.",
    createdOn: "2026-08-28",
  },
];

export interface AdminUser {
  name: string;
  email: string;
  role: "Admin";
}

export interface ActivityLog {
  id: string;
  user: string;
  role: string;
  action: string;
  details: string;
  timestamp: string;
}

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act-1",
    user: "ATOM Administrator",
    role: "Admin",
    action: "MySQL Database Connected",
    details: "Loaded all trainer profiles from MySQL database 'atom_trainer_hub'",
    timestamp: "Just now",
  },
];

const DEFAULT_ADMIN: AdminUser = {
  name: "ATOM Administrator",
  email: "Trainerdata@atomm.in",
  role: "Admin",
};

interface StoreContextType {
  // Authentication
  isAuthenticated: boolean;
  currentUser: AdminUser;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // Core State
  trainers: Trainer[];
  requirements: ProjectRequirement[];
  skillCategories: SkillCategory[];
  skillAliases: Record<string, string[]>;
  activityLogs: ActivityLog[];
  orgSettings: {
    orgName: string;
    currency: string;
    dateFormat: string;
  };
  currentRole: "Admin";
  isDbConnected: boolean;
  isLoadingDb: boolean;
  refreshFromDb: () => Promise<void>;
  // Trainer Operations
  addTrainer: (
    trainer: Omit<Trainer, "id" | "code"> & { id?: string; code?: string },
  ) => Promise<Trainer>;
  addTrainersBulk: (
    trainers: Array<Omit<Trainer, "id" | "code"> & { id?: string; code?: string }>,
  ) => Promise<Trainer[]>;
  updateTrainer: (id: string, updates: Partial<Trainer>) => Promise<void>;
  deleteTrainer: (id: string) => Promise<void>;
  archiveTrainer: (id: string) => Promise<void>;
  addTrainerNote: (trainerId: string, note: string) => Promise<void>;
  addTrainerRating: (
    trainerId: string,
    rating: {
      technical: number;
      communication: number;
      engagement: number;
      punctuality: number;
      content: number;
      overall: number;
      comments: string;
      project: string;
    },
  ) => Promise<void>;
  updateAvailability: (
    trainerId: string,
    availability: Availability,
    dates?: { from?: string; until?: string },
  ) => Promise<void>;
  // Requirements Operations
  addRequirement: (
    req: Omit<ProjectRequirement, "id" | "code" | "createdOn">,
  ) => Promise<ProjectRequirement>;
  updateRequirement: (id: string, updates: Partial<ProjectRequirement>) => Promise<void>;
  assignTrainerToRequirement: (reqId: string, trainerId: string) => Promise<void>;
  unassignTrainerFromRequirement: (reqId: string, trainerId: string) => Promise<void>;
  // Skills Operations
  addSkill: (category: string, name: string, aliases: string[]) => void;
  updateSkillAliases: (skillName: string, aliases: string[]) => void;
  // Helper functions
  getTrainerById: (id: string) => Trainer | undefined;
  checkDuplicate: (
    phone: string,
    email: string,
    name: string,
    excludeId?: string,
  ) => { isDuplicate: boolean; matchedTrainer?: Trainer; reason?: string };
  matchTrainersForCriteria: (params: {
    skills: string[];
    minExp?: number;
    location?: string;
    mode?: Mode;
    date?: string;
    minRating?: number;
  }) => {
    trainer: Trainer;
    score: number;
    details: {
      skillMatch: number;
      expMatch: boolean;
      locMatch: boolean;
      availMatch: boolean;
      modeMatch: boolean;
      ratingBonus: number;
      matchedSkills: string[];
      missingSkills: string[];
    };
  }[];
}

const StoreContext = createContext<StoreContextType | null>(null);

const AUTH_KEY = "atom_trainer_hub_auth_session";
const AUTH_USER_KEY = "atom_trainer_hub_user";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      // Clear legacy localStorage token
      try {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      } catch {
        // ignore
      }
      const saved = sessionStorage.getItem(AUTH_KEY);
      return saved === "true";
    }
    return false; // SSR initial default
  });

  const [currentUser, setCurrentUser] = useState<AdminUser>(() => {
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem(AUTH_USER_KEY);
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          // ignore
        }
      }
    }
    return DEFAULT_ADMIN;
  });
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [requirements, setRequirements] = useState<ProjectRequirement[]>([]);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(INITIAL_SKILL_CATEGORIES);
  const [skillAliases, setSkillAliases] = useState<Record<string, string[]>>(INITIAL_ALIASES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isDbConnected, setIsDbConnected] = useState<boolean>(true);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

  const [orgSettings] = useState({
    orgName: "ATOM Educational Network",
    currency: "INR (₹)",
    dateFormat: "DD/MM/YYYY",
  });

  // Fetch all data from MySQL via REST API
  const refreshFromDb = useCallback(async (silent = false) => {
    if (typeof window === "undefined" || !isAuthenticated) return;
    if (!silent) setIsLoadingDb(true);
    try {
      const [trainersRes, reqsRes, healthRes, actRes] = await Promise.allSettled([
        fetch("/api/trainers").then((r) => (r.ok ? r.json() : Promise.reject(r))),
        fetch("/api/requirements").then((r) => (r.ok ? r.json() : Promise.reject(r))),
        fetch("/api/health").then((r) => (r.ok ? r.json() : Promise.reject(r))),
        fetch("/api/activity").then((r) => (r.ok ? r.json() : Promise.reject(r))),
      ]);

      if (trainersRes.status === "fulfilled" && Array.isArray(trainersRes.value)) {
        setTrainers(trainersRes.value);
      }

      if (reqsRes.status === "fulfilled" && Array.isArray(reqsRes.value)) {
        setRequirements(reqsRes.value);
      }

      if (actRes.status === "fulfilled" && Array.isArray(actRes.value)) {
        setActivityLogs(actRes.value);
      }

      if (healthRes.status === "fulfilled" && healthRes.value?.status === "connected") {
        setIsDbConnected(true);
      }
    } catch (err) {
      console.warn("Failed to fetch from MySQL API", err);
      setIsDbConnected(false);
    } finally {
      if (!silent) setIsLoadingDb(false);
    }
  }, [isAuthenticated]);

  // Live background auto-sync with MySQL database (on mount, window focus, and interval)
  useEffect(() => {
    if (!isAuthenticated) return;

    refreshFromDb();

    // Auto sync on tab/window focus
    const onFocus = () => {
      refreshFromDb(true);
    };
    window.addEventListener("focus", onFocus);

    // Periodic live auto-sync every 8 seconds
    const interval = setInterval(() => {
      refreshFromDb(true);
    }, 8000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [refreshFromDb, isAuthenticated]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        if (data.user) {
          setCurrentUser(data.user);
          sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }
        sessionStorage.setItem(AUTH_KEY, "true");
        toast.success("Welcome back, Administrator (Authenticated via MySQL)!");
        return true;
      }
    } catch {
      // Fallback local check
    }

    if (cleanEmail === "trainerdata@atomm.in" && cleanPass === "atom@2020") {
      setIsAuthenticated(true);
      setCurrentUser(DEFAULT_ADMIN);
      sessionStorage.setItem(AUTH_KEY, "true");
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(DEFAULT_ADMIN));
      toast.success("Welcome back, Administrator!");
      return true;
    }

    toast.error("Invalid username or password. Please try again.");
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    try {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      // ignore
    }
    toast.info("You have been signed out.");
  };

  const getTrainerById = (id: string) => trainers.find((t) => t.id === id);

  const checkDuplicate = (phone: string, email: string, name: string, excludeId?: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim().toLowerCase();

    for (const t of trainers) {
      if (excludeId && t.id === excludeId) continue;
      const tPhone = (t.phone || "").replace(/[^0-9]/g, "");
      const tEmail = (t.email || "").trim().toLowerCase();
      const tName = (t.name || "").trim().toLowerCase();

      if (
        cleanPhone &&
        tPhone &&
        cleanPhone.length >= 10 &&
        tPhone.length >= 10 &&
        cleanPhone.slice(-10) === tPhone.slice(-10)
      ) {
        return {
          isDuplicate: true,
          matchedTrainer: t,
          reason: `Phone number matches existing trainer ${t.name} (${t.phone})`,
        };
      }
      if (cleanEmail && tEmail && cleanEmail === tEmail) {
        return {
          isDuplicate: true,
          matchedTrainer: t,
          reason: `Email matches existing trainer ${t.name} (${t.email})`,
        };
      }
      if (
        cleanName &&
        tName &&
        cleanName === tName &&
        (cleanPhone.slice(-5) === tPhone.slice(-5) ||
          cleanEmail.split("@")[0] === tEmail.split("@")[0])
      ) {
        return {
          isDuplicate: true,
          matchedTrainer: t,
          reason: `Name and contact details match existing trainer ${t.name}`,
        };
      }
    }
    return { isDuplicate: false };
  };

  const addTrainer = async (
    data: Omit<Trainer, "id" | "code"> & { id?: string; code?: string },
  ): Promise<Trainer> => {
    const nextId = data.id || String(Date.now());
    const nextCode = data.code || `ATM-T-${String(trainers.length + 1).padStart(3, "0")}`;
    const newTrainer: Trainer = {
      ...data,
      id: nextId,
      code: nextCode,
      status: data.status || "Active",
      rating: data.rating || 4.5,
      projectsCompleted: data.projectsCompleted || 0,
      addedOn: data.addedOn || new Date().toISOString().split("T")[0],
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

    // Optimistic UI update
    setTrainers((prev) => [newTrainer, ...prev]);

    try {
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrainer),
      });
      if (res.ok) {
        const saved = await res.json();
        setTrainers((prev) => prev.map((t) => (t.id === newTrainer.id ? saved : t)));
        refreshFromDb(true);
        toast.success(`Trainer ${newTrainer.name} saved directly to MySQL database!`);
        return saved;
      }
    } catch (e) {
      console.error("Failed to save trainer to MySQL:", e);
    }

    toast.success(`Trainer ${newTrainer.name} added!`);
    return newTrainer;
  };

  const addTrainersBulk = async (
    items: Array<Omit<Trainer, "id" | "code"> & { id?: string; code?: string }>,
  ): Promise<Trainer[]> => {
    if (items.length === 0) return [];

    try {
      const res = await fetch("/api/trainers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainers: items }),
      });
      if (res.ok) {
        const result = await res.json();
        const savedList: Trainer[] = result.trainers || [];
        setTrainers((prev) => [...savedList, ...prev]);
        refreshFromDb(true);
        toast.success(`Successfully saved ${savedList.length} trainers in bulk to MySQL database!`);
        return savedList;
      }
    } catch (e) {
      console.error("Failed to save trainers in bulk to MySQL:", e);
    }

    // Fallback if API fails
    const createdList: Trainer[] = items.map((data, idx) => ({
      ...data,
      id: data.id || `bulk-${Date.now()}-${idx}`,
      code: data.code || `ATM-T-${String(trainers.length + idx + 1).padStart(3, "0")}`,
      status: data.status || "Active",
      rating: data.rating || 4.5,
      projectsCompleted: data.projectsCompleted || 0,
      addedOn: data.addedOn || new Date().toISOString().split("T")[0],
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
    }));

    setTrainers((prev) => [...createdList, ...prev]);
    toast.success(`Added ${createdList.length} trainers in bulk!`);
    return createdList;
  };

  const updateTrainer = async (id: string, updates: Partial<Trainer>) => {
    setTrainers((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return { ...t, ...updates };
        }
        return t;
      }),
    );

    try {
      await fetch(`/api/trainers/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      refreshFromDb(true);
    } catch (e) {
      console.error("Failed to update trainer in MySQL:", e);
    }
    toast.success("Trainer profile updated in MySQL!");
  };

  const deleteTrainer = async (id: string) => {
    setTrainers((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/trainers/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      refreshFromDb(true);
    } catch (e) {
      console.error("Failed to delete trainer from MySQL:", e);
    }
    toast.success("Trainer deleted from MySQL.");
  };

  const archiveTrainer = async (id: string) => {
    const target = trainers.find((t) => t.id === id);
    if (!target) return;
    const nextStatus = target.status === "Archived" ? "Active" : "Archived";
    await updateTrainer(id, { status: nextStatus });
    toast.info(`Trainer ${target.name} marked as ${nextStatus}.`);
  };

  const addTrainerNote = async (trainerId: string, note: string) => {
    if (!note.trim()) return;
    const date = new Date().toISOString().split("T")[0];
    const newNoteObj = { note: note.trim(), by: "Admin", date };

    setTrainers((prev) =>
      prev.map((t) => (t.id === trainerId ? { ...t, notes: [newNoteObj, ...t.notes] } : t)),
    );

    try {
      await fetch(`/api/trainers/${encodeURIComponent(trainerId)}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      refreshFromDb(true);
    } catch (e) {
      console.error("Failed to add note to MySQL:", e);
    }
    toast.success("Internal note saved to MySQL.");
  };

  const addTrainerRating = async (
    trainerId: string,
    rating: {
      technical: number;
      communication: number;
      engagement: number;
      punctuality: number;
      content: number;
      overall: number;
      comments: string;
      project: string;
    },
  ) => {
    const target = trainers.find((t) => t.id === trainerId);
    if (!target) return;
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

    setTrainers((prev) =>
      prev.map((t) =>
        t.id === trainerId
          ? {
              ...t,
              rating: nextRating,
              projectsCompleted: nextCompleted,
              trainings: [newTrainingEntry, ...t.trainings],
              notes: rating.comments
                ? [
                    {
                      note: `[Project Feedback - ${rating.project}]: ${rating.comments} (Rating: ${rating.overall}/5)`,
                      by: "Admin",
                      date: new Date().toISOString().split("T")[0],
                    },
                    ...t.notes,
                  ]
                : t.notes,
            }
          : t,
      ),
    );

    try {
      await fetch(`/api/trainers/${encodeURIComponent(trainerId)}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rating),
      });
    } catch (e) {
      console.error("Failed to save rating in MySQL:", e);
    }

    toast.success(`Scorecard saved to MySQL! New average: ${nextRating} / 5.0`);
  };

  const updateAvailability = async (
    trainerId: string,
    availability: Availability,
    dates?: { from?: string; until?: string },
  ) => {
    setTrainers((prev) =>
      prev.map((t) =>
        t.id === trainerId
          ? {
              ...t,
              availability,
              availableFrom: dates?.from ?? t.availableFrom,
              availableUntil: dates?.until ?? t.availableUntil,
            }
          : t,
      ),
    );

    try {
      await fetch(`/api/trainers/${encodeURIComponent(trainerId)}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability, dates }),
      });
    } catch (e) {
      console.error("Failed to update availability in MySQL:", e);
    }
    toast.success("Trainer availability saved to MySQL.");
  };

  const addRequirement = async (
    req: Omit<ProjectRequirement, "id" | "code" | "createdOn">,
  ): Promise<ProjectRequirement> => {
    const id = "req-" + Date.now();
    const code = `REQ-${new Date().getFullYear()}-${String(requirements.length + 1).padStart(3, "0")}`;
    const newReq: ProjectRequirement = {
      ...req,
      id,
      code,
      createdOn: new Date().toISOString().split("T")[0],
    };
    setRequirements((prev) => [newReq, ...prev]);

    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReq),
      });
      if (res.ok) {
        const saved = await res.json();
        setRequirements((prev) => prev.map((r) => (r.id === newReq.id ? saved : r)));
        toast.success(`Requirement ${saved.code} saved to MySQL.`);
        return saved;
      }
    } catch (e) {
      console.error("Failed to save requirement to MySQL:", e);
    }

    toast.success(`Project Requirement ${newReq.code} created.`);
    return newReq;
  };

  const updateRequirement = async (id: string, updates: Partial<ProjectRequirement>) => {
    setRequirements((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    try {
      const current = requirements.find((r) => r.id === id);
      if (current) {
        await fetch("/api/requirements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...current, ...updates, id }),
        });
      }
    } catch (e) {
      console.error("Failed to update requirement in MySQL:", e);
    }
    toast.success("Requirement updated in MySQL.");
  };

  const assignTrainerToRequirement = async (reqId: string, trainerId: string) => {
    const req = requirements.find((r) => r.id === reqId);
    const trainer = trainers.find((t) => t.id === trainerId);
    if (!req || !trainer) return;

    if (req.assignedTrainerIds.includes(trainerId)) {
      toast.info(`${trainer.name} is already assigned to this requirement.`);
      return;
    }

    const updatedAssigned = [...req.assignedTrainerIds, trainerId];
    const newStatus = updatedAssigned.length >= req.requiredTrainers ? "Fulfilled" : "In Progress";

    await updateRequirement(reqId, { assignedTrainerIds: updatedAssigned, status: newStatus });
    await updateAvailability(trainerId, "assigned");
    toast.success(`${trainer.name} assigned to requirement in MySQL!`);
  };

  const unassignTrainerFromRequirement = async (reqId: string, trainerId: string) => {
    const req = requirements.find((r) => r.id === reqId);
    if (!req) return;

    const updatedAssigned = req.assignedTrainerIds.filter((id) => id !== trainerId);
    const newStatus = updatedAssigned.length === 0 ? "Open" : "In Progress";

    await updateRequirement(reqId, { assignedTrainerIds: updatedAssigned, status: newStatus });
    toast.info("Trainer unassigned in MySQL.");
  };

  const addSkill = (category: string, name: string, aliases: string[]) => {
    setSkillCategories((prev) => {
      const catExists = prev.some((c) => c.category === category);
      if (catExists) {
        return prev.map((c) =>
          c.category === category ? { ...c, skills: [...c.skills, { name, aliases }] } : c,
        );
      }
      return [...prev, { category, skills: [{ name, aliases }] }];
    });
    if (aliases.length > 0) {
      setSkillAliases((prev) => ({ ...prev, [name]: aliases }));
    }
    toast.success(`Skill '${name}' added to catalog.`);
  };

  const updateSkillAliases = (skillName: string, aliases: string[]) => {
    setSkillAliases((prev) => ({ ...prev, [skillName]: aliases }));
    setSkillCategories((prev) =>
      prev.map((c) => ({
        ...c,
        skills: c.skills.map((s) => (s.name === skillName ? { ...s, aliases } : s)),
      })),
    );
    toast.success(`Aliases for '${skillName}' updated.`);
  };

  const matchTrainersForCriteria = (params: {
    skills: string[];
    minExp?: number;
    location?: string;
    mode?: Mode;
    date?: string;
    minRating?: number;
  }) => {
    const requiredSkills = params.skills.map((s) => s.toLowerCase().trim()).filter(Boolean);
    const minExp = params.minExp || 0;
    const reqLoc = (params.location || "").toLowerCase().trim();
    const reqMode = params.mode;
    const minRating = params.minRating || 0;

    const scored = trainers.map((t) => {
      // 1. Skill matching
      const matchedSkills: string[] = [];
      const missingSkills: string[] = [];

      requiredSkills.forEach((reqSkill) => {
        // Direct match
        const direct = (t.skills || []).find(
          (s) =>
            s.name.toLowerCase() === reqSkill ||
            s.name.toLowerCase().includes(reqSkill) ||
            reqSkill.includes(s.name.toLowerCase()),
        );
        if (direct) {
          matchedSkills.push(direct.name);
          return;
        }
        // Check aliases
        const aliases =
          Object.entries(skillAliases).find(([k]) => k.toLowerCase() === reqSkill)?.[1] || [];
        const aliasMatch = (t.skills || []).find((s) =>
          aliases.some((a) => s.name.toLowerCase().includes(a.toLowerCase())),
        );
        if (aliasMatch) {
          matchedSkills.push(aliasMatch.name);
          return;
        }
        missingSkills.push(reqSkill);
      });

      const skillFraction =
        requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 1;
      const skillScore = skillFraction * 50; // 50% max for skills

      // 2. Experience matching (15% max)
      const expMatch = (t.experience || 0) >= minExp;
      const expScore = expMatch ? 15 : Math.max(0, 15 - (minExp - (t.experience || 0)) * 3);

      // 3. Location matching (15% max)
      const locMatch =
        !reqLoc ||
        (t.city || "").toLowerCase().includes(reqLoc) ||
        reqLoc.includes((t.city || "").toLowerCase()) ||
        reqMode === "Online";
      const locScore = locMatch ? 15 : 4;

      // 4. Availability matching (10% max)
      const availMatch = t.availability === "available" || t.availability === "partial";
      const availScore = t.availability === "available" ? 10 : t.availability === "partial" ? 7 : 0;

      // 5. Training mode matching (5% max)
      const modeMatch =
        !reqMode || (t.modes || []).includes(reqMode) || (t.modes || []).includes("Hybrid");
      const modeScore = modeMatch ? 5 : 1;

      // 6. Rating bonus (5% max)
      const ratingBonus = ((t.rating || 4.5) / 5) * 5;

      const totalScore = Math.min(
        100,
        Math.round(skillScore + expScore + locScore + availScore + modeScore + ratingBonus),
      );

      return {
        trainer: t,
        score: totalScore,
        details: {
          skillMatch: Math.round(skillFraction * 100),
          expMatch,
          locMatch,
          availMatch,
          modeMatch,
          ratingBonus: Number(ratingBonus.toFixed(1)),
          matchedSkills,
          missingSkills,
        },
      };
    });

    return scored
      .filter((item) => (minRating ? (item.trainer.rating || 0) >= minRating : true))
      .sort((a, b) => b.score - a.score);
  };

  const value: StoreContextType = {
    isAuthenticated,
    currentUser,
    login,
    logout,
    trainers,
    requirements,
    skillCategories,
    skillAliases,
    activityLogs,
    orgSettings,
    currentRole: "Admin",
    isDbConnected,
    isLoadingDb,
    refreshFromDb,
    addTrainer,
    addTrainersBulk,
    updateTrainer,
    deleteTrainer,
    archiveTrainer,
    addTrainerNote,
    addTrainerRating,
    updateAvailability,
    addRequirement,
    updateRequirement,
    assignTrainerToRequirement,
    unassignTrainerFromRequirement,
    addSkill,
    updateSkillAliases,
    getTrainerById,
    checkDuplicate,
    matchTrainersForCriteria,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
