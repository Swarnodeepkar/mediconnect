import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hourglass, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Avatar, StatusBadge, Button, StatTile } from '../../components/ui.jsx';
import { formatTime12 } from '../../lib/format.js';
import ConsultationModal from './ConsultationModal.jsx';
import './DoctorQueue.css';

const today = '2026-09-04';

export default function DoctorQueue() {
  const { user } = useAuth();
  const appointments = useCollection('APPOINTMENTS');
  const patients = useCollection('PATIENTS');
  const [activeAppt, setActiveAppt] = useState(null);

  const mine = appointments
    .filter((a) => a.doctorId === user.doctorId && a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const patientById = (id) => patients.find((p) => p.id === id);

  const waiting = mine.filter((a) => a.status === 'Waiting' || a.status === 'Scheduled').length;
  const inProgress = mine.filter((a) => a.status === 'In Progress').length;
  const done = mine.filter((a) => a.status === 'Completed').length;

  function startConsult(appt) {
    if (appt.status === 'Scheduled' || appt.status === 'Waiting') {
      db.update('APPOINTMENTS', appt.id, { status: 'In Progress' });
    }
    setActiveAppt({ ...appt, status: 'In Progress' });
  }

  return (
    <div className="dq">
      <div className="ap-head">
        <div>
          <h1>Today's Queue</h1>
          <p className="ap-sub">{mine.length} appointments scheduled today</p>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Waiting" value={waiting} icon={Hourglass} iconTone="warn" />
        <StatTile label="In Consultation" value={inProgress} icon={Stethoscope} iconTone="brand" tone="neutral" />
        <StatTile label="Completed" value={done} icon={CheckCircle2} iconTone="success" tone="positive" />
      </div>

      <div className="dq-list">
        {mine.length === 0 && <div className="pr-empty">No appointments scheduled for today.</div>}
        {mine.map((a) => {
          const p = patientById(a.patientId);
          return (
            <div className="dq-card" key={a.id}>
              <div className="dq-card__time">{formatTime12(a.time)}</div>
              <Avatar name={p?.name || '?'} size={40} />
              <div className="dq-card__body">
                <div className="dq-card__name">{p?.name}</div>
                <div className="dq-card__meta">{p?.age}y &middot; {p?.gender} &middot; {a.service}</div>
              </div>
              <StatusBadge status={a.status} />
              {a.status !== 'Completed' && (
                <Button size="sm" onClick={() => startConsult(a)}>
                  {a.status === 'In Progress' ? 'Continue' : 'Start Consult'}
                </Button>
              )}
              {a.status === 'Completed' && (
                <Button size="sm" variant="secondary" onClick={() => setActiveAppt(a)}>View</Button>
              )}
            </div>
          );
        })}
      </div>

      <ConsultationModal appt={activeAppt} onClose={() => setActiveAppt(null)} />
    </div>
  );
}
