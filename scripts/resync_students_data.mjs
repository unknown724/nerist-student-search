import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
const students = JSON.parse(readFileSync(studentsPath, 'utf-8'));

console.log(`📋 Loaded ${students.length} students from students.json`);

let updatedCount = 0;
let semesterFixedCount = 0;
let deptFixedCount = 0;
let programFixedCount = 0;

// Resolve Program & Module based on NERIST Modular Structure
function resolveProgramAndModule(student) {
  const userId = student.user_id || '';
  const prefixStr = userId.split('/')[0] || '';
  const progUpper = (student.program_name || '').toUpperCase();

  if (prefixStr.startsWith('3') || progUpper.includes("CERTIFICATE") || progUpper.includes("BASE")) {
    return "Base Module (Certificate)";
  }
  if (prefixStr.startsWith('2') || progUpper.includes("DIPLOMA")) {
    return "Diploma Module";
  }
  if (prefixStr.startsWith('1') || progUpper.includes("B.TECH") || progUpper.includes("DEGREE")) {
    return "B.Tech. (Degree Module)";
  }
  if (progUpper.includes("M.TECH")) return "M.Tech.";
  if (progUpper.includes("M.SC")) return "M.Sc.";
  if (progUpper.includes("PH.D")) return "Ph.D.";

  return student.program_name || "B.Tech. (Degree Module)";
}

// Resolve Department with NERIST Base Module constraints
function resolveDepartment(student, programModule) {
  const degree = (student.degree_name || '').toUpperCase();
  const dept = (student.department_name || '').toUpperCase();
  const isBaseModule = programModule.includes("Base Module");

  if (degree.includes("AGRICULTUR") || dept.includes("AGRICULTUR")) {
    return { id: 1, name: "Agricultural Engineering", degree: "AGRICULTURAL ENGINEERING" };
  }
  if (degree.includes("CIVIL") || dept.includes("CIVIL")) {
    return { id: 3, name: "Civil Engineering", degree: "CIVIL ENGINEERING" };
  }
  if (degree.includes("ELECTRONIC") || degree.includes("ECE") || dept.includes("ELECTRONIC")) {
    return { id: 5, name: "Electronics and Communication Engineering", degree: "ELECTRONICS & COMMUNICATION ENGINEERING" };
  }
  if (degree.includes("ELECTRICAL") || dept.includes("ELECTRICAL")) {
    return { id: 4, name: "Electrical Engineering", degree: "ELECTRICAL ENGINEERING" };
  }
  if (degree.includes("MECHANICAL") || dept.includes("MECHANICAL")) {
    return { id: 6, name: "Mechanical Engineering", degree: "MECHANICAL ENGINEERING" };
  }
  if (degree.includes("FORESTRY") || dept.includes("FORESTRY")) {
    return { id: 7, name: "Forestry", degree: "FORESTRY" };
  }
  if (degree.includes("PHYSICS") || dept.includes("PHYSICS")) {
    return { id: 8, name: "Physics", degree: "PHYSICS" };
  }
  if (degree.includes("CHEMISTRY") || dept.includes("CHEMISTRY")) {
    return { id: 9, name: "Chemistry", degree: "CHEMISTRY" };
  }
  if (degree.includes("MATHEMATIC") || dept.includes("MATHEMATIC")) {
    return { id: 10, name: "Mathematics", degree: "MATHEMATICS" };
  }
  if (degree.includes("MANAGEMENT") || degree.includes("MBA") || dept.includes("MANAGEMENT")) {
    return { id: 11, name: "Management Studies", degree: "MANAGEMENT STUDIES" };
  }

  // Computer Science is ONLY valid for Degree/Diploma/Master's Module (NOT Base Module!)
  if (!isBaseModule && (degree.includes("COMPUTER") || degree.includes("CSE") || dept.includes("COMPUTER"))) {
    return { id: 2, name: "Computer Science and Engineering", degree: "COMPUTER SCIENCE & ENGINEERING" };
  }

  // For Base Module students where department was defaulted to CSE:
  if (isBaseModule) {
    return { id: 12, name: "Base Module Core Engineering", degree: "BASE MODULE CORE DISCIPLINES" };
  }

  return null;
}

// Calculate relative semester by admission year
function resolveSemester(student) {
  const userId = student.user_id || '';
  const parts = userId.split('/');
  if (parts.length !== 2) return student.semester;

  const prefixStr = parts[0];
  const yearCode = parseInt(prefixStr.slice(-2), 10);
  if (isNaN(yearCode)) return student.semester;

  const entryYear = 2000 + yearCode;
  const currentAcademicYear = 2024;
  const yearsInInstitute = currentAcademicYear - entryYear;
  if (yearsInInstitute < 0) return 1;

  if (prefixStr.startsWith('1')) { // Degree Module
    const sem = (yearsInInstitute * 2) + 1;
    return Math.min(Math.max(sem, 1), 8);
  }
  if (prefixStr.startsWith('2')) { // Diploma Module
    const sem = (yearsInInstitute * 2) + 1;
    return Math.min(Math.max(sem, 1), 6);
  }
  if (prefixStr.startsWith('3')) { // Base Module
    const sem = (yearsInInstitute * 2) + 1;
    return Math.min(Math.max(sem, 1), 4);
  }

  return student.semester;
}

for (const student of students) {
  let changed = false;

  // 1. Resync Program / Module
  const newProgram = resolveProgramAndModule(student);
  if (newProgram !== student.program_name) {
    student.program_name = newProgram;
    changed = true;
    programFixedCount++;
  }

  // 2. Resync Department
  const resolvedDept = resolveDepartment(student, newProgram);
  if (resolvedDept && (student.department_name !== resolvedDept.name || student.department_id !== resolvedDept.id)) {
    student.department_name = resolvedDept.name;
    student.department_id = resolvedDept.id;
    student.degree_name = resolvedDept.degree;
    changed = true;
    deptFixedCount++;
  }

  // 3. Resync Semester
  const newSem = resolveSemester(student);
  if (newSem !== student.semester) {
    student.semester = newSem;
    changed = true;
    semesterFixedCount++;
  }

  if (changed) updatedCount++;
}

writeFileSync(studentsPath, JSON.stringify(students, null, 2), 'utf-8');

console.log(`✅ Resync Complete with NERIST Modular Constraints!`);
console.log(`   - Fixed Modules/Programs: ${programFixedCount} students`);
console.log(`   - Fixed Semesters: ${semesterFixedCount} students`);
console.log(`   - Fixed Departments: ${deptFixedCount} students`);
console.log(`   - Total Updated: ${updatedCount} entries saved to students.json`);
