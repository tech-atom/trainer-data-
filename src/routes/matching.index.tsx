import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Star,
  Briefcase,
  Phone,
  MessageCircle,
  Mail,
  UserPlus,
  ArrowRight,
  Download,
  Filter,
  Layers,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { ContactActions, StatusPill, waLink, mailLink } from "@/components/atom/TrainerCard";
import { useStore, type ProjectRequirement } from "@/lib/store";
import type { Mode } from "@/lib/trainers";

export const Route = createFileRoute("/matching/")({
  head: () => ({
    meta: [
      { title: "Smart Trainer Matching — ATOM Trainer Hub" },
      {
        name: "description",
        content:
          "Algorithmic trainer matching engine across skills, experience, location, availability, and client ratings.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      reqId: (search.reqId as string) || "",
    };
  },
  component: SmartMatchingPage,
});

function SmartMatchingPage() {
  const searchParams = useSearch({ from: "/matching/" });
  const { requirements, matchTrainersForCriteria, assignTrainerToRequirement, currentRole } =
    useStore();

  const [selectedReqId, setSelectedReqId] = useState<string>(
    searchParams.reqId || (requirements[0]?.id ?? ""),
  );
  const selectedReq = requirements.find((r) => r.id === selectedReqId);

  // Ad-hoc criteria state (initialized from selected requirement if available)
  const [skillsInput, setSkillsInput] = useState(
    selectedReq?.skills.join(", ") || "Java, Spring Boot, DSA, SQL",
  );
  const [minExp, setMinExp] = useState(selectedReq?.minExperience || 5);
  const [location, setLocation] = useState(selectedReq?.location || "Bangalore");
  const [mode, setMode] = useState<Mode>(selectedReq?.mode || "Offline");
  const [minRating, setMinRating] = useState(4.0);

  // Synchronize when dropdown selection changes
  const handleSelectRequirement = (id: string) => {
    setSelectedReqId(id);
    const found = requirements.find((r) => r.id === id);
    if (found) {
      setSkillsInput(found.skills.join(", "));
      setMinExp(found.minExperience);
      setLocation(found.location);
      setMode(found.mode);
    }
  };

  const skillsList = useMemo(() => {
    return skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [skillsInput]);

  const rankedResults = useMemo(() => {
    return matchTrainersForCriteria({
      skills: skillsList,
      minExp: Number(minExp),
      location: location.trim(),
      mode,
      minRating: Number(minRating),
    });
  }, [matchTrainersForCriteria, skillsList, minExp, location, mode, minRating]);

  const exportShortlistCsv = () => {
    const rows = [
      [
        "Rank",
        "Match Score",
        "Name",
        "Designation",
        "City",
        "Experience",
        "Availability",
        "Rating",
        "Matched Skills",
        "Phone",
        "Email",
      ],
      ...rankedResults.map((r, i) => [
        String(i + 1),
        `${r.score}%`,
        r.trainer.name,
        r.trainer.designation,
        r.trainer.city,
        `${r.trainer.experience} yrs`,
        r.trainer.availability,
        String(r.trainer.rating),
        r.details.matchedSkills.join(" | "),
        r.trainer.phone,
        r.trainer.email,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `atom-matching-shortlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rankedResults.length} shortlisted trainers to CSV!`);
  };

  return (
    <AppShell
      title="Smart Trainer Matching Engine"
      subtitle="Weighted algorithmic scoring matching skills, experience, location, availability, and rating"
    >
      {/* Criteria Selector Card */}
      <div className="card-surface mb-6 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Matching Criteria
              </h3>
              <p className="text-xs text-muted-foreground">
                Select a live project requirement or tune ad-hoc parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Load Requirement:</span>
            <select
              value={selectedReqId}
              onChange={(e) => handleSelectRequirement(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
            >
              <option value="">-- Ad-hoc Custom Criteria --</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.title} ({r.client})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="sm:col-span-2">
            <label className="mb-1 block font-bold text-muted-foreground uppercase">
              Required Skills
            </label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g. Java, Spring Boot, SQL, DSA"
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs outline-none focus:border-primary focus:bg-card font-medium"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-muted-foreground uppercase">
              Location / City
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bangalore"
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs outline-none focus:border-primary focus:bg-card"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-muted-foreground uppercase">
              Training Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs outline-none focus:border-primary focus:bg-card font-semibold"
            >
              <option value="Offline">Offline</option>
              <option value="Online">Online</option>
              <option value="Hybrid">Hybrid</option>
            </select>
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
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs outline-none focus:border-primary focus:bg-card font-semibold"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-muted-foreground uppercase">
              Minimum Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-xs outline-none focus:border-primary focus:bg-card font-semibold"
            >
              <option value={0}>Any Rating</option>
              <option value={4.0}>★ 4.0 & above</option>
              <option value={4.5}>★ 4.5 & above (Top Rated)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between border-t border-border pt-4 text-xs">
          <p className="text-muted-foreground">
            Ranked <strong className="text-foreground">{rankedResults.length}</strong> trainers
            matching your profile demand.
          </p>
          <button
            onClick={exportShortlistCsv}
            disabled={rankedResults.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 font-bold hover:bg-muted disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5 text-primary" /> Export Shortlist CSV
          </button>
        </div>
      </div>

      {/* Ranked Results Grid */}
      <div className="space-y-4">
        {rankedResults.map(({ trainer, score, details }, index) => {
          const isAssigned = selectedReq?.assignedTrainerIds.includes(trainer.id);

          return (
            <div
              key={trainer.id}
              className={`card-surface p-6 transition-all hover:shadow-lg ${
                score >= 85 ? "ring-2 ring-primary/30" : ""
              }`}
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative shrink-0">
                    <img
                      src={trainer.photo}
                      alt={trainer.name}
                      className="h-16 w-16 rounded-2xl border-2 border-border bg-muted object-cover shadow-sm"
                    />
                    <span className="absolute -bottom-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-sidebar font-mono text-[10px] font-bold text-white shadow-xs">
                      #{index + 1}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/trainers/$trainerId"
                        params={{ trainerId: trainer.id }}
                        className="text-lg font-bold text-foreground hover:text-primary"
                      >
                        {trainer.name}
                      </Link>
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {trainer.code}
                      </span>
                      <StatusPill trainer={trainer} />
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground">
                      {trainer.designation} • {trainer.organization}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-primary" /> {trainer.city},{" "}
                        {trainer.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-primary" /> {trainer.experience}{" "}
                        Years Exp
                      </span>
                      <span className="flex items-center gap-1 font-bold text-foreground">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary" />{" "}
                        {trainer.rating.toFixed(1)} ({trainer.projectsCompleted} Projects)
                      </span>
                    </div>

                    {/* Matched Criteria Checklist */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                      {details.matchedSkills.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1 rounded-md bg-emerald-600/10 px-2 py-0.5 font-semibold text-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" /> {s}
                        </span>
                      ))}
                      {details.expMatch && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-600/10 px-2 py-0.5 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> {trainer.experience}y Exp
                        </span>
                      )}
                      {details.locMatch && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-600/10 px-2 py-0.5 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> {trainer.city}
                        </span>
                      )}
                      {details.availMatch && (
                        <span className="flex items-center gap-1 rounded-md bg-emerald-600/10 px-2 py-0.5 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </span>
                      )}
                      {details.missingSkills.map((s) => (
                        <span
                          key={s}
                          className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-muted-foreground opacity-70"
                        >
                          <XCircle className="h-3 w-3" /> No {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Score & Allocation Actions */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-primary font-display">{score}%</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Match Score
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ContactActions trainer={trainer} size="sm" />

                    {selectedReq && currentRole !== "Viewer" && (
                      <button
                        onClick={() => {
                          if (isAssigned) {
                            toast.info(`${trainer.name} is already assigned to this requirement.`);
                          } else {
                            assignTrainerToRequirement(selectedReq.id, trainer.id);
                          }
                        }}
                        disabled={isAssigned}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs ${
                          isAssigned
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        {isAssigned ? "Assigned ✓" : `Assign to ${selectedReq.code}`}
                      </button>
                    )}

                    <Link
                      to="/trainers/$trainerId"
                      params={{ trainerId: trainer.id }}
                      className="rounded-xl border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted"
                    >
                      Profile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {rankedResults.length === 0 && (
          <div className="card-surface p-12 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-base font-bold text-foreground">
              No Trainers Matched Minimum Requirements
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try relaxing experience or rating filters to see more candidates.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
