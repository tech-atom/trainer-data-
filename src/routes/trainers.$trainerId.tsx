import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Mail,
  Star,
  MapPin,
  Building,
  Award,
  GraduationCap,
  Calendar,
  Briefcase,
  FileText,
  FileDown,
  Printer,
  Edit,
  Trash2,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Share2,
  ArrowLeft,
  ChevronRight,
  UserX,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { ContactActions, StatusPill, waLink, mailLink } from "@/components/atom/TrainerCard";
import { availabilityMeta, profileCompleteness } from "@/lib/trainers";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/trainers/$trainerId")({
  head: ({ params }) => ({
    meta: [
      { title: `Trainer Profile — ATOM Trainer Hub` },
      {
        name: "description",
        content:
          "Complete trainer profile with skills, certifications, availability, documents and ratings.",
      },
    ],
  }),
  component: TrainerProfilePage,
});

type TabId =
  | "overview"
  | "skills"
  | "education"
  | "trainings"
  | "availability"
  | "documents"
  | "notes"
  | "ratings";

function TrainerProfilePage() {
  const params = useParams({ from: "/trainers/$trainerId" });
  const navigate = useNavigate();
  const {
    getTrainerById,
    updateTrainer,
    deleteTrainer,
    archiveTrainer,
    addTrainerNote,
    addTrainerDocument,
    deleteTrainerDocument,
    addTrainerRating,
    updateAvailability,
    currentRole,
    orgSettings,
  } = useStore();

  const trainer = getTrainerById(params.trainerId);

  // Tabs state
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Modals state
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("Certificates");

  // Rating modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [rateProject, setRateProject] = useState("");
  const [rateTech, setRateTech] = useState(5);
  const [rateComm, setRateComm] = useState(5);
  const [rateEngage, setRateEngage] = useState(5);
  const [ratePunctual, setRatePunctual] = useState(5);
  const [rateContent, setRateContent] = useState(5);
  const [rateComments, setRateComments] = useState("");

  // Quick availability status modal
  const [availModalOpen, setAvailModalOpen] = useState(false);
  const [newAvail, setNewAvail] = useState(trainer?.availability || "available");
  const [newAvailFrom, setNewAvailFrom] = useState(trainer?.availableFrom || "");
  const [newAvailUntil, setNewAvailUntil] = useState(trainer?.availableUntil || "");

  if (!trainer) {
    return (
      <AppShell title="Trainer Not Found">
        <div className="card-surface p-12 text-center">
          <p className="text-base font-bold text-foreground">Trainer Profile Not Found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested trainer does not exist or has been removed.
          </p>
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

  const completeness = profileCompleteness(trainer);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addTrainerNote(trainer.id, noteInput.trim());
    setNoteInput("");
  };

  const handleAddDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;
    addTrainerDocument(trainer.id, { name: docName.trim(), type: docType });
    setDocName("");
    setDocModalOpen(false);
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    const overall = Number(
      ((rateTech + rateComm + rateEngage + ratePunctual + rateContent) / 5).toFixed(1),
    );
    addTrainerRating(trainer.id, {
      technical: rateTech,
      communication: rateComm,
      engagement: rateEngage,
      punctuality: ratePunctual,
      content: rateContent,
      overall,
      comments: rateComments.trim(),
      project: rateProject.trim() || "Corporate Training",
    });
    setRatingModalOpen(false);
    setRateComments("");
    setRateProject("");
  };

  const handleSaveAvailability = () => {
    updateAvailability(trainer.id, newAvail, { from: newAvailFrom, until: newAvailUntil });
    setAvailModalOpen(false);
  };

  return (
    <AppShell title={trainer.name} subtitle={`${trainer.code} • ${trainer.designation}`}>
      {/* Back link & Actions Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/trainers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPdfModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5 text-primary" /> View & Print CV Profile
          </button>

          <button
            onClick={() => setRatingModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold hover:bg-muted"
          >
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" /> Rate Trainer
          </button>

          {currentRole === "Admin" && (
            <Link
              to="/trainers/$trainerId/edit"
              params={{ trainerId: trainer.id }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold hover:bg-muted"
            >
              <Edit className="h-3.5 w-3.5 text-muted-foreground" /> Edit Profile
            </Link>
          )}

          {currentRole === "Admin" && (
            <button
              onClick={() => archiveTrainer(trainer.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold hover:bg-muted"
            >
              <Archive className="h-3.5 w-3.5 text-muted-foreground" />
              {trainer.status === "Archived" ? "Unarchive" : "Archive"}
            </button>
          )}

          {currentRole === "Admin" && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete trainer ${trainer.name}?`)) {
                  deleteTrainer(trainer.id);
                  navigate({ to: "/trainers" });
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/20"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="card-surface mb-6 p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <img
              src={trainer.photo}
              alt={trainer.name}
              className="h-24 w-24 rounded-2xl border-2 border-border bg-muted object-cover shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-2xl font-bold text-foreground">{trainer.name}</h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-mono font-semibold text-muted-foreground">
                  {trainer.code}
                </span>
                <StatusPill trainer={trainer} />
                {trainer.status !== "Active" && (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                    {trainer.status}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {trainer.designation} • {trainer.organization}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {trainer.city}, {trainer.state}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5 text-primary" /> {trainer.experience} Years Exp
                  ({trainer.trainingExperience}y Training)
                </span>
                <span className="flex items-center gap-1 font-bold text-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {trainer.projectsCompleted} Projects Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Quick Contact Box */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Quick Contact Actions
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:${trainer.phone}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-2 text-xs font-bold hover:bg-muted"
              >
                <Phone className="h-3.5 w-3.5 text-primary" /> {trainer.phone}
              </a>
              <a
                href={waLink(trainer)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-bold hover:bg-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
              <a
                href={mailLink(trainer)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-card border border-border px-3 py-2 text-xs font-bold hover:bg-muted"
              >
                <Mail className="h-3.5 w-3.5 text-primary" /> Email
              </a>
            </div>
          </div>
        </div>

        {/* Profile Completeness Bar */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Profile Completeness</span>
            <span
              className={
                completeness.pct >= 80 ? "text-primary font-bold" : "text-amber-600 font-bold"
              }
            >
              {completeness.pct}%
            </span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                completeness.pct >= 80 ? "bg-primary" : "bg-amber-500"
              }`}
              style={{ width: `${completeness.pct}%` }}
            />
          </div>
          {completeness.missing.length > 0 && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              To reach 100%, consider adding:{" "}
              <span className="font-medium text-foreground">{completeness.missing.join(", ")}</span>
            </p>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 flex overflow-x-auto border-b border-border text-xs font-bold">
        {[
          { id: "overview", label: "Overview & Bio" },
          { id: "skills", label: `Skills (${trainer.skills.length})` },
          {
            id: "education",
            label: `Education & Certs (${trainer.education.length + trainer.certifications.length})`,
          },
          { id: "trainings", label: `Training History (${trainer.trainings.length})` },
          { id: "availability", label: "Availability Schedule" },
          { id: "documents", label: `Documents (${trainer.documents.length})` },
          { id: "notes", label: `Internal Notes (${trainer.notes.length})` },
          { id: "ratings", label: "Ratings & Scorecard" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`cursor-pointer border-b-2 px-4 py-3 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card-surface p-6 lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Professional Summary
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {trainer.bio || "No professional summary provided."}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Primary Technical Stack
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {trainer.skills.map((s) => (
                  <span
                    key={s.name}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground"
                  >
                    <span>{s.name}</span>
                    <span className="rounded bg-card px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {s.level}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Target Sectors
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {trainer.sectors.map((sec) => (
                  <span
                    key={sec}
                    className="rounded-xl border border-border bg-muted px-3 py-1 text-xs font-semibold"
                  >
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card-surface p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Profile Metadata
            </h3>
            <div className="divide-y divide-border">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Trainer Code:</span>
                <span className="font-semibold text-foreground">{trainer.code}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Employment:</span>
                <span className="font-semibold text-foreground">{trainer.employment}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Training Modes:</span>
                <span className="font-semibold text-foreground">{trainer.modes.join(", ")}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Added On:</span>
                <span className="font-semibold text-foreground">{trainer.addedOn}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Registered Phone:</span>
                <span className="font-semibold text-foreground">{trainer.phone}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Registered Email:</span>
                <span className="font-semibold text-foreground">{trainer.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS */}
      {activeTab === "skills" && (
        <div className="card-surface p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Technical Skills & Proficiency Levels
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainer.skills.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3.5"
                >
                  <div>
                    <p className="font-bold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.years} Years Experience</p>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-bold ${
                      s.level === "Expert"
                        ? "bg-primary/20 text-primary"
                        : s.level === "Advanced"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-base font-bold text-foreground">
              Soft Skills & Placement Training
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {trainer.softSkills.map((ss) => (
                <span
                  key={ss}
                  className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold"
                >
                  {ss}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EDUCATION & CERTS */}
      {activeTab === "education" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Education */}
          <div className="card-surface p-6">
            <h3 className="mb-4 text-base font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Educational Qualifications
            </h3>
            <div className="space-y-3 text-xs">
              {trainer.education.map((edu, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-muted/40 p-3.5">
                  <p className="font-bold text-foreground text-sm">
                    {edu.degree} in {edu.specialization}
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    {edu.university} • Year {edu.year}
                  </p>
                </div>
              ))}
              {trainer.education.length === 0 && (
                <p className="text-muted-foreground">No education listed.</p>
              )}
            </div>
          </div>

          {/* Certifications */}
          <div className="card-surface p-6">
            <h3 className="mb-4 text-base font-bold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Professional Certifications
            </h3>
            <div className="space-y-3 text-xs">
              {trainer.certifications.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-muted/40 p-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{c.name}</p>
                      <p className="text-muted-foreground mt-0.5">
                        {c.org} • Credential ID: {c.id}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-1">
                        Issued: {c.issued} {c.expires ? `• Valid until: ${c.expires}` : ""}
                      </p>
                    </div>
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      Verified
                    </span>
                  </div>
                </div>
              ))}
              {trainer.certifications.length === 0 && (
                <p className="text-muted-foreground">No certifications uploaded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TRAININGS */}
      {activeTab === "trainings" && (
        <div className="card-surface p-6">
          <h3 className="mb-4 text-base font-bold text-foreground">
            Delivered ATOM Training Batches & Client Programs
          </h3>
          <div className="space-y-3">
            {trainer.trainings.map((tr, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{tr.program}</h4>
                    <p className="text-muted-foreground mt-0.5">
                      Client: <span className="font-semibold text-foreground">{tr.client}</span> •
                      Location: {tr.location} ({tr.mode})
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Technology Covered:{" "}
                      <span className="font-medium text-foreground">{tr.tech}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary text-sm">★ {tr.rating.toFixed(1)}</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {tr.students} Students • {tr.days} Days • {tr.year}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {trainer.trainings.length === 0 && (
              <p className="text-xs text-muted-foreground">No historical training records yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AVAILABILITY */}
      {activeTab === "availability" && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Current Availability Status</h3>
              <p className="text-xs text-muted-foreground">
                Deployment readiness for upcoming programs
              </p>
            </div>
            <button
              onClick={() => setAvailModalOpen(true)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Update Availability
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="font-bold uppercase tracking-wider text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusPill trainer={trainer} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="font-bold uppercase tracking-wider text-muted-foreground">Date Range</p>
              <p className="mt-2 font-semibold text-foreground">
                {trainer.availableFrom
                  ? `${trainer.availableFrom} to ${trainer.availableUntil || "Open"}`
                  : "Immediate / Full-time"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="font-bold uppercase tracking-wider text-muted-foreground">
                Preferred Modes
              </p>
              <p className="mt-2 font-semibold text-foreground">{trainer.modes.join(" & ")}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Trainer Documents & CV Repository
              </h3>
              <p className="text-xs text-muted-foreground">
                Access-controlled resumes, certificates, and ID records
              </p>
            </div>
            <button
              onClick={() => setDocModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Upload Document
            </button>
          </div>

          <div className="divide-y divide-border text-xs">
            {trainer.documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-bold text-foreground">{doc.name}</p>
                    <p className="text-muted-foreground text-[11px]">
                      {doc.type} • Uploaded by {doc.by} on {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toast.info(`Viewing preview of ${doc.name}`);
                      setPdfModalOpen(true);
                    }}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      toast.success(`Downloading ${doc.name}...`);
                    }}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
                  >
                    Download
                  </button>
                  {currentRole === "Admin" && (
                    <button
                      onClick={() => deleteTrainerDocument(trainer.id, doc.name)}
                      className="rounded-lg p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: NOTES */}
      {activeTab === "notes" && (
        <div className="card-surface p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Internal Team Notes & Observations
            </h3>
            <p className="text-xs text-muted-foreground">
              Internal notes are strictly confidential to ATOM administrators and coordinators.
            </p>
          </div>

          <form onSubmit={handleAddNote} className="flex gap-3">
            <input
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add an internal observation (e.g. 'Prefers corporate batches in Pune; excellent feedback in Java DSA')..."
              className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-xs outline-none focus:border-primary focus:bg-card"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shrink-0"
            >
              Add Note
            </button>
          </form>

          <div className="space-y-3">
            {trainer.notes.map((note, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="font-bold text-foreground">{note.by}</span>
                  <span className="text-[11px]">{note.date}</span>
                </div>
                <p className="text-foreground leading-relaxed">{note.note}</p>
              </div>
            ))}
            {trainer.notes.length === 0 && (
              <p className="text-xs text-muted-foreground">No notes added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: RATINGS */}
      {activeTab === "ratings" && (
        <div className="card-surface p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Quality Scorecard & Feedback Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Cumulative rating across completed training programs
              </p>
            </div>
            <button
              onClick={() => setRatingModalOpen(true)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
            >
              Add Project Rating
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase">Overall Average</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                ★ {trainer.rating.toFixed(1)} / 5.0
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {trainer.projectsCompleted} Batches Delivered
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase">Technical Depth</p>
              <p className="mt-2 text-2xl font-bold text-primary">4.9 / 5.0</p>
              <p className="mt-1 text-xs text-muted-foreground">Code walkthroughs & assignments</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Student Engagement
              </p>
              <p className="mt-2 text-2xl font-bold text-primary">4.7 / 5.0</p>
              <p className="mt-1 text-xs text-muted-foreground">Q&A resolution & interactivity</p>
            </div>
          </div>
        </div>
      )}

      {/* Printable CV PDF Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">
                  ATOM Verified Trainer Profile & CV
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setPdfModalOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="space-y-6 text-xs text-foreground font-sans">
              <div className="flex items-start justify-between border-b border-border pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{trainer.name}</h1>
                  <p className="text-sm font-semibold text-primary">{trainer.designation}</p>
                  <p className="text-muted-foreground mt-1">
                    {trainer.city}, {trainer.state}, {trainer.country} • {trainer.experience} Years
                    Experience
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Phone: {trainer.phone} • Email: {trainer.email}
                  </p>
                </div>
                <img
                  src={trainer.photo}
                  alt={trainer.name}
                  className="h-20 w-20 rounded-xl border object-cover"
                />
              </div>

              <div>
                <h4 className="font-bold text-primary uppercase tracking-wide">
                  Professional Summary
                </h4>
                <p className="mt-1.5 leading-relaxed text-muted-foreground">{trainer.bio}</p>
              </div>

              <div>
                <h4 className="font-bold text-primary uppercase tracking-wide">
                  Core Technical Competencies
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {trainer.skills.map((s) => (
                    <span
                      key={s.name}
                      className="rounded-lg border border-border bg-muted px-2.5 py-1 text-[11px] font-semibold"
                    >
                      {s.name} ({s.level} • {s.years} yrs)
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-primary uppercase tracking-wide">
                  Education & Qualifications
                </h4>
                <div className="mt-2 space-y-1.5">
                  {trainer.education.map((e, i) => (
                    <p key={i} className="text-muted-foreground">
                      <strong className="text-foreground">{e.degree}</strong> in {e.specialization}{" "}
                      — {e.university} ({e.year})
                    </p>
                  ))}
                </div>
              </div>

              {trainer.certifications.length > 0 && (
                <div>
                  <h4 className="font-bold text-primary uppercase tracking-wide">Certifications</h4>
                  <div className="mt-2 space-y-1">
                    {trainer.certifications.map((c, i) => (
                      <p key={i} className="text-muted-foreground">
                        <strong className="text-foreground">{c.name}</strong> ({c.org}) —
                        Credential: {c.id}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {trainer.trainings.length > 0 && (
                <div>
                  <h4 className="font-bold text-primary uppercase tracking-wide">
                    Selected Training Programs Delivered
                  </h4>
                  <div className="mt-2 space-y-2">
                    {trainer.trainings.map((t, i) => (
                      <div key={i} className="rounded-lg bg-muted/40 p-2.5">
                        <p className="font-bold text-foreground">
                          {t.program} — {t.client}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t.tech} • {t.students} Participants • {t.days} Days • Rating: ★{" "}
                          {t.rating}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
                Verified Document issued by ATOM Trainer Management System • Confidential
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-bold text-foreground">Upload Trainer Document</h3>
            <form onSubmit={handleAddDoc} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Document Name
                </label>
                <input
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. AWS Solutions Architect Cert.pdf"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                >
                  <option value="CV">CV / Resume</option>
                  <option value="Profile PDF">ATOM Profile PDF</option>
                  <option value="Certificates">Certificate</option>
                  <option value="Experience Letters">Experience Letter</option>
                  <option value="Feedback">Client Feedback</option>
                  <option value="ID Document">ID Proof</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Trainer Modal */}
      {ratingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-bold text-foreground">
              Submit Project Rating for {trainer.name}
            </h3>
            <form onSubmit={handleSubmitRating} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Project / Client Name
                </label>
                <input
                  required
                  value={rateProject}
                  onChange={(e) => setRateProject(e.target.value)}
                  placeholder="e.g. ABC University Java Bootcamp"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground">
                    Technical Depth (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={rateTech}
                    onChange={(e) => setRateTech(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground">
                    Communication (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={rateComm}
                    onChange={(e) => setRateComm(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground">
                    Student Engagement (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={rateEngage}
                    onChange={(e) => setRateEngage(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2 outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground">
                    Punctuality (1-5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.5}
                    value={ratePunctual}
                    onChange={(e) => setRatePunctual(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Comments & Review
                </label>
                <textarea
                  rows={3}
                  value={rateComments}
                  onChange={(e) => setRateComments(e.target.value)}
                  placeholder="Detailed feedback regarding curriculum completion, student engagement, and punctuality..."
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Submit Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Availability Update Modal */}
      {availModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-bold text-foreground">
              Update Availability for {trainer.name}
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Status
                </label>
                <select
                  value={newAvail}
                  onChange={(e) => setNewAvail(e.target.value as Availability)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                >
                  <option value="available">🟢 Available</option>
                  <option value="partial">🟡 Partially Available</option>
                  <option value="assigned">🔵 Assigned</option>
                  <option value="unavailable">🔴 Unavailable</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Available From
                </label>
                <input
                  type="date"
                  value={newAvailFrom}
                  onChange={(e) => setNewAvailFrom(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Available Until
                </label>
                <input
                  type="date"
                  value={newAvailUntil}
                  onChange={(e) => setNewAvailUntil(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAvailModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAvailability}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
