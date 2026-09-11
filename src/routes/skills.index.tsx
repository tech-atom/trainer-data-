import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tags, Plus, Search, Layers, Edit2, Users, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/atom/AppShell";
import { useStore, type SkillCategory } from "@/lib/store";

export const Route = createFileRoute("/skills/")({
  head: () => ({
    meta: [
      { title: "Skills & Aliases Catalog — ATOM Trainer Hub" },
      {
        name: "description",
        content: "Central technical & soft skills directory with search aliases mapping.",
      },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  const { skillCategories, trainers, addSkill, updateSkillAliases, currentRole } = useStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Add Skill Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("Programming & Backend");
  const [newSkillName, setNewSkillName] = useState("");
  const [newAliases, setNewAliases] = useState("");

  // Edit Aliases Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<{ name: string; aliases: string[] } | null>(
    null,
  );
  const [aliasInput, setAliasInput] = useState("");

  // Calculate trainer count per skill
  const skillTrainerCount = trainers.reduce<Record<string, number>>((acc, t) => {
    t.skills.forEach((s) => {
      acc[s.name] = (acc[s.name] ?? 0) + 1;
    });
    return acc;
  }, {});

  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const aliases = newAliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    addSkill(newCategory, newSkillName.trim(), aliases);
    setAddModalOpen(false);
    setNewSkillName("");
    setNewAliases("");
  };

  const openEditAliases = (skill: { name: string; aliases: string[] }) => {
    setEditingSkill(skill);
    setAliasInput(skill.aliases.join(", "));
    setEditModalOpen(true);
  };

  const handleSaveAliases = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    const aliases = aliasInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    updateSkillAliases(editingSkill.name, aliases);
    setEditModalOpen(false);
  };

  const filteredCategories = skillCategories.filter((cat) => {
    if (selectedCategory !== "All" && cat.category !== selectedCategory) return false;
    return true;
  });

  return (
    <AppShell
      title="Skills & Aliases Catalog"
      subtitle="Manage technical competencies, taxonomy, and search aliases to optimize trainer discovery"
    >
      {/* Controls Bar */}
      <div className="card-surface mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-muted/60 px-3.5 py-2.5 focus-within:border-primary focus-within:bg-card min-w-[240px] max-w-md">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills or aliases (e.g. JS, ML, Spring, Docker)..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-border bg-card px-3 py-2 font-semibold outline-none focus:border-primary"
            >
              <option value="All">All Categories</option>
              {skillCategories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>

            {currentRole === "Admin" && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-bold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" /> Add Skill
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {filteredCategories.map((cat) => {
          const matchingSkills = cat.skills.filter((s) => {
            const q = search.toLowerCase().trim();
            if (!q) return true;
            return (
              s.name.toLowerCase().includes(q) || s.aliases.some((a) => a.toLowerCase().includes(q))
            );
          });

          if (matchingSkills.length === 0) return null;

          return (
            <div key={cat.category} className="card-surface p-6">
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">{cat.category}</h3>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {matchingSkills.length} Skills
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {matchingSkills.map((skill) => {
                  const count = skillTrainerCount[skill.name] || 0;

                  return (
                    <div
                      key={skill.name}
                      className="flex flex-col justify-between rounded-xl border border-border bg-muted/40 p-3.5 transition-colors hover:bg-muted/70"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-foreground text-sm">{skill.name}</h4>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {count} Trainer{count === 1 ? "" : "s"}
                          </span>
                        </div>

                        {/* Aliases */}
                        <div className="mt-2 text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">Search Aliases: </span>
                          {skill.aliases.length > 0 ? (
                            <span>{skill.aliases.join(", ")}</span>
                          ) : (
                            <span className="italic opacity-60">None defined</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                        <Link
                          to="/trainers"
                          className="font-semibold text-primary hover:underline text-[11px]"
                        >
                          Find {skill.name} Trainers →
                        </Link>

                        {currentRole === "Admin" && (
                          <button
                            onClick={() => openEditAliases(skill)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit Aliases"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Skill Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-bold text-foreground">
              Add New Technical or Soft Skill
            </h3>
            <form onSubmit={handleCreateSkill} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                >
                  {skillCategories.map((c) => (
                    <option key={c.category} value={c.category}>
                      {c.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Skill Name *
                </label>
                <input
                  required
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. Rust, PyTorch, GraphQL"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Aliases (Comma separated)
                </label>
                <input
                  value={newAliases}
                  onChange={(e) => setNewAliases(e.target.value)}
                  placeholder="e.g. rust-lang, rs"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Aliases Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="mb-4 text-base font-bold text-foreground">
              Edit Aliases for {editingSkill?.name}
            </h3>
            <form onSubmit={handleSaveAliases} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-muted-foreground uppercase">
                  Search Aliases (Comma separated)
                </label>
                <input
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="e.g. js, ecmascript, frontend js"
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Update Aliases
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
