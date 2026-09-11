import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Plus,
  Trash2,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import {
  extractTextFromPdf,
  parseTrainerProfileText,
  SAMPLE_RESUMES,
  type ExtractedTrainerData,
} from "@/lib/pdf-parser";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { TrainerType, Mode } from "@/lib/trainers";

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrainerAdded?: (trainerId: string) => void;
}

export function PdfUploadModal({ isOpen, onClose, onTrainerAdded }: PdfUploadModalProps) {
  const { addTrainer, checkDuplicate } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedTrainerData | null>(null);
  const [newSkillInput, setNewSkillInput] = useState("");

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsParsing(true);
    setFileName(file.name);

    try {
      let rawText = "";
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        rawText = await extractTextFromPdf(arrayBuffer);
      } else {
        rawText = await file.text();
      }

      if (!rawText || rawText.trim().length === 0) {
        throw new Error("No readable text could be extracted from this file.");
      }

      const parsed = parseTrainerProfileText(rawText, file.name);
      setExtractedData(parsed);
      toast.success(`Extracted details for ${parsed.name}!`);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to parse PDF resume.";
      toast.error(message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const loadSample = (type: keyof typeof SAMPLE_RESUMES) => {
    setIsParsing(true);
    setTimeout(() => {
      const text = SAMPLE_RESUMES[type];
      const parsed = parseTrainerProfileText(text, `${type}_resume.pdf`);
      setFileName(`${type}_resume.pdf`);
      setExtractedData(parsed);
      setIsParsing(false);
      toast.success(`Loaded and extracted ${parsed.name}'s profile!`);
    }, 400);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim() || !extractedData) return;
    const skillName = newSkillInput.trim();
    if (!extractedData.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setExtractedData({
        ...extractedData,
        skills: [
          ...extractedData.skills,
          { name: skillName, level: "Expert", years: extractedData.experience },
        ],
      });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!extractedData) return;
    setExtractedData({
      ...extractedData,
      skills: extractedData.skills.filter((s) => s.name !== skillName),
    });
  };

  const handleSaveTrainer = async () => {
    if (!extractedData) return;
    if (!extractedData.name.trim()) {
      toast.error("Please provide a trainer name.");
      return;
    }

    // Check duplicate
    const dup = checkDuplicate(extractedData.phone, extractedData.email, extractedData.name);
    if (dup.isDuplicate) {
      toast.warning(`Notice: ${dup.reason}`);
    }

    const newTrainer = await addTrainer({
      name: extractedData.name,
      designation: extractedData.designation || "Corporate Trainer",
      phone: extractedData.phone || "9876543210",
      whatsapp: extractedData.whatsapp || extractedData.phone || "9876543210",
      email:
        extractedData.email || `${extractedData.name.toLowerCase().replace(/\s+/g, "")}@atom.ac.in`,
      city: extractedData.city || "Bangalore",
      state: extractedData.state || "Karnataka",
      organization: "Independent Consultant / ATOM Faculty",
      experience: extractedData.experience || 5,
      trainingExperience: extractedData.trainingExperience || 3,
      trainerType: extractedData.trainerType || "Technical Trainer",
      employment: "Freelance",
      rating: 4.8,
      ratingCount: 12,
      projectsCompleted: Math.max(10, (extractedData.experience || 3) * 8),
      skills: extractedData.skills,
      primarySkill: extractedData.skills[0]?.name || "Aptitude",
      modes: ["Offline", "Online", "Hybrid"] as Mode[],
      sectors: ["College", "University", "Corporate"],
      commercialPerDay: 8000,
      commercialPerHour: 1500,
      availability: "available",
      availableFrom: new Date().toISOString().split("T")[0],
      bio: extractedData.bio,
      education: extractedData.education,
      certifications: extractedData.certifications,
      trainings: [],
      documents: fileName
        ? [
            {
              name: fileName,
              type: "Resume / CV",
              date: new Date().toISOString().split("T")[0],
              by: "Admin (Auto-Parsed)",
            },
          ]
        : [],
      notes: [
        {
          note: `Profile automatically extracted from uploaded resume (${fileName || "PDF"}).`,
          by: "Admin",
          date: new Date().toISOString().split("T")[0],
        },
      ],
      status: "Active",
    });

    toast.success(`Trainer "${newTrainer.name}" added to ATOM Hub!`);
    if (onTrainerAdded) {
      onTrainerAdded(newTrainer.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card-surface max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">Smart PDF Profile Extractor</h2>
              <p className="text-xs text-muted-foreground">
                Upload trainer resume to automatically parse and fill profile details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-5">
          {!extractedData ? (
            <>
              {/* Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center transition-all hover:border-primary hover:bg-primary/10 cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="rounded-2xl bg-card p-4 shadow-sm group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-3 font-bold text-foreground text-sm">
                  {isParsing
                    ? "Analyzing & extracting trainer details..."
                    : "Drop Trainer PDF Resume Here"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports PDF, DOCX or TXT • Automatic recognition of Aptitude, Soft Skills, Tech &
                  Contact
                </p>
              </div>

              {/* Sample Profiles Quick Buttons */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                  Or Test with Sample Resumes (1-Click Demo)
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    onClick={() => loadSample("softSkillsAptitude")}
                    disabled={isParsing}
                    className="flex flex-col items-start rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary/5 cursor-pointer text-xs"
                  >
                    <span className="font-bold text-foreground">Dr. Ananya Sen</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Aptitude & Soft Skills
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      9 yrs • Bangalore
                    </span>
                  </button>

                  <button
                    onClick={() => loadSample("javaFullStack")}
                    disabled={isParsing}
                    className="flex flex-col items-start rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary/5 cursor-pointer text-xs"
                  >
                    <span className="font-bold text-foreground">Rajesh V. Sharma</span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                      Java Full Stack & AWS
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      8 yrs • Bangalore
                    </span>
                  </button>

                  <button
                    onClick={() => loadSample("aiDataScience")}
                    disabled={isParsing}
                    className="flex flex-col items-start rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary hover:bg-primary/5 cursor-pointer text-xs"
                  >
                    <span className="font-bold text-foreground">Pooja Kulkarni</span>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                      AI, ML & Python
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      6 yrs • Hyderabad
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Extracted Details Preview & Edit */
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Successfully extracted details from {fileName}
                </div>
                <button
                  onClick={() => setExtractedData(null)}
                  className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Upload Another
                </button>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Trainer Full Name
                  </label>
                  <input
                    type="text"
                    value={extractedData.name}
                    onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Designation</label>
                  <input
                    type="text"
                    value={extractedData.designation}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, designation: e.target.value })
                    }
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={extractedData.phone}
                    onChange={(e) =>
                      setExtractedData({
                        ...extractedData,
                        phone: e.target.value,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={extractedData.email}
                    onChange={(e) => setExtractedData({ ...extractedData, email: e.target.value })}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={extractedData.city}
                    onChange={(e) => setExtractedData({ ...extractedData, city: e.target.value })}
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">
                    Total Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={extractedData.experience}
                    onChange={(e) =>
                      setExtractedData({
                        ...extractedData,
                        experience: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full rounded-xl border border-input bg-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="font-bold text-muted-foreground block mb-1.5 text-xs">
                  Extracted Skills & Competencies ({extractedData.skills.length})
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {extractedData.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary"
                    >
                      {skill.name}
                      <button
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="hover:text-destructive cursor-pointer ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. Aptitude, Soft Skills, Python)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    className="flex-1 rounded-xl border border-input bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bio Summary */}
              <div>
                <label className="font-bold text-muted-foreground block mb-1 text-xs">
                  Professional Bio / Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={extractedData.bio}
                  onChange={(e) => setExtractedData({ ...extractedData, bio: e.target.value })}
                  className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTrainer}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" /> Save Trainer to Hub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
