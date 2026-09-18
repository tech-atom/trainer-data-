/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import JSZip from "jszip";
import * as XLSX from "xlsx";
import {
  FolderArchive,
  UploadCloud,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Trash2,
  Sparkles,
  Database,
  Check,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import {
  extractTextFromPdf,
  parseTrainerProfileText,
  type ExtractedTrainerData,
} from "@/lib/pdf-parser";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Trainer } from "@/lib/trainers";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

interface ParsedBulkItem extends ExtractedTrainerData {
  id: string;
  fileName: string;
  selected: boolean;
  isDuplicate: boolean;
  duplicateReason?: string;
}

// 50 realistic pre-built trainer profiles across Aptitude, Soft Skills, Java, Python, AI, Cloud, VLSI for 1-click batch testing
const GENERATED_SAMPLE_50_DATA: Array<{
  name: string;
  designation: string;
  phone: string;
  email: string;
  city: string;
  exp: number;
  skills: string[];
  bio: string;
}> = [
  {
    name: "Prajwal S",
    designation: "Software Developer & Technical Trainer",
    phone: "7204087858",
    email: "prajwals7072@gmail.com",
    city: "Bangalore",
    exp: 2,
    skills: ["Python", "Django", "Java", "React", "SQL", "Machine Learning"],
    bio: "Enthusiastic developer and trainer specializing in Python, Django, React and ML.",
  },
  {
    name: "Dr. Ananya Sen",
    designation: "Lead Aptitude & Soft Skills Trainer",
    phone: "9845088219",
    email: "ananya.sen@example.com",
    city: "Bangalore",
    exp: 7,
    skills: ["Aptitude", "Soft Skills", "Logical Reasoning", "Communication", "Interview Skills"],
    bio: "Master aptitude and campus placement readiness faculty with 7+ years experience.",
  },
  {
    name: "Rajesh V. Sharma",
    designation: "Senior Java Full Stack Trainer",
    phone: "9901234567",
    email: "rajesh.sharma@example.com",
    city: "Mysore",
    exp: 6,
    skills: ["Java", "Spring Boot", "SQL", "DSA", "Microservices"],
    bio: "Corporate Java and Spring Boot architect training campus batches.",
  },
  {
    name: "Pooja Kulkarni",
    designation: "AI/ML & Data Science Trainer",
    phone: "9741054321",
    email: "pooja.kulkarni@example.com",
    city: "Pune",
    exp: 5,
    skills: ["Python", "Machine Learning", "Data Science", "Pandas", "TensorFlow"],
    bio: "Specialist in machine learning pipelines, deep learning and data analytics.",
  },
  {
    name: "Karthik Raghavan",
    designation: "Campus Placement Readiness Lead",
    phone: "9845012345",
    email: "karthik.r@example.com",
    city: "Bangalore",
    exp: 8,
    skills: ["Aptitude", "Logical Reasoning", "Quantitative Aptitude", "Soft Skills"],
    bio: "Top pre-placement trainer across Tier-1 engineering colleges in Karnataka.",
  },
  {
    name: "Sneha Kulkarni",
    designation: "Aptitude & Verbal Ability Faculty",
    phone: "9845012305",
    email: "sneha.k@example.com",
    city: "Pune",
    exp: 6,
    skills: ["Aptitude", "Soft Skills", "Communication", "Public Speaking"],
    bio: "Specialist in quantitative aptitude and corporate transition skills.",
  },
  {
    name: "Vikram Mehta",
    designation: "Cloud & DevOps Architect Trainer",
    phone: "9845012304",
    email: "vikram.m@example.com",
    city: "Hyderabad",
    exp: 10,
    skills: ["AWS", "DevOps", "Linux", "Docker", "Kubernetes"],
    bio: "AWS authorized instructor and corporate DevOps coach.",
  },
  {
    name: "Dr. Suresh Mukherjee",
    designation: "Generative AI & Data Analytics Faculty",
    phone: "9845012307",
    email: "suresh.m@example.com",
    city: "Kolkata",
    exp: 9,
    skills: ["AI", "Machine Learning", "Python", "Generative AI"],
    bio: "PhD in AI and machine learning conducting faculty development workshops.",
  },
  {
    name: "Manish Verma",
    designation: "VLSI & Embedded Systems Trainer",
    phone: "9845012308",
    email: "manish.v@example.com",
    city: "Bangalore",
    exp: 11,
    skills: ["VLSI", "Embedded Systems", "C", "C++", "MATLAB"],
    bio: "Ex-semiconductor engineer turned core hardware and IoT trainer.",
  },
  {
    name: "Deepika Rao",
    designation: "Frontend React & UI/UX Specialist",
    phone: "9845012309",
    email: "deepika.r@example.com",
    city: "Chennai",
    exp: 4,
    skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind"],
    bio: "Frontend trainer specializing in modern React ecosystem and responsive UI.",
  },
  {
    name: "Abhishek Joshi",
    designation: "Cybersecurity & Ethical Hacking Trainer",
    phone: "9845012310",
    email: "abhishek.j@example.com",
    city: "Noida",
    exp: 7,
    skills: ["Cyber Security", "Networking", "Linux", "Ethical Hacking"],
    bio: "Certified ethical hacker and enterprise security infrastructure trainer.",
  },
  {
    name: "Nidhi Deshmukh",
    designation: "Full Stack MERN Trainer",
    phone: "9845012311",
    email: "nidhi.d@example.com",
    city: "Mumbai",
    exp: 5,
    skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript"],
    bio: "Full stack developer mentor training campus placement cohorts.",
  },
  {
    name: "Rohan Nambiar",
    designation: "Aptitude & Math Shortcuts Specialist",
    phone: "9845012312",
    email: "rohan.n@example.com",
    city: "Kochi",
    exp: 6,
    skills: ["Aptitude", "Quantitative Aptitude", "Logical Reasoning"],
    bio: "Author of speed math techniques for campus recruitment tests.",
  },
  {
    name: "Shweta Tiwari",
    designation: "Business Communication & GD Coach",
    phone: "9845012313",
    email: "shweta.t@example.com",
    city: "Indore",
    exp: 8,
    skills: ["Communication", "Soft Skills", "Leadership", "Interview Skills"],
    bio: "Corporate soft skills trainer and interview grooming coach.",
  },
  {
    name: "Varun Bhat",
    designation: "C++ & DSA Competitive Coding Trainer",
    phone: "9845012314",
    email: "varun.b@example.com",
    city: "Mangalore",
    exp: 5,
    skills: ["C++", "DSA", "Algorithms", "Problem Solving", "C"],
    bio: "Competitive programmer and algorithms coach for product companies.",
  },
  {
    name: "Meera Krishnan",
    designation: "Power BI & Business Intelligence Trainer",
    phone: "9845012315",
    email: "meera.k@example.com",
    city: "Coimbatore",
    exp: 6,
    skills: ["Power BI", "Tableau", "SQL", "Data Analytics"],
    bio: "Business intelligence and corporate analytics visualization trainer.",
  },
  {
    name: "Aditya Hegde",
    designation: "Spring Boot Microservices Lead",
    phone: "9845012316",
    email: "aditya.h@example.com",
    city: "Hubli",
    exp: 8,
    skills: ["Java", "Spring Boot", "Microservices", "REST API", "Docker"],
    bio: "Java microservices trainer for corporate fresher induction programs.",
  },
  {
    name: "Kavya Murthy",
    designation: "Python Automation & Testing Faculty",
    phone: "9845012317",
    email: "kavya.m@example.com",
    city: "Bangalore",
    exp: 4,
    skills: ["Python", "Selenium", "API Testing", "Git"],
    bio: "Python test automation and backend QA trainer.",
  },
  {
    name: "Gaurav Bansal",
    designation: "Azure Cloud Solutions Architect",
    phone: "9845012318",
    email: "gaurav.b@example.com",
    city: "Delhi NCR",
    exp: 9,
    skills: ["Azure", "Cloud Computing", "DevOps", "Linux"],
    bio: "Microsoft certified Azure instructor delivering hands-on cloud labs.",
  },
  {
    name: "Divya Patel",
    designation: "Campus Employability & Soft Skills Lead",
    phone: "9845012319",
    email: "divya.p@example.com",
    city: "Ahmedabad",
    exp: 7,
    skills: ["Soft Skills", "Aptitude", "Communication", "Personality Development"],
    bio: "Employability trainer preparing college students for corporate interviews.",
  },
  {
    name: "Siddharth Roy",
    designation: "Full Stack Django & Python Trainer",
    phone: "9845012320",
    email: "siddharth.r@example.com",
    city: "Kolkata",
    exp: 5,
    skills: ["Python", "Django", "PostgreSQL", "React", "REST API"],
    bio: "Full stack web development trainer with multiple SaaS projects.",
  },
  {
    name: "Neha Saxena",
    designation: "Data Science & NLP Specialist",
    phone: "9845012321",
    email: "neha.s@example.com",
    city: "Jaipur",
    exp: 6,
    skills: ["Data Science", "Python", "Machine Learning", "Pandas"],
    bio: "Data science corporate trainer focusing on predictive modeling.",
  },
  {
    name: "Prateek Sundaram",
    designation: "Core Java & OOPs Concepts Master",
    phone: "9845012322",
    email: "prateek.s@example.com",
    city: "Trivandrum",
    exp: 7,
    skills: ["Java", "DSA", "SQL", "OOPs", "Spring Boot"],
    bio: "Master trainer in Java object-oriented programming and data structures.",
  },
  {
    name: "Lavanya Reddy",
    designation: "Aptitude & Verbal Reasoning Faculty",
    phone: "9845012323",
    email: "lavanya.r@example.com",
    city: "Visakhapatnam",
    exp: 5,
    skills: ["Aptitude", "Verbal Ability", "Soft Skills", "Logical Reasoning"],
    bio: "Trainer specializing in TCS, Infosys, and Wipro campus aptitude patterns.",
  },
  {
    name: "Alok Sengupta",
    designation: "Embedded Systems & IoT Hardware Lead",
    phone: "9845012324",
    email: "alok.s@example.com",
    city: "Bhubaneswar",
    exp: 10,
    skills: ["Embedded Systems", "IoT", "Microcontrollers", "C"],
    bio: "Hands-on robotics, IoT, and embedded hardware trainer.",
  },
  {
    name: "Tanvi Kothari",
    designation: "React & Angular Frontend Architect",
    phone: "9845012325",
    email: "tanvi.k@example.com",
    city: "Pune",
    exp: 6,
    skills: ["React", "Angular", "TypeScript", "JavaScript"],
    bio: "Modern JavaScript and frontend framework specialist.",
  },
  {
    name: "Naveen Chawla",
    designation: "DevOps CI/CD & Kubernetes Coach",
    phone: "9845012326",
    email: "naveen.c@example.com",
    city: "Chandigarh",
    exp: 8,
    skills: ["DevOps", "Docker", "Kubernetes", "CI/CD", "Linux"],
    bio: "DevOps pipelines and enterprise containerization coach.",
  },
  {
    name: "Preeti Mahajan",
    designation: "Corporate Etiquette & Soft Skills Coach",
    phone: "9845012327",
    email: "preeti.m@example.com",
    city: "Nagpur",
    exp: 9,
    skills: ["Soft Skills", "Communication", "Leadership", "Corporate Etiquette"],
    bio: "Corporate communication coach for senior campus placement batches.",
  },
  {
    name: "Harish Pillai",
    designation: "SQL Database & Query Optimization Lead",
    phone: "9845012328",
    email: "harish.p@example.com",
    city: "Kochi",
    exp: 8,
    skills: ["SQL", "MySQL", "PostgreSQL", "Oracle", "Database"],
    bio: "Database design, indexing, and complex SQL query optimization faculty.",
  },
  {
    name: "Sonali Guha",
    designation: "Python Data Engineering & ETL Trainer",
    phone: "9845012329",
    email: "sonali.g@example.com",
    city: "Bangalore",
    exp: 5,
    skills: ["Python", "SQL", "Pandas", "Data Science", "AWS"],
    bio: "ETL pipelines, data cleaning, and analytics trainer.",
  },
  {
    name: "Ramesh Swaminathan",
    designation: "Quantitative Aptitude Master Faculty",
    phone: "9845012330",
    email: "ramesh.s@example.com",
    city: "Chennai",
    exp: 12,
    skills: ["Aptitude", "Quantitative Aptitude", "Logical Reasoning"],
    bio: "Senior faculty with 12 years of pre-placement aptitude training experience.",
  },
  {
    name: "Pallavi Joshi",
    designation: "Django & REST API Developer Trainer",
    phone: "9845012331",
    email: "pallavi.j@example.com",
    city: "Mysore",
    exp: 4,
    skills: ["Python", "Django", "REST API", "SQL", "HTML"],
    bio: "Web development trainer mentoring live student full stack capstones.",
  },
  {
    name: "Vikas Agrawal",
    designation: "Java Spring Cloud & Microservices Coach",
    phone: "9845012332",
    email: "vikas.a@example.com",
    city: "Indore",
    exp: 9,
    skills: ["Java", "Spring Boot", "Microservices", "Cloud", "SQL"],
    bio: "Distributed architecture and Spring Cloud corporate consultant.",
  },
  {
    name: "Aishwarya Natarajan",
    designation: "Aptitude & Campus Interview Specialist",
    phone: "9845012333",
    email: "aishwarya.n@example.com",
    city: "Coimbatore",
    exp: 5,
    skills: ["Aptitude", "Soft Skills", "Interview Skills", "Communication"],
    bio: "Pre-placement interview and quantitative aptitude mentor.",
  },
  {
    name: "Mohit Kapoor",
    designation: "AWS Cloud Infrastructure Trainer",
    phone: "9845012334",
    email: "mohit.k@example.com",
    city: "Delhi NCR",
    exp: 7,
    skills: ["AWS", "Linux", "Cloud Computing", "DevOps"],
    bio: "AWS certified practitioner and cloud architect mentor.",
  },
  {
    name: "Swati Deshpande",
    designation: "Data Analytics & Tableau Faculty",
    phone: "9845012335",
    email: "swati.d@example.com",
    city: "Belgaum",
    exp: 5,
    skills: ["Tableau", "Power BI", "SQL", "Data Science"],
    bio: "Data visualization and corporate analytics dashboards trainer.",
  },
  {
    name: "Chethan Gowda",
    designation: "DSA & Problem Solving Lead",
    phone: "9845012336",
    email: "chethan.g@example.com",
    city: "Bangalore",
    exp: 6,
    skills: ["DSA", "Java", "C++", "Algorithms", "Problem Solving"],
    bio: "Data structures and algorithm trainer for high-paying product drives.",
  },
  {
    name: "Rashmi Shetty",
    designation: "Corporate Communication & Leadership Coach",
    phone: "9845012337",
    email: "rashmi.s@example.com",
    city: "Mangalore",
    exp: 8,
    skills: ["Communication", "Soft Skills", "Leadership", "Public Speaking"],
    bio: "Soft skills trainer specializing in executive presence and communication.",
  },
  {
    name: "Kishore Kumar",
    designation: "Full Stack Node.js & React Architect",
    phone: "9845012338",
    email: "kishore.k@example.com",
    city: "Hyderabad",
    exp: 7,
    skills: ["Node.js", "React", "JavaScript", "MongoDB", "Express"],
    bio: "MERN stack mentor with hands-on fintech application experience.",
  },
  {
    name: "Archana Bose",
    designation: "Machine Learning & Python Analytics Trainer",
    phone: "9845012339",
    email: "archana.b@example.com",
    city: "Kolkata",
    exp: 6,
    skills: ["Python", "Machine Learning", "Pandas", "Scikit-Learn"],
    bio: "Machine learning algorithms and predictive modeling trainer.",
  },
  {
    name: "Santosh Kadam",
    designation: "VLSI Design & Digital Electronics Faculty",
    phone: "9845012340",
    email: "santosh.k@example.com",
    city: "Pune",
    exp: 10,
    skills: ["VLSI", "Verilog", "Embedded Systems", "MATLAB"],
    bio: "Digital system design and FPGA synthesis corporate trainer.",
  },
  {
    name: "Bhavana Rao",
    designation: "Aptitude & Verbal Ability Master Coach",
    phone: "9845012341",
    email: "bhavana.r@example.com",
    city: "Bangalore",
    exp: 7,
    skills: ["Aptitude", "Soft Skills", "Verbal Ability", "Logical Reasoning"],
    bio: "Placement aptitude trainer with top student feedback across Karnataka.",
  },
  {
    name: "Girish Namboodiri",
    designation: "C & Modern C++ Systems Trainer",
    phone: "9845012342",
    email: "girish.n@example.com",
    city: "Trivandrum",
    exp: 9,
    skills: ["C", "C++", "DSA", "Linux", "Embedded Systems"],
    bio: "Low-level systems programming and modern C++ trainer.",
  },
  {
    name: "Pooja Varma",
    designation: "Frontend JavaScript & UI Components Coach",
    phone: "9845012343",
    email: "pooja.v@example.com",
    city: "Jaipur",
    exp: 4,
    skills: ["JavaScript", "HTML", "CSS", "React", "Tailwind"],
    bio: "Frontend web development and UI engineering mentor.",
  },
  {
    name: "Vinay Prasad",
    designation: "DevOps Docker & CI/CD Pipeline Specialist",
    phone: "9845012344",
    email: "vinay.p@example.com",
    city: "Hyderabad",
    exp: 8,
    skills: ["DevOps", "Docker", "Kubernetes", "Linux", "CI/CD"],
    bio: "Continuous integration and automated cloud delivery trainer.",
  },
  {
    name: "Anjali Saxena",
    designation: "Soft Skills & Mock Interview Lead",
    phone: "9845012345",
    email: "anjali.s@example.com",
    city: "Noida",
    exp: 7,
    skills: ["Soft Skills", "Communication", "Interview Skills", "Leadership"],
    bio: "Mock interview and personality grooming trainer for engineering graduates.",
  },
  {
    name: "Subhashree Roy",
    designation: "Python Data Science & GenAI Coach",
    phone: "9845012346",
    email: "subhashree.r@example.com",
    city: "Bhubaneswar",
    exp: 6,
    skills: ["Python", "AI", "Machine Learning", "Generative AI"],
    bio: "Applied artificial intelligence and prompt engineering faculty.",
  },
  {
    name: "Deepak Soni",
    designation: "MySQL & Database Administration Faculty",
    phone: "9845012347",
    email: "deepak.s@example.com",
    city: "Ahmedabad",
    exp: 8,
    skills: ["MySQL", "SQL", "Database", "Linux"],
    bio: "RDBMS architecture and database administration trainer.",
  },
  {
    name: "Ranjitha Hegde",
    designation: "Aptitude Speed Math & Placement Lead",
    phone: "9845012348",
    email: "ranjitha.h@example.com",
    city: "Hubli",
    exp: 6,
    skills: ["Aptitude", "Logical Reasoning", "Quantitative Aptitude"],
    bio: "Campus recruitment quantitative aptitude shortcuts specialist.",
  },
  {
    name: "Vijay Narayanan",
    designation: "Senior Java Full Stack & Microservices Lead",
    phone: "9845012349",
    email: "vijay.n@example.com",
    city: "Bangalore",
    exp: 11,
    skills: ["Java", "Spring Boot", "SQL", "Microservices", "DSA", "AWS"],
    bio: "Senior architect training campus placement and lateral hire batches.",
  },
];

export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const { addTrainersBulk, checkDuplicate } = useStore();
  const [items, setItems] = useState<ParsedBulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string }>({
    current: 0,
    total: 0,
    filename: "",
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean and normalize phone numbers
  const cleanPhoneStr = (val: any): string => {
    if (val === undefined || val === null) return "";
    let str = String(val).trim();
    if (/^[0-9]+(\.[0-9]+)?e\+[0-9]+$/i.test(str)) {
      str = Number(val).toLocaleString("fullwide", { useGrouping: false });
    }
    return str.replace(/[()\s\-.]/g, "");
  };

  // Helper to parse Excel file into ParsedBulkItem[]
  const parseExcelFile = async (file: File): Promise<ParsedBulkItem[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) return [];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[firstSheet], {
      defval: "",
    });

    if (rows.length === 0) return [];
    const headers = Object.keys(rows[0] || {});

    const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const findKey = (targets: string[]) =>
      headers.find((h) =>
        targets.some((t) => clean(h).includes(clean(t)) || clean(t).includes(clean(h))),
      );

    const nameKey = findKey(["name", "trainer name", "full name", "trainer", "candidate", "faculty"]);
    const phoneKey = findKey([
      "phone",
      "phonenumber",
      "phone number",
      "mobile",
      "contact",
      "whatsapp",
      "tel",
      "cell",
    ]);
    const domainKey = findKey([
      "domain",
      "skills",
      "skill",
      "technology",
      "specialization",
      "subject",
      "domain / skill",
    ]);
    const emailKey = findKey(["email", "mail", "email address"]);
    const cityKey = findKey(["city", "location", "place"]);
    const expKey = findKey(["experience", "exp", "years", "total exp"]);

    const results: ParsedBulkItem[] = [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const name = nameKey && r[nameKey] ? String(r[nameKey]).trim() : "";
      const phone = phoneKey && r[phoneKey] !== undefined ? cleanPhoneStr(r[phoneKey]) : "";
      const domain = domainKey && r[domainKey] ? String(r[domainKey]).trim() : "Aptitude & Soft Skills";
      const email = emailKey && r[emailKey] ? String(r[emailKey]).trim() : "";
      const city = cityKey && r[cityKey] ? String(r[cityKey]).trim() : "";
      const exp = expKey && r[expKey] ? Number(r[expKey]) || 0 : 0;

      if (!name && !phone) continue;

      const dup = checkDuplicate(phone, email, name);
      const skillNames = Array.from(
        new Set(
          domain
            .split(/[,+/&]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0),
        ),
      );
      const skills =
        skillNames.length > 0
          ? skillNames.map((s) => ({ name: s, level: "Expert" as const, years: exp }))
          : [{ name: domain, level: "Expert" as const, years: exp }];

      results.push({
        id: `bulk-excel-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
        name: name || "Unnamed Trainer",
        designation: `${domain} Trainer`,
        phone: phone || "",
        whatsapp: phone || "",
        email,
        city,
        state: city ? "Karnataka" : "",
        experience: exp,
        trainingExperience: Math.max(0, Math.round(exp * 0.75)),
        trainerType:
          domain.toLowerCase().includes("aptitude") || domain.toLowerCase().includes("soft skills")
            ? "Aptitude Trainer"
            : "Technical Trainer",
        skills,
        bio: `Experienced corporate faculty specializing in ${domain}.`,
        education: [],
        certifications: [],
        fileName: file.name,
        selected: Boolean(name && phone && phone.replace(/\D/g, "").length >= 7 && !dup.isDuplicate),
        isDuplicate: dup.isDuplicate,
        duplicateReason: !phone || phone.replace(/\D/g, "").length < 7 ? "Missing phone number (mandatory)" : dup.reason,
      });
    }

    return results;
  };

  // Process raw files in bulk
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const parsedItems: ParsedBulkItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length, filename: file.name });

      try {
        if (
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv") ||
          file.type.includes("spreadsheet") ||
          file.type.includes("excel") ||
          file.type.includes("csv")
        ) {
          const excelParsed = await parseExcelFile(file);
          parsedItems.push(...excelParsed);
          continue;
        }

        let text = "";
        if (file.name.endsWith(".pdf") || file.type === "application/pdf") {
          const buffer = await file.arrayBuffer();
          text = await extractTextFromPdf(buffer);
        } else if (file.name.endsWith(".txt") || file.name.endsWith(".docx")) {
          text = await file.text();
        }

        if (text && text.trim().length > 10) {
          const parsed = parseTrainerProfileText(text, file.name);
          const dup = checkDuplicate(parsed.phone, parsed.email, parsed.name);

          parsedItems.push({
            ...parsed,
            id: `bulk-item-${Date.now()}-${i}`,
            fileName: file.name,
            selected: Boolean(parsed.name && parsed.phone && parsed.phone.replace(/\D/g, "").length >= 7 && !dup.isDuplicate),
            isDuplicate: dup.isDuplicate,
            duplicateReason: !parsed.phone || parsed.phone.replace(/\D/g, "").length < 7 ? "Missing phone number (mandatory)" : dup.reason,
          });
        }
      } catch (err) {
        console.warn(`Failed to parse file ${file.name}:`, err);
      }
    }

    setItems((prev) => [...prev, ...parsedItems]);
    setIsProcessing(false);
    toast.success(`Successfully parsed ${parsedItems.length} trainer records in batch!`);
  };

  // Handle Excel upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  // Download Sample Excel Template
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
        "Domain / Skills": "Java Full Stack, Spring Boot, MySQL",
      },
      {
        "Trainer Name": "Meghana Rao",
        "Phone Number": "9845099887",
        "Domain / Skills": "Python, Machine Learning, Data Science",
      },
      {
        "Trainer Name": "Abhinav Kashyap",
        "Phone Number": "9876501234",
        "Domain / Skills": "Aptitude & Verbal Ability",
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

  // Handle ZIP upload
  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const filesToProcess: File[] = [];

      const entries = Object.keys(contents.files);
      for (const filename of entries) {
        const entry = contents.files[filename];
        if (
          !entry.dir &&
          (filename.endsWith(".pdf") || filename.endsWith(".txt") || filename.endsWith(".docx"))
        ) {
          const blob = await entry.async("blob");
          const f = new File([blob], filename.split("/").pop() || filename, {
            type: "application/pdf",
          });
          filesToProcess.push(f);
        }
      }

      if (filesToProcess.length === 0) {
        toast.error("No valid PDF, DOCX or TXT files found inside the ZIP archive.");
        setIsProcessing(false);
        return;
      }

      await processFiles(filesToProcess);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to read ZIP archive. Please ensure it is a valid .zip file.");
      setIsProcessing(false);
    }
  };

  // Handle Multi file / folder selection
  const handleFileListChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files).filter(
        (f) => f.name.endsWith(".pdf") || f.name.endsWith(".txt") || f.name.endsWith(".docx"),
      );
      processFiles(fileList);
    }
  };

  // 1-Click Generate 50 Sample Resumes (Demo Batch)
  const handleLoad50DemoProfiles = () => {
    setIsProcessing(true);
    setProgress({ current: 0, total: 50, filename: "Generating 50 Trainer Profiles..." });

    setTimeout(() => {
      const demoItems: ParsedBulkItem[] = GENERATED_SAMPLE_50_DATA.map((t, idx) => {
        const dup = checkDuplicate(t.phone, t.email, t.name);
        return {
          id: `demo-50-${Date.now()}-${idx}`,
          name: t.name,
          designation: t.designation,
          phone: t.phone,
          whatsapp: t.phone,
          email: t.email,
          city: t.city,
          state: "Karnataka",
          experience: t.exp,
          trainingExperience: Math.max(1, Math.round(t.exp * 0.75)),
          trainerType: t.skills.includes("Aptitude") ? "Aptitude Trainer" : "Technical Trainer",
          skills: t.skills.map((s) => ({ name: s, level: "Expert" as const, years: t.exp })),
          bio: t.bio,
          education: [
            { degree: "B.Tech / MCA", college: "State Technical University", year: 2024 - t.exp },
          ],
          certifications: [
            { name: `Certified ${t.skills[0]} Trainer`, issuer: "ATOM Accreditation" },
          ],
          fileName: `${t.name.replace(/\s+/g, "_")}_Resume.pdf`,
          selected: true,
          isDuplicate: dup.isDuplicate,
          duplicateReason: dup.reason,
        };
      });

      setItems(demoItems);
      setIsProcessing(false);
      toast.success("Loaded 50 ready-to-import trainer profiles!");
    }, 400);
  };

  // Toggle selection
  const toggleSelectAll = (select: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: select })));
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Commit selected items to MySQL database
  const handleSaveAllTo= async () => {
    const selected = items.filter((i) => i.selected);
    if (selected.length === 0) {
      toast.error("Please select at least one trainer to import.");
      return;
    }

    const missingPhone = selected.filter((i) => !i.phone || i.phone.replace(/\D/g, "").length < 7);
    if (missingPhone.length > 0) {
      toast.error(`Phone number is mandatory. ${missingPhone.length} selected trainer(s) do not have a valid phone number.`);
      return;
    }

    setIsSaving(true);
    try {
      const trainersToInsert: Array<Omit<Trainer, "id" | "code">> = selected.map((item) => ({
        name: item.name,
        designation: item.designation || "Corporate Trainer",
        phone: item.phone,
        whatsapp: item.whatsapp || item.phone,
        email: item.email,
        city: item.city || "Bangalore",
        state: item.state || "Karnataka",
        country: "India",
        organization: item.organization || "ATOM Faculty / Consultant",
        experience: item.experience,
        trainingExperience:
          item.trainingExperience || Math.max(1, Math.round(item.experience * 0.7)),
        trainerType: item.trainerType || "Technical Trainer",
        employment: "Freelance",
        modes: ["Online", "Offline", "Hybrid"],
        availability: "available",
        rating: 4.8,
        projectsCompleted: Math.max(5, item.experience * 4),
        bio: item.bio,
        status: "Active",
        tags: ["Bulk Import", "Verified"],
        skills: item.skills,
        softSkills: item.skills
          .filter((s) => ["Aptitude", "Soft Skills", "Communication"].includes(s.name))
          .map((s) => s.name),
        education: (item.education || []).map((e) => ({
          degree: e.degree,
          specialization: e.field || "Computer Science",
          university: e.college,
          year: e.year,
        })),
        certifications: (item.certifications || []).map((c) => ({
          name: c.name,
          org: c.issuer || "Accredited",
          id: "CERT-" + Math.floor(1000 + Math.random() * 9000),
          issued: `${c.year || 2024}-01-01`,
        })),
        trainings: [],
        notes: [
          {
            note: `Imported via bulk batch upload (${item.fileName}).`,
            by: "Admin",
            date: new Date().toISOString().split("T")[0],
          },
        ],
        documents: [
          {
            name: item.fileName,
            type: "Resume",
            date: new Date().toISOString().split("T")[0],
            by: "Admin",
          },
        ],
        sectors: ["College", "University", "Corporate"],
        addedOn: new Date().toISOString().split("T")[0],
        photo: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(item.name)}&backgroundColor=d7f2e3,e7f6ec,cdeedd`,
      }));

      await addTrainersBulk(trainersToInsert);

      toast.success(
        `Successfully saved ${trainersToInsert.length} trainers in bulk to MySQL database!`,
      );
      if (onSuccess) {
        onSuccess(trainersToInsert.length);
      }
      onClose();
    } catch (err: any) {
      console.error("Bulk save error:", err);
      toast.error("Failed to save all trainers to MySQL.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const duplicateCount = items.filter((i) => i.isDuplicate).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card-surface flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-border p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <FolderArchive className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Bulk Trainer Resume Importer</h2>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                  <Database className="h-2.5 w-2.5" /> MySQL Batch Save
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a ZIP file containing multiple resumes, select a folder, or choose 50+ PDF
                files at once
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

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={excelInputRef}
          onChange={handleExcelUpload}
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
          className="hidden"
        />
        <input
          type="file"
          ref={zipInputRef}
          onChange={handleZipUpload}
          accept=".zip,application/zip,application/x-zip-compressed"
          className="hidden"
        />
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFileListChange}
          // @ts-expect-error webkitdirectory is standard for folder picking
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={multiFileInputRef}
          onChange={handleFileListChange}
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
        />

        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-sm font-bold text-foreground">
              Extracting Profiles in Batch... ({progress.current}/{progress.total})
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
              {progress.filename}
            </p>
            <div className="mt-4 h-2 w-64 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Zone (Shown when no items loaded) */}
        {!isProcessing && items.length === 0 && (
          <div className="my-6 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Option 1: Excel & CSV Spreadsheet Upload (Name, Phone, Domain) */}
              <div
                onClick={() => excelInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-500/40 bg-emerald-500/5 p-5 text-center transition-all hover:border-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
              >
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Excel / CSV Spreadsheet</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Upload .xlsx or .csv with Name, Phone Number & Domain columns
                </p>
              </div>

              {/* Option 2: ZIP Upload */}
              <div
                onClick={() => zipInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-5 text-center transition-all hover:border-primary hover:bg-primary/10 cursor-pointer"
              >
                <div className="rounded-xl bg-primary/10 p-3 text-primary mb-2.5 group-hover:scale-105 transition-transform">
                  <FileArchive className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Upload .ZIP Archive</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Upload a single zip file containing 50+ resume PDFs
                </p>
              </div>

              {/* Option 3: Folder Upload */}
              <div
                onClick={() => folderInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-500/30 bg-blue-500/5 p-5 text-center transition-all hover:border-blue-500 hover:bg-blue-500/10 cursor-pointer"
              >
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Select Folder of Resumes</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Choose a directory of PDF / DOCX files from your computer
                </p>
              </div>

              {/* Option 4: Multi-file picker */}
              <div
                onClick={() => multiFileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 p-5 text-center transition-all hover:border-purple-500 hover:bg-purple-500/10 cursor-pointer"
              >
                <div className="rounded-xl bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400 mb-2.5 group-hover:scale-105 transition-transform">
                  <FolderArchive className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-foreground">Select Multiple Files</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Ctrl+Click / Shift+Click to select 50+ PDF files
                </p>
              </div>
            </div>

            {/* Template Download & Demo Quick Bar */}
            <div className="rounded-2xl border border-border bg-muted/40 p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Excel Template & Instant 50 Trainer Demo
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Download a pre-formatted Excel template (Name, Phone Number, Domain) or test with 50 generated profiles
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadSampleTemplate("xlsx")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Excel Template (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoad50DemoProfiles}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-98 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Load 50 Sample Resumes</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Parsed Items Review Table */}
        {!isProcessing && items.length > 0 && (
          <div className="flex flex-1 flex-col overflow-hidden my-3 space-y-3">
            {/* Stats & Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 p-2.5 text-xs border border-border">
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">
                  {items.length} Profiles Extracted ({selectedCount} selected)
                </span>
                {duplicateCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5" /> {duplicateCount} Existing Duplicates
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSelectAll(true)}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-foreground hover:bg-card border border-border cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={() => toggleSelectAll(false)}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-card border border-border cursor-pointer"
                >
                  Deselect All
                </button>
                <button
                  onClick={() => setItems([])}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-destructive hover:bg-destructive/10 border border-destructive/20 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-muted border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground z-10">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCount === items.length && items.length > 0}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        className="rounded accent-primary cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Trainer Name & Designation</th>
                    <th className="p-3">Phone & Email</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Exp</th>
                    <th className="p-3">Extracted Skills</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-muted/30 transition-colors ${!item.selected ? "opacity-50" : ""} ${item.isDuplicate ? "bg-amber-500/5" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => toggleItem(item.id)}
                          className="rounded accent-primary cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setItems((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, name: newName } : i)),
                                );
                              }}
                              className="font-bold text-foreground bg-transparent border-b border-dashed border-border focus:border-primary focus:outline-none"
                            />
                            <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                              {item.designation}
                            </p>
                          </div>
                          {item.isDuplicate && (
                            <span
                              title={item.duplicateReason}
                              className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400"
                            >
                              Duplicate
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{item.phone}</p>
                        <p className="text-[11px] text-muted-foreground">{item.email}</p>
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-2 py-0.5 font-semibold text-foreground">
                          {item.city}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-foreground">{item.experience} yr</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {item.skills.slice(0, 4).map((s) => (
                            <span
                              key={s.name}
                              className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary"
                            >
                              {s.name}
                            </span>
                          ))}
                          {item.skills.length > 4 && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{item.skills.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
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
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            Cancel
          </button>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                disabled={isSaving || selectedCount === 0}
                onClick={handleSaveAllToMySQL}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:opacity-90 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving {selectedCount} Trainers to MySQL...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    <span>Save All ({selectedCount}) to MySQL Database</span>
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
