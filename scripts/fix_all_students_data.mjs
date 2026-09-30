import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const studentsPath = join(__dirname, '..', 'src', 'data', 'students.json');
const students = JSON.parse(readFileSync(studentsPath, 'utf-8'));

console.log(`Loaded ${students.length} students from students.json`);

const DEPT_MAP = {
  // CSE
  'CS': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'CSE': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'AI': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  'IT': { id: 2, name: 'Computer Science and Engineering', degree: 'COMPUTER SCIENCE & ENGINEERING' },
  // EE
  'EE': { id: 4, name: 'Electrical Engineering', degree: 'ELECTRICAL ENGINEERING' },
  'PSE': { id: 4, name: 'Electrical Engineering', degree: 'ELECTRICAL ENGINEERING' },
  // ECE
  'EC': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'ECE': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'MVD': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  'VLSI': { id: 5, name: 'Electronics and Communication Engineering', degree: 'ELECTRONICS & COMMUNICATION ENGINEERING' },
  // ME
  'ME': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'CIM': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'TFE': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  'TSE': { id: 6, name: 'Mechanical Engineering', degree: 'MECHANICAL ENGINEERING' },
  // CE
  'CE': { id: 3, name: 'Civil Engineering', degree: 'CIVIL ENGINEERING' },
  'GTE': { id: 3, name: 'Civil Engineering', degree: 'CIVIL ENGINEERING' },
  'ESE': { id: 3, name: 'Civil Engineering', degree: 'CIVIL ENGINEERING' },
  // AE
  'AE': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'AGE': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'FMP': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'SWC': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  'SWCE': { id: 1, name: 'Agricultural Engineering', degree: 'AGRICULTURAL ENGINEERING' },
  // Forestry
  'FO': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'FOR': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'FR': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  'FE': { id: 7, name: 'Forestry', degree: 'FORESTRY' },
  // Sciences & Others
  'PH': { id: 8, name: 'Physics', degree: 'PHYSICS' },
  'CY': { id: 9, name: 'Chemistry', degree: 'CHEMISTRY' },
  'CH': { id: 9, name: 'Chemistry', degree: 'CHEMISTRY' },
  'MA': { id: 10, name: 'Mathematics', degree: 'MATHEMATICS' },
  'MB': { id: 11, name: 'Management Studies', degree: 'MANAGEMENT STUDIES' },
  'MBA': { id: 11, name: 'Management Studies', degree: 'MANAGEMENT STUDIES' },
  'MS': { id: 11, name: 'Management Studies', degree: 'MANAGEMENT STUDIES' },
  'HS': { id: 13, name: 'Humanities & Social Sciences', degree: 'HUMANITIES & SOCIAL SCIENCES' },
};

function resolveDepartment(student) {
  // First priority: Roll number branch code
  if (student.roll_no) {
    const parts = student.roll_no.toUpperCase().split('/');
    for (const part of parts) {
      if (DEPT_MAP[part]) {
        return DEPT_MAP[part];
      }
    }
  }

  // Second priority: Degree name or existing department name
  const text = `${student.degree_name || ''} ${student.department_name || ''}`.toUpperCase();
  if (text.includes('COMPUTER') || text.includes('CSE')) return DEPT_MAP['CS'];
  if (text.includes('AGRICULTUR')) return DEPT_MAP['AE'];
  if (text.includes('CIVIL')) return DEPT_MAP['CE'];
  if (text.includes('ELECTRONIC') || text.includes('ECE')) return DEPT_MAP['EC'];
  if (text.includes('ELECTRICAL')) return DEPT_MAP['EE'];
  if (text.includes('MECHANICAL')) return DEPT_MAP['ME'];
  if (text.includes('FORESTRY')) return DEPT_MAP['FO'];
  if (text.includes('PHYSICS')) return DEPT_MAP['PH'];
  if (text.includes('CHEMISTRY')) return DEPT_MAP['CY'];
  if (text.includes('MATHEMATIC')) return DEPT_MAP['MA'];
  if (text.includes('MANAGEMENT') || text.includes('MBA')) return DEPT_MAP['MBA'];
  if (text.includes('HUMANITIES')) return DEPT_MAP['HS'];

  return null;
}

function resolveProgramAndModule(student) {
  const rollNo = (student.roll_no || '').toUpperCase();
  const userId = student.user_id || '';
  const firstDigit = userId.split('/')[0]?.[0];

  if (rollNo.startsWith('B/')) return 'Base Module (Certificate)';
  if (rollNo.startsWith('DS/')) return 'Diploma Module';
  if (rollNo.startsWith('D/')) return 'B.Tech. (Degree Module)';
  if (rollNo.startsWith('MT/')) return 'M.Tech.';
  if (rollNo.startsWith('MS/')) return 'M.Sc.';
  if (rollNo.startsWith('MBA/') || rollNo.startsWith('MB/')) return 'MBA';
  if (rollNo.startsWith('PHD/') || rollNo.startsWith('PH.D/')) return 'Ph.D.';

  // If no roll number, use registration prefix
  if (firstDigit === '3') return 'B.Tech. (Degree Module)'; // NEE-III Lateral Entry to Degree
  if (firstDigit === '1') return 'B.Tech. (Degree Module)';
  if (firstDigit === '2') return 'Diploma Module';
  if (firstDigit === '4') return student.program_name || 'Post Graduate';
  if (firstDigit === '5') return 'Ph.D.';

  return student.program_name || 'B.Tech. (Degree Module)';
}

function resolveOddSemester(student) {
  const parts = (student.user_id || '').split('/');
  if (parts.length !== 2) return student.semester;
  const prefix = parts[0];
  const firstDigit = prefix[0];
  const yearCode = parseInt(prefix.slice(-2), 10);
  if (isNaN(yearCode)) return student.semester;

  const currentAcademicYear = 2026;
  const entryYear = 2000 + yearCode;
  const yearsPassed = currentAcademicYear - entryYear;

  // July - Dec 2026 session is strictly ODD SEMESTER
  if (firstDigit === '3') {
    // NEE-III Lateral Entry directly enters Semester 3 in entry year
    const sem = 3 + (yearsPassed * 2);
    return Math.max(1, Math.min(sem, 9));
  } else {
    // Regular students start at Semester 1
    const sem = 1 + (yearsPassed * 2);
    return Math.max(1, Math.min(sem, 9));
  }
}

let deptCount = 0;
let progCount = 0;
let semCount = 0;

for (const student of students) {
  // 1. Department
  const deptInfo = resolveDepartment(student);
  if (deptInfo && (student.department_name !== deptInfo.name || student.department_id !== deptInfo.id)) {
    student.department_name = deptInfo.name;
    student.department_id = deptInfo.id;
    student.degree_name = deptInfo.degree;
    deptCount++;
  }

  // 2. Program
  const prog = resolveProgramAndModule(student);
  if (prog && prog !== student.program_name) {
    student.program_name = prog;
    progCount++;
  }

  // 3. Semester (July - Dec = Odd Semesters)
  const sem = resolveOddSemester(student);
  if (sem && sem !== student.semester) {
    student.semester = sem;
    semCount++;
  }
}

writeFileSync(studentsPath, JSON.stringify(students, null, 2), 'utf-8');

console.log(`\n🎉 Successfully resynced all students in students.json!`);
console.log(`- Updated Departments: ${deptCount}`);
console.log(`- Updated Programs: ${progCount}`);
console.log(`- Updated Semesters: ${semCount}`);

// Verify Silky
const silky = students.find(s => s.user_id === '326/079');
console.log('\nVerified Silky Chanu Haobijam (326/079):', {
  name: silky.full_name,
  roll: silky.roll_no,
  dept: silky.department_name,
  degree: silky.degree_name,
  prog: silky.program_name,
  sem: silky.semester
});
