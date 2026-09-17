import React, { useState, useRef } from "react";
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  Plus,
  UserPlus,
  FileSpreadsheet,
  UploadCloud,
} from "lucide-react";
import type { Trainer } from "@/lib/trainers";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { ExcelBulkUploadModal } from "./ExcelBulkUploadModal";

interface SimplePhoneListProps {
  trainers: { trainer: Trainer; matchPercentage?: number }[];
  activeRequirementTerms?: string[];
  minExperience?: number | null;
}

export function SimplePhoneList({
  trainers,
  activeRequirementTerms = [],
  minExperience,
}: SimplePhoneListProps) {
  const { addTrainer, checkDuplicate } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Excel Upload Modal state
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Inline Quick Add state (Name, Phone, Domain only)
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickDomain, setQuickDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const copyPhone = (trainer: Trainer) => {
    navigator.clipboard.writeText(trainer.phone);
    setCopiedId(trainer.id);
    toast.success(`Copied ${trainer.name}'s phone (${trainer.phone})`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllNumbers = () => {
    const numbers = trainers.map(({ trainer }) => trainer.phone).join(", ");
    navigator.clipboard.writeText(numbers);
    toast.success(`Copied ${trainers.length} phone numbers to clipboard!`);
  };

  const handleExcelFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setDroppedFiles(Array.from(e.target.files));
      setExcelModalOpen(true);
    }
  };

  const handleInlineQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      toast.error("Please enter the trainer's name.");
      return;
    }
    if (!quickPhone.trim()) {
      toast.error("Please enter the phone number.");
      return;
    }

    const domainName = quickDomain.trim() || "Aptitude & Soft Skills";
    const dup = checkDuplicate(quickPhone, "", quickName);
    if (dup.isDuplicate) {
      toast.warning(`Duplicate note: ${dup.reason}`);
    }

    setIsAdding(true);
    try {
      const parsedSkillNames = Array.from(
        new Set(
          domainName
            .split(/[,+/&]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        ),
      );
      const skills = parsedSkillNames.map((s) => ({
        name: s,
        level: "Expert" as const,
        years: 5,
      }));

      await addTrainer({
        name: quickName.trim(),
        phone: quickPhone.trim(),
        whatsapp: quickPhone.trim(),
        email: `${quickName.trim().toLowerCase().replace(/\s+/g, "")}@atom.ac.in`,
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        organization: "ATOM Faculty",
        designation: `${domainName} Trainer`,
        experience: 5,
        trainingExperience: 4,
        trainerType: domainName.toLowerCase().includes("aptitude")
          ? "Aptitude Trainer"
          : "Technical Trainer",
        skills: skills.length > 0 ? skills : [{ name: domainName, level: "Expert", years: 5 }],
        primarySkill: skills[0]?.name || domainName,
        modes: ["Online", "Offline", "Hybrid"],
        rating: 5.0,
        projectsCompleted: 10,
        bio: `Experienced trainer in ${domainName}.`,
        status: "Active",
      });

      toast.success(`Trainer "${quickName}" (${domainName}) added and saved to MySQL!`);
      setQuickName("");
      setQuickPhone("");
      setQuickDomain("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add trainer.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="card-surface rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Hidden File Input for Excel Upload */}
      <input
        type="file"
        ref={excelFileInputRef}
        onChange={handleExcelFileSelected}
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        className="hidden"
      />

      {/* Bulk Excel Upload Modal */}
      <ExcelBulkUploadModal
        isOpen={excelModalOpen}
        onClose={() => {
          setExcelModalOpen(false);
          setDroppedFiles([]);
        }}
        initialFiles={droppedFiles}
      />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Name, Phone & Domain Directory ({trainers.length} Contacts)
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary">
              Direct Contact • No Profile Bloat
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Minimalist directory with Name, Phone Number, Domain & instant 1-click WhatsApp / Call
            actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDroppedFiles([]);
              setExcelModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Excel / CSV Bulk Upload</span>
          </button>
          <button
            onClick={copyAllNumbers}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
          >
            <Copy className="h-3.5 w-3.5 text-primary" /> Copy All Phone Numbers
          </button>
        </div>
      </div>

      {/* Inline Quick Add Bar (Name, Phone, Domain only) & Excel Bulk Upload */}
      <div className="border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 px-5 py-3">
        <form
          onSubmit={handleInlineQuickAdd}
          className="flex flex-wrap items-center gap-2.5 text-xs"
        >
          <span className="font-bold text-primary flex items-center gap-1 shrink-0 text-[11px]">
            <UserPlus className="h-3.5 w-3.5" /> Quick Add:
          </span>
          <input
            type="text"
            required
            placeholder="Trainer Name (e.g. Ramesh S)"
            value={quickName}
            onChange={(e) => setQuickName(e.target.value)}
            className="flex-1 min-w-[140px] rounded-xl border border-input bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Phone (e.g. 9845012345)"
            value={quickPhone}
            onChange={(e) => setQuickPhone(e.target.value)}
            className="flex-1 min-w-[130px] rounded-xl border border-input bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <input
            type="text"
            placeholder="Domain (e.g. Aptitude, Soft Skills, Java)"
            value={quickDomain}
            onChange={(e) => setQuickDomain(e.target.value)}
            className="flex-1 min-w-[150px] rounded-xl border border-input bg-card px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isAdding}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer shrink-0 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isAdding ? "Saving..." : "Add"}</span>
          </button>

          {/* Excel / CSV Bulk Upload Button in Quick Add bar */}
          <button
            type="button"
            onClick={() => {
              setDroppedFiles([]);
              setExcelModalOpen(true);
            }}
            title="Bulk upload trainers via Excel (.xlsx) or CSV spreadsheet with Name, Phone Number, and Domain"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-98 cursor-pointer shrink-0 transition-all"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Bulk Upload Excel</span>
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/20 text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Trainer Name</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Experience</th>
              <th className="py-3 px-4">Domain / Skill</th>
              <th className="py-3 px-4 text-right">Quick Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground">
            {trainers.map(({ trainer, matchPercentage }, idx) => {
              const cleanPhone = trainer.whatsapp.replace(/[^0-9]/g, "");
              const whatsappNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Hello ${trainer.name}, We are from Team ATOM, and we are currently looking for a trainer. 
                We would like to check your availability and discuss the opportunity with you. 
                Please let us know a convenient time to connect.`,
              )}`;

              return (
                <tr key={trainer.id} className="hover:bg-muted/40 transition-colors group">
                  {/* Number */}
                  <td className="py-3.5 px-4 text-center font-bold text-muted-foreground text-xs">
                    {idx + 1}
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {trainer.name}
                      </span>
                      {matchPercentage !== undefined && matchPercentage > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-black text-primary-foreground">
                          <Sparkles className="h-2.5 w-2.5" /> {matchPercentage}%
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Phone Number & Copy */}
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{trainer.phone}</span>
                      <button
                        onClick={() => copyPhone(trainer)}
                        title="Copy phone number"
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      >
                        {copiedId === trainer.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        minExperience && trainer.experience >= minExperience
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {trainer.experience} yrs exp
                    </span>
                  </td>

                  {/* Domain */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {trainer.skills.slice(0, 3).map((s) => (
                        <span
                          key={s.name}
                          className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary"
                        >
                          {s.name}
                        </span>
                      ))}
                      {trainer.skills.length === 0 && (
                        <span className="rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {trainer.primarySkill || "Aptitude"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quick Contact Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={`tel:${trainer.phone}`}
                        title={`Call ${trainer.name}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        <span>Call</span>
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
