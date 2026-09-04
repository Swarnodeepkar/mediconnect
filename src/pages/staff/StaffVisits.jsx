import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { StatusBadge, Avatar } from '../../components/ui.jsx';
import './StaffVisits.css';

const NEXT_STATUS = { Assigned: 'In Progress', 'In Progress': 'Completed' };
const NEXT_LABEL = { Assigned: 'Start Visit →', 'In Progress': 'Mark Completed ✓' };

export default function StaffVisits() {
  const { user } = useAuth();
  const visits = useCollection('HOME_VISITS');
  const patients = useCollection('PATIENTS');

  const mine = visits.filter((v) => v.staffId === user.staffId).sort((a, b) => a.scheduled.localeCompare(b.scheduled));
  const patientById = (id) => patients.find((p) => p.id === id);

  return (
    <div className="sv">
      {mine.length === 0 && <div className="pr-empty">No home visits assigned.</div>}
      {mine.map((v) => {
        const p = patientById(v.patientId);
        const next = NEXT_STATUS[v.status];
        return (
          <div className="sv-card" key={v.id}>
            <div className="sv-card__top">
              <Avatar name={p?.name || '?'} size={38} />
              <div className="sv-card__body">
                <div className="sv-card__name">{p?.name}</div>
                <div className="sv-card__service">{v.service}</div>
              </div>
              <StatusBadge status={v.status} />
            </div>
            <div className="sv-card__info">
              <div>📍 {v.address}</div>
              <div>🕒 {v.scheduled}</div>
            </div>
            {next && (
              <button className="st-advance-btn" onClick={() => db.update('HOME_VISITS', v.id, { status: next })}>
                {NEXT_LABEL[v.status]}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
