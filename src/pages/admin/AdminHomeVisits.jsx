import { useMemo, useState } from 'react';
import {
  MapPin, Clock, IndianRupee, AlertTriangle, Hourglass, PlayCircle, CheckCircle2, Ban, CalendarClock,
} from 'lucide-react';
import { useClinic, filterByClinic } from '../../context/ClinicContext.jsx';
import { useCollection, db } from '../../data/store.js';
import {
  Card, Avatar, StatusBadge, StatTile, Input, Button, Field, Select, Modal,
} from '../../components/ui.jsx';
import './AdminPage.css';
import './AdminHomeVisits.css';

const STEPS = ['Assigned', 'In Progress', 'Completed'];
const STATUS_OPTIONS = ['All', 'Scheduled', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];
const VISIT_STAFF_ROLES = ['Nurse', 'Field Nurse'];
const TODAY = '2026-09-04';

export default function AdminHomeVisits() {
  const { clinics, clinicId } = useClinic();
  const visits = useCollection('HOME_VISITS');
  const patients = useCollection('PATIENTS');
  const staff = useCollection('STAFF');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [assignOpen, setAssignOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [activeVisit, setActiveVisit] = useState(null);

  const scoped = filterByClinic(visits, clinicId);
  const scopedStaff = filterByClinic(staff, clinicId);
  const scopedPatients = filterByClinic(patients, clinicId);

  const clinicById = (id) => clinics.find((c) => c.id === id);
  const patientById = (id) => patients.find((p) => p.id === id);
  const staffById = (id) => staff.find((s) => s.id === id);

  const pending = scoped.filter((v) => v.status === 'Scheduled' || v.status === 'Assigned').length;
  const inProgress = scoped.filter((v) => v.status === 'In Progress').length;
  const completedToday = scoped.filter((v) => v.status === 'Completed' && v.scheduled.startsWith(TODAY)).length;
  const delayed = scoped.filter((v) => v.delayed && v.status !== 'Completed' && v.status !== 'Cancelled').length;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return scoped
      .filter((v) => status === 'All' || v.status === status)
      .filter((v) => {
        if (!q) return true;
        return patientById(v.patientId)?.name.toLowerCase().includes(q)
          || staffById(v.staffId)?.name.toLowerCase().includes(q)
          || v.service.toLowerCase().includes(q)
          || v.address.toLowerCase().includes(q);
      })
      .sort((a, b) => b.scheduled.localeCompare(a.scheduled));
  }, [scoped, search, status, patients, staff]);

  const stepIndex = (v) => (v.status === 'Scheduled' ? -1 : STEPS.indexOf(v.status));

  function advanceStatus(visit, step) {
    if (visit.status === 'Cancelled') return;
    db.update('HOME_VISITS', visit.id, { status: step });
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Home Visits</h1>
          <p className="ap-sub">{scoped.length} visits {clinicId === 'all' ? 'across all clinics' : `at ${clinicById(clinicId)?.name}`}</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={() => setAssignOpen(true)}>+ New Home Visit</Button>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Pending" value={pending} tone="neutral" delta="Scheduled + Assigned" icon={CalendarClock} iconTone="brand" />
        <StatTile label="In Progress" value={inProgress} tone="neutral" icon={PlayCircle} iconTone="warn" />
        <StatTile label="Completed Today" value={completedToday} tone="positive" icon={CheckCircle2} iconTone="success" />
        <StatTile label="Delayed" value={delayed} tone={delayed > 0 ? 'negative' : 'positive'} icon={AlertTriangle} iconTone="danger" />
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search patient, staff, service, or address…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="ap-filter-group">
          {STATUS_OPTIONS.map((s) => (
            <Button key={s} size="sm" variant={status === s ? 'primary' : 'secondary'} onClick={() => setStatus(s)}>
              {s}
            </Button>
          ))}
        </div>
      </div>

      {rows.length === 0 && <Card className="ap-card"><div className="ap-empty">No home visits match your filters.</div></Card>}

      <div className="hv-grid">
        {rows.map((v) => {
          const p = patientById(v.patientId);
          const s = staffById(v.staffId);
          const idx = stepIndex(v);
          const isCancelled = v.status === 'Cancelled';
          const isTerminal = isCancelled || v.status === 'Completed';

          return (
            <Card className="hv-card" key={v.id}>
              <div className="hv-top">
                <div className="ap-person-cell">
                  <Avatar name={p?.name || '?'} size={34} />
                  <div>
                    <div className="ap-cell-primary">{p?.name}</div>
                    <div className="ap-cell-sub">{v.service}</div>
                  </div>
                </div>
                <div className="hv-badges">
                  {v.delayed && !isTerminal && <span className="hv-delayed-tag"><AlertTriangle size={11} strokeWidth={2.3} />Delayed</span>}
                  <StatusBadge status={v.status} />
                </div>
              </div>

              <div className="hv-info">
                <div><span className="hv-label">Assigned to</span> {s?.name} ({s?.role})</div>
                <div className="hv-info__row"><MapPin size={13} strokeWidth={2.2} /><span className="hv-label">Address</span> {v.address}</div>
                <div className="hv-info__row"><Clock size={13} strokeWidth={2.2} /><span className="hv-label">Scheduled</span> {v.scheduled}</div>
                <div><span className="hv-label">Clinic</span> {clinicById(v.clinicId)?.name}</div>
                <div className="hv-info__row"><IndianRupee size={13} strokeWidth={2.2} /><span className="hv-label">Billing</span> ₹{v.fee} &middot; <StatusBadge status={v.billingStatus} /></div>
              </div>

              {isCancelled ? (
                <div className="hv-cancelled-block">
                  <Ban size={14} strokeWidth={2.2} />
                  {v.cancelReason || 'Visit cancelled.'}
                </div>
              ) : (
                <div className="hv-stepper">
                  {STEPS.map((step, i) => (
                    <div key={step} className="hv-step-wrap">
                      <button
                        className={`hv-step ${i <= idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`}
                        onClick={() => advanceStatus(v, step)}
                        disabled={v.status === 'Completed' && i <= idx}
                      >
                        <span className="hv-step__dot" />
                        <span className="hv-step__label">{step}</span>
                      </button>
                      {i < STEPS.length - 1 && <span className={`hv-step__line ${i < idx ? 'is-done' : ''}`} />}
                    </div>
                  ))}
                </div>
              )}

              <div className="hv-card__actions">
                <button className="hv-link" onClick={() => setActiveVisit(v)}>View Details</button>
                {!isTerminal && <button className="hv-link hv-link--danger" onClick={() => setCancelTarget(v)}>Cancel Visit</button>}
              </div>
            </Card>
          );
        })}
      </div>

      <HomeVisitDetailModal visit={activeVisit} onClose={() => setActiveVisit(null)} patientById={patientById} staffById={staffById} clinicById={clinicById} />
      <CancelVisitModal visit={cancelTarget} onClose={() => setCancelTarget(null)} />
      <AssignVisitModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        patients={scopedPatients.length ? scopedPatients : patients}
        staff={(scopedStaff.length ? scopedStaff : staff).filter((s) => VISIT_STAFF_ROLES.includes(s.role))}
        clinics={clinics}
        defaultClinicId={clinicId}
      />
    </div>
  );
}

function HomeVisitDetailModal({ visit, onClose, patientById, staffById, clinicById }) {
  if (!visit) return null;
  const p = patientById(visit.patientId);
  const s = staffById(visit.staffId);

  return (
    <Modal open={!!visit} onClose={onClose} title={p?.name || 'Home Visit'} width={460}>
      <div className="ap-detail-grid">
        <div className="ap-detail-item"><div className="k">Service</div><div className="v">{visit.service}</div></div>
        <div className="ap-detail-item"><div className="k">Status</div><div className="v"><StatusBadge status={visit.status} /></div></div>
        <div className="ap-detail-item"><div className="k">Assigned Staff</div><div className="v">{s?.name} ({s?.role})</div></div>
        <div className="ap-detail-item"><div className="k">Clinic</div><div className="v">{clinicById(visit.clinicId)?.name}</div></div>
        <div className="ap-detail-item"><div className="k">Address</div><div className="v">{visit.address}</div></div>
        <div className="ap-detail-item"><div className="k">Scheduled</div><div className="v">{visit.scheduled}</div></div>
        <div className="ap-detail-item"><div className="k">Fee</div><div className="v">₹{visit.fee}</div></div>
        <div className="ap-detail-item"><div className="k">Billing Status</div><div className="v"><StatusBadge status={visit.billingStatus} /></div></div>
      </div>

      {visit.status === 'Cancelled' ? (
        <>
          <div className="ap-section-label">Cancellation Reason</div>
          <div className="ap-note-block">{visit.cancelReason || 'No reason recorded.'}</div>
        </>
      ) : (
        <>
          <div className="ap-section-label">Visit Report</div>
          <div className="ap-note-block">{visit.notes || 'No report uploaded yet.'}</div>
        </>
      )}

      <div className="ap-modal-actions">
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

function CancelVisitModal({ visit, onClose }) {
  const [reason, setReason] = useState('');

  function handleClose() {
    setReason('');
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    db.update('HOME_VISITS', visit.id, { status: 'Cancelled', cancelReason: reason.trim() || 'Cancelled by admin', delayed: false });
    handleClose();
  }

  return (
    <Modal open={!!visit} onClose={handleClose} title="Cancel Home Visit" width={400}>
      {visit && (
        <form onSubmit={handleSubmit}>
          <p className="hv-modal-hint">Cancelling the {visit.service.toLowerCase()} visit. This cannot be undone.</p>
          <Field label="Reason for cancellation">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Patient unavailable" />
          </Field>
          <div className="ap-modal-actions">
            <Button type="button" variant="secondary" onClick={handleClose}>Keep Visit</Button>
            <Button type="submit" variant="primary">Confirm Cancellation</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function AssignVisitModal({ open, onClose, patients, staff, clinics, defaultClinicId }) {
  const blank = {
    patientId: patients[0]?.id || '',
    staffId: staff[0]?.id || '',
    clinicId: defaultClinicId !== 'all' ? defaultClinicId : clinics[0]?.id || '',
    service: '',
    address: '',
    date: '2026-09-05',
    time: '10:00',
    fee: '',
  };
  const [form, setForm] = useState(blank);

  function handleClose() {
    setForm(blank);
    onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.service.trim() || !form.address.trim() || !form.patientId || !form.staffId) return;
    db.insert('HOME_VISITS', {
      patientId: form.patientId,
      staffId: form.staffId,
      clinicId: form.clinicId,
      service: form.service.trim(),
      address: form.address.trim(),
      scheduled: `${form.date} ${form.time}`,
      status: 'Scheduled',
      fee: Number(form.fee) || 0,
      billingStatus: 'Pending',
      notes: '',
      delayed: false,
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Home Visit" width={460}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Patient">
            <Select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Assign Staff">
            <Select value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })}>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Service">
          <Input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Post-op dressing, Physiotherapy…" required />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. 22 Jayanagar 4th Block" required />
        </Field>
        <div style={{ display: 'flex', gap: 12 }}>
          <Field label="Date">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Time">
            <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </Field>
          <Field label="Fee (₹)">
            <Input type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="e.g. 400" />
          </Field>
        </div>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Assign Visit</Button>
        </div>
      </form>
    </Modal>
  );
}
