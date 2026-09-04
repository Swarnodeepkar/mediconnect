import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { LEAVE_BALANCE } from '../../data/seed.js';
import { Modal, Button, Field, Select, Textarea, StatusBadge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './StaffLeave.css';

export default function StaffLeave() {
  const { user } = useAuth();
  const leaveRequests = useCollection('LEAVE_REQUESTS');
  const [applyOpen, setApplyOpen] = useState(false);

  const balance = LEAVE_BALANCE[user.staffId] || { casual: 0, sick: 0, earned: 0 };
  const mine = leaveRequests.filter((l) => l.staffId === user.staffId).sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn));

  return (
    <div className="sl">
      <div className="sl-balance-grid">
        <div className="sl-balance"><div className="sl-balance__v">{balance.casual}</div><div className="sl-balance__l">Casual</div></div>
        <div className="sl-balance"><div className="sl-balance__v">{balance.sick}</div><div className="sl-balance__l">Sick</div></div>
        <div className="sl-balance"><div className="sl-balance__v">{balance.earned}</div><div className="sl-balance__l">Earned</div></div>
      </div>

      <button className="pa-book-cta" onClick={() => setApplyOpen(true)}>+ Apply for Leave</button>

      <div className="sl-list">
        {mine.length === 0 && <div className="pr-empty">No leave requests yet.</div>}
        {mine.map((l) => (
          <div className="sl-card" key={l.id}>
            <div className="sl-card__top">
              <span className="sl-card__type">{l.type}</span>
              <StatusBadge status={l.status} />
            </div>
            <div className="sl-card__dates">
              {formatDate(l.from)}{l.from !== l.to ? ` – ${formatDate(l.to)}` : ''} &middot; {l.days} day{l.days > 1 ? 's' : ''}
            </div>
            <div className="sl-card__reason">{l.reason}</div>
          </div>
        ))}
      </div>

      <ApplyLeaveModal open={applyOpen} onClose={() => setApplyOpen(false)} staffId={user.staffId} />
    </div>
  );
}

function ApplyLeaveModal({ open, onClose, staffId }) {
  const [type, setType] = useState('Casual Leave');
  const [from, setFrom] = useState('2026-09-10');
  const [to, setTo] = useState('2026-09-10');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function days(a, b) {
    const d = (new Date(b) - new Date(a)) / 86400000 + 1;
    return Math.max(1, d);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    db.insert('LEAVE_REQUESTS', {
      staffId, type, from, to, days: days(from, to), status: 'Pending', reason, appliedOn: '2026-09-04',
    });
    setSubmitted(true);
  }

  function handleClose() {
    setSubmitted(false); setReason(''); onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={submitted ? 'Request Sent' : 'Apply for Leave'} width={400}>
      {submitted ? (
        <div className="pa-confirm">
          <div className="pa-confirm__icon">✅</div>
          <h4>Leave Request Submitted</h4>
          <p>Your manager will review this shortly. You'll be notified once it's approved.</p>
          <Button onClick={handleClose} className="pa-confirm__btn">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Leave Type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Earned Leave</option>
            </Select>
          </Field>
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="From">
              <input type="date" className="mc-input" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="To">
              <input type="date" className="mc-input" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </div>
          <Field label="Reason">
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain the reason…" required />
          </Field>
          <div className="ap-modal-actions">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Submit Request</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
