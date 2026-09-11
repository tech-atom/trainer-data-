import React, { useState } from "react";
import {
  X,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Layers,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { TrainerType, Mode, Availability, SkillLevel, TrainerSkill } from "@/lib/trainers";

interface SimpleAddTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrainerAdded?: (trainerId: string) => void;
}

const TRAINER_TYPES: TrainerType[] = [
  "Technical Trainer",
  "Soft Skills Trainer",
  "Aptitude Trainer",
  "Domain Expert",
  "Industry Expert",
  "Guest Faculty",
];

const MODES: Mode[] = ["Online", "Offline", "Hybrid"];

export function SimpleAddTrainerModal({
  isOpen,
  onClose,
  onTrainerAdded,
}: SimpleAddTrainerModalProps) {
  const { addTrainer, checkDuplicate } = useStore();

  // Basic Details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [trainerType, setTrainerType] = useState<TrainerType>("Technical Trainer");

  // Location & Org
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [organization, setOrganization] = useState("Independent Consultant");

  // Experience & Modes
  const [experience, setExperience] = useState(5);
  const [trainingExperience, setTrainingExperience] = useState(4);
  const [projectsCompleted, setProjectsCompleted] = useState(10);
  const [availability, setAvailability] = useState<Availability>("available");
  const [selectedModes, setSelectedModes] = useState<Mode[]>(["Online", "Offline"]);
  const [selectedSectors, setSelectedSectors] = useState<
    Array<"College" | "University" | "Corporate" | "School" | "Government">
  >(["College", "Corporate"]);

  // Skills
  const [skillsInput, setSkillsInput] = useState("");
  const [softSkillsInput, setSoftSkillsInput] = useState("Communication, Problem Solving, Interview Prep");

  // Education
  const [degree, setDegree] = useState("B.E. / B.Tech");
  const [specialization, setSpecialization] = useState("Computer Science");
  const [university, setUniversity] = useState("VTU");
  const [gradYear, setGradYear] = useState(new Date().getFullYear() - 5);

  // Certifications & Bio
  const [certificationsInput, setCertificationsInput] = useState("");
  const [bio, setBio] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Real-time duplicate check
  const duplicateCheck = checkDuplicate(phone, email, name);

  const toggleMode = (mode: Mode) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const toggleSector = (sector: "College" | "University" | "Corporate" | "School" | "Government") => {
    if (selectedSectors.includes(sector)) {
      if (selectedSectors.length > 1) {
        setSelectedSectors(selectedSectors.filter((s) => s !== sector));
      }
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter the trainer's name.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter the phone number.");
      return;
    }

    if (duplicateCheck.isDuplicate) {
      toast.warning(`Duplicate warning: ${duplicateCheck.reason}`);
    }

    setIsSubmitting(true);
    try {
      // Parse skills
      const parsedSkillNames = Array.from(
        new Set(
          skillsInput
            .split(/[,+/&]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        ),
      );

      const skills: TrainerSkill[] =
        parsedSkillNames.length > 0
          ? parsedSkillNames.map((s) => ({
              name: s,
              level: "Expert" as SkillLevel,
              years: Math.max(1, Math.min(experience, 8)),
            }))
          : [
              {
                name: designation || trainerType.replace(" Trainer", ""),
                level: "Expert" as SkillLevel,
                years: experience,
              },
            ];

      // Parse soft skills
      const softSkills = softSkillsInput
        .split(/[,+]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      // Parse certifications
      const certifications = certificationsInput
        .split(/[,;]+/)
        .map((c) => c.trim())
        .filter(Boolean)
        .map((cert) => ({
          name: cert,
          org: "Recognized Body",
          id: `CERT-${Date.now().toString().slice(-4)}`,
          issued: new Date().toISOString().split("T")[0],
        }));

      const finalEmail =
        email.trim() ||
        `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, ".")}@atom.ac.in`;

      const finalWhatsapp = whatsapp.trim() || phone.trim();

      const finalDesignation =
        designation.trim() ||
        `${skills[0]?.name || trainerType.replace(" Trainer", "")} Specialist`;

      const finalBio =
        bio.trim() ||
        `Experienced ${trainerType} with ${experience} years experience delivering ${selectedModes.join(", ")} training programs across ${city} and Pan-India.`;

      const newTrainer = await addTrainer({
        name: name.trim(),
        designation: finalDesignation,
        phone: phone.trim(),
        whatsapp: finalWhatsapp,
        email: finalEmail,
        city: city.trim(),
        state: state.trim(),
        country: "India",
        organization: organization.trim(),
        experience: Number(experience) || 5,
        trainingExperience: Number(trainingExperience) || 4,
        trainerType,
        employment: "Freelance",
        modes: selectedModes,
        availability,
        rating: 4.8,
        projectsCompleted: Number(projectsCompleted) || 10,
        bio: finalBio,
        status: "Active",
        tags: [trainerType.replace(" Trainer", ""), city, "Verified"],
        skills,
        softSkills,
        education: degree
          ? [
              {
                degree: degree.trim(),
                specialization: specialization.trim(),
                university: university.trim(),
                year: Number(gradYear) || 2018,
              },
            ]
          : [],
        certifications,
        trainings: [],
        notes: [],
        documents: [],
        sectors: selectedSectors,
        addedOn: new Date().toISOString().split("T")[0],
      });

      toast.success(`Trainer "${newTrainer.name}" added successfully to database!`);
      if (onTrainerAdded) {
        onTrainerAdded(newTrainer.id);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add trainer to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card-surface max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-primary/10 p-3 text-primary">
              <UserPlus className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">Add New Trainer</h2>
              <p className="text-xs text-muted-foreground">
                Enter complete trainer profile details for internal matchmaking and deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Duplicate Warning */}
        {duplicateCheck.isDuplicate && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{duplicateCheck.reason}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6 text-xs">
          {/* SECTION 1: Personal & Contact Information */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <UserPlus className="h-3.5 w-3.5" /> 1. Personal & Contact Details
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="font-bold text-foreground block mb-1">Trainer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="font-bold text-foreground block mb-1">Designation / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Java Full Stack Trainer / Aptitude Lead"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="font-bold text-foreground block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9845012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="font-bold text-foreground block mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="Defaults to Phone Number if blank"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="font-bold text-foreground block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. rajesh.kumar@atom.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Trainer Type */}
              <div>
                <label className="font-bold text-foreground block mb-1">Trainer Category / Domain</label>
                <select
                  value={trainerType}
                  onChange={(e) => setTrainerType(e.target.value as TrainerType)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {TRAINER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Location & Organization */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <MapPin className="h-3.5 w-3.5" /> 2. Location & Affiliation
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              {/* City */}
              <div>
                <label className="font-bold text-foreground block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* State */}
              <div>
                <label className="font-bold text-foreground block mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g. Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Organization */}
              <div>
                <label className="font-bold text-foreground block mb-1">Current Affiliation</label>
                <input
                  type="text"
                  placeholder="e.g. Independent Consultant / ATOM Faculty"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Experience, Availability & Delivery Modes */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Briefcase className="h-3.5 w-3.5" /> 3. Experience & Availability
            </h3>

            <div className="grid gap-3 sm:grid-cols-4">
              {/* Total Exp */}
              <div>
                <label className="font-bold text-foreground block mb-1">Total Exp (Years)</label>
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Training Exp */}
              <div>
                <label className="font-bold text-foreground block mb-1">Training Exp (Years)</label>
                <input
                  type="number"
                  min={0}
                  max={45}
                  value={trainingExperience}
                  onChange={(e) => setTrainingExperience(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Projects Completed */}
              <div>
                <label className="font-bold text-foreground block mb-1">Batches Delivered</label>
                <input
                  type="number"
                  min={0}
                  value={projectsCompleted}
                  onChange={(e) => setProjectsCompleted(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Availability */}
              <div>
                <label className="font-bold text-foreground block mb-1">Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as Availability)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="available">🟢 Available (Ready to Deploy)</option>
                  <option value="partial">🟡 Partial Availability</option>
                  <option value="assigned">🔵 Assigned to Batch</option>
                  <option value="unavailable">🔴 Unavailable</option>
                </select>
              </div>
            </div>

            {/* Delivery Modes & Sectors */}
            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="font-bold text-foreground block mb-1.5">Delivery Modes</label>
                <div className="flex flex-wrap gap-2">
                  {MODES.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => toggleMode(mode)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        selectedModes.includes(mode)
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-card border border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {selectedModes.includes(mode) ? "✓ " : ""}{mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1.5">Target Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {(["College", "University", "Corporate", "School", "Government"] as const).map(
                    (sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSector(sector)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          selectedSectors.includes(sector)
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-card border border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {selectedSectors.includes(sector) ? "✓ " : ""}{sector}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Skills & Competencies */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> 4. Skills & Competencies
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-foreground block mb-1">
                  Primary Domain Skills * (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java, Spring Boot, Microservices, SQL, DSA or Aptitude, Quantitative, Logical"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Separate multiple technical/domain skills with commas for algorithmic requirement matching.
                </p>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Soft Skills / Interpersonal</label>
                <input
                  type="text"
                  placeholder="e.g. Communication, Leadership, Interview Skills, Group Discussion"
                  value={softSkillsInput}
                  onChange={(e) => setSoftSkillsInput(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Education & Certifications */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <GraduationCap className="h-3.5 w-3.5" /> 5. Education & Certifications
            </h3>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="font-bold text-foreground block mb-1">Degree</label>
                <input
                  type="text"
                  placeholder="e.g. B.E. / M.Tech / MBA / MCA / Ph.D"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">University / College</label>
                <input
                  type="text"
                  placeholder="e.g. VTU / Anna University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Graduation Year</label>
                <input
                  type="number"
                  min={1980}
                  max={2030}
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-foreground block mb-1">Certifications (Optional)</label>
              <input
                type="text"
                placeholder="e.g. AWS Solutions Architect, Oracle Java SE 11, ISTQB, Scrum Master"
                value={certificationsInput}
                onChange={(e) => setCertificationsInput(e.target.value)}
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* SECTION 6: Bio / Professional Summary */}
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Layers className="h-3.5 w-3.5" /> 6. Professional Summary / Bio
            </h3>
            <textarea
              rows={3}
              placeholder="Detailed training profile summary, notable corporate clients, or pedagogy strengths..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? "Saving to Database..." : "Save Trainer Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
