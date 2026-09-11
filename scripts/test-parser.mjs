import { parseTrainerProfileText } from "../src/lib/pdf-parser.ts";

const prajwalRealPdfText = `P R A J W A L   S
7204087858 • prajwals7072@gmail.com • linkedin • Github
A highly enthusiastic graduate with project experience in supervised machine learning, Java-based statistical analysis, IoT systems, and 3D visualization. Eager to contribute innovative solutions and continuously enhance technical expertise in a professional environment.

Technical Skills
 Programing Language: C , C++ , JAVA , SQL, PYTHON , Django, Nodejs 
 Database : MySQL , Postgre SQL
 Web Development : HTML, CSS , JS, React 
 GraphicDesign /3D model : Blender
 Operating System : Windows 10, UNIX
 Data Visualization: Tableau

Experience
Software Developer | ATOM | March 2025 – PRESENT
 Designed, developed, and enhanced an end-to-end, production-ready Learning Management System (LMS) — AtomShaale (www.atomshaale.com) — built on Django 5.x and Python 3.12...
 Built ATOM AMS (www.atomams.com), a production-ready Flask-based LMS with secure online examinations...
 Developed INTERVEXA AI, an AI-powered mock interview and candidate assessment platform...

Projects
• COVID-19 Future Forecasting using Supervised Machine Learning
• RFID-Based Student Tracking & Monitoring System with Enhanced Security and SMS Alerts
• Boat in a Storm – 3D Animation using Blender
• Statistical Analysis of Brain Tumor Dataset (Java-based Application)
• Virtual Tour of Chanakya University (360° Experience)

Education
Chanakya University | Master’s in Computer Application (MCA) | July 2025 | CGPA : 8.61
K L E ‘s Society Degree College | Bachelor’s in Computer Application (BCA) | July 2023 | CGPA : 7.07

Certifications
 Introduction to Cyber Security
 AWS Academy Cloud Foundation
 Principles of Design Thinking
 RPA Starter
 Google Data Analytics
 The Ultimate Guide to Blender 3D Rigging & Animation
`;

const parsed = parseTrainerProfileText(prajwalRealPdfText, "Prajwal.pdf");

console.log("=== EXACT TEST WITH USER'S PRAJWAL.PDF ===");
console.log("1. Trainer Full Name:", parsed.name);
console.log("2. Designation:", parsed.designation);
console.log("3. Organization:", parsed.organization);
console.log("4. Phone:", parsed.phone);
console.log("5. Email:", parsed.email);
console.log("6. City:", parsed.city);
console.log("7. Total Experience:", parsed.experience, "Year(s)");
console.log("8. Bio / Summary:\n  ", parsed.bio);
console.log(
  "9. Extracted Skills (" + parsed.skills.length + "):\n  ",
  parsed.skills.map((s) => s.name).join(", "),
);
console.log("10. Education:\n  ", JSON.stringify(parsed.education));
console.log(
  "11. Certifications (" + parsed.certifications.length + "):\n  ",
  parsed.certifications.map((c) => c.name).join(", "),
);
