import { useState, useMemo } from "react";
import { createFileRoute, redirect, useSearch, useNavigate } from "@tanstack/react-router";
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
  UserCheck,
  Contact,
  FileSpreadsheet,
  Info,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/atom/AppShell";
import { SimpleTrainerCard } from "@/components/atom/SimpleTrainerCard";
import { SimplePhoneList } from "@/components/atom/SimplePhoneList";
import { SimpleTrainerModal } from "@/components/atom/SimpleTrainerModal";
import { PdfUploadModal } from "@/components/atom/PdfUploadModal";
import { BulkUploadModal } from "@/components/atom/BulkUploadModal";
import { ExcelBulkUploadModal } from "@/components/atom/ExcelBulkUploadModal";
import { SimpleAddTrainerModal } from "@/components/atom/SimpleAddTrainerModal";
import { CompleteProfileModal } from "@/components/atom/CompleteProfileModal";
import { useStore } from "@/lib/store";
import {
  computeDomainCounts,
  computeSectionCounts,
  isFullProfileTrainer,
  isQuickContactTrainer,
  scoreAndMatchTrainers,
  parseNaturalLanguageQuery,
  type Trainer,
} from "@/lib/trainers";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      section: (search.section as "all" | "full" | "contacts") || "all",
      q: (search.q as string) || "",
    };
  },
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
      { title: "ATOM — Unified Trainer Hub & Smart Matcher" },
      {
        name: "description",
        content:
          "Internal ATOM search hub for matching requirements across verified Full Profiles and Name, Phone & Domain contacts simultaneously.",
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
  const searchParams = useSearch({ from: "/" });
  const navigate = useNavigate();

  // Active view section filter: 'all' (Both Unified), 'full' (Full Profiles only), or 'contacts' (Name, Phone & Domain only)
  const [viewFilter, setViewFilter] = useState<"all" | "full" | "contacts">(
    searchParams.section === "full"
      ? "full"
      : searchParams.section === "contacts"
        ? "contacts"
        : "all",
  );

  // Search requirement query & filters
  const [requirementQuery, setRequirementQuery] = useState(searchParams.q || "");
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [domainFilter, setDomainFilter] = useState<"All" | "Technical" | "Aptitude" | "Soft Skills">("All");

  // Modals state
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [completeProfileTrainer, setCompleteProfileTrainer] = useState<Trainer | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Live Section & Dual Domain Counts Breakdown
  const sectionCounts = useMemo(() => computeSectionCounts(trainers), [trainers]);

  // Natural Language Requirement Query Parsing (Experience e.g. "7 years", "5+ yrs" + Skill/City tokens)
  const { minExperience, tokens: queryTokens } = useMemo(() => {
    return parseNaturalLanguageQuery(requirementQuery);
  }, [requirementQuery]);

  // Separate Full Profiles vs Quick Contacts
  const fullProfileTrainersList = useMemo(() => trainers.filter(isFullProfileTrainer), [trainers]);
  const quickContactsList = useMemo(() => trainers.filter(isQuickContactTrainer), [trainers]);

  // Extract unique cities from full profiles
  const cities = useMemo(() => {
    return Array.from(new Set(fullProfileTrainersList.map((t) => t.city))).sort();
  }, [fullProfileTrainersList]);

  // 1. Scored and Matched Full Profiles (Complete Data)
  const scoredFullProfiles = useMemo(() => {
    return scoreAndMatchTrainers(
      fullProfileTrainersList,
      requirementQuery,
      queryTokens,
      minExperience,
      cityFilter,
      domainFilter,
      skillAliases,
    );
  }, [fullProfileTrainersList, requirementQuery, queryTokens, minExperience, cityFilter, domainFilter, skillAliases]);

  // 2. Scored and Matched Quick Contacts (Name, Phone Number & Domain)
  const scoredQuickContacts = useMemo(() => {
    return scoreAndMatchTrainers(
      quickContactsList,
      requirementQuery,
      queryTokens,
      null, // Don't strictly filter quick contacts by minExperience unless specified
      "All",
      domainFilter,
      skillAliases,
    );
  }, [quickContactsList, requirementQuery, queryTokens, domainFilter, skillAliases]);

  const hasSearchActive = requirementQuery.trim().length > 0 || domainFilter !== "All" || cityFilter !== "All";

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* ============================================================== */}
        {/* MAIN UNIFIED SEARCH BAR & REQUIREMENT MATCHER                  */}
        {/* ============================================================== */}
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-xs">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Unified Requirement Matcher & Search Engine</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-foreground">
                Search & Match All Trainers Across Domains
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Type any skill, domain, city, or experience. Matches both <strong>Full Profiles</strong> and <strong>Name, Phone & Domain Contacts</strong> simultaneously.
              </p>
            </div>

            {/* Main Search Input */}
            <div className="relative">
              <div className="relative flex items-center rounded-2xl border-2 border-primary/40 bg-card shadow-lg transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <Search className="ml-4 h-5 w-5 text-primary shrink-0" />
                <input
                  type="text"
                  value={requirementQuery}
                  onChange={(e) => setRequirementQuery(e.target.value)}
                  placeholder="Type requirement (e.g. Technical, Aptitude, Soft Skills, Java, Python, Bangalore, 5+ yrs)..."
                  className="w-full bg-transparent px-3 py-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none font-medium"
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

        {/* ============================================================== */}
        {/* DOMAIN FILTERS WITH DUAL LIVE COUNTS (Full Profiles + Contacts) */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-2xl p-3 shadow-2xs">
          {/* Domain Filter Buttons with Dual Live Breakdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* All Domains */}
            <button
              onClick={() => setDomainFilter("All")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                domainFilter === "All"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-extrabold"
                  : "bg-muted/40 text-foreground border-border hover:bg-muted"
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
                {sectionCounts.fullProfilesCount} Full • {sectionCounts.quickContactsCount} Phone
              </span>
            </button>

            {/* Technical */}
            <button
              onClick={() => setDomainFilter("Technical")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                domainFilter === "Technical"
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs font-extrabold"
                  : "bg-muted/40 text-foreground border-border hover:border-blue-500/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
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
                {sectionCounts.fullDomainCounts.technical} Full • {sectionCounts.quickDomainCounts.technical} Phone
              </span>
            </button>

            {/* Aptitude */}
            <button
              onClick={() => setDomainFilter("Aptitude")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                domainFilter === "Aptitude"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs font-extrabold"
                  : "bg-muted/40 text-foreground border-border hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
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
                {sectionCounts.fullDomainCounts.aptitude} Full • {sectionCounts.quickDomainCounts.aptitude} Phone
              </span>
            </button>

            {/* Soft Skills */}
            <button
              onClick={() => setDomainFilter("Soft Skills")}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer border ${
                domainFilter === "Soft Skills"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs font-extrabold"
                  : "bg-muted/40 text-foreground border-border hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20"
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
                {sectionCounts.fullDomainCounts.softSkills} Full • {sectionCounts.quickDomainCounts.softSkills} Phone
              </span>
            </button>
          </div>

          {/* Right Controls: City Dropdown & Action Modals */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* City Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground font-semibold">City:</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="rounded-xl border border-input bg-card px-2.5 py-1.5 text-xs font-bold text-foreground focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="All">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload PDF Button */}
            <button
              onClick={() => setPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-98 cursor-pointer"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload PDF</span>
            </button>

            {/* Excel Bulk Upload Button */}
            <button
              onClick={() => setExcelModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-98 cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Excel Upload</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LIVE SEARCH SUMMARY & VIEW FILTER TOGGLE                        */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          {/* Match Summary Indicator */}
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground flex items-center flex-wrap gap-2">
              {requirementQuery.trim().length > 0 ? (
                <>
                  <span>Matching Results:</span>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {scoredFullProfiles.length} Full Profiles
                  </span>
                  <span className="text-muted-foreground font-normal">+</span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {scoredQuickContacts.length} Name & Phone Contacts
                  </span>
                  {minExperience !== null && minExperience > 0 && (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      {minExperience}+ Yrs Exp
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span>{domainFilter !== "All" ? `${domainFilter} Trainers` : "All Trainers"}</span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {scoredFullProfiles.length} Verified Profiles
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {scoredQuickContacts.length} Phone Directory Contacts
                  </span>
                </>
              )}
            </h2>

            {hasSearchActive && (
              <button
                onClick={() => {
                  setRequirementQuery("");
                  setDomainFilter("All");
                  setCityFilter("All");
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* View Filter Switcher (Show Both vs Full Profiles Only vs Phone Contacts Only) */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setViewFilter("all")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition-all cursor-pointer ${
                viewFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Show Both ({scoredFullProfiles.length + scoredQuickContacts.length})</span>
            </button>

            <button
              onClick={() => setViewFilter("full")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition-all cursor-pointer ${
                viewFilter === "full"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Full Profiles ({scoredFullProfiles.length})</span>
            </button>

            <button
              onClick={() => setViewFilter("contacts")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-bold transition-all cursor-pointer ${
                viewFilter === "contacts"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300"
              }`}
            >
              <Contact className="h-3.5 w-3.5" />
              <span>Name, Phone & Domain ({scoredQuickContacts.length})</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: VERIFIED FULL PROFILES (CARDS VIEW)                 */}
        {/* ============================================================== */}
        {(viewFilter === "all" || viewFilter === "full") && (
          <div className="space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Verified Full Profiles ({scoredFullProfiles.length} Candidates)
                </h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary">
                  Complete Data • PDF Resumes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  + Upload PDF Resume
                </button>
              </div>
            </div>

            {/* Grid of Full Profile Cards */}
            {scoredFullProfiles.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scoredFullProfiles.map(({ trainer, matchPercentage }) => (
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
            ) : (
              <div className="card-surface rounded-2xl border border-border p-8 text-center space-y-2">
                <UserCheck className="h-8 w-8 mx-auto text-muted-foreground opacity-50" />
                <p className="text-xs font-bold text-foreground">No full profiles matched current criteria</p>
                <p className="text-[11px] text-muted-foreground">
                  Check the Name, Phone & Domain Directory below or upload a new resume PDF.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: NAME, PHONE NUMBER & DOMAIN DIRECTORY (TABLE VIEW)  */}
        {/* ============================================================== */}
        {(viewFilter === "all" || viewFilter === "contacts") && (
          <div className="space-y-4 pt-2">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contact className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                  Name, Phone Number & Domain Directory ({scoredQuickContacts.length} Contacts)
                </h3>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Minimal Data • Direct Contact
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExcelModalOpen(true)}
                  className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  + Excel / CSV Bulk Upload
                </button>
              </div>
            </div>

            {/* Simple Phone List Table */}
            <SimplePhoneList
              trainers={scoredQuickContacts}
              activeRequirementTerms={queryTokens}
              minExperience={minExperience}
              onUpgradeTrainer={(trainer) => {
                setCompleteProfileTrainer(trainer);
              }}
            />
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
      <SimpleTrainerModal
        trainer={selectedTrainer}
        isOpen={Boolean(selectedTrainer)}
        onClose={() => setSelectedTrainer(null)}
        onEditTrainer={(trainer) => setCompleteProfileTrainer(trainer)}
      />

      {/* Complete Profile Modal (To Fill Details) */}
      <CompleteProfileModal
        trainer={completeProfileTrainer}
        isOpen={Boolean(completeProfileTrainer)}
        onClose={() => setCompleteProfileTrainer(null)}
      />

      {/* PDF Upload Modal */}
      <PdfUploadModal isOpen={pdfModalOpen} onClose={() => setPdfModalOpen(false)} />

      {/* Excel / CSV Bulk Upload Modal */}
      <ExcelBulkUploadModal isOpen={excelModalOpen} onClose={() => setExcelModalOpen(false)} />

      {/* Bulk Upload Modal */}
      <BulkUploadModal isOpen={bulkModalOpen} onClose={() => setBulkModalOpen(false)} />

      {/* Manual Add Trainer Modal */}
      <SimpleAddTrainerModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </AppShell>
  );
}


