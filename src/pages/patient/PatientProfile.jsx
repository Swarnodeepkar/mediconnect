import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Flag, Building2, Lock, HelpCircle, ChevronRight, Power, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Avatar, Modal, Button, Field, Select, Textarea, Badge } from '../../components/ui.jsx';
import './PatientProfile.css';

const MENU = [
  { icon: Bell, label: 'Notifications' },
  { icon: Flag, label: 'Raise a Complaint' },
  { icon: Building2, label: 'My Clinic & Family' },
  { icon: Lock, label: 'Privacy & Security' },
  { icon: HelpCircle, label: 'Help & Support' },
];

export default function PatientProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const patients = useCollection('PATIENTS');
  const notifications = useCollection('NOTIFICATIONS');
  const clinics = useCollection('CLINICS');

  const [openSheet, setOpenSheet] = useState(null);

  const patient = patients.find((p) => p.id === user.patientId);
  const myNotifications = notifications.filter((n) => n.patientId === user.patientId);
  const homeClinic = clinics.find((c) => c.id === user.clinicId);

  return (
    <div className="pf">
      <div className="pf-card">
        <Avatar name={user.name} size={64} />
        <div className="pf-card__name">{user.name}</div>
        <div className="pf-card__meta">{patient?.age}y &middot; {patient?.gender} &middot; {patient?.bloodGroup}</div>
        <div className="pf-card__meta">{patient?.phone}</div>
        <Badge tone="neutral">{homeClinic?.name}</Badge>
      </div>

      <div className="pf-menu">
        {MENU.map((m) => (
          <button key={m.label} className="pf-menu__item" onClick={() => setOpenSheet(m.label)}>
            <span className="pf-menu__icon"><m.icon size={17} strokeWidth={2} /></span>
            <span className="pf-menu__label">{m.label}</span>
            {m.label === 'Notifications' && myNotifications.some((n) => !n.read) && <span className="pf-menu__badge" />}
            <ChevronRight size={17} strokeWidth={2.2} className="pf-menu__arrow" />
          </button>
        ))}
      </div>

      <button className="pf-logout" onClick={() => { logout(); navigate('/login'); }}>
        <Power size={14} strokeWidth={2.2} /> Switch Role / Logout
      </button>

      <NotificationsSheet open={openSheet === 'Notifications'} onClose={() => setOpenSheet(null)} notifications={myNotifications} patientId={user.patientId} />
      <ComplaintSheet open={openSheet === 'Raise a Complaint'} onClose={() => setOpenSheet(null)} patientId={user.patientId} clinicId={user.clinicId} />
      <SimpleSheet open={openSheet === 'My Clinic & Family'} onClose={() => setOpenSheet(null)} title="My Clinic & Family" body="Manage linked family member profiles and your preferred home clinic here." />
      <SimpleSheet open={openSheet === 'Privacy & Security'} onClose={() => setOpenSheet(null)} title="Privacy & Security" body="Control data sharing consent, manage device sessions, and review your activity log here." />
      <SimpleSheet open={openSheet === 'Help & Support'} onClose={() => setOpenSheet(null)} title="Help & Support" body="Reach the clinic support desk, browse FAQs, or start a live chat with our care team." />
    </div>
  );
}

function NotificationsSheet({ open, onClose, notifications, patientId }) {
  return (
    <Modal open={open} onClose={onClose} title="Notifications" width={420}>
      <div className="pf-notif-full">
        {notifications.length === 0 && <div className="pr-empty">No notifications.</div>}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`ph-notif ${!n.read ? 'is-unread' : ''}`}
            onClick={() => db.update('NOTIFICATIONS', n.id, { read: true })}
          >
            <div className="ph-notif__title">{n.title}</div>
            <div className="ph-notif__body">{n.body}</div>
            <div className="ph-notif__time">{n.time}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ComplaintSheet({ open, onClose, patientId, clinicId }) {
  const [category, setCategory] = useState('Wait Time');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    db.insert('COMPLAINTS', {
      patientId, clinicId, category, priority, description,
      status: 'Submitted', assignedTo: null, raised: '2026-09-04',
    });
    setSubmitted(true);
  }

  function handleClose() {
    setSubmitted(false);
    setDescription('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Raise a Complaint" width={420}>
      {submitted ? (
        <div className="pa-confirm">
          <div className="pa-confirm__icon"><CheckCircle2 size={40} strokeWidth={1.8} /></div>
          <h4>Complaint Submitted</h4>
          <p>Our team will review this and get back to you. You can track its status from the admin&apos;s complaint log.</p>
          <Button onClick={handleClose} className="pa-confirm__btn">Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Wait Time</option>
              <option>Billing</option>
              <option>Staff Behaviour</option>
              <option>Appointment</option>
              <option>Reports</option>
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </Select>
          </Field>
          <Field label="Describe the issue">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us what happened…" required />
          </Field>
          <div className="ap-modal-actions">
            <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button type="submit">Submit Complaint</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function SimpleSheet({ open, onClose, title, body }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>{body}</p>
    </Modal>
  );
}
