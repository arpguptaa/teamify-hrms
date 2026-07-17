// Subscription plans, priced per the employee-count slab that a client's
// company falls into. Editable from Master > Plan Management.
export const DEFAULT_PLANS = [
  { id: 'plan-1', label: '1 – 50 Employees', min: 1, max: 50, price: 5000, discountType: 'none', discountValue: 0 },
  { id: 'plan-2', label: '51 – 100 Employees', min: 51, max: 100, price: 9000, discountType: 'none', discountValue: 0 },
  { id: 'plan-3', label: '101 – 200 Employees', min: 101, max: 200, price: 13500, discountType: 'none', discountValue: 0 },
  { id: 'plan-4', label: '201 – 500 Employees', min: 201, max: 500, price: 30000, discountType: 'none', discountValue: 0 },
];

// The 18 HR modules that make up a client's workspace sidebar.
// Each currently renders a "work in progress" placeholder — functionality
// gets wired up module by module in later builds.
export const CLIENT_MODULES = [
  { id: 'employee-management', label: 'Employee Management', icon: 'Users', blurb: 'Employee database, onboarding & offboarding, documents, org chart, directory, bulk import/export.' },
  { id: 'attendance-time', label: 'Attendance & Time', icon: 'Fingerprint', blurb: 'Biometric / geo attendance, shift rosters, leave, overtime, timesheets, holiday calendar.' },
  { id: 'payroll', label: 'Payroll Management', icon: 'Wallet', blurb: 'Salary structures, monthly payroll runs, TDS/PF/ESI/PT, payslips, reimbursements, F&F settlement.' },
  { id: 'leave-management', label: 'Leave Management', icon: 'CalendarDays', blurb: 'Leave policy setup, apply & approve workflow, balance dashboard, comp-off, encashment.' },
  { id: 'recruitment-ats', label: 'Recruitment & ATS', icon: 'BriefcaseBusiness', blurb: 'Job requisitions, resume parsing, interview scheduling, offer letters, talent pool.' },
  { id: 'performance', label: 'Performance Management', icon: 'Target', blurb: 'KRA/KPI, OKRs, 360° feedback, review cycles, appraisals, PIPs.' },
  { id: 'training-development', label: 'Training & Development', icon: 'GraduationCap', blurb: 'Training calendar, LMS integration, skill matrix, certifications, learning paths.' },
  { id: 'ess', label: 'Employee Self-Service', icon: 'UserCog', blurb: 'Profile updates, leave & attendance view, payslip access, tax declarations, helpdesk.' },
  { id: 'mss', label: 'Manager Self-Service', icon: 'Users2', blurb: 'Team attendance approvals, leave approvals, performance reviews, team reports.' },
  { id: 'statutory-compliance', label: 'Statutory Compliance', icon: 'ShieldCheck', blurb: 'PF, ESI, professional tax, TDS, gratuity, labor law, compliance calendar.' },
  { id: 'document-contracts', label: 'Document & Contracts', icon: 'FileSignature', blurb: 'Employment contracts, NDAs, policy documents, expiry alerts, digital signatures.' },
  { id: 'expense-management', label: 'Expense Management', icon: 'ReceiptIndianRupee', blurb: 'Travel claims, local conveyance, medical reimbursements, approvals, expense reports.' },
  { id: 'travel-fleet', label: 'Travel & Fleet', icon: 'Bus', blurb: 'Travel booking requests, cab/bus management, travel policy, settlements.' },
  { id: 'asset-management', label: 'Asset Management', icon: 'Laptop', blurb: 'IT asset allocation, tracking, return on exit, maintenance records.' },
  { id: 'helpdesk', label: 'Helpdesk / Ticketing', icon: 'LifeBuoy', blurb: 'HR queries, IT support tickets, SLA tracking, knowledge base.' },
  { id: 'exit-management', label: 'Exit Management', icon: 'DoorOpen', blurb: 'Resignation workflow, notice tracking, exit interview, clearance, F&F, experience letter.' },
  { id: 'hr-analytics', label: 'HR Analytics', icon: 'BarChart3', blurb: 'Headcount, attrition, attendance & leave trends, payroll summary, custom reports.' },
  { id: 'alerts-notifications', label: 'Alerts & Notifications', icon: 'BellRing', blurb: 'Email/SMS/WhatsApp alerts, in-app notices, birthdays & anniversaries, compliance due dates.' },
];

// Employment status tags shown on every employee record & the org chart.
export const EMPLOYEE_STATUSES = [
  { id: 'active', label: 'Active', dot: 'bg-emerald-500', chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'probation', label: 'Probation', dot: 'bg-sky-500', chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400' },
  { id: 'notice', label: 'Notice Period', dot: 'bg-amber-500', chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'pip', label: 'PIP', dot: 'bg-orange-500', chip: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: 'inactive', label: 'Inactive', dot: 'bg-ink-faint', chip: 'bg-ink-faint/15 text-ink-soft dark:text-ink-soft-dark' },
  { id: 'resigned', label: 'Resigned', dot: 'bg-brand-coral', chip: 'bg-brand-coral/10 text-brand-coral' },
];

export function statusMeta(id) {
  return EMPLOYEE_STATUSES.find((s) => s.id === id) || EMPLOYEE_STATUSES[0];
}

// The mandatory-attachment checklist HR ticks off per employee, grouped by
// category exactly as required for onboarding compliance.
export const DOCUMENT_CHECKLIST = [
  { id: 'aadhaar_front', label: 'Aadhaar Card (Front)', category: 'Identity & Address Proof' },
  { id: 'aadhaar_back', label: 'Aadhaar Card (Back)', category: 'Identity & Address Proof' },
  { id: 'pan_card', label: 'PAN Card', category: 'Identity & Address Proof' },
  { id: 'alt_id', label: 'Passport / Voter ID / Driving License', category: 'Identity & Address Proof' },
  { id: 'marksheet_10_12', label: '10th & 12th Marksheet / Certificate', category: 'Education Proof' },
  { id: 'degree', label: 'Graduation / Post-Graduation Degree or Final Marksheet', category: 'Education Proof' },
  { id: 'relieving_letter', label: 'Relieving / Experience Letter (previous company)', category: 'Previous Employment Proof' },
  { id: 'salary_slips', label: "Last 3 Months' Salary Slips", category: 'Previous Employment Proof' },
  { id: 'form16', label: 'Form 16 (if available)', category: 'Previous Employment Proof' },
  { id: 'cancelled_cheque', label: 'Cancelled Cheque / Bank Passbook (front page)', category: 'Banking Proof' },
  { id: 'photo', label: 'Passport Size Photograph', category: 'Formal Photographs' },
];

// Derives the employee-ID prefix from a company name, e.g.
// "Orbit Retail Pvt. Ltd." -> "ORBIT". Falls back to the first
// alphabetic run found anywhere in the name.
export function companyPrefix(companyName = '') {
  const firstWord = (companyName.trim().split(/\s+/)[0] || '').replace(/[^A-Za-z]/g, '');
  if (firstWord) return firstWord.toUpperCase().slice(0, 8);
  const anyLetters = companyName.replace(/[^A-Za-z]/g, '');
  return (anyLetters || 'EMP').toUpperCase().slice(0, 8);
}

// Employee ID = prefix + running sequence, zero-padded to 2 digits minimum
// (ORBIT01, ORBIT02 ... ORBIT101). The sequence never reuses a number even
// if an earlier employee is removed, so IDs stay unique for the company's
// lifetime.
export function nextEmployeeId(client) {
  const prefix = companyPrefix(client.companyName);
  const seq = (client.employeeSeq || 0) + 1;
  return { employeeId: `${prefix}${String(seq).padStart(2, '0')}`, employeeSeq: seq };
}

// Default password for every new employee account = their PAN number
// (uppercased, spaces stripped). HR/owner-driven resets also fall back to
// this unless a custom password is set.
export function defaultEmployeePassword(pan = '') {
  return pan.replace(/\s+/g, '').toUpperCase();
}

export const DEFAULT_NOTIFICATION_TEMPLATES = {
  birthday: "🎉 Happy Birthday, {name}! Wishing you a fantastic year ahead filled with success and joy. From all of us at {company}.",
  workAnniversary: "🎊 Congratulations {name} on completing {years} year(s) with {company}! Thank you for your dedication and hard work.",
  marriageAnniversary: "💐 Happy Anniversary, {name}! Wishing you and your partner many more years of happiness together. — {company}",
};

export function renderTemplate(tpl, vars) {
  return (tpl || '').replace(/\{(\w+)\}/g, (_, key) => (vars[key] ?? ''));
}

export const PERMISSION_LEVELS = [
  { id: 'none', label: 'No access' },
  { id: 'view', label: 'View only' },
  { id: 'edit', label: 'Full edit' },
];

// A plan-level discount (set from Plan Management) is the default for every
// client on that plan; an individual client's own discount (set from Client
// Database > Edit) overrides it if present — see monthlyPriceForClient below.
export function planPriceWithDiscount(plan) {
  if (!plan) return 0;
  const base = plan.price;
  if (!plan.discountType || plan.discountType === 'none' || !plan.discountValue) return base;
  if (plan.discountType === 'percent') return Math.max(0, Math.round(base * (1 - plan.discountValue / 100)));
  return Math.max(0, base - plan.discountValue);
}


export const TICKET_STATUSES = [
  { id: 'open', label: 'Open', color: 'amber' },
  { id: 'in_progress', label: 'In progress', color: 'blue' },
  { id: 'resolved', label: 'Resolved', color: 'emerald' },
  { id: 'closed', label: 'Closed', color: 'gray' },
];

export const BILLING_CYCLES = [
  { months: 1, label: 'Monthly' },
  { months: 3, label: 'Quarterly' },
  { months: 6, label: 'Half-yearly' },
  { months: 12, label: 'Annual' },
];

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_ATTACHMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

// A client's effective monthly price = plan price, minus their own discount
// override if set, otherwise the plan's default discount (if any).
export function monthlyPriceForClient(client, plans) {
  const plan = plans.find((p) => p.id === client.planId);
  const base = plan?.price || 0;
  const clientDiscount = client.discount && client.discount.type !== 'none' && client.discount.value ? client.discount : null;
  if (clientDiscount) {
    return clientDiscount.type === 'percent'
      ? Math.max(0, Math.round(base * (1 - clientDiscount.value / 100)))
      : Math.max(0, base - clientDiscount.value);
  }
  return planPriceWithDiscount(plan);
}

// Pro-rated amount owed when moving from one billing cycle length to another,
// based on the client's current effective monthly price and days remaining.
export function prorateCycleChange(client, plans, newCycleMonths) {
  const monthly = monthlyPriceForClient(client, plans);
  const dailyRate = monthly / 30;
  const oldMonths = client.billingCycleMonths || 1;
  const extraMonths = newCycleMonths - oldMonths;
  const extraDays = extraMonths * 30;
  return Math.round(dailyRate * extraDays);
}

export const STORAGE_KEYS = {
  master: 'teamify_master_auth',
  clients: 'teamify_clients',
  tickets: 'teamify_tickets',
  theme: 'teamify_theme',
  session: 'teamify_session',
  masterDrive: 'teamify_master_drive',
  activity: 'teamify_activity',
  celebrated: 'teamify_celebrated',
};

// Age in completed years between an ISO date and today (used for "N years
// with the company" / birthday copy).
export function yearsSince(iso) {
  if (!iso) return 0;
  const d = new Date(iso);
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  return years;
}

export function isSameMonthDay(iso, ref = new Date()) {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

export function planForEmployeeCount(count, plans = DEFAULT_PLANS) {
  return plans.find((p) => count >= p.min && count <= p.max) || plans[plans.length - 1];
}

export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysUntil(iso) {
  const diff = new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diff / 86400000);
}
