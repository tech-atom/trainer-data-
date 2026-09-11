import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search,
  LayoutGrid,
  Table2,
  Download,
  SlidersHorizontal,
  Plus,
  Upload,
  FileSpreadsheet,
  X,
  AlertTriangle,
  CheckCircle2,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { TrainerCard, ContactActions, StatusPill } from "@/components/atom/TrainerCard";
import { searchTrainers, type Availability, type Trainer } from "@/lib/trainers";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/trainers/")({
  head: () => ({
    meta: [
      { title: "Trainer Directory — ATOM Trainer Hub" },
      {
        name: "description",
        content:
          "Search and filter ATOM trainers by skill, location, experience, availability and training mode.",
      },
      { property: "og:title", content: "Trainer Directory — ATOM Trainer Hub" },
      {
        property: "og:description",
        content:
          "Search and filter ATOM trainers by skill, location, experience, availability and training mode.",
      },
    ],
  }),
  component: Directory,
});

const EXPERIENCE = ["Any", "0–2", "3–5", "5–10", "10+"] as const;
const TYPES = [
  "Technical Trainer",
  "Soft Skills Trainer",
  "Aptitude Trainer",
  "Domain Expert",
  "Industry Expert",
  "Guest Faculty",
];
const AVAIL: Availability[] = ["available", "partial", "assigned", "unavailable"];
const SECTORS = ["College", "University", "Corporate", "School", "Government"] as const;

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Directory() {
  const { trainers, addTrainer, checkDuplicate, currentRole } = useStore();

  const [q, setQ] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [skills, setSkills] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [avail, setAvail] = useState<Availability[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [exp, setExp] = useState<(typeof EXPERIENCE)[number]>("Any");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // Bulk Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState<
    Array<{
      name: string;
      phone: string;
      email: string;
      city: string;
      skills: string;
      exp: number;
      duplicate: boolean;
    }>
  >([]);

  // Extract unique dynamic skills and cities from current state
  const allSkills = useMemo(
    () => Array.from(new Set(trainers.flatMap((tr) => tr.skills.map((s) => s.name)))).sort(),
    [trainers],
  );
  const allCities = useMemo(
    () => Array.from(new Set(trainers.map((tr) => tr.city))).sort(),
    [trainers],
  );

  const results = useMemo(() => {
    let list = searchTrainers(trainers, q);
    if (skills.length)
      list = list.filter((t) => skills.every((s) => t.skills.some((x) => x.name === s)));
    if (cities.length) list = list.filter((t) => cities.includes(t.city));
    if (types.length) list = list.filter((t) => types.includes(t.trainerType));
    if (avail.length) list = list.filter((t) => avail.includes(t.availability));
    if (modes.length) list = list.filter((t) => modes.some((m) => t.modes.includes(m as never)));
    if (sectors.length)
      list = list.filter((t) => sectors.some((s) => t.sectors.includes(s as never)));
    if (exp !== "Any")
      list = list.filter((t) =>
        exp === "0–2"
          ? t.experience <= 2
          : exp === "3–5"
            ? t.experience > 2 && t.experience <= 5
            : exp === "5–10"
              ? t.experience > 5 && t.experience <= 10
              : t.experience > 10,
      );
    if (minRating) list = list.filter((t) => t.rating >= minRating);
    return list;
  }, [trainers, q, skills, cities, types, avail, modes, sectors, exp, minRating]);

  function exportCsv() {
    const rows = [
      [
        "Trainer Code",
        "Name",
        "Designation",
        "Primary Skills",
        "Experience (Yrs)",
        "City",
        "State",
        "Trainer Type",
        "Availability",
        "Rating",
        "Projects Completed",
        "Phone",
        "Email",
        "Organization",
      ],
      ...results.map((t) => [
        t.code,
        t.name,
        t.designation,
        t.skills.map((s) => `${s.name} (${s.level})`).join(" | "),
        String(t.experience),
        t.city,
        t.state,
        t.trainerType,
        t.availability,
        String(t.rating),
        String(t.projectsCompleted),
        t.phone,
        t.email,
        t.organization,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `atom-trainers-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${results.length} trainers to CSV!`);
  }

  function exportJson() {
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `atom-trainers-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success(`Exported ${results.length} trainers to JSON!`);
  }

  // Handle sample import file parsing
  function handleParseCsv() {
    if (!importText.trim()) {
      toast.error("Please paste CSV data or select a sample template.");
      return;
    }
    const lines = importText.trim().split("\n");
    const parsed = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const name = cols[0] || "Unknown Trainer";
      const phone = cols[1] || "+919800000000";
      const email = cols[2] || `${name.toLowerCase().replace(/[^a-z]/g, "")}@example.com`;
      const city = cols[3] || "Bangalore";
      const skills = cols[4] || "Java, Python";
      const exp = Number(cols[5]) || 5;

      const dupCheck = checkDuplicate(phone, email, name);
      return {
        name,
        phone,
        email,
        city,
        skills,
        exp,
        duplicate: dupCheck.isDuplicate,
      };
    });
    setImportPreview(parsed);
  }

  async function handleCommitImport() {
    let count = 0;
    for (const row of importPreview) {
      if (!row.duplicate) {
        await addTrainer({
          name: row.name,
          designation: `${row.skills.split(",")[0]?.trim() || "Technology"} Trainer`,
          phone: row.phone,
          whatsapp: row.phone,
          email: row.email,
          city: row.city,
          state: "Karnataka",
          country: "India",
          organization: "Consultant",
          experience: row.exp,
          trainingExperience: Math.max(1, row.exp - 2),
          trainerType: "Technical Trainer",
          employment: "Freelance",
          modes: ["Online", "Offline"],
          availability: "available",
          rating: 4.5,
          projectsCompleted: 2,
          bio: `Experienced corporate trainer specializing in ${row.skills}.`,
          status: "Active",
          tags: ["New Import"],
          skills: row.skills
            .split(",")
            .map((s) => ({ name: s.trim(), level: "Advanced", years: row.exp })),
          softSkills: ["Communication"],
          education: [
            {
              degree: "B.Tech / B.E.",
              specialization: "Computer Science",
              university: "State University",
              year: 2018,
            },
          ],
          certifications: [],
          trainings: [],
          notes: [
            {
              note: "Imported via bulk CSV upload.",
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
          ],
          sectors: ["College", "Corporate"],
          addedOn: new Date().toISOString().split("T")[0],
          photo: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(row.name)}&backgroundColor=d7f2e3,e7f6ec,cdeedd`,
        });
        count++;
      }
    }

    toast.success(`Successfully imported ${count} trainers!`);
    setImportOpen(false);
    setImportText("");
    setImportPreview([]);
  }

  const Chip = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-xs"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );

  return (
    <AppShell
      title="Trainer Directory"
      subtitle="Search across verified skills, locations, previous training batches, and certifications"
    >
      {/* Top Controls & Search Bar */}
      <div className="card-surface mb-6 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/60 px-3.5 py-3 focus-within:border-primary focus-within:bg-card focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, skills (Java, Python, CAD), city (Bangalore, Pune), sector, or previous clients…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{results.length}</span> of{" "}
              {trainers.length} trainers
            </p>
            {(skills.length > 0 ||
              cities.length > 0 ||
              types.length > 0 ||
              avail.length > 0 ||
              modes.length > 0 ||
              exp !== "Any" ||
              minRating > 0 ||
              sectors.length > 0 ||
              q) && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Filters Active
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {currentRole === "Admin" && (
              <button
                onClick={() => setImportOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted"
              >
                <Upload className="h-3.5 w-3.5 text-muted-foreground" /> Import CSV
              </button>
            )}

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </button>

            {/* View Toggle */}
            <div className="flex overflow-hidden rounded-xl border border-border bg-card p-0.5">
              <button
                onClick={() => setView("cards")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "cards"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Cards
              </button>
              <button
                onClick={() => setView("table")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === "table"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Table2 className="h-3.5 w-3.5" /> Table
              </button>
            </div>

            {currentRole === "Admin" && (
              <Link
                to="/trainers/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Add Trainer
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Filter + Results Grid */}
      <div className={`grid gap-6 ${showFilters ? "lg:grid-cols-[280px_1fr]" : "grid-cols-1"}`}>
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="card-surface h-fit space-y-5 p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Filter Database
              </h3>
              <button
                onClick={() => {
                  setSkills([]);
                  setCities([]);
                  setTypes([]);
                  setAvail([]);
                  setModes([]);
                  setSectors([]);
                  setExp("Any");
                  setMinRating(0);
                  setQ("");
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* Experience */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Experience (Years)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EXPERIENCE.map((e) => (
                  <Chip key={e} active={exp === e} onClick={() => setExp(e)}>
                    {e === "Any" ? "All Levels" : `${e} yrs`}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Availability Status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {AVAIL.map((a) => (
                  <Chip
                    key={a}
                    active={avail.includes(a)}
                    onClick={() => setAvail(toggle(avail, a))}
                  >
                    {a === "available"
                      ? "🟢 Available"
                      : a === "partial"
                        ? "🟡 Partial"
                        : a === "assigned"
                          ? "🔵 Assigned"
                          : "🔴 Unavailable"}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Training Mode */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Training Mode
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Online", "Offline", "Hybrid"].map((m) => (
                  <Chip
                    key={m}
                    active={modes.includes(m)}
                    onClick={() => setModes(toggle(modes, m))}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Trainer Type */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Trainer Specialization
              </p>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((tp) => (
                  <Chip
                    key={tp}
                    active={types.includes(tp)}
                    onClick={() => setTypes(toggle(types, tp))}
                  >
                    {tp.replace(" Trainer", "")}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Sectors */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Experience Sector
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map((s) => (
                  <Chip
                    key={s}
                    active={sectors.includes(s)}
                    onClick={() => setSectors(toggle(sectors, s))}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Location / City
              </p>
              <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {allCities.map((c) => (
                  <Chip
                    key={c}
                    active={cities.includes(c)}
                    onClick={() => setCities(toggle(cities, c))}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-wide">
                  Minimum Rating
                </span>
                <span className="text-primary">
                  {minRating > 0 ? `${minRating} ★ & above` : "Any"}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Technical Skills */}
            <div>
              <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Technical Skills
              </p>
              <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {allSkills.map((s) => (
                  <Chip
                    key={s}
                    active={skills.includes(s)}
                    onClick={() => setSkills(toggle(skills, s))}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Results Area */}
        <div>
          {results.length === 0 ? (
            <div className="card-surface p-12 text-center">
              <p className="text-base font-bold text-foreground">No matching trainers found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search terms, clearing selected filters, or adding a new trainer.
              </p>
              <button
                onClick={() => {
                  setSkills([]);
                  setCities([]);
                  setTypes([]);
                  setAvail([]);
                  setModes([]);
                  setSectors([]);
                  setExp("Any");
                  setMinRating(0);
                  setQ("");
                }}
                className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
              >
                Clear All Filters
              </button>
            </div>
          ) : view === "cards" ? (
            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
              {results.map((t) => (
                <TrainerCard key={t.id} trainer={t} />
              ))}
            </div>
          ) : (
            <div className="card-surface overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-border bg-muted/60 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3.5">Code & Name</th>
                    <th className="px-3 py-3.5">Skills</th>
                    <th className="px-3 py-3.5">Exp</th>
                    <th className="px-3 py-3.5">City</th>
                    <th className="px-3 py-3.5">Type</th>
                    <th className="px-3 py-3.5">Availability</th>
                    <th className="px-3 py-3.5">Batches</th>
                    <th className="px-4 py-3.5">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {results.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          to="/trainers/$trainerId"
                          params={{ trainerId: t.id }}
                          className="font-bold text-foreground hover:text-primary"
                        >
                          {t.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {t.code} • {t.designation}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex max-w-[200px] flex-wrap gap-1">
                          {t.skills.slice(0, 3).map((s) => (
                            <span
                              key={s.name}
                              className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground"
                            >
                              {s.name}
                            </span>
                          ))}
                          {t.skills.length > 3 && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{t.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold">{t.experience}y</td>
                      <td className="px-3 py-3">{t.city}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground">
                        {t.trainerType.replace(" Trainer", "")}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill trainer={t} />
                      </td>
                      <td className="px-3 py-3">{t.projectsCompleted}</td>
                      <td className="px-4 py-3">
                        <ContactActions trainer={t} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bulk CSV Import Dialog */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Bulk Import Trainers (CSV)</h3>
              </div>
              <button
                onClick={() => setImportOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-muted-foreground">
                Paste comma-separated trainer records below. Columns:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-semibold text-foreground">
                  Name, Phone, Email, City, Skills, Experience
                </code>
              </p>

              <button
                type="button"
                onClick={() =>
                  setImportText(
                    `Name,Phone,Email,City,Skills,Experience\nVikram Seth,+919845012320,vikram.seth@example.com,Bangalore,Golang; Kubernetes; Docker,7\nAnanya Rao,+919845012321,ananya.rao@example.com,Hyderabad,React; TypeScript; Next.js,5\nRahul Sharma,+919845012301,rahul.sharma@example.com,Bangalore,Java; Spring Boot,8`,
                  )
                }
                className="text-xs font-semibold text-primary hover:underline"
              >
                Insert Sample Data (includes 1 duplicate for test)
              </button>

              <textarea
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Name,Phone,Email,City,Skills,Experience..."
                className="w-full rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs outline-none focus:border-primary focus:bg-card"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleParseCsv}
                  className="rounded-xl bg-muted px-4 py-2 text-xs font-bold hover:bg-muted/80"
                >
                  Validate & Preview
                </button>
              </div>

              {/* Preview Table */}
              {importPreview.length > 0 && (
                <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-border p-3">
                  <p className="mb-2 font-bold text-foreground">
                    Parsed Records ({importPreview.length}):
                  </p>
                  <div className="space-y-2">
                    {importPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-lg p-2 ${
                          item.duplicate
                            ? "bg-destructive/10 border border-destructive/30"
                            : "bg-muted/50"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {item.name} ({item.phone})
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {item.email} • {item.city} • {item.skills} ({item.exp} yrs)
                          </p>
                        </div>
                        {item.duplicate ? (
                          <span className="flex items-center gap-1 rounded bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive">
                            <AlertTriangle className="h-3 w-3" /> Duplicate Skipped
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <CheckCircle2 className="h-3 w-3" /> Valid
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setImportOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleCommitImport}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                >
                  Confirm Import ({importPreview.filter((p) => !p.duplicate).length} Records)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
