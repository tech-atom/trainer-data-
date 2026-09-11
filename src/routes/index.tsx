import { useState, useMemo } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  Search,
  Sparkles,
  Plus,
  Users,
  CheckCircle2,
  Filter,
  X,
  MapPin,
  TrendingUp,
  MessageCircle,
  Phone,
  Mail,
  Star,
  Award,
  LayoutGrid,
  List,
  Code2,
  Brain,
  MessageSquareQuote,
  UploadCloud,
} from "lucide-react";
import { AppShell } from "@/components/atom/AppShell";
import { SimpleTrainerCard } from "@/components/atom/SimpleTrainerCard";
import { SimplePhoneList } from "@/components/atom/SimplePhoneList";
import { SimpleTrainerModal } from "@/components/atom/SimpleTrainerModal";
import { PdfUploadModal } from "@/components/atom/PdfUploadModal";
import { BulkUploadModal } from "@/components/atom/BulkUploadModal";
import { SimpleAddTrainerModal } from "@/components/atom/SimpleAddTrainerModal";
import { useStore } from "@/lib/store";
import {
  computeDomainCounts,
  getTrainerDomainCategory,
  parseNaturalLanguageQuery,
  type Trainer,
  type Availability,
} from "@/lib/trainers";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("atom_trainer_hub_auth_session") === "true";
      if (!isAuth) {
        throw redirect({ to: "/login" });
      }
    }
  },
  head: () => ({
    meta: [
      { title: "ATOM  — Minimalist Trainer Management" },
      {
        name: "description",
        content:
          "Internal ATOM hub for automatic PDF trainer profile extraction, requirement typing and instant matching.",
      },
    ],
  }),
  component: MinimalistHubPage,
});

const QUICK_REQUIREMENT_PRESETS = [
  {
    label: "Aptitude",
    query: "Quantitative Aptitude, Logical Reasoning, Verbal Ability",
  },
  {
    label: "Soft Skills",
    query: "Soft Skills, Communication, Interview Skills",
  },
  {
    label: "Technical",
    query: "Technical, Java, Python, Full Stack",
  },
  { label: "Aptitude & Soft Skills", query: "Aptitude, Soft Skills, Communication" },
  { label: "Java Full Stack", query: "Java, Spring Boot, SQL, DSA" },
  { label: "AI & Machine Learning", query: "Python, Machine Learning, Data Science" },
  { label: "Cloud & DevOps", query: "AWS, Cloud, DevOps, Docker" },
  { label: "Campus Placement Prep", query: "Aptitude, Interview Skills, GD" },
];

function MinimalistHubPage() {
  const { trainers, skillAliases } = useStore();

  // View mode: 'cards' or 'phoneList'
  const [viewMode, setViewMode] = useState<"cards" | "phoneList">("cards");

  // Search & Requirement query state
  const [requirementQuery, setRequirementQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [domainFilter, setDomainFilter] = useState<"All" | "Technical" | "Aptitude" | "Soft Skills">("All");

  // Domain Counts Breakdown
  const domainCounts = useMemo(() => computeDomainCounts(trainers), [trainers]);

  // Modals state
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Natural Language Requirement Query Parsing (Experience e.g. "7 years", "5+ yrs" + Skill/City tokens)
  const { minExperience, tokens: queryTokens } = useMemo(() => {
    return parseNaturalLanguageQuery(requirementQuery);
  }, [requirementQuery]);

  // Extract unique cities
  const cities = useMemo(() => {
    return Array.from(new Set(trainers.map((t) => t.city))).sort();
  }, [trainers]);

  // Algorithmic scoring and sorting
  const scoredTrainers = useMemo(() => {
    const hasQuery = requirementQuery.trim().length > 0;
    const hasTokens = queryTokens.length > 0;
    const hasMinExp = minExperience !== null && minExperience > 0;

    return trainers
      .map((trainer) => {
        let score = 0;
        let matchedCount = 0;
        let meetsExp = true;

        // 1. Check Experience Requirement (e.g. "7 years", "5+ yrs")
        if (hasMinExp) {
          if (trainer.experience >= minExperience) {
            matchedCount++;
            // Higher score for satisfying experience + bonus for more experience
            score += 50 + Math.min(25, (trainer.experience - minExperience) * 3);
          } else {
            meetsExp = false;
          }
        }

        if (!hasTokens && !hasMinExp) {
          // Default sorting by rating and availability
          score = trainer.rating * 10 + (trainer.availability === "available" ? 20 : 0);
        } else {
          // Check skill matches
          for (const token of queryTokens) {
            let hasSkill = trainer.skills.some((s) => {
              const skillLower = s.name.toLowerCase();
              return skillLower.includes(token) || token.includes(skillLower);
            });

            // Also check aliases
            if (!hasSkill && skillAliases) {
              for (const [canonical, aliases] of Object.entries(skillAliases)) {
                if (
                  canonical.toLowerCase().includes(token) ||
                  aliases.some((a) => a.toLowerCase().includes(token))
                ) {
                  if (
                    trainer.skills.some((s) => s.name.toLowerCase() === canonical.toLowerCase())
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

            // Check location/city match
            if (
              trainer.city.toLowerCase().includes(token) ||
              token.includes(trainer.city.toLowerCase())
            ) {
              score += 25;
              matchedCount++;
            }

            // Check designation or bio
            if (trainer.designation.toLowerCase().includes(token)) {
              score += 20;
              matchedCount++;
            }
            if (trainer.trainerType.toLowerCase().includes(token)) {
              score += 20;
              matchedCount++;
            }
          }

          // Availability bonus
          if (trainer.availability === "available") score += 15;
          if (trainer.availability === "partial") score += 8;

          // Rating bonus
          score += trainer.rating * 2;
        }

        const totalExpectedMatches = (hasMinExp ? 1 : 0) + queryTokens.length;
        const maxPossible = Math.max(1, totalExpectedMatches * 45 + 25);
        const matchPercentage =
          hasQuery
            ? Math.min(100, Math.max(65, Math.round((score / maxPossible) * 100)))
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
        // Experience constraint: When user specifically requests experience (e.g. "7 years"), filter out trainers with < 7 years
        if (hasMinExp && !meetsExp) return false;

        // If user typed skill/city tokens, trainer must match at least one token or have high relevance
        if (hasTokens) {
          if (matchedCount === (hasMinExp ? 1 : 0)) {
            // check if city or designation matches
            const isGenericMatch = queryTokens.some(
              (t) =>
                trainer.city.toLowerCase().includes(t) ||
                trainer.name.toLowerCase().includes(t) ||
                trainer.designation.toLowerCase().includes(t) ||
                trainer.bio.toLowerCase().includes(t),
            );
            if (!isGenericMatch) return false;
          }
        }

        // City filter
        if (cityFilter !== "All" && trainer.city !== cityFilter) return false;

        // Domain category filter
        if (domainFilter !== "All") {
          const cat = getTrainerDomainCategory(trainer);
          if (domainFilter === "Technical" && !cat.isTechnical) return false;
          if (domainFilter === "Aptitude" && !cat.isAptitude) return false;
          if (domainFilter === "Soft Skills" && !cat.isSoftSkills) return false;
        }

        return true;
      })
      .sort((a, b) => b.score - a.score || b.trainer.experience - a.trainer.experience);
  }, [trainers, queryTokens, minExperience, cityFilter, domainFilter, skillAliases, requirementQuery]);

  const totalTrainers = trainers.length;

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Top Hero Section: Requirement Input & PDF Uploader */}
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-xs">
          <div className="max-w-3xl mx-auto">
            {/* Main Natural Language Requirement Input */}
            <div className="relative">
              <div className="relative flex items-center rounded-2xl border-2 border-primary/40 bg-card shadow-lg transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <Search className="ml-4 h-5 w-5 text-primary shrink-0" />
                <input
                  type="text"
                  value={requirementQuery}
                  onChange={(e) => setRequirementQuery(e.target.value)}
                  placeholder="Type requirement (e.g. Aptitude, Soft Skills, Java, Python, Bangalore, 5+ yrs)..."
                  className="w-full bg-transparent px-3 py-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {requirementQuery && (
                  <button
                    onClick={() => setRequirementQuery("")}
                    className="mr-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Quick Requirement Presets */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                <span className="text-muted-foreground font-semibold text-[11px] mr-1">
                  Quick Presets:
                </span>
                {QUICK_REQUIREMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setRequirementQuery(preset.query)}
                    className={`rounded-xl px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                      requirementQuery === preset.query
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-card border border-border text-foreground hover:border-primary/40 hover:bg-muted"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Domain Category Filter Tabs with Live Counts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDomainFilter("All")}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
              domainFilter === "All"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>All Domains</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                domainFilter === "All"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {domainCounts.total}
            </span>
          </button>

          <button
            onClick={() => setDomainFilter("Technical")}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
              domainFilter === "Technical"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-card text-foreground border-border hover:border-blue-500/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
            }`}
          >
            <Code2 className="h-4 w-4 text-blue-500" />
            <span>Technical</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                domainFilter === "Technical"
                  ? "bg-white/20 text-white"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {domainCounts.technical}
            </span>
          </button>

          <button
            onClick={() => setDomainFilter("Aptitude")}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
              domainFilter === "Aptitude"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-card text-foreground border-border hover:border-amber-500/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
            }`}
          >
            <Brain className="h-4 w-4 text-amber-500" />
            <span>Aptitude</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                domainFilter === "Aptitude"
                  ? "bg-white/20 text-white"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              {domainCounts.aptitude}
            </span>
          </button>

          <button
            onClick={() => setDomainFilter("Soft Skills")}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
              domainFilter === "Soft Skills"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-card text-foreground border-border hover:border-emerald-500/40 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
            }`}
          >
            <MessageSquareQuote className="h-4 w-4 text-emerald-500" />
            <span>Soft Skills</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                domainFilter === "Soft Skills"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {domainCounts.softSkills}
            </span>
          </button>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-6 w-[1px] bg-border mx-1" />

          {/* Bulk Import Button */}
          <button
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary shadow-xs transition-all hover:bg-primary/20 active:scale-98 cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Bulk Import</span>
          </button>

          {/* Upload PDF Button */}
          <button
            onClick={() => setPdfModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-98 cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload PDF</span>
          </button>

          {/* Add Trainer Button */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground transition-all hover:bg-muted active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Add Trainer</span>
          </button>
        </div>

        {/* Filter and Match Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground">
              {requirementQuery.trim().length > 0 ? (
                <span className="flex items-center flex-wrap gap-2">
                  <span>Matching Candidates</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-bold">
                    {scoredTrainers.length} Found
                  </span>
                  {minExperience !== null && minExperience > 0 && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      {minExperience}+ Yrs Exp
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>
                    {domainFilter !== "All" ? `${domainFilter} Trainers` : "Trainer Network"}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-bold">
                    {scoredTrainers.length} Trainers
                  </span>
                </span>
              )}
            </h2>

            {(requirementQuery.trim().length > 0 || domainFilter !== "All") && (
              <button
                onClick={() => {
                  setRequirementQuery("");
                  setDomainFilter("All");
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Quick Filter Controls & View Toggle */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border bg-card p-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode("phoneList")}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                  viewMode === "phoneList"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Name, Phone & Domain</span>
              </button>
            </div>

            {/* City Dropdown */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-xl border border-input bg-card px-3 py-1.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content: Cards View or Name & Phone List View */}
        {scoredTrainers.length > 0 ? (
          viewMode === "phoneList" ? (
            <SimplePhoneList
              trainers={scoredTrainers}
              activeRequirementTerms={queryTokens}
              minExperience={minExperience}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {scoredTrainers.map(({ trainer, matchPercentage }) => (
                <SimpleTrainerCard
                  key={trainer.id}
                  trainer={trainer}
                  activeRequirementTerms={queryTokens}
                  minExperience={minExperience}
                  matchScore={matchPercentage}
                  onViewDetails={(t) => setSelectedTrainer(t)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="card-surface rounded-2xl border border-border p-12 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Trainers Found</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No trainers matched the current requirement "{requirementQuery}". You can adjust your
              keywords or upload a new trainer resume PDF.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setRequirementQuery("")}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                Reset Search
              </button>
              <button
                onClick={() => setPdfModalOpen(true)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 cursor-pointer"
              >
                Upload Profile PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
      <SimpleTrainerModal
        trainer={selectedTrainer}
        isOpen={Boolean(selectedTrainer)}
        onClose={() => setSelectedTrainer(null)}
      />

      {/* PDF Upload Modal */}
      <PdfUploadModal isOpen={pdfModalOpen} onClose={() => setPdfModalOpen(false)} />

      {/* Bulk Upload Modal */}
      <BulkUploadModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />

      {/* Manual Add Trainer Modal */}
      <SimpleAddTrainerModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </AppShell>
  );
}
