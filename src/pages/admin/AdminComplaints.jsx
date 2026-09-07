import { useMemo, useState } from 'react';
import { Flag, AlertTriangle, Clock3, CheckCircle2, Hourglass, Send } from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import {
  Card, Table, StatusBadge, Badge, Modal, Button, Select, Input, StatTile, Avatar,
  usePagination, Pagination,
} from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';
import './AdminClinical.css';

const WORKFLOW = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const STATUS_OPTIONS = ['All', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const PRIORITY_OPTIONS = ['All', 'High', 'Medium', 'Low'];
const SLA_DAYS = { High: 2, Medium: 4, Low: 7 };
const TODAY = '2026-09-04';

function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(`${b}T00:00:00`) - new Date(`${a}T00:00:00`)) / 86400000);
}
function dueDate(complaint) {
  return addDays(complaint.raised, SLA_DAYS[complaint.priority] ?? 5);
}
function isOverdue(complaint) {
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') return false;
  return dueDate(complaint) < TODAY;
}

export default function AdminComplaints() {
  const { clinics, clinicId } = useClinic();
  const complaints = useCollection('COMPLAINTS');
  const patients = useCollection('PATIENTS');
  const staff = useCollection('STAFF');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [active, setActive] = useState(null);

  const scoped = filterByClinic(complaints, clinicId);
  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);
  const staffById = (id) => staff.find((s) => s.id === id);

  const open = scoped.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed');
  const overdue = open.filter(isOverdue);
  const resolvedWithDate = scoped.filter((c) => (c.status === 'Resolved' || c.status === 'Closed') && c.resolvedOn);
  const avgResolutionDays = resolvedWithDate.length
    ? Math.round((resolvedWithDate.reduce((s, c) => s + daysBetween(c.raised, c.resolvedOn), 0) / resolvedWithDate.length) * 10) / 10
    : null;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return [...scoped]
      .filter((c) => status === 'All' || c.status === status)
      .filter((c) => priority === 'All' || c.priority === priority)
      .filter((c) => {
        if (!q) return true;
        return c.category.toLowerCase().includes(q)
          || c.description.toLowerCase().includes(q)
          || patientById(c.patientId)?.name.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.raised) - new Date(a.raised));
  }, [scoped, search, status, priority, patients]);

  const pagination = usePagination(rows);

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Complaints</h1>
          <p className="ap-sub">{open.length} open of {scoped.length} total {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}</p>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Open Complaints" value={open.length} tone="neutral" icon={Flag} iconTone="brand" />
        <StatTile label="Overdue (Past SLA)" value={overdue.length} tone={overdue.length > 0 ? 'negative' : 'positive'} icon={AlertTriangle} iconTone="danger" />
        <StatTile label="Resolved / Closed" value={scoped.length - open.length} tone="positive" icon={CheckCircle2} iconTone="success" />
        <StatTile label="Avg Resolution Time" value={avgResolutionDays != null ? `${avgResolutionDays}d` : '—'} tone="neutral" icon={Hourglass} iconTone="warn" />
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search patient, category, or description…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ap-filter-group">
          {STATUS_OPTIONS.map((s) => (
            <Button key={s} size="sm" variant={status === s ? 'primary' : 'secondary'} onClick={() => setStatus(s)}>{s}</Button>
          ))}
        </div>
      </div>
      <div className="ap-toolbar">
        <div className="ap-filter-group">
          {PRIORITY_OPTIONS.map((p) => (
            <Button key={p} size="sm" variant={priority === p ? 'primary' : 'secondary'} onClick={() => setPriority(p)}>{p} Priority</Button>
          ))}
        </div>
      </div>

      <Card className="ap-card">
        <Table
          empty="No complaints match your filters."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'category', header: 'Category', render: (r) => <span className="ap-cell-primary">{r.category}</span> },
            { key: 'description', header: 'Description', render: (r) => <span className="ap-truncate">{r.description}</span> },
            { key: 'patient', header: 'Patient', render: (r) => patientById(r.patientId)?.name },
            { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
            { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
            { key: 'assigned', header: 'Assigned To', render: (r) => r.assignedTo ? staffById(r.assignedTo)?.name : <span className="ap-dash">Unassigned</span> },
            { key: 'due', header: 'Due', render: (r) => (
              isOverdue(r)
                ? <span className="cl-followup-badge cl-followup-badge--overdue"><AlertTriangle size={12} strokeWidth={2.3} />{formatDate(dueDate(r))}</span>
                : <span>{formatDate(dueDate(r))}</span>
            ) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={pagination.pagedRows}
        />
        <Pagination {...pagination} />
      </Card>

      <ComplaintModal
        complaint={active ? complaints.find((c) => c.id === active.id) : null}
        onClose={() => setActive(null)}
        patientById={patientById}
        clinicById={clinicById}
        staffById={staffById}
        staff={staff}
      />
    </div>
  );
}

function ComplaintModal({ complaint, onClose, patientById, clinicById, staffById, staff }) {
  const [noteText, setNoteText] = useState('');
  const [openId, setOpenId] = useState(null);

  if (complaint && complaint.id !== openId) {
    setOpenId(complaint.id);
    setNoteText('');
  }

  if (!complaint) return null;

  const patient = patientById(complaint.patientId);
  const stepIdx = Math.max(WORKFLOW.indexOf(complaint.status), 0);
  const overdue = isOverdue(complaint);

  function setStatus(status) {
    const patch = { status };
    if ((status === 'Resolved' || status === 'Closed') && !complaint.resolvedOn) patch.resolvedOn = TODAY;
    if (status !== 'Resolved' && status !== 'Closed') patch.resolvedOn = null;
    db.update('COMPLAINTS', complaint.id, patch);
  }

  function setAssignee(staffId) {
    db.update('COMPLAINTS', complaint.id, { assignedTo: staffId || null, status: complaint.status === 'Submitted' ? 'Assigned' : complaint.status });
  }

  function addNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    const note = { id: `n_${Date.now()}`, author: 'admin', text: noteText.trim(), date: TODAY };
    db.update('COMPLAINTS', complaint.id, { notes: [...(complaint.notes || []), note] });
    setNoteText('');
  }

  return (
    <Modal open={!!complaint} onClose={onClose} title={`${complaint.category} Complaint`} width={540}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Patient</div><div className="v">{patient?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(complaint.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Priority</div><div className="v"><Badge tone={complaint.priority === 'High' ? 'danger' : complaint.priority === 'Medium' ? 'warn' : 'neutral'}>{complaint.priority}</Badge></div></div>
        <div className="ap-detail-item"><div className="k">Raised</div><div className="v">{formatDate(complaint.raised)}</div></div>
      </div>

      {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
        <div className={`cl-followup-strip ${overdue ? 'is-overdue' : ''}`}>
          <Clock3 size={15} strokeWidth={2.2} />
          {overdue ? 'Past SLA — due was' : 'Due by'} <b>{formatDate(dueDate(complaint))}</b> ({SLA_DAYS[complaint.priority]}-day SLA for {complaint.priority} priority)
        </div>
      )}

      <div className="ap-note-block">{complaint.description}</div>

      <div className="ap-section-label">Resolution Progress</div>
      <div className="cl-workflow" style={{ marginBottom: 18 }}>
        {WORKFLOW.map((step, i) => (
          <button key={step} className={`cl-workflow__step ${i <= stepIdx ? 'is-done' : ''}`} onClick={() => setStatus(step)}>
            {step}
          </button>
        ))}
      </div>

      <div className="mc-field" style={{ marginBottom: 18 }}>
        <span className="mc-field__label">Assign to staff member</span>
        <Select value={complaint.assignedTo || ''} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {staff.filter((s) => s.clinicId === complaint.clinicId).map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
          ))}
        </Select>
      </div>

      <div className="ap-section-label">Internal Notes</div>
      <div className="ap-list" style={{ marginBottom: 12 }}>
        {(!complaint.notes || complaint.notes.length === 0) && <div className="ap-dash">No notes yet.</div>}
        {(complaint.notes || []).map((n) => (
          <div className="ap-list-item" key={n.id}>
            <div className="ap-list-item__title">{staffById(n.author)?.name || 'Admin'}</div>
            <div className="ap-list-item__meta">{n.text}</div>
            <div className="ap-list-item__meta" style={{ marginTop: 4 }}>{formatDate(n.date)}</div>
          </div>
        ))}
      </div>

      <form onSubmit={addNote} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add an internal note…" style={{ flex: 1 }} />
        <Button type="submit" variant="secondary"><Send size={14} strokeWidth={2.2} /></Button>
      </form>

      <div className="ap-modal-actions">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
          <Button onClick={() => { setStatus('Resolved'); onClose(); }}>Mark Resolved</Button>
        )}
      </div>
    </Modal>
  );
}
