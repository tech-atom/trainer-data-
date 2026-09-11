import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { useStore } from "@/lib/store";
import type { TrainerType, Mode, Availability, SkillLevel } from "@/lib/trainers";

export const Route = createFileRoute("/trainers/$trainerId/edit")({
  head: () => ({
    meta: [{ title: "Edit Trainer — ATOM Trainer Hub" }],
  }),
  component: EditTrainerPage,
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

function EditTrainerPage() {
  const params = useParams({ from: "/trainers/$trainerId/edit" });
  const navigate = useNavigate();
  const { getTrainerById, updateTrainer } = useStore();

  const trainer = getTrainerById(params.trainerId);

  // Form State
  const [name, setName] = useState(trainer?.name || "");
  const [designation, setDesignation] = useState(trainer?.designation || "");
  const [phone, setPhone] = useState(trainer?.phone || "");
  const [whatsapp, setWhatsapp] = useState(trainer?.whatsapp || "");
  const [email, setEmail] = useState(trainer?.email || "");
  const [city, setCity] = useState(trainer?.city || "Bangalore");
  const [state, setState] = useState(trainer?.state || "Karnataka");
  const [organization, setOrganization] = useState(trainer?.organization || "");
  const [experience, setExperience] = useState(trainer?.experience || 5);
  const [trainingExperience, setTrainingExperience] = useState(trainer?.trainingExperience || 3);
  const [trainerType, setTrainerType] = useState<TrainerType>(
    trainer?.trainerType || "Technical Trainer",
  );
  const [employment, setEmployment] = useState(trainer?.employment || "Freelance");
  const [selectedModes, setSelectedModes] = useState<Mode[]>(
    trainer?.modes || ["Online", "Offline"],
  );
  const [availability, setAvailability] = useState<Availability>(
    trainer?.availability || "available",
  );
  const [availableFrom, setAvailableFrom] = useState(trainer?.availableFrom || "");
  const [availableUntil, setAvailableUntil] = useState(trainer?.availableUntil || "");
  const [bio, setBio] = useState(trainer?.bio || "");
  const [selectedSectors, setSelectedSectors] = useState(
    trainer?.sectors || ["College", "Corporate"],
  );

  // Skills
  const [skills, setSkills] = useState(trainer?.skills || []);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>("Advanced");
  const [newSkillYears, setNewSkillYears] = useState(3);

  // Soft Skills
  const [softSkillsInput, setSoftSkillsInput] = useState(trainer?.softSkills.join(", ") || "");

  if (!trainer) {
    return (
      <AppShell title="Trainer Not Found">
        <div className="card-surface p-12 text-center">
          <p className="text-base font-bold text-foreground">Trainer Profile Not Found</p>
          <Link
            to="/trainers"
            className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            Back to Directory
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      { name: newSkillName.trim(), level: newSkillLevel, years: newSkillYears },
    ]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Trainer name is required.");
      return;
    }

    updateTrainer(trainer.id, {
      name: name.trim(),
      designation: designation.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim(),
      city: city.trim(),
      state: state.trim(),
      organization: organization.trim(),
      experience: Number(experience),
      trainingExperience: Number(trainingExperience),
      trainerType,
      employment: employment as "Freelance" | "Full-time" | "Part-time",
      modes: selectedModes,
      availability,
      availableFrom: availableFrom || undefined,
      availableUntil: availableUntil || undefined,
      bio: bio.trim(),
      sectors: selectedSectors,
      skills,
      softSkills: softSkillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });

    navigate({ to: "/trainers/$trainerId", params: { trainerId: trainer.id } });
  };

  return (
    <AppShell
      title={`Edit Profile: ${trainer.name}`}
      subtitle={`Update details for trainer ${trainer.code}`}
    >
      <div className="mb-4">
        <Link
          to="/trainers/$trainerId"
          params={{ trainerId: trainer.id }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel & View Profile
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">Personal & Contact Details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Full Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Designation
              </label>
              <input
                required
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Phone Number
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-sm outline-none focus:border-primary focus:bg-card"
              />
            </div>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">Skills & Specialization</h2>
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

          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <div className="flex-1 min-w-[160px]">
              <label className="mb-1 block text-[11px] font-bold uppercase text-muted-foreground">
                Skill Name
              </label>
              <input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. Kotlin, Power BI"
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
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        <div className="card-surface p-6">
          <h2 className="mb-4 text-base font-bold text-foreground">Bio & Summary</h2>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 p-3 text-sm outline-none focus:border-primary focus:bg-card"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            to="/trainers/$trainerId"
            params={{ trainerId: trainer.id }}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </form>
    </AppShell>
  );
}
