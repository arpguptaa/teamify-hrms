const INDUSTRIES = ['Retail', 'Logistics', 'Manufacturing', 'IT / Software', 'Healthcare', 'Finance', 'Education', 'Hospitality', 'Construction', 'Other'];
const PAYROLL_FREQ = ['Monthly', 'Bi-weekly', 'Weekly'];
const WORKING_PATTERNS = ['Mon–Fri', 'Mon–Sat', 'Custom'];
const FISCAL_STARTS = ['January', 'April', 'July', 'October'];
const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'Cheque', 'Card'];

export default function ClientProfileFields({ values, onChange }) {
  const set = (key) => (e) => onChange(key, e.target.value);

  return (
    <div className="space-y-6">
      <Section title="Company details" subtitle="Verification & legal compliance">
        <Grid>
          <Field label="Company name" value={values.companyName} onChange={set('companyName')} placeholder="Acme Pvt. Ltd." required />
          <Field label="Legal entity name" value={values.legalEntityName} onChange={set('legalEntityName')} placeholder="Acme Private Limited" />
          <Field label="Registration number" value={values.registrationNumber} onChange={set('registrationNumber')} />
          <SelectField label="Industry / business type" value={values.industry} onChange={set('industry')} options={INDUSTRIES} />
          <Field label="Company website" value={values.website} onChange={set('website')} placeholder="https://company.com" />
        </Grid>
      </Section>

      <Section title="Contact person" subtitle="Primary communication point">
        <Grid>
          <Field label="Full name" value={values.clientName} onChange={set('clientName')} placeholder="Full name" required />
          <Field label="Designation" value={values.contactDesignation} onChange={set('contactDesignation')} placeholder="e.g. Founder, HR Head" />
          <Field label="Mobile number" value={values.contactInfo} onChange={set('contactInfo')} placeholder="+91 98765 43210" required />
          <Field label="Email ID" type="email" value={values.email} onChange={set('email')} placeholder="you@company.com" required />
          <Field label="Department" value={values.department} onChange={set('department')} />
          <Field label="Reporting authority" value={values.reportingAuthority} onChange={set('reportingAuthority')} />
        </Grid>
      </Section>

      <Section title="Addresses" subtitle="Jurisdiction & regulatory compliance">
        <Grid>
          <Field label="Registered office address" value={values.registeredAddress} onChange={set('registeredAddress')} />
          <Field label="Operational address" value={values.operationalAddress} onChange={set('operationalAddress')} />
        </Grid>
      </Section>

      <Section title="Financial details" subtitle="Tax, statutory & invoicing">
        <Grid>
          <Field label="GST number" value={values.gstNumber} onChange={set('gstNumber')} />
          <Field label="PAN" value={values.pan} onChange={set('pan')} />
          <Field label="CIN (if applicable)" value={values.cin} onChange={set('cin')} />
          <Field label="Billing address" value={values.billingAddress} onChange={set('billingAddress')} />
          <SelectField label="Payment method preference" value={values.paymentMethodPref} onChange={set('paymentMethodPref')} options={PAYMENT_METHODS} />
        </Grid>
      </Section>

      <Section title="System requirements" subtitle="License planning, payroll & attendance configuration">
        <Grid>
          <Field label="Employee accounts needed" type="number" min="1" value={values.employeeCount} onChange={set('employeeCount')} placeholder="e.g. 45" required />
          <SelectField label="Fiscal year start" value={values.fiscalYearStart} onChange={set('fiscalYearStart')} options={FISCAL_STARTS} />
          <SelectField label="Payroll frequency" value={values.payrollFrequency} onChange={set('payrollFrequency')} options={PAYROLL_FREQ} />
          <SelectField label="Working days pattern" value={values.workingDaysPattern} onChange={set('workingDaysPattern')} options={WORKING_PATTERNS} />
        </Grid>
        <Field label="Holiday calendar notes" value={values.holidayCalendarNote} onChange={set('holidayCalendarNote')} placeholder="Any specific regional holidays to account for" />
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink dark:text-ink-dark">{title}</p>
      <p className="text-xs text-ink-faint mb-3">{subtitle}</p>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

export function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <input {...props} className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-soft dark:text-ink-soft-dark mb-1.5 block">{label}</label>
      <select value={value} onChange={onChange} className="w-full rounded-xl border border-line dark:border-line-dark bg-canvas dark:bg-surface-dark-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-purple/40">
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
