import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Layers,
  MapPin,
  Sparkles,
  Award,
  Phone,
  Mail,
  FileText,
  Building,
  Calendar,
  Globe,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Trainer, TrainerType, Mode, Availability, SkillLevel, TrainerSkill } from "@/lib/trainers";

interface CompleteProfileModalProps {
  trainer: Trainer | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (trainerId: string) => void;
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

const SECTOR_OPTIONS = ["College", "University", "Corporate", "School", "Government"] as const;

export function CompleteProfileModal({
  trainer,
  isOpen,
  onClose,
  onCompleted,
}: CompleteProfileModalProps) {
  const { updateTrainer } = useStore();

  // Basic Info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [trainerType, setTrainerType] = useState<TrainerType>("Technical Trainer");

  // Location & Org
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [organization, setOrganization] = useState("ATOM Faculty");

  // Experience & Modes
  const [experience, setExperience] = useState(5);
  const [trainingExperience, setTrainingExperience] = useState(4);
  const [projectsCompleted, setProjectsCompleted] = useState(10);
  const [employment, setEmployment] = useState<"Freelance" | "Full-time" | "Part-time">("Freelance");
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

  // Populate fields when a trainer is selected
  useEffect(() => {
    if (trainer) {
      setName(trainer.name || "");
      setPhone(trainer.phone || "");
      setWhatsapp(trainer.whatsapp || trainer.phone || "");
      setEmail(trainer.email || `${(trainer.name || "trainer").toLowerCase().replace(/\s+/g, "")}@atom.ac.in`);
      setDesignation(trainer.designation || `${trainer.skills?.[0]?.name || "Corporate"} Trainer`);
      setTrainerType(trainer.trainerType || "Technical Trainer");
      setCity(trainer.city || "Bangalore");
      setState(trainer.state || "Karnataka");
      setOrganization(trainer.organization || "Independent / ATOM Faculty");
      setExperience(trainer.experience || 5);
      setTrainingExperience(trainer.trainingExperience || 4);
      setProjectsCompleted(trainer.projectsCompleted || 10);
      setEmployment(trainer.employment || "Freelance");
      setAvailability(trainer.availability || "available");
      setSelectedModes(trainer.modes && trainer.modes.length > 0 ? trainer.modes : ["Online", "Offline"]);
      setSelectedSectors(trainer.sectors && trainer.sectors.length > 0 ? trainer.sectors : ["College", "Corporate"]);

      // Skills
      const skillNames = trainer.skills?.map((s) => s.name).join(", ") || "";
      setSkillsInput(skillNames);

      const softSkillNames = trainer.softSkills && trainer.softSkills.length > 0
        ? trainer.softSkills.join(", ")
        : "Communication, Interview Prep, Problem Solving";
      setSoftSkillsInput(softSkillNames);

      // Education
      if (trainer.education && trainer.education.length > 0) {
        const edu = trainer.education[0];
        setDegree(edu.degree || "B.E. / B.Tech");
        setSpecialization(edu.specialization || "Engineering");
        setUniversity(edu.university || "VTU");
        setGradYear(edu.year || new Date().getFullYear() - 5);
      } else {
        setDegree("B.E. / B.Tech");
        setSpecialization("Computer Science / Engineering");
        setUniversity("State University");
        setGradYear(new Date().getFullYear() - 5);
      }

      // Certifications
      if (trainer.certifications && trainer.certifications.length > 0) {
        setCertificationsInput(trainer.certifications.map((c) => c.name).join(", "));
      } else {
        setCertificationsInput("");
      }

      // Bio
      setBio(
        trainer.bio && !trainer.bio.startsWith("Quick contact")
          ? trainer.bio
          : `Experienced ${trainer.designation || "trainer"} with proven track record in campus placement preparation, hands-on workshops, and corporate training.`,
      );
    }
  }, [trainer, isOpen]);

  if (!isOpen || !trainer) return null;

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
      toast.error("Trainer name is required.");
      return;
    }
    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse technical skills
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
              years: Math.max(1, Math.min(experience, 10)),
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
      const certNames = certificationsInput
        .split(/[,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const certifications = certNames.map((cName, idx) => ({
        name: cName,
        org: "Authorized Certification Authority",
        id: `CERT-${Date.now()}-${idx + 1}`,
        issued: `${new Date().getFullYear() - 1}-06-01`,
      }));

      // Update tags: remove quick contact tags and add full profile tags
      const currentTags = trainer.tags || [];
      const filteredTags = currentTags.filter(
        (t) =>
          ![
            "Quick Contact",
            "Excel Bulk Import",
            "Minimal Contact",
            "Phone Directory",
            "Name & Phone Directory",
            "Manual Quick Add",
          ].includes(t),
      );

      const updatedTags = Array.from(
        new Set(["Full Profile", "Verified Profile", trainerType, ...filteredTags]),
      );

      // Education payload
      const education = [
        {
          degree: degree.trim(),
          specialization: specialization.trim(),
          university: university.trim(),
          year: Number(gradYear),
        },
      ];

      // Documents payload
      const documents =
        trainer.documents && trainer.documents.length > 0
          ? trainer.documents
          : [
              {
                name: `${name.trim()} Profile.pdf`,
                type: "Profile PDF",
                date: new Date().toISOString().split("T")[0],
                by: "Admin",
              },
            ];

      await updateTrainer(trainer.id, {
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, "")}@atom.ac.in`,
        designation: designation.trim(),
        trainerType,
        city: city.trim(),
        state: state.trim(),
        organization: organization.trim(),
        experience: Number(experience),
        trainingExperience: Number(trainingExperience),
        projectsCompleted: Number(projectsCompleted),
        employment,
        availability,
        modes: selectedModes,
        sectors: selectedSectors,
        skills,
        primarySkill: skills[0]?.name || designation || trainerType,
        softSkills,
        education,
        certifications,
        documents,
        bio: bio.trim(),
        tags: updatedTags,
      });

      toast.success(`✨ Profile completed! "${name}" has been upgraded to Verified Full Profiles.`);
      onCompleted?.(trainer.id);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className="card-surface max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-7 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-foreground">Complete Trainer Profile</h2>
                <span className="rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  ⚡ Upgrade to Full Profile
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Fill in complete professional credentials, education, skills & experience for <strong>{trainer.name}</strong> ({trainer.code}).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* SECTION 1: Personal & Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>1. Trainer & Contact Details</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chaitra Sharma"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">
                  Designation / Role Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Lead Java Full Stack Technical Trainer"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="relative mt-1 flex items-center">
                  <Phone className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9845012345"
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs font-mono font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">WhatsApp Number</label>
                <div className="relative mt-1 flex items-center">
                  <Phone className="absolute left-3 h-3.5 w-3.5 text-emerald-600" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. +91 9845012345"
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs font-mono font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">Email Address</label>
                <div className="relative mt-1 flex items-center">
                  <Mail className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. chaitra@atom.ac.in"
                    className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">
                  Primary Domain / Category <span className="text-destructive">*</span>
                </label>
                <select
                  value={trainerType}
                  onChange={(e) => setTrainerType(e.target.value as TrainerType)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {TRAINER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Location & Organization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <MapPin className="h-3.5 w-3.5" />
              <span>2. Location & Institution</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-bold text-foreground">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">Organization / Affiliation</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. ATOM Faculty / Independent"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Experience, Delivery Modes & Availability */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Briefcase className="h-3.5 w-3.5" />
              <span>3. Experience & Delivery Model</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[11px] font-bold text-foreground">Total Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">Training Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={trainingExperience}
                  onChange={(e) => setTrainingExperience(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">Employment Type</label>
                <select
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="Freelance">Freelance</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>

            {/* Delivery Modes & Sectors */}
            <div className="grid gap-4 sm:grid-cols-2 pt-1">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1.5">
                  Training Delivery Modes
                </label>
                <div className="flex flex-wrap gap-2">
                  {MODES.map((mode) => {
                    const isSelected = selectedModes.includes(mode);
                    return (
                      <button
                        type="button"
                        key={mode}
                        onClick={() => toggleMode(mode)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1.5">
                  Target Delivery Sectors
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SECTOR_OPTIONS.map((sec) => {
                    const isSelected = selectedSectors.includes(sec);
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => toggleSector(sec)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-background text-muted-foreground border-border hover:bg-muted"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Skills & Competencies */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Layers className="h-3.5 w-3.5" />
              <span>4. Technical & Soft Skills</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold text-foreground">
                  Core / Technical Skills (Comma-separated) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. Java, Python, Spring Boot, DSA, SQL, AWS"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Enter key subjects, technologies, or topics separated by commas.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">
                  Soft Skills & Interview Modules
                </label>
                <input
                  type="text"
                  value={softSkillsInput}
                  onChange={(e) => setSoftSkillsInput(e.target.value)}
                  placeholder="e.g. Communication, Problem Solving, GD Prep, Personality Development"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Education Credentials */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>5. Education & Academics</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[11px] font-bold text-foreground">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.E. / B.Tech / MCA"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">University / College</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. VTU"
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground">Graduation Year</label>
                <input
                  type="number"
                  min={1980}
                  max={new Date().getFullYear() + 2}
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Certifications & Bio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Award className="h-3.5 w-3.5" />
              <span>6. Certifications & Profile Bio</span>
            </div>
            <div>
              <label className="text-[11px] font-bold text-foreground">Certifications (Optional)</label>
              <input
                type="text"
                value={certificationsInput}
                onChange={(e) => setCertificationsInput(e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect, Oracle Java SE 11, ISTQB"
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-foreground">Professional Summary / Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of training highlights, corporate programs delivered, student feedback..."
                className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-border bg-muted/40 px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-md hover:bg-primary/90 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? "Saving & Upgrading..." : "Save & Complete Profile"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
