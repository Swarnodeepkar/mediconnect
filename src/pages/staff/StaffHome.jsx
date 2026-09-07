import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { Badge } from '../../components/ui.jsx';
import './StaffHome.css';

export default function StaffHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const attendance = useCollection('ATTENDANCE_TODAY');
  const tasks = useCollection('TASKS');
  const visits = useCollection('HOME_VISITS');
  const clinics = useCollection('CLINICS');

  const [locating, setLocating] = useState(false);

  const myAttendance = attendance.find((a) => a.staffId === user.staffId);
  const myClinic = clinics.find((c) => c.id === user.clinicId);
  const myTasks = tasks.filter((t) => t.staffId === user.staffId);
  const pendingTasks = myTasks.filter((t) => t.status !== 'Completed');
  const myVisits = visits.filter((v) => v.staffId === user.staffId && v.status !== 'Completed');

  const checkedIn = !!myAttendance?.checkIn && !myAttendance?.checkOut;

  function handleCheckToggle() {
    setLocating(true);
    setTimeout(() => {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (!myAttendance?.checkIn) {
        updateAttendanceByStaff(user.staffId, { checkIn: time, status: 'Present' });
      } else {
        updateAttendanceByStaff(user.staffId, { checkOut: time });
      }
      setLocating(false);
    }, 900);
  }

  function updateAttendanceByStaff(staffId, patch) {
    const all = db.get('ATTENDANCE_TODAY');
    const updated = all.map((a) => (a.staffId === staffId ? { ...a, ...patch } : a));
    db.setCollection('ATTENDANCE_TODAY', updated);
  }

  return (
    <div className="sh">
      <div className={`sh-attend-card ${checkedIn ? 'is-checked-in' : ''}`}>
        <div className="sh-attend-card__status">
          <span className={`sh-attend-dot ${checkedIn ? 'is-on' : ''}`} />
          {checkedIn ? 'Checked in' : myAttendance?.checkOut ? 'Shift completed' : 'Not checked in'}
        </div>
        <div className="sh-attend-card__clinic"><MapPin size={13} strokeWidth={2} /> {myClinic?.name}</div>

        {myAttendance?.checkIn && (
          <div className="sh-attend-times">
            <div><span className="k">Check-in</span><span className="v">{myAttendance.checkIn}</span></div>
            {myAttendance.checkOut && <div><span className="k">Check-out</span><span className="v">{myAttendance.checkOut}</span></div>}
          </div>
        )}

        {!myAttendance?.checkOut && (
          <button className="sh-check-btn" onClick={handleCheckToggle} disabled={locating}>
            {locating ? 'Verifying location…' : (
              <><MapPin size={15} strokeWidth={2.2} /> {checkedIn ? 'Check Out' : 'Check In (GPS)'}</>
            )}
          </button>
        )}
      </div>

      <div className="sh-stats-row">
        <div className="sh-stat" onClick={() => navigate('/staff/tasks')}>
          <div className="sh-stat__v">{pendingTasks.length}</div>
          <div className="sh-stat__l">Pending Tasks</div>
        </div>
        <div className="sh-stat" onClick={() => navigate('/staff/visits')}>
          <div className="sh-stat__v">{myVisits.length}</div>
          <div className="sh-stat__l">Home Visits</div>
        </div>
      </div>

      <div className="sh-section-head">
        <h3>Today's Tasks</h3>
        <button onClick={() => navigate('/staff/tasks')}>View all</button>
      </div>
      <div className="sh-task-list">
        {pendingTasks.length === 0 && <div className="pr-empty">No pending tasks. Nice work!</div>}
        {pendingTasks.slice(0, 3).map((t) => (
          <div className="sh-task" key={t.id}>
            <span className={`sh-task__priority sh-task__priority--${t.priority.toLowerCase()}`} />
            <span className="sh-task__title">{t.title}</span>
            <Badge tone={t.status === 'In Progress' ? 'info' : 'neutral'}>{t.status}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
