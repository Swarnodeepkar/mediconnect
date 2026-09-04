import { useMemo, useState } from 'react';
import { Banknote, CheckCircle2, Clock3, Users, Download } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import {
  Card, Table, StatusBadge, StatTile, Select, Button, Modal, Avatar,
} from '../../components/ui.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { downloadCsv } from '../../lib/exportCsv.js';
import './AdminPage.css';
import './AdminPayroll.css';

export default function AdminPayroll() {
  const { clinics, clinicId } = useClinic();
  const staff = useCollection('STAFF');
  const payslips = useCollection('PAYSLIPS');

  const months = useMemo(() => [...new Set(payslips.map((p) => p.month))], [payslips]);
  const [month, setMonth] = useState(months[0] || 'September 2026');
  const [active, setActive] = useState(null);

  const scopedStaff = filterByClinic(staff, clinicId);
  const scopedIds = new Set(scopedStaff.map((s) => s.id));

  const monthSlips = payslips.filter((p) => p.month === month && scopedIds.has(p.staffId));
  const staffById = (id) => staff.find((s) => s.id === id);

  const totalPayroll = monthSlips.reduce((s, p) => s + p.netPay, 0);
  const paidCount = monthSlips.filter((p) => p.status === 'Paid').length;
  const pendingCount = monthSlips.filter((p) => p.status !== 'Paid').length;
  const avgSalary = monthSlips.length ? Math.round(totalPayroll / monthSlips.length) : 0;

  const byRole = useMemo(() => {
    const map = {};
    for (const slip of monthSlips) {
      const s = staffById(slip.staffId);
      if (!s) continue;
      map[s.role] = map[s.role] || { role: s.role, count: 0, total: 0 };
      map[s.role].count += 1;
      map[s.role].total += slip.netPay;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [monthSlips, staff]);

  const rows = [...monthSlips].sort((a, b) => (staffById(a.staffId)?.name || '').localeCompare(staffById(b.staffId)?.name || ''));

  function handleExport() {
    downloadCsv(
      `mediconnect-payroll-${month.replace(/\s/g, '-').toLowerCase()}.csv`,
      [
        { header: 'Employee', value: (r) => staffById(r.staffId)?.name || '' },
        { header: 'Role', value: (r) => staffById(r.staffId)?.role || '' },
        { header: 'Basic', value: (r) => r.basic },
        { header: 'Overtime', value: (r) => r.overtime },
        { header: 'Incentives', value: (r) => r.incentives },
        { header: 'Deductions', value: (r) => r.deductions },
        { header: 'Net Pay', value: (r) => r.netPay },
        { header: 'Status', value: (r) => r.status },
        { header: 'Paid On', value: (r) => r.paidOn || '' },
      ],
      rows,
    );
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Payroll</h1>
          <p className="ap-sub">Monthly salary processing, payslips, and disbursement records.</p>
        </div>
        <div className="ap-head__actions">
          <Select value={month} onChange={(e) => setMonth(e.target.value)} style={{ minWidth: 160 }}>
            {months.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Button variant="secondary" onClick={handleExport} disabled={rows.length === 0}>
            <Download size={15} strokeWidth={2.2} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Total Payroll" value={formatCurrency(totalPayroll)} delta={`${monthSlips.length} employees`} tone="neutral" icon={Banknote} iconTone="brand" />
        <StatTile label="Disbursed" value={paidCount} delta={`of ${monthSlips.length} processed`} tone="positive" icon={CheckCircle2} iconTone="success" />
        <StatTile label="Pending" value={pendingCount} tone={pendingCount > 0 ? 'negative' : 'positive'} icon={Clock3} iconTone="warn" />
        <StatTile label="Average Salary" value={formatCurrency(avgSalary)} tone="neutral" icon={Users} iconTone="purple" />
      </div>

      <Card className="ay-summary-card">
        <div className="ov-card-head"><h3>Department Summary</h3></div>
        <div className="ay-role-grid">
          {byRole.map((r) => (
            <div className="ay-role-row" key={r.role}>
              <span className="ay-role-row__name">{r.role}</span>
              <span className="ay-role-row__count">{r.count} employee{r.count > 1 ? 's' : ''}</span>
              <span className="ay-role-row__total">{formatCurrency(r.total)}</span>
            </div>
          ))}
          {byRole.length === 0 && <div className="ov-empty">No payroll data for this month.</div>}
        </div>
      </Card>

      <Card className="ap-card" style={{ marginTop: 18 }}>
        <Table
          empty="No payslips found for this month."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'employee', header: 'Employee', render: (r) => {
              const s = staffById(r.staffId);
              return (
                <div className="ap-person-cell">
                  <Avatar name={s?.name || '?'} size={30} />
                  <div>
                    <div className="ap-cell-primary">{s?.name}</div>
                    <div className="ap-cell-sub">{s?.role}</div>
                  </div>
                </div>
              );
            } },
            { key: 'basic', header: 'Basic', render: (r) => formatCurrency(r.basic) },
            { key: 'overtime', header: 'Overtime', render: (r) => formatCurrency(r.overtime) },
            { key: 'incentives', header: 'Incentives', render: (r) => formatCurrency(r.incentives) },
            { key: 'deductions', header: 'Deductions', render: (r) => `-${formatCurrency(r.deductions)}` },
            { key: 'net', header: 'Net Pay', render: (r) => <span className="ap-cell-primary">{formatCurrency(r.netPay)}</span> },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
        />
      </Card>

      <PayslipModal payslip={active} onClose={() => setActive(null)} staffById={staffById} />
    </div>
  );
}

function PayslipModal({ payslip, onClose, staffById }) {
  if (!payslip) return null;
  const employee = staffById(payslip.staffId);

  function markPaid() {
    db.update('PAYSLIPS', payslip.id, { status: 'Paid', paidOn: '2026-09-04' });
    onClose();
  }

  return (
    <Modal open={!!payslip} onClose={onClose} title="Payslip" width={420}>
      <div className="ay-modal-head">
        <Avatar name={employee?.name || '?'} size={44} />
        <div>
          <div className="ay-modal-head__name">{employee?.name}</div>
          <div className="ay-modal-head__role">{employee?.role} &middot; {payslip.month}</div>
        </div>
        <StatusBadge status={payslip.status} />
      </div>

      <div className="ay-breakdown">
        <div className="ay-breakdown__row"><span>Basic Salary</span><span>{formatCurrency(payslip.basic)}</span></div>
        <div className="ay-breakdown__row"><span>Overtime</span><span>+{formatCurrency(payslip.overtime)}</span></div>
        <div className="ay-breakdown__row"><span>Incentives</span><span>+{formatCurrency(payslip.incentives)}</span></div>
        <div className="ay-breakdown__row"><span>Deductions</span><span>-{formatCurrency(payslip.deductions)}</span></div>
        <div className="ay-breakdown__row ay-breakdown__row--total"><span>Net Pay</span><span>{formatCurrency(payslip.netPay)}</span></div>
      </div>

      {payslip.paidOn && <p className="ay-paid-note">Disbursed on {formatDate(payslip.paidOn)}</p>}

      <div className="ap-modal-actions">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {payslip.status !== 'Paid' && <Button onClick={markPaid}>Mark as Disbursed</Button>}
      </div>
    </Modal>
  );
}
