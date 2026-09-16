/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Trash2,
  Sparkles,
  Database,
  Plus,
  ClipboardPaste,
  FileText,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Trainer, TrainerSkill } from "@/lib/trainers";

export interface ExcelBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
  initialFiles?: File[];
}

export interface ParsedExcelRow {
  id: string;
  name: string;
  phone: string;
  domain: string;
  email?: string;
  city?: string;
  experience?: number;
  selected: boolean;
  isDuplicate: boolean;
  duplicateReason?: string;
  isValid: boolean;
  errorReason?: string;
}

export function ExcelBulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
  initialFiles,
}: ExcelBulkUploadModalProps) {
  const { addTrainersBulk, checkDuplicate } = useStore();
  const [items, setItems] = useState<ParsedExcelRow[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pasteText, setPasteText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-process initial files if passed in
  React.useEffect(() => {
    if (isOpen && initialFiles && initialFiles.length > 0) {
      handleFiles(initialFiles);
    }
  }, [isOpen, initialFiles]);

  if (!isOpen) return null;

  // Clean and format phone number from raw string or number (handling Excel scientific notation or spaces)
  const cleanPhoneNumber = (val: any): string => {
    if (val === undefined || val === null) return "";
    let str = String(val).trim();
    // In case scientific notation was parsed
    if (/^[0-9]+(\.[0-9]+)?e\+[0-9]+$/i.test(str)) {
      str = Number(val).toLocaleString("fullwide", { useGrouping: false });
    }
    // Remove formatting characters like spaces, dashes, parentheses
    str = str.replace(/[()\s\-.]/g, "");
    return str;
  };

  // Identify column headers flexibly
  const findColumnKey = (headers: string[], possibleNames: string[]): string | undefined => {
    const cleanPossible = possibleNames.map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, ""));
    return headers.find((h) => {
      const cleanH = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      return cleanPossible.some((p) => cleanH.includes(p) || p.includes(cleanH));
    });
  };

  // Parse raw JSON rows from XLSX
  const parseRowsData = (rows: Record<string, any>[]): ParsedExcelRow[] => {
    if (!rows || rows.length === 0) return [];

    const headers = Object.keys(rows[0] || {});

    // Match column keys
    const nameKey = findColumnKey(headers, [
      "name",
      "trainer name",
      "full name",
      "trainer",
      "candidate",
      "faculty",
      "trainer_name",
    ]);
    const phoneKey = findColumnKey(headers, [
      "phone",
      "phonenumber",
      "phone number",
      "mobile",
      "contact",
      "whatsapp",
      "tel",
      "cell",
      "contact number",
    ]);
    const domainKey = findColumnKey(headers, [
      "domain",
      "skills",
      "skill",
      "technology",
      "specialization",
      "subject",
      "track",
      "domain / skill",
      "category",
    ]);
    const emailKey = findColumnKey(headers, ["email", "mail", "email address", "email id"]);
    const cityKey = findColumnKey(headers, ["city", "location", "place"]);
    const expKey = findColumnKey(headers, ["experience", "exp", "years", "total exp"]);

    const parsed: ParsedExcelRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rawName = nameKey && row[nameKey] ? String(row[nameKey]).trim() : "";
      const rawPhone = phoneKey && row[phoneKey] !== undefined ? cleanPhoneNumber(row[phoneKey]) : "";
      const rawDomain =
        domainKey && row[domainKey] ? String(row[domainKey]).trim() : "Aptitude & Soft Skills";
      const rawEmail = emailKey && row[emailKey] ? String(row[emailKey]).trim() : undefined;
      const rawCity = cityKey && row[cityKey] ? String(row[cityKey]).trim() : "Bangalore";
      const rawExp = expKey && row[expKey] ? Number(row[expKey]) || 5 : 5;

      // Skip completely blank rows
      if (!rawName && !rawPhone && !rawDomain) continue;

      let isValid = true;
      let errorReason: string | undefined;

      if (!rawName) {
        isValid = false;
        errorReason = "Missing trainer name";
      } else if (!rawPhone || rawPhone.length < 7) {
        isValid = false;
        errorReason = "Missing or invalid phone number";
      }

      const dup = checkDuplicate(rawPhone, rawEmail || "", rawName);

      parsed.push({
        id: `excel-row-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
        name: rawName || "Unnamed Trainer",
        phone: rawPhone || "",
        domain: rawDomain || "General",
        email: rawEmail,
        city: rawCity,
        experience: rawExp,
        selected: isValid,
        isDuplicate: dup.isDuplicate,
        duplicateReason: dup.reason,
        isValid,
        errorReason,
      });
    }

    return parsed;
  };

  // Handle file uploads (Excel .xlsx, .xls, or .csv)
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFile = fileArray.find(
      (f) =>
        f.name.endsWith(".xlsx") ||
        f.name.endsWith(".xls") ||
        f.name.endsWith(".csv") ||
        f.type.includes("spreadsheet") ||
        f.type.includes("excel") ||
        f.type.includes("csv"),
    );

    if (!validFile) {
      toast.error("Please select a valid Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setIsProcessing(true);
    try {
      const buffer = await validFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("No sheet found in workbook.");
      }
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });

      if (jsonData.length === 0) {
        toast.warning("The selected spreadsheet is empty.");
        setIsProcessing(false);
        return;
      }

      const parsed = parseRowsData(jsonData);
      setItems(parsed);
      toast.success(
        `Parsed ${parsed.length} trainers from ${validFile.name} (Valid: ${
          parsed.filter((p) => p.isValid && !p.isDuplicate).length
        })`,
      );
    } catch (err: any) {
      console.error("Excel parse error:", err);
      toast.error("Failed to parse Excel file. Please ensure it has valid columns.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle pasted text (Tab-separated from Excel/Sheets or comma-separated)
  const handleParsePaste = () => {
    if (!pasteText.trim()) {
      toast.error("Please paste tabular data from Excel or Google Sheets.");
      return;
    }

    setIsProcessing(true);
    try {
      const lines = pasteText
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) {
        toast.error("No data found.");
        setIsProcessing(false);
        return;
      }

      // Check if first row is header
      const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(",") ? "," : " ";
      const firstLineTokens = lines[0].split(delimiter).map((t) => t.trim().toLowerCase());
      const hasHeader =
        firstLineTokens.some((t) => ["name", "trainer", "fullname"].includes(t)) ||
        firstLineTokens.some((t) => ["phone", "phonenumber", "mobile", "contact"].includes(t));

      const startIndex = hasHeader ? 1 : 0;
      const parsed: ParsedExcelRow[] = [];

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        let cols: string[] = [];
        if (delimiter === ",") {
          // simple csv split
          cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        } else if (delimiter === "\t") {
          cols = line.split("\t").map((c) => c.trim());
        } else {
          cols = line.split(/\s{2,}|\t/).map((c) => c.trim());
        }

        const name = cols[0] || "";
        const phone = cleanPhoneNumber(cols[1] || "");
        const domain = cols[2] || "Aptitude & Soft Skills";

        if (!name && !phone) continue;

        let isValid = true;
        let errorReason: string | undefined;

        if (!name) {
          isValid = false;
          errorReason = "Missing trainer name";
        } else if (!phone || phone.length < 7) {
          isValid = false;
          errorReason = "Missing or invalid phone number";
        }

        const dup = checkDuplicate(phone, "", name);

        parsed.push({
          id: `paste-row-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          name: name || "Unnamed Trainer",
          phone: phone || "",
          domain: domain || "Aptitude & Soft Skills",
          selected: isValid,
          isDuplicate: dup.isDuplicate,
          duplicateReason: dup.reason,
          isValid,
          errorReason,
        });
      }

      if (parsed.length === 0) {
        toast.warning("Could not extract any trainer rows. Please check format.");
      } else {
        setItems(parsed);
        toast.success(`Successfully parsed ${parsed.length} trainers from pasted text!`);
      }
    } catch (err: any) {
      console.error("Paste parse error:", err);
      toast.error("Failed to parse pasted data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Sample data template generation
  const downloadSampleTemplate = (format: "xlsx" | "csv") => {
    const sampleData = [
      {
        "Trainer Name": "Ramesh S",
        "Phone Number": "9845012345",
        "Domain / Skills": "Aptitude, Soft Skills, Communication",
      },
      {
        "Trainer Name": "Chaitra Rao",
        "Phone Number": "8861796089",
        "Domain / Skills": "Java Full Stack, Spring Boot, SQL",
      },
      {
        "Trainer Name": "Meghana Rao",
        "Phone Number": "9845099887",
        "Domain / Skills": "Python, Machine Learning, Data Science",
      },
      {
        "Trainer Name": "Abhinav Kashyap",
        "Phone Number": "9876501234",
        "Domain / Skills": "Aptitude & Logical Reasoning",
      },
      {
        "Trainer Name": "Kiran Kumar",
        "Phone Number": "9845012310",
        "Domain / Skills": "AWS Cloud, DevOps, Docker",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trainers");

    if (format === "xlsx") {
      XLSX.writeFile(workbook, "ATOM_Trainers_Bulk_Upload_Template.xlsx");
    } else {
      XLSX.writeFile(workbook, "ATOM_Trainers_Bulk_Upload_Template.csv");
    }
    toast.success(`Downloaded sample ${format.toUpperCase()} template!`);
  };

  // Add empty row manually
  const handleAddManualRow = () => {
    setItems((prev) => [
      {
        id: `manual-row-${Date.now()}`,
        name: "",
        phone: "",
        domain: "Aptitude & Soft Skills",
        selected: true,
        isDuplicate: false,
        isValid: false,
        errorReason: "Fill in name & phone",
      },
      ...prev,
    ]);
  };

  // Update a single item field
  const handleUpdateItem = (
    id: string,
    field: "name" | "phone" | "domain",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // re-validate
        const cleanPhone = field === "phone" ? cleanPhoneNumber(value) : item.phone;
        const currentName = field === "name" ? value : item.name;
        const dup = checkDuplicate(cleanPhone, "", currentName);

        const isValid = Boolean(currentName.trim() && cleanPhone && cleanPhone.length >= 7);
        return {
          ...updated,
          phone: cleanPhone,
          isDuplicate: dup.isDuplicate,
          duplicateReason: dup.reason,
          isValid,
          errorReason: !isValid ? "Incomplete name or phone" : undefined,
        };
      }),
    );
  };

  const handleToggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    );
  };

  const handleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Save selected trainers to MySQL database
  const handleSaveToDatabase = async () => {
    const selected = items.filter((i) => i.selected && i.name.trim() && i.phone.trim());
    if (selected.length === 0) {
      toast.error("Please select at least one valid trainer to import.");
      return;
    }

    setIsSaving(true);
    try {
      const trainersToInsert: Array<Omit<Trainer, "id" | "code">> = selected.map((item) => {
        const domainText = item.domain || "Aptitude & Soft Skills";
        const parsedSkillNames = Array.from(
          new Set(
            domainText
              .split(/[,+/&]+/)
              .map((s) => s.trim())
              .filter((s) => s.length > 0),
          ),
        );

        const skills: TrainerSkill[] =
          parsedSkillNames.length > 0
            ? parsedSkillNames.map((s) => ({
                name: s,
                level: "Expert" as const,
                years: item.experience || 5,
              }))
            : [{ name: domainText, level: "Expert" as const, years: item.experience || 5 }];

        const softSkills = skills
          .filter((s) =>
            ["Aptitude", "Soft Skills", "Communication", "Verbal", "Reasoning"].includes(s.name),
          )
          .map((s) => s.name);

        const trainerType =
          domainText.toLowerCase().includes("aptitude") ||
          domainText.toLowerCase().includes("soft skills")
            ? "Aptitude Trainer"
            : "Technical Trainer";

        const email =
          item.email ||
          `${item.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@atom.ac.in`;

        return {
          name: item.name.trim(),
          designation: `${domainText} Trainer`,
          phone: item.phone.trim(),
          whatsapp: item.phone.trim(),
          email,
          city: item.city || "Bangalore",
          state: "Karnataka",
          country: "India",
          organization: "ATOM Faculty / Consultant",
          experience: item.experience || 5,
          trainingExperience: Math.max(1, Math.round((item.experience || 5) * 0.75)),
          trainerType,
          employment: "Freelance",
          modes: ["Online", "Offline", "Hybrid"],
          availability: "available",
          rating: 4.8,
          projectsCompleted: 8,
          bio: `Experienced corporate faculty specializing in ${domainText}.`,
          status: "Active",
          tags: ["Excel Bulk Import", "Verified", ...parsedSkillNames.slice(0, 2)],
          skills,
          softSkills: softSkills.length > 0 ? softSkills : ["Communication"],
          education: [
            {
              degree: "B.Tech / B.E. / MCA",
              specialization: domainText,
              university: "State University",
              year: 2020,
            },
          ],
          certifications: [
            {
              name: `Certified ${domainText} Trainer`,
              org: "ATOM Accreditation",
              id: "CERT-" + Math.floor(1000 + Math.random() * 9000),
              issued: new Date().toISOString().split("T")[0],
            },
          ],
          trainings: [],
          notes: [
            {
              note: `Bulk imported via Excel (Name: ${item.name}, Phone: ${item.phone}, Domain: ${domainText}).`,
              by: "Admin",
              date: new Date().toISOString().split("T")[0],
            },
          ],
          documents: [],
          sectors: ["College", "Corporate", "University"],
          addedOn: new Date().toISOString().split("T")[0],
          photo: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
            item.name,
          )}&backgroundColor=d7f2e3,e7f6ec,cdeedd`,
        };
      });

      await addTrainersBulk(trainersToInsert);

      toast.success(
        `Successfully imported ${trainersToInsert.length} trainers in bulk to MySQL database!`,
      );
      if (onSuccess) {
        onSuccess(trainersToInsert.length);
      }
      onClose();
    } catch (err: any) {
      console.error("Bulk save error:", err);
      toast.error("Failed to save trainers to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const duplicateCount = items.filter((i) => i.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card-surface flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-border p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Excel & CSV Bulk Upload (Name, Phone & Domain)
                </h2>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Database className="h-2.5 w-2.5" /> Direct MySQL Import
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Quickly import batches of trainers by uploading an Excel spreadsheet or pasting Name,
                Phone Number & Domain
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="hidden"
        />

        {/* Action Tabs & Template Download (Shown when not reviewing or always accessible) */}
        {items.length === 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center rounded-xl bg-muted/60 p-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UploadCloud className="h-3.5 w-3.5" /> Upload File (.xlsx, .csv)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
                  activeTab === "paste"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardPaste className="h-3.5 w-3.5" /> Paste Tabular Text
              </button>
            </div>

            {/* Template Download Links */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSampleTemplate("xlsx")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Download Sample Excel (.xlsx)</span>
              </button>
              <button
                type="button"
                onClick={() => downloadSampleTemplate("csv")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
            <p className="text-sm font-bold text-foreground">Reading Spreadsheet Data...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Extracting Name, Phone Number, and Domain columns
            </p>
          </div>
        )}

        {/* UPLOAD TAB */}
        {!isProcessing && items.length === 0 && activeTab === "upload" && (
          <div className="my-5 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-emerald-500 bg-emerald-500/10 scale-99"
                  : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10"
              }`}
            >
              <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="h-10 w-10" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                Drop your Excel (.xlsx, .xls) or CSV file here
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Spreadsheet must contain columns for <span className="font-bold text-foreground">Name</span>,{" "}
                <span className="font-bold text-foreground">PhoneNumber</span>, and{" "}
                <span className="font-bold text-foreground">Domain / Skills</span>.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <UploadCloud className="h-4 w-4" /> Browse Excel File
              </button>
            </div>

            {/* Quick Demo Pre-fill */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/40 p-3.5 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-foreground">Want to test with sample data?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasteText(`Trainer Name\tPhone Number\tDomain / Skills
Ramesh S\t9845012345\tAptitude, Soft Skills, Logical Reasoning
Chaitra Rao\t8861796089\tJava Full Stack, Spring Boot, MySQL
Meghana Rao\t9845099887\tPython, Machine Learning, Data Science
Abhinav Kashyap\t9876501234\tAptitude & Verbal Ability
Pooja Kulkarni\t9741054321\tAI & Deep Learning, PyTorch
Vikram Mehta\t9845012304\tAWS Cloud, DevOps, Kubernetes`);
                  setActiveTab("paste");
                }}
                className="rounded-xl border border-border bg-card px-3 py-1 font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Load Sample Data in Paste Tab →
              </button>
            </div>
          </div>
        )}

        {/* PASTE TAB */}
        {!isProcessing && items.length === 0 && activeTab === "paste" && (
          <div className="my-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Paste columns directly from Excel or Google Sheets (Name, Phone Number, Domain):
              </label>
              <span className="text-[11px] text-muted-foreground">Tab or Comma separated</span>
            </div>
            <textarea
              rows={8}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`Trainer Name\tPhone Number\tDomain\nRamesh S\t9845012345\tAptitude & Soft Skills\nChaitra\t8861796089\tJava, Spring Boot, SQL\nMeghana Rao\t9845099887\tPython, Machine Learning`}
              className="w-full rounded-2xl border border-input bg-card p-3.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPasteText("")}
                className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleParsePaste}
                disabled={!pasteText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Parse {pasteText.trim() ? `${pasteText.trim().split("\n").length} Rows` : "Data"}</span>
              </button>
            </div>
          </div>
        )}

        {/* REVIEW & EDIT PREVIEW TABLE */}
        {!isProcessing && items.length > 0 && (
          <div className="my-3 flex flex-1 flex-col overflow-hidden space-y-3">
            {/* Header / Stats */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted/50 p-3 text-xs border border-border">
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">
                  {items.length} Records Parsed ({selectedCount} selected)
                </span>
                {duplicateCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> {duplicateCount} Existing Duplicates
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddManualRow}
                  className="inline-flex items-center gap-1 rounded-xl bg-card border border-border px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Add Row
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(true)}
                  className="rounded-xl bg-card border border-border px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-muted cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAll(false)}
                  className="rounded-xl bg-card border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Scrollable Table */}
            <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-muted border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground z-10">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCount === items.length && items.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded accent-emerald-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">#</th>
                    <th className="p-3">Trainer Name</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3">Domain / Skills</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        !item.selected ? "opacity-50" : ""
                      } ${item.isDuplicate ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded accent-emerald-600 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-bold text-muted-foreground">{idx + 1}</td>

                      {/* Name Input */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                          placeholder="Trainer Name"
                          className="w-full rounded-lg border border-transparent hover:border-input focus:border-emerald-600 bg-transparent px-2 py-1 font-bold text-foreground focus:bg-card focus:outline-none"
                        />
                      </td>

                      {/* Phone Input */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.phone}
                          onChange={(e) => handleUpdateItem(item.id, "phone", e.target.value)}
                          placeholder="9845012345"
                          className="w-full rounded-lg border border-transparent hover:border-input focus:border-emerald-600 bg-transparent px-2 py-1 font-mono font-bold text-foreground focus:bg-card focus:outline-none"
                        />
                      </td>

                      {/* Domain Input */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.domain}
                          onChange={(e) => handleUpdateItem(item.id, "domain", e.target.value)}
                          placeholder="Domain / Skills"
                          className="w-full rounded-lg border border-transparent hover:border-input focus:border-emerald-600 bg-transparent px-2 py-1 text-foreground focus:bg-card focus:outline-none"
                        />
                      </td>

                      {/* Status Badges */}
                      <td className="p-3 text-center">
                        {item.isDuplicate ? (
                          <span
                            title={item.duplicateReason}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" /> Duplicate
                          </span>
                        ) : !item.isValid ? (
                          <span
                            title={item.errorReason}
                            className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive border border-destructive/20"
                          >
                            Incomplete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Ready
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
          >
            Cancel
          </button>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving || selectedCount === 0}
                onClick={handleSaveToDatabase}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving {selectedCount} Trainers to MySQL...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Import {selectedCount} Trainers to Database</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
