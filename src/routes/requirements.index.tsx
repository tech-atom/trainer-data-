import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Sparkles,
  Calendar,
  MapPin,
  Building,
  Users,
  CheckCircle2,
  Clock,
  Search,
  X,
  ArrowRight,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { useStore, type ProjectRequirement } from "@/lib/store";
import type { Mode } from "@/lib/trainers";

export const Route = createFileRoute("/requirements/")({
  head: () => ({
    meta: [
      { title: "Project Requirements — ATOM Trainer Hub" },
      {
        name: "description",
        content:
          "Manage upcoming college & corporate training demands, allocate trainers and run smart matching.",
      },
    ],
  }),
  component: RequirementsPage,
});

const MODES: Mode[] = ["Offline", "Online", "Hybrid"];
const SECTORS = ["College", "University", "Corporate", "School", "Government"] as const;

function RequirementsPage() {
  const {
    requirements,
    trainers,
    addRequirement,
    updateRequirement,
    unassignTrainerFromRequirement,
    currentRole,
  } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);

  // New Requirement Form State
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [skillsInput, setSkillsInput] = useState("Java, Spring Boot, DSA, SQL");
  const [minExp, setMinExp] = useState(5);
  const [location, setLocation] = useState("Bangalore");
  const [mode, setMode] = useState<Mode>("Offline");
  const [requiredTrainers, setRequiredTrainers] = useState(2);
  const [startDate, setStartDate] = useState("2026-09-20");
  const [endDate, setEndDate] = useState("2026-10-02");
  const [dailyHours, setDailyHours] = useState(6);
  const [sector, setSector] = useState<
    "College" | "University" | "Corporate" | "School" | "Government"
  >("University");
  const [notes, setNotes] = useState("");

  const filteredRequirements = useMemo(() => {
    return requirements.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.client.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.skills.some((s) => s.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requirements, search, statusFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) {
      toast.error("Title and client are required.");
      return;
    }

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    addRequirement({
      title: title.trim(),
      client: client.trim(),
      skills,
      minExperience: Number(minExp),
      location: location.trim(),
      mode,
      requiredTrainers: Number(requiredTrainers),
      startDate,
      endDate,
      dailyHours: Number(dailyHours),
      sector,
      status: "Open",
      assignedTrainerIds: [],
      notes: notes.trim(),
    });

    setModalOpen(false);
    setTitle("");
    setClient("");
    setNotes("");
  };

  return (
    <AppShell
      title="Project Requirements"
      subtitle="Track institutional and corporate training requirements, run smart matching and allocate verified trainers"
    >
      {/* Header Controls */}
      <div className="card-surface mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-muted/60 px-3.5 py-2.5 focus-within:border-primary focus-within:bg-card min-w-[240px] max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requirements by skill, client, city..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex overflow-hidden rounded-xl border border-border bg-card p-0.5 text-xs">
              {["All", "Open", "In Progress", "Fulfilled", "Closed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {currentRole !== "Viewer" && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Post Requirement
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requirements List Grid */}
      <div className="grid gap-5">
        {filteredRequirements.map((req) => {
          const assignedTrainers = req.assignedTrainerIds
            .map((id) => trainers.find((t) => t.id === id))
            .filter((t): t is NonNullable<typeof t> => Boolean(t));

          const isComplete = assignedTrainers.length >= req.requiredTrainers;

          return (
            <div key={req.id} className="card-surface p-6 transition-shadow hover:shadow-md">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono font-bold text-muted-foreground">
                      {req.code}
                    </span>
                    <h3 className="text-lg font-bold text-foreground">{req.title}</h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        req.status === "Open"
                          ? "bg-amber-500/10 text-amber-600"
                          : req.status === "In Progress"
                            ? "bg-primary/10 text-primary"
                            : req.status === "Fulfilled"
                              ? "bg-emerald-600/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-primary" /> {req.client} • Sector:{" "}
                    {req.sector}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {req.location} ({req.mode})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {req.startDate} to {req.endDate} (
                      {req.dailyHours} hrs/day)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Needed: {req.requiredTrainers} Trainers (
                      {req.minExperience}+ yrs exp)
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground">
                      Required Skills:
                    </span>
                    {req.skills.map((s) => (
                      <span
                        key={s}
                        className="rounded-lg bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {req.notes && (
                    <p className="mt-2.5 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">
                      <strong className="text-foreground">Note:</strong> {req.notes}
                    </p>
                  )}
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col gap-2 shrink-0 md:items-end">
                  <Link
                    to="/matching"
                    search={{ reqId: req.id } as never}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Find Matching Trainers
                  </Link>

                  <span className="text-xs font-semibold text-muted-foreground">
                    Allocation:{" "}
                    <strong
                      className={isComplete ? "text-primary font-bold" : "text-amber-600 font-bold"}
                    >
                      {assignedTrainers.length} / {req.requiredTrainers}
                    </strong>{" "}
                    Filled
                  </span>
                </div>
              </div>

              {/* Assigned Trainers Area */}
              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Assigned Trainers ({assignedTrainers.length})
                </p>
                {assignedTrainers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No trainers assigned yet. Click 'Find Matching Trainers' to rank and allocate
                    candidates.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {assignedTrainers.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2 text-xs"
                      >
                        <img
                          src={t.photo}
                          alt={t.name}
                          className="h-7 w-7 rounded-lg bg-muted object-cover"
                        />
                        <div>
                          <Link
                            to="/trainers/$trainerId"
                            params={{ trainerId: t.id }}
                            className="font-bold text-foreground hover:text-primary"
                          >
                            {t.name}
                          </Link>
                          <p className="text-[10px] text-muted-foreground">
                            {t.city} • ★ {t.rating.toFixed(1)}
                          </p>
                        </div>
                        {currentRole !== "Viewer" && (
                          <button
                            onClick={() => unassignTrainerFromRequirement(req.id, t.id)}
                            title="Unassign trainer"
                            className="ml-1 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRequirements.length === 0 && (
          <div className="card-surface p-12 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-base font-bold text-foreground">No Requirements Found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Post a new project requirement to begin searching and matching trainers.
            </p>
          </div>
        )}
      </div>

      {/* Create Requirement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Post New Project Requirement</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Project Title *
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Java Spring Boot Bootcamp"
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Client / University *
                  </label>
                  <input
                    required
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. ABC University"
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Required Skills (Comma separated) *
                </label>
                <input
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Java, Spring Boot, SQL, DSA"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Location / City
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Training Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as Mode)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  >
                    {MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as (typeof SECTORS)[number])}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  >
                    {SECTORS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Trainers Needed
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={requiredTrainers}
                    onChange={(e) => setRequiredTrainers(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Min Experience (Yrs)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={minExp}
                    onChange={(e) => setMinExp(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Daily Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-muted-foreground uppercase">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Requirement Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Batch size, specific modules, hands-on lab requirements..."
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary focus:bg-card"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Save Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
