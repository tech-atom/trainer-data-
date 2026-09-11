import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  UserPlus,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  GraduationCap,
  Award,
  Briefcase,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { useStore } from "@/lib/store";
import type { TrainerType, Mode, Availability, SkillLevel } from "@/lib/trainers";

export const Route = createFileRoute("/trainers/new")({
  head: () => ({
    meta: [
      { title: "Add New Trainer — ATOM Trainer Hub" },
      {
        name: "description",
        content:
          "Onboard and verify a new trainer profile with skills, certifications, and availability.",
      },
    ],
  }),
  component: AddTrainerPage,
});

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced", "Expert"];
const MODES: Mode[] = ["Online", "Offline", "Hybrid"];
const TRAINER_TYPES: TrainerType[] = [
  "Technical Trainer",
  "Soft Skills Trainer",
  "Aptitude Trainer",
  "Domain Expert",
  "Industry Expert",
  "Guest Faculty",
];
const SECTORS = ["College", "University", "Corporate", "School", "Government"] as const;

function AddTrainerPage() {
  const { addTrainer, checkDuplicate } = useStore();
  const navigate = useNavigate();

  // Basic Info
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [country, setCountry] = useState("India");
  const [organization, setOrganization] = useState("Independent Consultant");
  const [experience, setExperience] = useState(6);
  const [trainingExperience, setTrainingExperience] = useState(4);
  const [trainerType, setTrainerType] = useState<TrainerType>("Technical Trainer");
  const [employment, setEmployment] = useState<"Freelance" | "Full-time" | "Part-time">(
    "Freelance",
  );
  const [selectedModes, setSelectedModes] = useState<Mode[]>(["Online", "Offline"]);
  const [availability, setAvailability] = useState<Availability>("available");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<
    Array<"College" | "University" | "Corporate" | "School" | "Government">
  >(["College", "Corporate"]);

  // Skills
  const [skills, setSkills] = useState<Array<{ name: string; level: SkillLevel; years: number }>>([
    { name: "Java", level: "Expert", years: 6 },
    { name: "Spring Boot", level: "Advanced", years: 4 },
  ]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>("Advanced");
  const [newSkillYears, setNewSkillYears] = useState(3);

  // Soft Skills
  const [softSkillsInput, setSoftSkillsInput] = useState(
    "Communication, Problem Solving, Interview Prep",
  );

  // Education
  const [education, setEducation] = useState<
    Array<{ degree: string; specialization: string; university: string; year: number }>
  >([
    { degree: "B.Tech / B.E.", specialization: "Computer Science", university: "VTU", year: 2016 },
  ]);

  // Certifications
  const [certifications, setCertifications] = useState<
    Array<{ name: string; org: string; id: string; issued: string; expires?: string }>
  >([]);
  const [certName, setCertName] = useState("");
  const [certOrg, setCertOrg] = useState("");
  const [certId, setCertId] = useState("");

  // Initial Note
  const [initialNote, setInitialNote] = useState("");

  // Real-time Duplicate Check
  const duplicateCheck = checkDuplicate(phone, email, name);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      { name: newSkillName.trim(), level: newSkillLevel, years: newSkillYears },
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddCert = () => {
    if (!certName.trim() || !certOrg.trim()) return;
    setCertifications([
      ...certifications,
      {
        name: certName.trim(),
        org: certOrg.trim(),
        id: certId.trim() || "CERT-VERIFIED",
        issued: "2024-01-01",
      },
    ]);
    setCertName("");
    setCertOrg("");
    setCertId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Trainer name is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }
    if (skills.length === 0) {
      toast.error("Please add at least one technical skill.");
      return;
    }

    const created = await addTrainer({
      name: name.trim(),
      designation: designation.trim() || "Technology Trainer",
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      organization: organization.trim(),
      experience: Number(experience),
      trainingExperience: Number(trainingExperience),
      trainerType,
      employment,
      modes: selectedModes,
      availability,
      availableFrom: availableFrom || undefined,
      availableUntil: availableUntil || undefined,
      rating: 4.8,
      projectsCompleted: 0,
      bio:
        bio.trim() ||
        `Specialized ${trainerType} with ${experience} years experience delivering training programs.`,
      status: "Active",
      tags: ["Verified", "New Onboard"],
      skills,
      softSkills: softSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      education,
      certifications,
      trainings: [],
      notes: initialNote.trim()
        ? [{ note: initialNote.trim(), by: "Admin", date: new Date().toISOString().split("T")[0] }]
        : [
            {
              note: "Trainer profile created and verified.",
              by: "Admin",
              date: new Date().toISOString().split("T")[0],
            },
          ],
      documents: [
        {
          name: "Trainer CV.pdf",
          type: "CV",
          date: new Date().toISOString().split("T")[0],
          by: "Admin",
        },
        {
          name: "ATOM Profile.pdf",
          type: "Profile PDF",
          date: new Date().toISOString().split("T")[0],
          by: "Admin",
        },
      ],
      sectors: selectedSectors,
      addedOn: new Date().toISOString().split("T")[0],
      photo: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=d7f2e3,e7f6ec,cdeedd`,
    });

    navigate({ to: "/trainers/$trainerId", params: { trainerId: created.id } });
  };

  return (
    <AppShell
      title="Onboard New Trainer"
      subtitle="Add a verified trainer to the central ATOM directory"
    >
      <div className="mb-4">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateCheck.isDuplicate && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-bold text-destructive">Possible Duplicate Trainer Detected!</p>
            <p className="mt-0.5 text-muted-foreground">{duplicateCheck.reason}</p>
            {duplicateCheck.matchedTrainer && (
              <Link
                to="/trainers/$trainerId"
                params={{ trainerId: duplicateCheck.matchedTrainer.id }}
                className="mt-2 inline-block font-bold text-destructive hover:underline"
              >
                View Existing Profile: {duplicateCheck.matchedTrainer.name} (
                {duplicateCheck.matchedTrainer.code}) →
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic & Contact Info */}
        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">
            1. Personal & Contact Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Full Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Designation / Role Title *
              </label>
              <input
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Java Full Stack Trainer"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Phone Number *
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919845012301"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                WhatsApp Number
              </label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+919845012301"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@example.com"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Current Organization / Freelance
              </label>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Independent Consultant"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bangalore"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                State
              </label>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Country
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Professional & Experience */}
        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">
            2. Professional & Training Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Total Experience (Years)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={experience}
                onChange={(e) => setExperience(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Training Experience (Years)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={trainingExperience}
                onChange={(e) => setTrainingExperience(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Trainer Specialization
              </label>
              <select
                value={trainerType}
                onChange={(e) => setTrainerType(e.target.value as TrainerType)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              >
                {TRAINER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Employment Type
              </label>
              <select
                value={employment}
                onChange={(e) =>
                  setEmployment(e.target.value as "Freelance" | "Full-time" | "Part-time")
                }
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              >
                <option value="Freelance">Freelance</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Training Modes Supported
              </label>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setSelectedModes(
                        selectedModes.includes(m)
                          ? selectedModes.filter((x) => x !== m)
                          : [...selectedModes, m],
                      )
                    }
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                      selectedModes.includes(m)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Sectors Experience
              </label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setSelectedSectors(
                        selectedSectors.includes(s)
                          ? selectedSectors.filter((x) => x !== s)
                          : [...selectedSectors, s],
                      )
                    }
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                      selectedSectors.includes(s)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
              Professional Bio / Summary
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summary of trainer's technical domain, previous client trainings, methodologies, and achievements..."
              className="w-full rounded-xl border border-border bg-muted/40 p-3 text-sm outline-none focus:border-primary focus:bg-card"
            />
          </div>
        </div>

        {/* Section 3: Technical & Soft Skills */}
        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">
            3. Skills & Proficiency Matrix
          </h2>

          {/* Existing Skills List */}
          <div className="mb-4 flex flex-wrap gap-2">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-border bg-accent/60 px-3 py-1.5 text-xs font-semibold text-accent-foreground"
              >
                <span>{s.name}</span>
                <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {s.level}
                </span>
                <span className="text-[10px] opacity-75">{s.years}y</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add Skill Row */}
          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                Skill Name
              </label>
              <input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Docker, Python, VLSI, Aptitude"
                className="w-full rounded-lg border border-border bg-card p-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                Level
              </label>
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
                className="rounded-lg border border-border bg-card p-2 text-xs outline-none focus:border-primary"
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                Years
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(Number(e.target.value))}
                className="w-20 rounded-lg border border-border bg-card p-2 text-xs outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSkill}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Add Skill
            </button>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
              Soft Skills (Comma separated)
            </label>
            <input
              value={softSkillsInput}
              onChange={(e) => setSoftSkillsInput(e.target.value)}
              placeholder="Communication, Leadership, Interview Skills, Team Management"
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
            />
          </div>
        </div>

        {/* Section 4: Availability & Schedule */}
        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">4. Availability & Status</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Current Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as Availability)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              >
                <option value="available">🟢 Available (Ready for new allocation)</option>
                <option value="partial">🟡 Partially Available (Specific dates)</option>
                <option value="assigned">🔵 Assigned (On active project)</option>
                <option value="unavailable">🔴 Unavailable</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Available From (Optional)
              </label>
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Available Until (Optional)
              </label>
              <input
                type="date"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Internal Admin Note */}
        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">5. Internal Admin Note</h2>
          <textarea
            rows={2}
            value={initialNote}
            onChange={(e) => setInitialNote(e.target.value)}
            placeholder="e.g. Excellent for campus batches; prefers offline programs in Karnataka..."
            className="w-full rounded-xl border border-border bg-muted/40 p-3 text-sm outline-none focus:border-primary focus:bg-card"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to="/trainers"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
          >
            <UserPlus className="h-4 w-4" /> Save & Verify Trainer
          </button>
        </div>
      </form>
    </AppShell>
  );
}
