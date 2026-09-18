export type Availability = "available" | "partial" | "assigned" | "unavailable";
export type TrainerType =
  | "Technical Trainer"
  | "Soft Skills Trainer"
  | "Aptitude Trainer"
  | "Domain Expert"
  | "Industry Expert"
  | "Guest Faculty";
export type Mode = "Online" | "Offline" | "Hybrid";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface TrainerSkill {
  name: string;
  level: SkillLevel;
  years: number;
}

export interface Trainer {
  id: string;
  code: string;
  name: string;
  designation: string;
  photo: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  state: string;
  country: string;
  organization: string;
  experience: number;
  trainingExperience: number;
  trainerType: TrainerType;
  employment: "Freelance" | "Full-time" | "Part-time";
  modes: Mode[];
  availability: Availability;
  availableFrom?: string;
  availableUntil?: string;
  rating: number;
  projectsCompleted: number;
  bio: string;
  status: "Active" | "Inactive" | "Archived";
  tags: string[];
  skills: TrainerSkill[];
  softSkills: string[];
  education: { degree: string; specialization: string; university: string; year: number }[];
  certifications: {
    name: string;
    org: string;
    id: string;
    issued: string;
    expires?: string;
  }[];
  trainings: {
    client: string;
    program: string;
    tech: string;
    students: number;
    days: number;
    location: string;
    mode: Mode;
    year: number;
    rating: number;
  }[];
  notes: { note: string; by: string; date: string }[];
  documents: { name: string; type: string; date: string; by: string }[];
  sectors: ("College" | "University" | "Corporate" | "School" | "Government")[];
  addedOn: string;
}

const photo = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=d7f2e3,e7f6ec,cdeedd`;

function t(p: Partial<Trainer> & Pick<Trainer, "id" | "name" | "designation">): Trainer {
  return {
    code: "ATM-T-" + p.id.padStart(3, "0"),
    photo: photo(p.name),
    phone: "+919800000000",
    whatsapp: "+919800000000",
    email: p.name.toLowerCase().replace(/[^a-z]/g, ".") + "@example.com",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    organization: "Independent",
    experience: 6,
    trainingExperience: 4,
    trainerType: "Technical Trainer",
    employment: "Freelance",
    modes: ["Online", "Offline"],
    availability: "available",
    rating: 4.5,
    projectsCompleted: 10,
    bio: "",
    status: "Active",
    tags: [],
    skills: [],
    softSkills: [],
    education: [],
    certifications: [],
    trainings: [],
    notes: [],
    documents: [
      { name: "Trainer CV.pdf", type: "CV", date: "2026-06-11", by: "Admin" },
      { name: "ATOM Profile.pdf", type: "Profile PDF", date: "2026-06-11", by: "Admin" },
    ],
    sectors: ["College", "Corporate"],
    addedOn: "2026-05-04",
    ...p,
  } as Trainer;
}

const sk = (name: string, level: SkillLevel, years: number): TrainerSkill => ({
  name,
  level,
  years,
});

export const TRAINERS: Trainer[] = [];

export const SKILL_ALIASES: Record<string, string[]> = {
  JavaScript: ["js", "ecmascript"],
  "Machine Learning": ["ml"],
  Python: ["django", "pandas", "numpy"],
  DSA: ["data structures", "algorithms"],
  AWS: ["amazon web services", "cloud"],
  "Spring Boot": ["spring"],
  MERN: ["mongo", "express", "react", "node"],
  AI: ["artificial intelligence", "deep learning"],
};

export const ALL_SKILLS = Array.from(
  new Set(TRAINERS.flatMap((tr) => tr.skills.map((s) => s.name))),
).sort();

export const ALL_CITIES = Array.from(new Set(TRAINERS.map((tr) => tr.city))).sort();

export const availabilityMeta: Record<Availability, { label: string; dot: string; chip: string }> =
  {
    available: { label: "Available", dot: "bg-status-available", chip: "text-status-available" },
    partial: {
      label: "Partially Available",
      dot: "bg-status-partial",
      chip: "text-status-partial",
    },
    assigned: { label: "Assigned", dot: "bg-status-assigned", chip: "text-status-assigned" },
    unavailable: {
      label: "Unavailable",
      dot: "bg-status-unavailable",
      chip: "text-status-unavailable",
    },
  };

function haystack(tr: Trainer) {
  return [
    tr.name,
    tr.designation,
    tr.city,
    tr.state,
    tr.country,
    tr.organization,
    tr.trainerType,
    tr.bio,
    tr.tags.join(" "),
    tr.skills.map((s) => s.name).join(" "),
    tr.softSkills.join(" "),
    tr.education.map((e) => `${e.degree} ${e.specialization} ${e.university}`).join(" "),
    tr.certifications.map((c) => `${c.name} ${c.org}`).join(" "),
    tr.trainings.map((x) => `${x.client} ${x.program} ${x.tech} ${x.location}`).join(" "),
    tr.sectors.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export interface ParsedRequirementQuery {
  minExperience: number | null;
  cleanedQuery: string;
  tokens: string[];
}

export function parseNaturalLanguageQuery(query: string): ParsedRequirementQuery {
  let minExperience: number | null = null;
  let cleaned = query.trim();

  // Pattern match "7 years", "7+ years", "7 yrs", "7+ yrs", "7 yr", "7y", "min 7 years", "7+ exp", "7 years experience", etc.
  const expMatch =
    cleaned.match(/(?:min(?:imum)?|at\s+least)?\s*(\d+)\s*(?:\+)?\s*(?:years?|yrs?|yr|y|yo)\s*(?:of\s+)?(?:exp(?:erience)?)?/i) ||
    cleaned.match(/(?:min(?:imum)?|at\s+least)?\s*(\d+)\s*\+\s*(?:exp(?:erience)?|years?|yrs?|yr|y)?/i) ||
    cleaned.match(/(?:experience|exp)\s*(?:of|:)?\s*(\d+)\s*(?:\+)?\s*(?:years?|yrs?|yr|y)?/i);

  if (expMatch) {
    minExperience = parseInt(expMatch[1], 10);
    cleaned = cleaned.replace(expMatch[0], " ").trim();
  }

  // Remove leftover experience keywords
  cleaned = cleaned.replace(/\b(years?|yrs?|yr|exp|experience|minimum|min|at\s+least)\b/gi, " ").trim();

  const tokens = cleaned
    .toLowerCase()
    .split(/[,+\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
    .map((token) => {
      if (token.includes("apptid") || token.includes("aptid")) return "aptitude";
      if (token.includes("softskill") || token.includes("soft-skill")) return "soft skills";
      if (token.includes("communi")) return "communication";
      return token;
    });

  return {
    minExperience,
    cleanedQuery: cleaned,
    tokens,
  };
}

export function searchTrainers(list: Trainer[], query: string) {
  const parsed = parseNaturalLanguageQuery(query);
  const { minExperience, tokens } = parsed;
  if (!query.trim()) return list;

  return list.filter((tr) => {
    // Experience check
    if (minExperience !== null && tr.experience < minExperience) {
      return false;
    }
    if (tokens.length === 0) {
      return true;
    }
    const h = haystack(tr);
    const expanded = tokens.flatMap((term) => {
      const hits = Object.entries(SKILL_ALIASES)
        .filter(([k, v]) => k.toLowerCase().includes(term) || v.some((a) => a.includes(term)))
        .map(([k]) => k.toLowerCase());
      return [term, ...hits];
    });
    return tokens.every((term) => h.includes(term)) || expanded.some((term) => h.includes(term));
  });
}

export function profileCompleteness(tr: Trainer) {
  const checks = [
    !!tr.photo,
    !!tr.bio,
    tr.skills.length > 0,
    tr.education.length > 0,
    tr.certifications.length > 0,
    tr.trainings.length > 0,
    !!tr.phone,
    !!tr.email,
    tr.documents.length > 1,
    tr.tags.length > 0,
  ];
  const missing: string[] = [];
  if (!tr.bio) missing.push("Professional summary");
  if (!tr.certifications.length) missing.push("Certifications");
  if (!tr.trainings.length) missing.push("Training experience");
  if (!tr.education.length) missing.push("Education");
  if (!tr.tags.length) missing.push("Tags");
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return { pct, missing };
}

export type DomainCategory = "Technical" | "Aptitude" | "Soft Skills" | "Other";

export function getTrainerDomainCategory(trainer: Trainer) {
  const allText = [
    trainer.trainerType || "",
    trainer.designation || "",
    trainer.bio || "",
    ...(trainer.skills?.map((s) => s.name) || []),
    ...(trainer.softSkills || []),
    ...(trainer.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  const isTechnical =
    trainer.trainerType === "Technical Trainer" ||
    trainer.trainerType === "Industry Expert" ||
    trainer.trainerType === "Domain Expert" ||
    /\b(java|python|react|node|javascript|typescript|c\+\+|c#|golang|rust|php|ruby|sql|database|aws|azure|gcp|cloud|devops|docker|kubernetes|ai|ml|machine learning|data science|data analytics|deep learning|nlp|dsa|full stack|frontend|backend|web|cyber|testing|selenium|qa|embedded|iot|spring|django|flask|dotnet|\.net|html|css|linux|git|microservices)\b/i.test(
      allText,
    );

  const isAptitude =
    trainer.trainerType === "Aptitude Trainer" ||
    /\b(aptitude|quant|quantitative|logical|reasoning|math|maths|arithmetic|data interpretation|puzzle|verbal ability|campus placement)\b/i.test(
      allText,
    );

  const isSoftSkills =
    trainer.trainerType === "Soft Skills Trainer" ||
    /\b(soft skill|soft skills|soft-skill|softskills|communication|interpersonal|personality|interview|interview skills|gd|group discussion|presentation|public speaking|leadership|etiquette|corporate readiness|verbal|english)\b/i.test(
      allText,
    );

  let primaryDomain: DomainCategory = "Other";
  if (trainer.trainerType === "Technical Trainer" || isTechnical) primaryDomain = "Technical";
  else if (trainer.trainerType === "Aptitude Trainer" || isAptitude) primaryDomain = "Aptitude";
  else if (trainer.trainerType === "Soft Skills Trainer" || isSoftSkills) primaryDomain = "Soft Skills";

  return { isTechnical, isAptitude, isSoftSkills, primaryDomain };
}

export function computeDomainCounts(trainers: Trainer[]) {
  let technical = 0;
  let aptitude = 0;
  let softSkills = 0;

  for (const t of trainers) {
    const { isTechnical, isAptitude, isSoftSkills } = getTrainerDomainCategory(t);
    if (isTechnical) technical++;
    if (isAptitude) aptitude++;
    if (isSoftSkills) softSkills++;
  }

  return {
    total: trainers.length,
    technical,
    aptitude,
    softSkills,
  };
}

export function isQuickContactTrainer(trainer: Trainer): boolean {
  if (
    trainer.tags?.some((t) =>
      [
        "Quick Contact",
        "Excel Bulk Import",
        "Minimal Contact",
        "Phone Directory",
        "Name & Phone Directory",
        "Manual Quick Add",
      ].includes(t),
    )
  ) {
    return true;
  }
  if (
    trainer.tags?.some((t) =>
      ["Full Profile", "Verified Profile", "PDF Resume Upload", "Comprehensive"].includes(t),
    )
  ) {
    return false;
  }
  // If no education, certifications, trainings, and documents, it's a minimal/quick contact
  const hasDetailedRecords =
    (trainer.education && trainer.education.length > 0) ||
    (trainer.certifications && trainer.certifications.length > 0) ||
    (trainer.trainings && trainer.trainings.length > 0) ||
    (trainer.documents && trainer.documents.length > 0);

  return !hasDetailedRecords;
}

export function isFullProfileTrainer(trainer: Trainer): boolean {
  return !isQuickContactTrainer(trainer);
}

export function computeSectionCounts(trainers: Trainer[]) {
  const fullProfiles = trainers.filter(isFullProfileTrainer);
  const quickContacts = trainers.filter(isQuickContactTrainer);

  const fullDomainCounts = computeDomainCounts(fullProfiles);
  const quickDomainCounts = computeDomainCounts(quickContacts);
  const totalDomainCounts = computeDomainCounts(trainers);

  return {
    total: trainers.length,
    fullProfilesCount: fullProfiles.length,
    quickContactsCount: quickContacts.length,
    fullDomainCounts,
    quickDomainCounts,
    totalDomainCounts,
  };
}

export interface ScoredTrainerResult {
  trainer: Trainer;
  score: number;
  matchedCount: number;
  meetsExp: boolean;
  matchPercentage?: number;
}

export function scoreAndMatchTrainers(
  trainersList: Trainer[],
  requirementQuery: string,
  queryTokens: string[],
  minExperience: number | null,
  cityFilter: string,
  domainFilter: "All" | "Technical" | "Aptitude" | "Soft Skills",
  skillAliases: Record<string, string[]> = SKILL_ALIASES,
): ScoredTrainerResult[] {
  const hasQuery = requirementQuery.trim().length > 0;
  const hasTokens = queryTokens.length > 0;
  const hasMinExp = minExperience !== null && minExperience > 0;

  return trainersList
    .map((trainer) => {
      let score = 0;
      let matchedCount = 0;
      let meetsExp = true;

      // 1. Check Experience Requirement
      if (hasMinExp) {
        if (trainer.experience >= minExperience) {
          matchedCount++;
          score += 50 + Math.min(25, (trainer.experience - minExperience) * 3);
        } else {
          meetsExp = false;
        }
      }

      if (!hasTokens && !hasMinExp) {
        score = (trainer.rating || 4.5) * 10 + (trainer.availability === "available" ? 20 : 0);
      } else {
        for (const token of queryTokens) {
          let hasSkill = trainer.skills?.some((s) => {
            const skillLower = s.name.toLowerCase();
            return skillLower.includes(token) || token.includes(skillLower);
          });

          if (!hasSkill && skillAliases) {
            for (const [canonical, aliases] of Object.entries(skillAliases)) {
              if (
                canonical.toLowerCase().includes(token) ||
                aliases.some((a) => a.toLowerCase().includes(token))
              ) {
                if (
                  trainer.skills?.some((s) => s.name.toLowerCase() === canonical.toLowerCase())
                ) {
                  hasSkill = true;
                  break;
                }
              }
            }
          }

          if (hasSkill) {
            matchedCount++;
            score += 40;
          }

          if (
            trainer.city?.toLowerCase().includes(token) ||
            token.includes(trainer.city?.toLowerCase() || "")
          ) {
            score += 25;
            matchedCount++;
          }

          if (trainer.designation?.toLowerCase().includes(token)) {
            score += 25;
            matchedCount++;
          }
          if (trainer.trainerType?.toLowerCase().includes(token)) {
            score += 20;
            matchedCount++;
          }
          if (trainer.name?.toLowerCase().includes(token)) {
            score += 30;
            matchedCount++;
          }
          if (trainer.phone?.includes(token) || trainer.whatsapp?.includes(token)) {
            score += 35;
            matchedCount++;
          }
          if (trainer.bio?.toLowerCase().includes(token)) {
            score += 15;
            matchedCount++;
          }
        }

        if (trainer.availability === "available") score += 15;
        if (trainer.availability === "partial") score += 8;
        score += (trainer.rating || 4.5) * 2;
      }

      const totalExpectedMatches = (hasMinExp ? 1 : 0) + (hasTokens ? queryTokens.length : 1);
      const maxPossible = Math.max(1, totalExpectedMatches * 45 + 25);
      const matchPercentage = hasQuery
        ? Math.min(100, Math.max(55, Math.round((score / maxPossible) * 100)))
        : undefined;

      return {
        trainer,
        score,
        matchedCount,
        meetsExp,
        matchPercentage,
      };
    })
    .filter(({ trainer, matchedCount, meetsExp }) => {
      if (hasMinExp && !meetsExp) return false;

      if (hasTokens) {
        if (matchedCount === (hasMinExp ? 1 : 0)) {
          const isGenericMatch = queryTokens.some(
            (t) =>
              (trainer.city && trainer.city.toLowerCase().includes(t)) ||
              (trainer.name && trainer.name.toLowerCase().includes(t)) ||
              (trainer.designation && trainer.designation.toLowerCase().includes(t)) ||
              (trainer.phone && trainer.phone.includes(t)) ||
              (trainer.whatsapp && trainer.whatsapp.includes(t)) ||
              (trainer.bio && trainer.bio.toLowerCase().includes(t)) ||
              (trainer.primarySkill && trainer.primarySkill.toLowerCase().includes(t)),
          );
          if (!isGenericMatch) return false;
        }
      }

      if (cityFilter !== "All" && trainer.city !== cityFilter) return false;

      if (domainFilter !== "All") {
        const cat = getTrainerDomainCategory(trainer);
        if (domainFilter === "Technical" && !cat.isTechnical) return false;
        if (domainFilter === "Aptitude" && !cat.isAptitude) return false;
        if (domainFilter === "Soft Skills" && !cat.isSoftSkills) return false;
      }

      return true;
    })
    .sort((a, b) => b.score - a.score || (b.trainer.experience || 0) - (a.trainer.experience || 0));
}


