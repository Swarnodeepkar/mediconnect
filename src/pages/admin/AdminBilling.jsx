import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Wallet, IndianRupee, Smartphone, AlertCircle, Undo2, Download } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import {
  Card, Table, StatusBadge, StatTile, Input, Select, Button, Modal, Avatar,
} from '../../components/ui.jsx';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { downloadCsv } from '../../lib/exportCsv.js';
import './AdminPage.css';
import './AdminBilling.css';

const STATUS_FILTERS = ['All', 'Paid', 'Due', 'Refunded'];
const CATEGORIES = ['All', 'Consultation', 'Laboratory', 'Pharmacy', 'Package'];

export default function AdminBilling() {
  const { clinics, clinicId } = useClinic();
  const payments = useCollection('PAYMENTS');
  const patients = useCollection('PATIENTS');
  const revenueTrend = useCollection('REVENUE_TREND');

  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const scoped = filterByClinic(payments, clinicId);
  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);

  const today = '2026-09-04';
  const todaysPayments = scoped.filter((p) => p.date === today);
  const collectedToday = todaysPayments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const onlineToday = todaysPayments.filter((p) => p.status === 'Paid' && (p.method === 'UPI' || p.method === 'Card')).reduce((s, p) => s + p.amount, 0);
  const cashToday = todaysPayments.filter((p) => p.status === 'Paid' && p.method === 'Cash').reduce((s, p) => s + p.amount, 0);
  const outstanding = scoped.filter((p) => p.status === 'Due').reduce((s, p) => s + p.amount, 0);
  const refunded = scoped.filter((p) => p.status === 'Refunded').reduce((s, p) => s + p.amount, 0);

  const rows = useMemo(() => {
    return scoped
      .filter((p) => status === 'All' || p.status === status)
      .filter((p) => category === 'All' || p.category === category)
      .filter((p) => {
        if (!search.trim()) return true;
        const patient = patientById(p.patientId);
        const q = search.toLowerCase();
        return patient?.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.date + b.id).localeCompare(a.date + a.id));
  }, [scoped, status, category, search, patients]);

  const revenueByClinicData = useMemo(() => {
    return revenueTrend.map((d) => {
      const row = { day: d.day };
      const ids = clinicId === 'all' ? clinics.map((c) => c.id) : [clinicId];
      for (const id of ids) row[id] = d[id];
      return row;
    });
  }, [revenueTrend, clinicId, clinics]);

  const clinicColorFor = (id) => clinics.find((c) => c.id === id)?.color || 'var(--brand-500)';

  function handleExport() {
    downloadCsv(
      'mediconnect-billing-transactions.csv',
      [
        { header: 'Patient', value: (r) => patientById(r.patientId)?.name || '' },
        { header: 'Description', value: (r) => r.description },
        { header: 'Category', value: (r) => r.category },
        { header: 'Clinic', value: (r) => clinicById(r.clinicId)?.name || '' },
        { header: 'Date', value: (r) => r.date },
        { header: 'Method', value: (r) => r.method || '' },
        { header: 'Amount (INR)', value: (r) => r.amount },
        { header: 'Status', value: (r) => r.status },
      ],
      rows,
    );
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Billing &amp; Finance</h1>
          <p className="ap-sub">Consolidated billing, collections, and outstanding payments {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}.</p>
        </div>
        <div className="ap-head__actions">
          <Button variant="secondary" onClick={handleExport} disabled={rows.length === 0}>
            <Download size={15} strokeWidth={2.2} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Collected Today" value={formatCurrency(collectedToday)} delta="↑ 15% vs yesterday" tone="positive" icon={Wallet} iconTone="success" />
        <StatTile label="Online Payments" value={formatCurrency(onlineToday)} delta={`${todaysPayments.filter(p => p.status === 'Paid' && p.method !== 'Cash').length} transactions`} tone="neutral" icon={Smartphone} iconTone="brand" />
        <StatTile label="Cash Collections" value={formatCurrency(cashToday)} tone="neutral" icon={IndianRupee} iconTone="warn" />
        <StatTile label="Outstanding Amount" value={formatCurrency(outstanding)} delta={`${scoped.filter(p => p.status === 'Due').length} pending bills`} tone={outstanding > 0 ? 'negative' : 'positive'} icon={AlertCircle} iconTone="danger" />
        <StatTile label="Refunds Issued" value={formatCurrency(refunded)} tone="neutral" icon={Undo2} iconTone="purple" />
      </div>

      <Card className="ab-chart-card">
        <div className="ov-card-head">
          <h3>Revenue Trend — This Week</h3>
          <span className="ov-card-sub">{clinicId === 'all' ? 'All clinics' : clinicById(clinicId)?.name}</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueByClinicData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {clinics.map((c) => (
                <linearGradient id={`bill-grad-${c.id}`} key={c.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12.5, fill: 'var(--ink-500)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--ink-500)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} width={48} />
            <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, boxShadow: 'var(--shadow-md)' }} />
            {(clinicId === 'all' ? clinics.map((c) => c.id) : [clinicId]).map((id) => (
              <Area key={id} type="monotone" dataKey={id} name={id} stroke={clinicColorFor(id)} fill={`url(#bill-grad-${id})`} strokeWidth={2.5} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="ap-toolbar" style={{ marginTop: 18 }}>
        <Input className="ap-search" placeholder="Search patient or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ap-filter-group">
          {STATUS_FILTERS.map((s) => (
            <Button key={s} size="sm" variant={status === s ? 'primary' : 'secondary'} onClick={() => setStatus(s)}>{s}</Button>
          ))}
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 180 }}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </Select>
      </div>

      <Card className="ap-card">
        <Table
          empty="No transactions match your filters."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'patient', header: 'Patient', render: (r) => {
              const p = patientById(r.patientId);
              return (
                <div className="ap-person-cell">
                  <Avatar name={p?.name || '?'} size={30} />
                  <span className="ap-cell-primary">{p?.name}</span>
                </div>
              );
            } },
            { key: 'description', header: 'Description', render: (r) => <span style={{ maxWidth: 260, display: 'inline-block' }}>{r.description}</span> },
            { key: 'category', header: 'Category' },
            { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
            { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
            { key: 'method', header: 'Method', render: (r) => r.method || '—' },
            { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
        />
      </Card>

      <PaymentDetailModal payment={active} onClose={() => setActive(null)} patientById={patientById} clinicById={clinicById} />
    </div>
  );
}

function PaymentDetailModal({ payment, onClose, patientById, clinicById }) {
  if (!payment) return null;
  const patient = patientById(payment.patientId);

  function markPaid() {
    db.update('PAYMENTS', payment.id, { status: 'Paid', method: payment.method || 'UPI', date: '2026-09-04' });
    onClose();
  }

  function issueRefund() {
    db.update('PAYMENTS', payment.id, { status: 'Refunded' });
    onClose();
  }

  return (
    <Modal open={!!payment} onClose={onClose} title="Transaction Detail" width={440}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Patient</div><div className="v">{patient?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(payment.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Category</div><div className="v">{payment.category}</div></div>
        <div className="ap-detail-item"><div className="k">Date</div><div className="v">{formatDate(payment.date)}</div></div>
        <div className="ap-detail-item"><div className="k">Method</div><div className="v">{payment.method || 'Not paid yet'}</div></div>
        <div className="ap-detail-item"><div className="k">Amount</div><div className="v">{formatCurrency(payment.amount)}</div></div>
      </div>
      <div style={{ background: 'var(--surface-sunk)', borderRadius: 10, padding: '12px 14px', marginBottom: 4, fontSize: 13.5, lineHeight: 1.5 }}>
        {payment.description}
      </div>
      <div className="ap-modal-actions">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {payment.status === 'Due' && <Button onClick={markPaid}>Mark as Paid</Button>}
        {payment.status === 'Paid' && <Button variant="danger" onClick={issueRefund}>Issue Refund</Button>}
      </div>
    </Modal>
  );
}
