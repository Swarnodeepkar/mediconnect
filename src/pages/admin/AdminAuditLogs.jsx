import { useMemo, useState } from 'react';
import { ScrollText, ShieldAlert, Activity, Users, Download } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Table, Badge, StatTile, Input, Select, Button } from '../../components/ui.jsx';
import { downloadCsv } from '../../lib/exportCsv.js';
import './AdminPage.css';
import './AdminAuditLogs.css';

const CATEGORY_TONE = {
  Billing: 'success', Clinical: 'brand', Attendance: 'neutral', Complaints: 'warn',
  Payroll: 'purple', Settings: 'neutral', Security: 'danger', Reports: 'brand',
  Appointments: 'success', 'Users & Roles': 'purple',
};

export default function AdminAuditLogs() {
  const { clinics, clinicId } = useClinic();
  const logs = useCollection('AUDIT_LOGS');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const categories = ['All', ...new Set(logs.map((l) => l.category))];

  const scoped = filterByClinic(logs, clinicId);

  const securityEvents = logs.filter((l) => l.category === 'Security').length;
  const todayEvents = logs.filter((l) => l.timestamp.startsWith('2026-09-04')).length;
  const uniqueActors = new Set(logs.map((l) => l.actor)).size;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return scoped
      .filter((l) => category === 'All' || l.category === category)
      .filter((l) => !q || l.actor.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.target.toLowerCase().includes(q))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [scoped, search, category]);

  function handleExport() {
    downloadCsv(
      'mediconnect-audit-logs.csv',
      [
        { header: 'Timestamp', value: (r) => r.timestamp },
        { header: 'Actor', value: (r) => r.actor },
        { header: 'Action', value: (r) => r.action },
        { header: 'Target', value: (r) => r.target },
        { header: 'Clinic', value: (r) => r.clinicId ? clinicById(r.clinicId)?.name || '' : 'All Clinics' },
        { header: 'Category', value: (r) => r.category },
      ],
      rows,
    );
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Audit Logs</h1>
          <p className="ap-sub">A full trail of sensitive actions across the platform.</p>
        </div>
        <div className="ap-head__actions">
          <Button variant="secondary" onClick={handleExport} disabled={rows.length === 0}>
            <Download size={15} strokeWidth={2.2} /> Export CSV
          </Button>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Events Today" value={todayEvents} tone="neutral" icon={Activity} iconTone="brand" />
        <StatTile label="Security Events" value={securityEvents} tone={securityEvents > 0 ? 'negative' : 'positive'} icon={ShieldAlert} iconTone="danger" />
        <StatTile label="Active Actors" value={uniqueActors} tone="neutral" icon={Users} iconTone="success" />
        <StatTile label="Total Logged Events" value={logs.length} tone="neutral" icon={ScrollText} iconTone="purple" />
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search actor, action, or target…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} style={{ maxWidth: 200 }}>
          {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
        </Select>
      </div>

      <Card className="ap-card">
        <Table
          empty="No audit events match your filters."
          columns={[
            { key: 'timestamp', header: 'Timestamp', render: (r) => <span className="al-time">{r.timestamp}</span> },
            { key: 'actor', header: 'Actor', render: (r) => <span className="ap-cell-primary">{r.actor}</span> },
            { key: 'action', header: 'Action' },
            { key: 'target', header: 'Target', render: (r) => <span style={{ maxWidth: 260, display: 'inline-block' }}>{r.target}</span> },
            { key: 'clinic', header: 'Clinic', render: (r) => r.clinicId ? clinicById(r.clinicId)?.code : 'All' },
            { key: 'category', header: 'Category', render: (r) => <Badge tone={CATEGORY_TONE[r.category] || 'neutral'}>{r.category}</Badge> },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}
