import { useState } from 'react';
import { Building2, ShieldCheck, Bell, Save } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext.jsx';
import { Card, Button, Field, Input, Select, Textarea } from '../../components/ui.jsx';
import './AdminPage.css';
import './AdminSettings.css';

export default function AdminSettings() {
  const { clinics } = useClinic();
  const [saved, setSaved] = useState(false);

  const [org, setOrg] = useState({
    name: 'MediConnect Health System',
    email: 'admin@mediconnect.in',
    phone: '080-4567 8901',
    address: 'HQ — 12, Health Care Circle, Bengaluru 560001',
    timezone: 'IST (GMT+5:30)',
    currency: 'INR (₹)',
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    passwordExpiry: 90,
    sessionTimeout: 30,
    auditRetention: 180,
    restrictExports: true,
    ipLogging: true,
  });

  const [notify, setNotify] = useState({
    lowStaffAttendance: true,
    overdueComplaints: true,
    outstandingPayments: true,
    payrollReminders: true,
    weeklyDigest: false,
  });

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Settings</h1>
          <p className="ap-sub">Organization profile, security, and platform configuration.</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={handleSave}><Save size={15} strokeWidth={2.2} /> {saved ? 'Saved!' : 'Save Changes'}</Button>
        </div>
      </div>

      <div className="as-grid">
        <Card className="as-card">
          <div className="as-card__head"><Building2 size={17} strokeWidth={2} /><h3>Organization Profile</h3></div>
          <Field label="Organization Name">
            <Input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
          </Field>
          <Field label="Contact Email">
            <Input type="email" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} />
          </Field>
          <Field label="Contact Phone">
            <Input value={org.phone} onChange={(e) => setOrg({ ...org, phone: e.target.value })} />
          </Field>
          <Field label="Head Office Address">
            <Textarea value={org.address} onChange={(e) => setOrg({ ...org, address: e.target.value })} />
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="Timezone">
              <Select value={org.timezone} onChange={(e) => setOrg({ ...org, timezone: e.target.value })}>
                <option>IST (GMT+5:30)</option>
                <option>UTC (GMT+0:00)</option>
                <option>PST (GMT-8:00)</option>
              </Select>
            </Field>
            <Field label="Currency">
              <Select value={org.currency} onChange={(e) => setOrg({ ...org, currency: e.target.value })}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </Select>
            </Field>
          </div>
          <div className="as-card__label" style={{ marginTop: 4 }}>Registered Clinics</div>
          <div className="as-clinic-list">
            {clinics.map((c) => (
              <div className="as-clinic-row" key={c.id}>
                <span className="as-clinic-row__dot" style={{ background: c.color }} />
                <span className="as-clinic-row__name">{c.name}</span>
                <span className="as-clinic-row__code">{c.code}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="as-side-col">
          <Card className="as-card">
            <div className="as-card__head"><ShieldCheck size={17} strokeWidth={2} /><h3>Security Settings</h3></div>
            <ToggleRow
              label="Two-Factor Authentication"
              hint="Require a second verification step for admin and doctor logins"
              checked={security.twoFactor}
              onChange={(v) => setSecurity({ ...security, twoFactor: v })}
            />
            <ToggleRow
              label="Restrict Data Exports"
              hint="Only Super Admins can export patient or financial reports"
              checked={security.restrictExports}
              onChange={(v) => setSecurity({ ...security, restrictExports: v })}
            />
            <ToggleRow
              label="IP Address Logging"
              hint="Log IP addresses for every login and sensitive action"
              checked={security.ipLogging}
              onChange={(v) => setSecurity({ ...security, ipLogging: v })}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Field label="Password Expiry (days)">
                <Input type="number" value={security.passwordExpiry} onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })} />
              </Field>
              <Field label="Session Timeout (min)">
                <Input type="number" value={security.sessionTimeout} onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })} />
              </Field>
            </div>
            <Field label="Audit Log Retention (days)">
              <Input type="number" value={security.auditRetention} onChange={(e) => setSecurity({ ...security, auditRetention: e.target.value })} />
            </Field>
          </Card>

          <Card className="as-card">
            <div className="as-card__head"><Bell size={17} strokeWidth={2} /><h3>Notification Preferences</h3></div>
            <ToggleRow label="Low Staff Attendance Alerts" checked={notify.lowStaffAttendance} onChange={(v) => setNotify({ ...notify, lowStaffAttendance: v })} />
            <ToggleRow label="Overdue Complaint Alerts" checked={notify.overdueComplaints} onChange={(v) => setNotify({ ...notify, overdueComplaints: v })} />
            <ToggleRow label="Outstanding Payment Reminders" checked={notify.outstandingPayments} onChange={(v) => setNotify({ ...notify, outstandingPayments: v })} />
            <ToggleRow label="Payroll Processing Reminders" checked={notify.payrollReminders} onChange={(v) => setNotify({ ...notify, payrollReminders: v })} />
            <ToggleRow label="Weekly Performance Digest" checked={notify.weeklyDigest} onChange={(v) => setNotify({ ...notify, weeklyDigest: v })} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <div className="as-toggle-row">
      <div className="as-toggle-row__text">
        <span className="as-toggle-row__label">{label}</span>
        {hint && <span className="as-toggle-row__hint">{hint}</span>}
      </div>
      <button
        type="button"
        className={`as-switch ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
      >
        <span className="as-switch__knob" />
      </button>
    </div>
  );
}
