/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI Escapes for styling
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";

console.log(`${BOLD}${CYAN}======================================================`);
console.log(`🚀 THE OBSOLETE HUMAN - HACKATHON HEALTH AUDIT SCRIPT`);
console.log(`======================================================${RESET}\n`);

let score = 100;
const deductions = [];
const recommendations = [];

function pass(msg) { console.log(`${GREEN}${BOLD}✅ PASS:${RESET} ${msg}`); }
function fail(msg, penalty = 5) { 
  console.log(`${RED}${BOLD}❌ FAIL:${RESET} ${msg} (-${penalty} pts)`); 
  score -= penalty;
  deductions.push(msg);
}
function warn(msg) { console.log(`${YELLOW}${BOLD}⚠️ WARN:${RESET} ${msg}`); }

// ── Helper: Recursively get all files in a directory ──
function getAllFiles(dir, ext = [], fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next')) {
        getAllFiles(filePath, ext, fileList);
      }
    } else {
      if (ext.length === 0 || ext.some(e => filePath.endsWith(e))) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

// ── CATEGORY 1: PROBLEM STATEMENT ALIGNMENT ──
console.log(`${BOLD}--- CATEGORY 1: PROBLEM ALIGNMENT ---${RESET}`);
const requiredFiles = [
  'src/app/onboarding/page.tsx',
  'src/lib/extinction.ts',
  'src/app/taxidermy/page.tsx',
  'src/components/museum/CarbonTranslate.tsx',
];
let alignmentPass = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    fail(`Missing required alignment file: ${file}`, 10);
    alignmentPass = false;
  }
});
if (alignmentPass) {
  pass("All core carbon footprint and museum files exist.");
}

// Check carbon math logic existence
if (fs.existsSync('src/lib/extinction.ts')) {
  const extinctionLogic = fs.readFileSync('src/lib/extinction.ts', 'utf8');
  if (extinctionLogic.includes('calculateAnnualEmissions')) {
    pass("Carbon calculation logic found in extinction.ts");
  } else {
    fail("No calculateAnnualEmissions logic found in extinction.ts", 10);
  }
}

// ── CATEGORY 2: CODE QUALITY ──
console.log(`\n${BOLD}--- CATEGORY 2: CODE QUALITY ---${RESET}`);
const srcFiles = getAllFiles('src', ['.ts', '.tsx']);

let anyCount = 0;
let consoleCount = 0;
srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.match(/:\s*any\b/) || line.match(/\bas\s+any\b/)) {
      anyCount++;
      recommendations.push(`Remove 'any' type in ${file}:${i+1}`);
    }
    if (line.includes('console.log') && !file.includes('.test.')) {
      consoleCount++;
      recommendations.push(`Remove console.log in ${file}:${i+1}`);
    }
  });
});

if (anyCount > 0) fail(`Found ${anyCount} instances of 'any' types in src/`, Math.min(10, anyCount * 2));
else pass("No 'any' types found in src/ files.");

if (consoleCount > 0) fail(`Found ${consoleCount} console.log statements in production code`, Math.min(5, consoleCount));
else pass("No console.log statements found in production code.");

// Try running TSC
try {
  console.log(`${CYAN}Running TypeScript compiler...${RESET}`);
  execSync('npx tsc --noEmit', { stdio: 'ignore' });
  pass("TypeScript compilation passed (noEmit).");
} catch (e) {
  fail("TypeScript compilation failed (run `npx tsc --noEmit` manually to see errors)", 10);
}

// Try running ESLint
try {
  console.log(`${CYAN}Running ESLint...${RESET}`);
  execSync('npx eslint . --max-warnings=0', { stdio: 'ignore' });
  pass("ESLint passed with 0 warnings/errors.");
} catch (e) {
  fail("ESLint violations found (run `npx eslint .` manually to see errors)", 5);
}

// ── CATEGORY 3: SECURITY ──
console.log(`\n${BOLD}--- CATEGORY 3: SECURITY ---${RESET}`);
let secretCount = 0;
let evalCount = 0;
let innerHtmlCount = 0;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.match(/AIza[0-9A-Za-z-_]{35}/) || content.match(/sk-[a-zA-Z0-9]{32,}/) || content.match(/password\s*=\s*['"][^'"]+['"]/)) {
    secretCount++;
    recommendations.push(`CRITICAL: Hardcoded secret found in ${file}`);
  }
  if (content.includes('eval(') || content.includes('Function(')) {
    evalCount++;
  }
  if (content.includes('dangerouslySetInnerHTML')) {
    innerHtmlCount++;
  }
});

if (secretCount > 0) fail(`Found ${secretCount} potential hardcoded secrets!`, 20);
else pass("No hardcoded secrets found in source files.");

if (evalCount > 0) fail(`Found eval() or Function() usage. Highly insecure!`, 15);
else pass("No eval() or Function() used.");

if (innerHtmlCount > 0) fail(`dangerouslySetInnerHTML used! Ensure it is sanitized with DOMPurify.`, 5);
else pass("No dangerouslySetInnerHTML used.");

// Edge runtime check
const apiRoutePath = 'src/app/api/curate/route.ts';
if (fs.existsSync(apiRoutePath)) {
  const apiRoute = fs.readFileSync(apiRoutePath, 'utf8');
  if (apiRoute.includes("export const runtime = 'edge'") || apiRoute.includes('export const runtime = "edge"')) {
    pass("API route explicitly uses the Edge runtime.");
  } else {
    fail("API route missing `export const runtime = 'edge'`", 5);
  }
}

// ── CATEGORY 4: EFFICIENCY & PERFORMANCE ──
console.log(`\n${BOLD}--- CATEGORY 4: DEPENDENCIES & TESTS ---${RESET}`);
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

if (deps['vitest']) pass("Vitest is installed.");
else fail("Vitest is missing from package.json", 5);

if (deps['@playwright/test']) pass("Playwright is installed for E2E tests.");
else fail("Playwright is missing from package.json", 5);

if (deps['zod']) pass("Zod is installed for validation.");
else fail("Zod is missing", 5);

const testFiles = [
  'src/tests/components/SpecimenCard.test.tsx',
  'src/tests/components/HabitatCam.test.tsx',
  'e2e/journey.spec.ts',
];
testFiles.forEach(file => {
  if (fs.existsSync(file)) pass(`Test file ${file} exists.`);
  else fail(`Missing test file: ${file}`, 5);
});

// Try running tests
try {
  console.log(`${CYAN}Running Vitest...${RESET}`);
  // Run tests in run mode, redirect output
  execSync('npx vitest run', { stdio: 'ignore' });
  pass("All Vitest unit/component tests passed!");
} catch (e) {
  fail("Vitest tests failed! Run `npm run test` to fix them.", 10);
}


// ── FINAL SCORE & REPORT ──
console.log(`\n${BOLD}======================================================${RESET}`);
score = Math.max(0, score);
let scoreColor = GREEN;
if (score < 97) scoreColor = YELLOW;
if (score < 80) scoreColor = RED;

console.log(`${BOLD}FINAL PROJECT HEALTH SCORE: ${scoreColor}${score} / 100${RESET}`);

if (deductions.length > 0) {
  console.log(`\n${BOLD}CRITICAL GAPS TO FIX (Deductions):${RESET}`);
  deductions.forEach(d => console.log(`${RED} - ${d}${RESET}`));
}

if (recommendations.length > 0) {
  console.log(`\n${BOLD}TOP ACTION ITEMS:${RESET}`);
  recommendations.slice(0, 5).forEach((r, i) => console.log(`${YELLOW} ${i+1}. ${r}${RESET}`));
}

console.log(`\n${BOLD}Note:${RESET} Manual checks for Accessibility (Screen Reader/Keyboard) and Lighthouse scores still require human verification. Please consult CHECKLIST.md.`);
console.log(`${BOLD}======================================================${RESET}`);
