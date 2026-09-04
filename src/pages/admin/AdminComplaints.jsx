import { useState } from 'react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Card, Table, StatusBadge, Badge, Modal, Button, Select, Avatar } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './AdminPage.css';

const WORKFLOW = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];

export default function AdminComplaints() {
  const { clinics, clinicId } = useClinic();
  const complaints = useCollection('COMPLAINTS');
  const patients = useCollection('PATIENTS');
  const staff = useCollection('STAFF');

  const [active, setActive] = useState(null);

  const scoped = filterByClinic(complaints, clinicId);
  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);
  const staffById = (id) => staff.find((s) => s.id === id);

  const sorted = [...scoped].sort((a, b) => new Date(b.raised) - new Date(a.raised));

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Complaints</h1>
          <p className="ap-sub">{scoped.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length} open of {scoped.length} total</p>
        </div>
      </div>

      <Card className="ap-card">
        <Table
          empty="No complaints logged."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'category', header: 'Category', render: (r) => <span className="ap-cell-primary">{r.category}</span> },
            { key: 'description', header: 'Description', render: (r) => <span style={{ maxWidth: 260, display: 'inline-block' }}>{r.description}</span> },
            { key: 'patient', header: 'Patient', render: (r) => patientById(r.patientId)?.name },
            { key: 'clinic', header: 'Clinic', render: (r) => clinicById(r.clinicId)?.code },
            { key: 'priority', header: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
            { key: 'assigned', header: 'Assigned To', render: (r) => r.assignedTo ? staffById(r.assignedTo)?.name : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span> },
            { key: 'raised', header: 'Raised', render: (r) => formatDate(r.raised) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={sorted}
        />
      </Card>

      <ComplaintModal complaint={active} onClose={() => setActive(null)} patientById={patientById} clinicById={clinicById} staff={staff} />
    </div>
  );
}

function ComplaintModal({ complaint, onClose, patientById, clinicById, staff }) {
  if (!complaint) return null;
  const patient = patientById(complaint.patientId);
  const stepIdx = WORKFLOW.indexOf(complaint.status) === -1 ? 0 : WORKFLOW.indexOf(complaint.status);

  function setStatus(status) {
    db.update('COMPLAINTS', complaint.id, { status });
  }

  function setAssignee(staffId) {
    db.update('COMPLAINTS', complaint.id, { assignedTo: staffId || null, status: complaint.status === 'Submitted' ? 'Assigned' : complaint.status });
  }

  return (
    <Modal open={!!complaint} onClose={onClose} title={`${complaint.category} Complaint`} width={520}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Patient</div><div className="v">{patient?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(complaint.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Priority</div><div className="v"><Badge tone={complaint.priority === 'High' ? 'danger' : complaint.priority === 'Medium' ? 'warn' : 'neutral'}>{complaint.priority}</Badge></div></div>
        <div className="ap-detail-item"><div className="k">Raised</div><div className="v">{formatDate(complaint.raised)}</div></div>
      </div>

      <div style={{ background: 'var(--surface-sunk)', borderRadius: 10, padding: '12px 14px', marginBottom: 18, fontSize: 13.5, lineHeight: 1.5 }}>
        {complaint.description}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>RESOLUTION PROGRESS</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {WORKFLOW.map((step, i) => (
            <button
              key={step}
              onClick={() => setStatus(step)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 8,
                border: '1.5px solid ' + (i <= stepIdx ? 'var(--brand-500)' : 'var(--border)'),
                background: i <= stepIdx ? 'var(--brand-50)' : 'var(--surface)',
                color: i <= stepIdx ? 'var(--brand-700)' : 'var(--text-muted)',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {step}
            </button>
          ))}
        </div>
      </div>

      <div className="mc-field">
        <span className="mc-field__label">Assign to staff member</span>
        <Select value={complaint.assignedTo || ''} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Unassigned</option>
          {staff.filter((s) => s.clinicId === complaint.clinicId).map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.role}</option>
          ))}
        </Select>
      </div>

      <div className="ap-modal-actions">
        <Button variant="secondary" onClick={onClose}>Close</Button>
        {complaint.status !== 'Resolved' && (
          <Button onClick={() => { setStatus('Resolved'); onClose(); }}>Mark Resolved</Button>
        )}
      </div>
    </Modal>
  );
}
