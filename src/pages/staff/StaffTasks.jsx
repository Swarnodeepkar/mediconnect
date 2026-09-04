import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection, db } from '../../data/store.js';
import { SegmentedControl, Badge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import './StaffTasks.css';

export default function StaffTasks() {
  const { user } = useAuth();
  const tasks = useCollection('TASKS');
  const [tab, setTab] = useState('pending');

  const mine = tasks.filter((t) => t.staffId === user.staffId);
  const pending = mine.filter((t) => t.status !== 'Completed');
  const done = mine.filter((t) => t.status === 'Completed');
  const list = tab === 'pending' ? pending : done;

  function advanceStatus(task) {
    const next = task.status === 'Pending' ? 'In Progress' : 'Completed';
    db.update('TASKS', task.id, { status: next });
  }

  return (
    <div className="st">
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[{ value: 'pending', label: `Pending (${pending.length})` }, { value: 'done', label: 'Completed' }]}
      />

      <div className="st-list">
        {list.length === 0 && <div className="pr-empty">Nothing here.</div>}
        {list.map((t) => (
          <div className="st-card" key={t.id}>
            <div className="st-card__top">
              <span className={`sh-task__priority sh-task__priority--${t.priority.toLowerCase()}`} />
              <span className="st-card__title">{t.title}</span>
            </div>
            <div className="st-card__meta">
              <span>Due {formatDate(t.dueDate)}</span>
              <Badge tone={t.status === 'Completed' ? 'success' : t.status === 'In Progress' ? 'info' : 'neutral'}>{t.status}</Badge>
            </div>
            {t.status !== 'Completed' && (
              <button className="st-advance-btn" onClick={() => advanceStatus(t)}>
                {t.status === 'Pending' ? 'Start Task →' : 'Mark Complete ✓'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
