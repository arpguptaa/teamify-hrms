import { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, X, UploadCloud, FileText, Network, Users, RefreshCcw, Camera, ChevronDown, ChevronUp } from 'lucide-react';
import { CLIENT_MODULES, PERMISSION_LEVELS, EMPLOYEE_STATUSES, DOCUMENT_CHECKLIST, statusMeta, defaultEmployeePassword } from '../lib/constants';
import OrgTree from './OrgTree';
import ReportsToSelect from './ReportsToSelect';

const emptyForm = {
  name: '', designation: '', reportsTo: '', email: '', phone: '', status: 'active',
  dob: '', gender: '', bloodGroup: '', maritalStatus: '', fatherOrSpouseName: '', photo: '',
  personalEmail: '', personalPhone: '', emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
  currentAddress: '', permanentAddress: '',
  doj: '', department: '', workLocation: '', employmentType: 'Full-time',
  bankName: '', bankAccountNumber: '', ifscCode: '', pan: '', aadhaar: '', uan: '', esic: '',
  education: '', previousEmployment: '', marriageAnniversary: '',
};

function defaultPermissions() {
  const p = {};
  CLIENT_MODULES.forEach((m) => { p[m.id] = 'none'; });
  return p;
}

export default function EmployeeManager({ client, employees, onAdd, onUpdate, onRemove, onResetPassword }) {
  const [view, setView] = useState('tree');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState({});
  const [permissions, setPermissions] = useState(defaultPermissions());
  const [statusFilter, setStatusFilter] = useState('all');
  const fileRef = useRef(null);
  const photoRef = useRef(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDocuments([]);
    setChecklist({});
    setPermissions(defaultPermissions());
    setFormOpen(true);
  };

  const openEdit = (emp) => {
    setEditingId(emp.id);
    setForm({ ...emptyForm, ...emp, reportsTo: emp.reportsTo || '' });
    setDocuments(emp.documents || []);
    setChecklist(emp.documentChecklist || {});
    setPermissions({ ...defaultPermissions(), ...(emp.permissions || {}) });
    setFormOpen(true);
  };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onFiles = (e) => {
    Array.from(e.target.files || []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setDocuments((prev) => [...prev, { name: file.name, dataUrl: reader.result }]);
      reader.readAsDataURL(file);
    });
  };
  const removeDoc = (name) => setDocuments((prev) => prev.filter((d) => d.name !== name));

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form, reportsTo: form.reportsTo || null, documents, documentChecklist: checklist, permissions };
    if (editingId) onUpdate(editingId, payload);
    else onAdd(payload);
    setFormOpen(false);
  };

  const del = (emp) => {
    if (confirm(`Remove ${emp.name} from the organisation? Anyone reporting to them will move to the top level.`)) {
      onRemove(emp.id);
    }
  };

  const visibleEmployees = statusFilter === 'all' ? employees : employees.filter((e) => e.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink dark:text-ink-dark">Create Your Organisation</h1>
          <p className="text-sm text-ink-soft dark:text-ink-soft-dark mt-1">Build your team, set reporting lines, and control what each person can access.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl border border-line dark:border-line-dark p-1">
            <ViewTab active={view === 'tree'} icon={Network} label="Overview & Genealogy" onClick={() => setView('tree')} />
            <ViewTab active={view === 'list'} icon={Users} label="Employee list" onClick={() => setView('list')} />
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 transition">
            <Plus size={15} /> Add employee
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line dark:border-line-dark bg-surface dark:bg-surface-dark p-5">
        {view === 'tree' ? (
          <OrgTree employees={employees} onSelect={openEdit} />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <FilterChip active={statusFilter === 'all'} label="All" onClick={() => setStatusFilter('all')} />
              {EMPLOYEE_STATUSES.map((s) => (
                <FilterChip key={s.id} active={statusFilter === s.id} label={s.label} dot={s.dot} onClick={() => setStatusFilter(s.id)} />
              ))}
            </div>
            <div className="space-y-2">
              {visibleEmployees.length === 0 && <p className="text-sm text-ink-faint text-center py-16">No employees in this view.</p>}
              {visibleEmployees.map((emp) => {
                const manager = employees.find((e) => e.id === emp.reportsTo);
                const status = statusMeta(emp.status);
                return (
                  <div key={emp.id} className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 bg-surface-soft dark:bg-surface-dark-soft">
                    <button onClick={() => openEdit(emp)} className="flex items-center gap-3 text-left min-w-0 flex-1">
                      <span className="relative h-9 w-9 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
                        {emp.photo ? <img src={emp.photo} alt="" className="h-full w-full object-cover" /> : emp.name?.[0]?.toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <p className="text-sm font-medium text-ink dark:text-ink-dark truncate">{emp.name}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${status.chip}`}>{status.label}</span>
                        </span>
                        <p className="text-xs text-ink-faint truncate">
                          {emp.employeeId} · {emp.designation || 'No designation'} {manager ? `· reports to ${manager.name}` : ''}
                        </p>
                      </span>
                    </button>
                    <button onClick={() => del(emp)} className="text-ink-faint hover:text-brand-coral transition shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <FormModal
          client={client}
          editingId={editingId}
          form={form}
          set={set}
          documents={documents}
          fileRef={fileRef}
          photoRef={photoRef}
          onFiles={onFiles}
          removeDoc={removeDoc}
          onPhoto={onPhoto}
          checklist={checklist}
          setChecklist={setChecklist}
          permissions={permissions}
          setPermissions={setPermissions}
          employees={employees}
          onClose={() => setFormOpen(false)}
          onSubmit={submit}
          onDelete={() => { del({ id: editingId, name: form.name }); setFormOpen(false); }}
          onResetPassword={onResetPassword}
        />
      )}
    </div>
  );
}

function FormModal({
  client: _client, editingId, form, set, documents, fileRef, photoRef, onFiles, removeDoc, onPhoto,
  checklist, setChecklist, permissions, setPermissions, employees, onClose, onSubmit, onDelete, onResetPassword,
}) {
  const [showAccess, setShowAccess] = useState(false);
  const checklistByCategory = useMemo(() => {
    const groups = {};
    DOCUMENT_CHECKLIST.forEach((d) => { (groups[d.category] ||= []).push(d); });
    return groups;
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl bg-surface dark:bg-surface-dark rounded-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line dark:border-line-dark">
          <h2 className="font-semibold text-ink dark:text-ink-dark">{editingId ? 'Edit employee' : 'Add employee'}</h2>
          <button onClick={onClose} className="text-ink-faint hover:text-ink dark:hover:text-ink-dark"><X size={20} /></button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-7 max-h-[75vh] overflow-y-auto">

          {editingId && (
            <div className="rounded-xl bg-brand-purple/5 border border-brand-purple/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[11px] text-ink-faint">Employee ID (login)</p>
                  <p className="text-sm font-mono font-semibold text-ink dark:text-ink-dark">{form.employeeId}</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-faint">Status</p>
                  <select value={form.status} onChange={(e) => set('status', e.target.value)} className="text-xs font-medium rounded-lg border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-2 py-1 outline-none">
                    {EMPLOYEE_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { if (confirm("Reset this employee's password to their PAN number?")) onResetPassword(editingId, defaultEmployeePassword(form.pan || '')); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium rounded-lg border border-line dark:border-line-dark px-3 py-1.5 text-ink-soft dark:text-ink-soft-dark hover:bg-surface dark:hover:bg-surface-dark transition"
              >
                <RefreshCcw size={12} /> Reset password to PAN
              </button>
            </div>
          )}

          {/* Photo + Personal details */}
          <Section title="Personal details">
            <div className="flex items-center gap-4 mb-4">
              <button type="button" onClick={() => photoRef.current?.click()} className="relative h-16 w-16 rounded-full overflow-hidden brand-gradient flex items-center justify-center text-white font-semibold shrink-0">
                {form.photo ? <img src={form.photo} alt="" className="h-full w-full object-cover" /> : (form.name?.[0]?.toUpperCase() || <Camera size={18} />)}
                <span className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center transition"><Camera size={16} className="text-white" /></span>
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
              <p className="text-xs text-ink-faint">Passport-size photo — used across the profile, org chart and celebration notifications.</p>
            </div>
            <Grid>
              <Field label="Full name" value={form.name} onChange={(v) => set('name', v)} required />
              <Field label="Date of birth" type="date" value={form.dob} onChange={(v) => set('dob', v)} />
              <SelectField label="Gender" value={form.gender} onChange={(v) => set('gender', v)} options={['Male', 'Female', 'Other']} />
              <SelectField label="Blood group" value={form.bloodGroup} onChange={(v) => set('bloodGroup', v)} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
              <SelectField label="Marital status" value={form.maritalStatus} onChange={(v) => set('maritalStatus', v)} options={['Single', 'Married']} />
              <Field label="Father's / Spouse's name" value={form.fatherOrSpouseName} onChange={(v) => set('fatherOrSpouseName', v)} />
              {form.maritalStatus === 'Married' && (
                <Field label="Marriage anniversary" type="date" value={form.marriageAnniversary} onChange={(v) => set('marriageAnniversary', v)} />
              )}
            </Grid>
          </Section>

          <Section title="Contact & address">
            <Grid>
              <Field label="Work email" type="email" value={form.email} onChange={(v) => set('email', v)} />
              <Field label="Work phone" value={form.phone} onChange={(v) => set('phone', v)} />
              <Field label="Personal email" type="email" value={form.personalEmail} onChange={(v) => set('personalEmail', v)} />
              <Field label="Personal mobile" value={form.personalPhone} onChange={(v) => set('personalPhone', v)} />
              <Field label="Emergency contact name" value={form.emergencyContactName} onChange={(v) => set('emergencyContactName', v)} />
              <Field label="Emergency contact relation" value={form.emergencyContactRelation} onChange={(v) => set('emergencyContactRelation', v)} />
              <Field label="Emergency contact phone" value={form.emergencyContactPhone} onChange={(v) => set('emergencyContactPhone', v)} />
            </Grid>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <TextArea label="Current address" value={form.currentAddress} onChange={(v) => set('currentAddress', v)} />
              <TextArea label="Permanent address" value={form.permanentAddress} onChange={(v) => set('permanentAddress', v)} />
            </div>
          </Section>

          <Section title="Employment & job details">
            <Grid>
              <Field label="Designation" value={form.designation} onChange={(v) => set('designation', v)} placeholder="e.g. HR Manager" />
              <Field label="Department / business unit" value={form.department} onChange={(v) => set('department', v)} />
              <Field label="Date of joining" type="date" value={form.doj} onChange={(v) => set('doj', v)} />
              <Field label="Work location" value={form.workLocation} onChange={(v) => set('workLocation', v)} placeholder="Office branch or Remote" />
              <SelectField label="Employment type" value={form.employmentType} onChange={(v) => set('employmentType', v)} options={['Full-time', 'Part-time', 'Intern', 'Contract']} />
              {!editingId && (
                <SelectField label="Status" value={form.status} onChange={(v) => set('status', v)} options={EMPLOYEE_STATUSES.map((s) => s.label)} />
              )}
            </Grid>
            <div className="mt-4">
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Reports to</label>
              <ReportsToSelect employees={employees} value={form.reportsTo} onChange={(v) => set('reportsTo', v)} excludeId={editingId} />
            </div>
          </Section>

          <Section title="Bank & statutory details" subtitle="For salary credit & compliance">
            <Grid>
              <Field label="Bank name" value={form.bankName} onChange={(v) => set('bankName', v)} />
              <Field label="Bank account number" value={form.bankAccountNumber} onChange={(v) => set('bankAccountNumber', v)} />
              <Field label="IFSC code" value={form.ifscCode} onChange={(v) => set('ifscCode', v)} />
              <Field label="PAN number" value={form.pan} onChange={(v) => set('pan', v.toUpperCase())} placeholder="Used as the default login password" required />
              <Field label="Aadhaar number" value={form.aadhaar} onChange={(v) => set('aadhaar', v)} />
              <Field label="PF / UAN number" value={form.uan} onChange={(v) => set('uan', v)} />
              <Field label="ESIC number" value={form.esic} onChange={(v) => set('esic', v)} />
            </Grid>
          </Section>

          <Section title="Qualification & past experience">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextArea label="Education (degree, institute, year)" value={form.education} onChange={(v) => set('education', v)} />
              <TextArea label="Previous employment (company, tenure, designation)" value={form.previousEmployment} onChange={(v) => set('previousEmployment', v)} />
            </div>
          </Section>

          <Section title="Document checklist" subtitle="Tick what HR has collected & attach the scanned copies">
            <div className="space-y-4">
              {Object.entries(checklistByCategory).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-ink-soft dark:text-ink-soft-dark mb-1.5">{category}</p>
                  <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {items.map((doc) => (
                      <label key={doc.id} className="flex items-center gap-2 text-sm text-ink dark:text-ink-dark cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checklist[doc.id]}
                          onChange={(e) => setChecklist((prev) => ({ ...prev, [doc.id]: e.target.checked }))}
                          className="h-4 w-4 rounded accent-[var(--color-brand-purple)]"
                        />
                        {doc.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">Attach scanned copies</label>
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-line dark:border-line-dark px-4 py-2.5 text-sm text-ink-soft dark:text-ink-soft-dark hover:border-brand-purple/50 hover:text-brand-purple transition">
                  <UploadCloud size={15} /> Upload document
                </button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={onFiles} />
                {documents.map((d) => (
                  <span key={d.name} className="inline-flex items-center gap-1.5 text-xs bg-surface-soft dark:bg-surface-dark-soft rounded-full px-3 py-1.5">
                    <FileText size={12} /> {d.name}
                    <button type="button" onClick={() => removeDoc(d.name)} className="text-ink-faint hover:text-brand-coral"><X size={12} /></button>
                  </span>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Module access">
            <button type="button" onClick={() => setShowAccess((v) => !v)} className="text-xs font-medium text-brand-purple dark:text-brand-coral inline-flex items-center gap-1 mb-2">
              {showAccess ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {showAccess ? 'Hide module access' : 'Set module access'}
            </button>
            {showAccess && (
              <div className="rounded-xl border border-line dark:border-line-dark divide-y divide-line dark:divide-line-dark max-h-64 overflow-y-auto">
                {CLIENT_MODULES.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="text-sm text-ink dark:text-ink-dark">{m.label}</span>
                    <div className="flex gap-1">
                      {PERMISSION_LEVELS.map((lvl) => (
                        <button
                          type="button"
                          key={lvl.id}
                          onClick={() => setPermissions({ ...permissions, [m.id]: lvl.id })}
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 transition ${
                            permissions[m.id] === lvl.id ? 'brand-gradient text-white' : 'bg-surface-soft dark:bg-surface-dark-soft text-ink-soft dark:text-ink-soft-dark'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <div className="flex items-center justify-between pt-2 sticky bottom-0 bg-surface dark:bg-surface-dark pb-1">
            {editingId ? (
              <button type="button" onClick={onDelete} className="text-sm text-brand-coral hover:underline">
                Remove employee
              </button>
            ) : <span />}
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl brand-gradient text-white text-sm font-medium px-5 py-2.5 hover:opacity-90 transition">
              {editingId ? 'Save changes' : 'Add employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewTab({ active, icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-2 transition ${active ? 'bg-brand-purple/10 text-brand-purple dark:text-brand-coral' : 'text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft'}`}>
      <Icon size={14} /> {label}
    </button>
  );
}

function FilterChip({ active, label, dot, onClick }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition ${active ? 'border-brand-purple/40 bg-brand-purple/10 text-brand-purple dark:text-brand-coral' : 'border-line dark:border-line-dark text-ink-soft dark:text-ink-soft-dark hover:bg-surface-soft dark:hover:bg-surface-dark-soft'}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />} {label}
    </button>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink dark:text-ink-dark">{title}</p>
      {subtitle && <p className="text-xs text-ink-faint mb-2">{subtitle}</p>}
      {!subtitle && <div className="mb-2" />}
      {children}
    </div>
  );
}
function Grid({ children }) { return <div className="grid sm:grid-cols-2 gap-4">{children}</div>; }

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        type={props.type || 'text'}
        placeholder={props.placeholder}
        required={props.required}
        className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40 resize-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
