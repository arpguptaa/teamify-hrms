import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  DEFAULT_PLANS, STORAGE_KEYS, planForEmployeeCount, nextEmployeeId, defaultEmployeePassword,
  DEFAULT_NOTIFICATION_TEMPLATES, renderTemplate, isSameMonthDay, yearsSince,
} from '../lib/constants';

const DataContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const emptyDrive = { connected: false, folderId: '', folderName: '' };
const emptyDiscount = { type: 'none', value: 0 };

// Two sample records so the console isn't empty on first run.
// Delete anytime from My Account > Reset demo data.
const SEED_CLIENTS = [
  {
    id: 'client-demo-active',
    companyName: 'Orbit Retail Pvt. Ltd.',
    legalEntityName: 'Orbit Retail Private Limited',
    registrationNumber: '',
    industry: 'Retail',
    clientName: 'Neha Kapoor',
    contactInfo: '+91 98765 43210',
    email: 'neha@orbitretail.example',
    website: '',
    registeredAddress: '',
    operationalAddress: '',
    contactDesignation: 'Founder',
    department: '',
    reportingAuthority: '',
    gstNumber: '', pan: '', cin: '',
    billingAddress: '', paymentMethodPref: 'UPI',
    fiscalYearStart: 'April', payrollFrequency: 'Monthly',
    workingDaysPattern: 'Mon–Fri', holidayCalendarNote: '',
    logo: '',
    userId: 'orbitretail',
    password: 'Orbit@1234',
    employeeCount: 48,
    planId: 'plan-1',
    discount: emptyDiscount,
    billingCycleMonths: 1,
    status: 'active',
    nextBillingDate: new Date(Date.now() + 18 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    upgradeRequested: false,
    driveConfig: emptyDrive,
    org: { employees: [] },
    paymentProofs: [],
    employeeSeq: 0,
    notificationTemplates: { ...DEFAULT_NOTIFICATION_TEMPLATES },
    companyDocuments: [],
  },
  {
    id: 'client-demo-pending',
    companyName: 'Fernway Logistics',
    legalEntityName: '', registrationNumber: '', industry: 'Logistics',
    clientName: 'Rohit Sen',
    contactInfo: '+91 90000 11122',
    email: 'rohit@fernway.example',
    website: '', registeredAddress: '', operationalAddress: '',
    contactDesignation: 'Director', department: '', reportingAuthority: '',
    gstNumber: '', pan: '', cin: '',
    billingAddress: '', paymentMethodPref: 'UPI',
    fiscalYearStart: 'April', payrollFrequency: 'Monthly',
    workingDaysPattern: 'Mon–Sat', holidayCalendarNote: '',
    logo: '',
    userId: 'fernway',
    password: 'Fernway@2026',
    employeeCount: 85,
    planId: 'plan-2',
    discount: emptyDiscount,
    billingCycleMonths: 1,
    status: 'pending',
    nextBillingDate: null,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    upgradeRequested: false,
    driveConfig: emptyDrive,
    org: { employees: [] },
    paymentProofs: [],
    employeeSeq: 0,
    notificationTemplates: { ...DEFAULT_NOTIFICATION_TEMPLATES },
    companyDocuments: [],
  },
];

const SEED_TICKETS = [
  {
    id: 'ticket-demo-1',
    clientId: null,
    name: 'Priya Malhotra',
    email: 'priya@brightworks.example',
    phone: '+91 99887 66554',
    status: 'open',
    messages: [
      { id: 'msg-seed-1', sender: 'guest', text: "Hi, I'm interested in Teamify for our 120-person team. Can you share a demo?", attachment: null, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    read: false,
  },
];

const SEED_ACTIVITY = [
  { id: 'activity-seed-1', scope: 'master', message: 'Sample data loaded for Orbit Retail Pvt. Ltd. and Fernway Logistics.', createdAt: new Date(Date.now() - 40 * 86400000).toISOString(), read: true },
];

export function DataProvider({ children }) {
  const [plans, setPlans] = useState(() => load('teamify_plans', DEFAULT_PLANS));
  const [clients, setClients] = useState(() => load(STORAGE_KEYS.clients, SEED_CLIENTS));
  const [tickets, setTickets] = useState(() => load(STORAGE_KEYS.tickets, SEED_TICKETS));
  const [activity, setActivity] = useState(() => load(STORAGE_KEYS.activity, SEED_ACTIVITY));
  const [masterDrive, setMasterDrive] = useState(() => load(STORAGE_KEYS.masterDrive, emptyDrive));

  useEffect(() => save(STORAGE_KEYS.clients, clients), [clients]);
  useEffect(() => save(STORAGE_KEYS.tickets, tickets), [tickets]);
  useEffect(() => save('teamify_plans', plans), [plans]);
  useEffect(() => save(STORAGE_KEYS.activity, activity), [activity]);
  useEffect(() => save(STORAGE_KEYS.masterDrive, masterDrive), [masterDrive]);

  // Once a day, scan every employee for a birthday, work anniversary or
  // marriage anniversary that falls on today and push a notification (with
  // photo) into the owning company's feed exactly once. Guarded by a
  // localStorage set so it survives refreshes without duplicating.
  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const celebrated = load(STORAGE_KEYS.celebrated, {});
    const seenToday = celebrated[todayKey] || [];
    const newlySeen = [];
    const newActivity = [];

    clients.forEach((c) => {
      const tpl = { ...DEFAULT_NOTIFICATION_TEMPLATES, ...(c.notificationTemplates || {}) };
      (c.org?.employees || []).forEach((e) => {
        if (e.status === 'resigned' || e.status === 'inactive') return;
        const checks = [
          { field: e.dob, type: 'birthday', tplKey: 'birthday' },
          { field: e.doj, type: 'workAnniversary', tplKey: 'workAnniversary' },
          { field: e.marriageAnniversary, type: 'marriageAnniversary', tplKey: 'marriageAnniversary' },
        ];
        checks.forEach(({ field, type, tplKey }) => {
          if (!field || !isSameMonthDay(field)) return;
          if (type === 'workAnniversary' && yearsSince(field) < 1) return;
          const markerId = `${e.id}-${type}`;
          if (seenToday.includes(markerId)) return;
          newlySeen.push(markerId);
          const message = renderTemplate(tpl[tplKey], { name: e.name, years: yearsSince(field), company: c.companyName });
          newActivity.push({ id: uid('activity'), scope: c.id, message, photo: e.photo || '', celebrationType: type, employeeId: e.id, createdAt: new Date().toISOString(), read: false });
        });
      });
    });

    if (newlySeen.length) {
      save(STORAGE_KEYS.celebrated, { ...celebrated, [todayKey]: [...seenToday, ...newlySeen] });
      setActivity((prev) => [...newActivity, ...prev].slice(0, 300));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  const logActivity = useCallback((scope, message) => {
    setActivity((prev) => [{ id: uid('activity'), scope, message, createdAt: new Date().toISOString(), read: false }, ...prev].slice(0, 200));
  }, []);

  const addSignupRequest = useCallback((data) => {
    const plan = planForEmployeeCount(Number(data.employeeCount) || 1, plans);
    const record = {
      id: uid('client'),
      companyName: data.companyName,
      legalEntityName: data.legalEntityName || '',
      registrationNumber: data.registrationNumber || '',
      industry: data.industry || '',
      clientName: data.clientName,
      contactInfo: data.contactInfo,
      email: data.email,
      website: data.website || '',
      registeredAddress: data.registeredAddress || '',
      operationalAddress: data.operationalAddress || '',
      contactDesignation: data.contactDesignation || '',
      department: data.department || '',
      reportingAuthority: data.reportingAuthority || '',
      gstNumber: data.gstNumber || '', pan: data.pan || '', cin: data.cin || '',
      billingAddress: data.billingAddress || '', paymentMethodPref: data.paymentMethodPref || 'UPI',
      fiscalYearStart: data.fiscalYearStart || 'April', payrollFrequency: data.payrollFrequency || 'Monthly',
      workingDaysPattern: data.workingDaysPattern || 'Mon–Fri', holidayCalendarNote: data.holidayCalendarNote || '',
      logo: data.logo || '',
      userId: data.userId,
      password: data.password,
      employeeCount: Number(data.employeeCount) || 1,
      planId: plan.id,
      discount: data.discount || emptyDiscount,
      billingCycleMonths: data.billingCycleMonths || 1,
      status: 'pending',
      nextBillingDate: null,
      createdAt: new Date().toISOString(),
      upgradeRequested: false,
      driveConfig: emptyDrive,
      org: { employees: [] },
      paymentProofs: data.paymentProof ? [{ id: uid('proof'), type: 'signup', ...data.paymentProof, amount: data.amountPaid || 0, submittedAt: new Date().toISOString(), approved: false }] : [],
      employeeSeq: 0,
      notificationTemplates: { ...DEFAULT_NOTIFICATION_TEMPLATES },
      companyDocuments: [],
    };
    setClients((prev) => [record, ...prev]);
    logActivity('master', `New signup request from ${record.companyName}.`);
    return record;
  }, [plans, logActivity]);

  const activateClient = useCallback((id, months = 1) => {
    setClients((prev) => prev.map((c) => c.id === id ? {
      ...c,
      status: 'active',
      nextBillingDate: new Date(Date.now() + months * 30 * 86400000).toISOString(),
    } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `Activated account for ${c?.companyName || 'a client'}.`);
    if (c) logActivity(c.id, 'Your Teamify account was activated. Welcome aboard!');
  }, [clients, logActivity]);

  const extendSubscription = useCallback((id, months = 1) => {
    setClients((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const base = c.nextBillingDate && new Date(c.nextBillingDate) > new Date() ? new Date(c.nextBillingDate) : new Date();
      base.setMonth(base.getMonth() + months);
      return { ...c, nextBillingDate: base.toISOString(), status: c.status === 'locked' ? 'active' : c.status };
    }));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `Extended subscription for ${c?.companyName || 'a client'} by ${months} month(s).`);
  }, [clients, logActivity]);

  const setClientStatus = useCallback((id, status) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `${c?.companyName || 'A client'}'s account status changed to ${status}.`);
    if (c) logActivity(c.id, `Your account status was changed to "${status}".`);
  }, [clients, logActivity]);

  // Convenience wrapper for the Client Database "Unlock" button.
  const unlockClient = useCallback((id) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, status: 'active' } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `${c?.companyName || 'A client'}'s account was unlocked.`);
    if (c) logActivity(c.id, 'Your account was unlocked and is active again.');
  }, [clients, logActivity]);

  const removeClient = useCallback((id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const requestUpgrade = useCallback((id) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, upgradeRequested: true } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `${c?.companyName || 'A client'} requested a plan upgrade.`);
  }, [clients, logActivity]);

  const applyUpgrade = useCallback((id, planId) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, planId, upgradeRequested: false } : c));
    logActivity(id, 'Your plan upgrade was approved.');
  }, [logActivity]);

  // Master directly changing a client's plan (no request/approval needed).
  const setClientPlan = useCallback((id, planId) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, planId, upgradeRequested: false } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `Changed ${c?.companyName || "a client"}'s plan.`);
    logActivity(id, 'Your subscription plan was updated by Teamify.');
  }, [clients, logActivity]);

  const updateEmployeeCount = useCallback((id, count) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, employeeCount: count } : c));
  }, []);

  const updatePlans = useCallback((next) => setPlans(next), []);

  // Full profile edit from the Client Database "pencil" button.
  const updateClientDetails = useCallback((id, patch) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
    logActivity('master', `Updated account details for ${patch.companyName || 'a client'}.`);
  }, [logActivity]);

  const setClientDiscount = useCallback((id, discount) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, discount } : c));
  }, []);

  // Changing billing cycle length recalculates the next billing date and
  // logs the pro-rated amount owed for the change (charged manually by the master).
  const changeBillingCycle = useCallback((id, newCycleMonths, proratedAmount) => {
    setClients((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const base = c.nextBillingDate && new Date(c.nextBillingDate) > new Date() ? new Date(c.nextBillingDate) : new Date();
      return { ...c, billingCycleMonths: newCycleMonths, billingCycleChangeRequest: null };
    }));
    const c = clients.find((x) => x.id === id);
    const amountNote = proratedAmount > 0
      ? ` A pro-rated amount of ₹${proratedAmount.toLocaleString('en-IN')} is due for the change.`
      : proratedAmount < 0 ? ` A credit of ₹${Math.abs(proratedAmount).toLocaleString('en-IN')} applies to the next invoice.` : '';
    logActivity('master', `${c?.companyName || 'A client'} moved to a ${newCycleMonths}-month billing cycle.${amountNote}`);
    logActivity(id, `Your billing cycle was changed to every ${newCycleMonths} month(s).${amountNote}`);
  }, [clients, logActivity]);

  // Client-initiated request from their own My Account — master reviews and
  // applies it from Client Database (which runs the same pro-ration).
  const requestBillingCycleChange = useCallback((id, months) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, billingCycleChangeRequest: { months, requestedAt: new Date().toISOString() } } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `${c?.companyName || 'A client'} requested a ${months}-month billing cycle.`);
  }, [clients, logActivity]);

  // ---- Tickets (master <-> client / guest chat threads) ----
  const addTicket = useCallback((data) => {
    const firstMessage = { id: uid('msg'), sender: data.clientId ? 'client' : 'guest', text: data.message, attachment: data.attachment || null, createdAt: new Date().toISOString() };
    const record = {
      id: uid('ticket'),
      clientId: data.clientId || null,
      name: data.name, email: data.email, phone: data.phone,
      status: 'open',
      messages: [firstMessage],
      createdAt: new Date().toISOString(),
      read: false,
    };
    setTickets((prev) => [record, ...prev]);
    logActivity('master', `New message from ${data.name || 'a website visitor'}.`);
    return record;
  }, [logActivity]);

  const addTicketMessage = useCallback((ticketId, sender, text, attachment = null) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? {
      ...t,
      messages: [...t.messages, { id: uid('msg'), sender, text, attachment, createdAt: new Date().toISOString() }],
      read: sender === 'master',
      status: t.status === 'closed' ? 'open' : t.status,
    } : t));
    const t = tickets.find((x) => x.id === ticketId);
    if (sender === 'master' && t?.clientId) logActivity(t.clientId, 'Teamify replied to your support ticket.');
    if (sender !== 'master') logActivity('master', `New reply from ${t?.name || 'a client'} on a support ticket.`);
  }, [tickets, logActivity]);

  const setTicketStatus = useCallback((ticketId, status) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
  }, []);

  const markTicketRead = useCallback((id) => {
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, read: true } : t));
  }, []);

  // ---- Client-side account settings ----
  const updateClientPassword = useCallback((id, newPassword) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, password: newPassword } : c));
  }, []);

  const setClientDrive = useCallback((id, folder) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, driveConfig: { connected: true, folderId: folder.id, folderName: folder.name } } : c));
    logActivity(id, `Google Drive connected — organisation data will be stored in "${folder.name}".`);
  }, [logActivity]);

  const disconnectClientDrive = useCallback((id) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, driveConfig: emptyDrive } : c));
  }, []);

  const addPaymentProof = useCallback((id, proof) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, paymentProofs: [...(c.paymentProofs || []), { id: uid('proof'), type: 'recurring', approved: false, ...proof, submittedAt: new Date().toISOString() }] } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `${c?.companyName || 'A client'} submitted proof of payment.`);
  }, [clients, logActivity]);

  // Master reviews a submitted payment proof: mark it approved and extend
  // the subscription. The client's billing date never moves until this
  // runs, so a submitted screenshot alone never unlocks extra time.
  const approvePaymentProof = useCallback((id, proofId, months = 1) => {
    setClients((prev) => prev.map((c) => c.id !== id ? c : {
      ...c,
      paymentProofs: (c.paymentProofs || []).map((p) => p.id === proofId ? { ...p, approved: true, approvedAt: new Date().toISOString() } : p),
    }));
    extendSubscription(id, months);
    const c = clients.find((x) => x.id === id);
    logActivity(id, `Your payment was verified and your subscription was extended by ${months} month(s).`);
    logActivity('master', `Verified payment and extended ${c?.companyName || 'a client'}'s subscription.`);
  }, [clients, logActivity, extendSubscription]);

  // Master can manually pull the next-billing date forward or back from a
  // calendar picker in Client Database.
  const setNextBillingDate = useCallback((id, isoDate) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, nextBillingDate: isoDate } : c));
    const c = clients.find((x) => x.id === id);
    logActivity('master', `Manually updated the next billing date for ${c?.companyName || 'a client'}.`);
  }, [clients, logActivity]);

  // ---- Company documents (uploaded by the client owner, visible to master) ----
  const addCompanyDocument = useCallback((id, doc) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, companyDocuments: [...(c.companyDocuments || []), { id: uid('doc'), ...doc, uploadedAt: new Date().toISOString() }] } : c));
  }, []);

  const removeCompanyDocument = useCallback((id, docId) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, companyDocuments: (c.companyDocuments || []).filter((d) => d.id !== docId) } : c));
  }, []);

  // ---- Notification templates (birthday / work anniversary / marriage) ----
  const updateNotificationTemplates = useCallback((id, templates) => {
    setClients((prev) => prev.map((c) => c.id === id ? { ...c, notificationTemplates: { ...c.notificationTemplates, ...templates } } : c));
  }, []);

  // ---- Organisation / employees ----
  // Every new hire gets a system-generated login (Employee ID = company
  // prefix + running number, e.g. ORBIT01) and a default password equal to
  // their PAN number. Both are only ever set here at creation time.
  const addEmployee = useCallback((clientId, employee) => {
    const client = clients.find((c) => c.id === clientId);
    const { employeeId, employeeSeq } = nextEmployeeId(client || { companyName: 'EMP', employeeSeq: 0 });
    const record = {
      id: uid('emp'),
      status: 'active',
      permissions: {}, documents: [], documentChecklist: {}, reportsTo: null,
      photo: '', dob: '', gender: '', bloodGroup: '', maritalStatus: '', fatherOrSpouseName: '',
      personalEmail: '', personalPhone: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
      currentAddress: '', permanentAddress: '',
      doj: '', department: '', workLocation: '', employmentType: 'Full-time',
      bankName: '', bankAccountNumber: '', ifscCode: '', pan: '', aadhaar: '', uan: '', esic: '',
      education: '', previousEmployment: '',
      marriageAnniversary: '',
      mustChangePassword: true,
      ...employee,
      employeeId,
      password: employee.password || defaultEmployeePassword(employee.pan || ''),
    };
    setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, employeeSeq, org: { ...c.org, employees: [...(c.org?.employees || []), record] } } : c));
    logActivity(clientId, `Added ${record.name} (${employeeId}) to the organisation chart.`);
    return record;
  }, [logActivity, clients]);

  const updateEmployee = useCallback((clientId, employeeId, patch) => {
    setClients((prev) => prev.map((c) => c.id !== clientId ? c : {
      ...c,
      org: { ...c.org, employees: (c.org?.employees || []).map((e) => e.id === employeeId ? { ...e, ...patch } : e) },
    }));
  }, []);

  const removeEmployee = useCallback((clientId, employeeId) => {
    setClients((prev) => prev.map((c) => c.id !== clientId ? c : {
      ...c,
      org: {
        ...c.org,
        employees: (c.org?.employees || [])
          .filter((e) => e.id !== employeeId)
          .map((e) => e.reportsTo === employeeId ? { ...e, reportsTo: null } : e),
      },
    }));
  }, []);

  // Owner or an HR-permissioned employee resets someone's password back to
  // a fresh value (defaults to their PAN if left blank). Complexity rules
  // only apply when the employee changes their own password afterwards.
  const resetEmployeePassword = useCallback((clientId, employeeId, newPassword) => {
    setClients((prev) => prev.map((c) => c.id !== clientId ? c : {
      ...c,
      org: { ...c.org, employees: (c.org?.employees || []).map((e) => e.id === employeeId ? { ...e, password: newPassword, mustChangePassword: true } : e) },
    }));
    logActivity(clientId, `Password reset for an employee account.`);
  }, [logActivity]);

  // Employee self-service password change — the only place complexity
  // rules (upper/lower/number/special) are enforced.
  const changeOwnEmployeePassword = useCallback((clientId, employeeId, newPassword) => {
    setClients((prev) => prev.map((c) => c.id !== clientId ? c : {
      ...c,
      org: { ...c.org, employees: (c.org?.employees || []).map((e) => e.id === employeeId ? { ...e, password: newPassword, mustChangePassword: false } : e) },
    }));
  }, []);

  // ---- Master drive ----
  const connectMasterDrive = useCallback((folder) => {
    setMasterDrive({ connected: true, folderId: folder.id, folderName: folder.name });
    logActivity('master', `Google Drive connected — your data will be stored in "${folder.name}".`);
  }, [logActivity]);

  const disconnectMasterDrive = useCallback(() => {
    setMasterDrive(emptyDrive);
  }, []);

  // ---- Activity ----
  const markActivityRead = useCallback((scopeMatcher) => {
    setActivity((prev) => prev.map((a) => scopeMatcher(a.scope) ? { ...a, read: true } : a));
  }, []);

  const resetDemoData = useCallback(() => {
    setClients(SEED_CLIENTS);
    setTickets(SEED_TICKETS);
    setPlans(DEFAULT_PLANS);
    setActivity(SEED_ACTIVITY);
  }, []);

  const clearAllData = useCallback(() => {
    setClients([]);
    setTickets([]);
    setActivity([]);
  }, []);

  const value = {
    plans, clients, tickets, activity, masterDrive,
    addSignupRequest, activateClient, extendSubscription, setClientStatus, unlockClient,
    removeClient, requestUpgrade, applyUpgrade, setClientPlan, updateEmployeeCount, updatePlans,
    updateClientDetails, setClientDiscount, changeBillingCycle, requestBillingCycleChange,
    addTicket, addTicketMessage, setTicketStatus, markTicketRead, resetDemoData, clearAllData,
    updateClientPassword, setClientDrive, disconnectClientDrive, addPaymentProof,
    approvePaymentProof, setNextBillingDate, addCompanyDocument, removeCompanyDocument,
    updateNotificationTemplates,
    addEmployee, updateEmployee, removeEmployee, resetEmployeePassword, changeOwnEmployeePassword,
    connectMasterDrive, disconnectMasterDrive,
    logActivity, markActivityRead,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
