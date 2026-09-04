import { useState } from 'react';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useCollection, db } from '../../data/store.js';
import { Card, Button, SegmentedControl, Badge } from '../../components/ui.jsx';
import './AdminPage.css';
import './AdminNotifications.css';

export default function AdminNotifications() {
  const notifications = useCollection('ADMIN_NOTIFICATIONS');
  const [tab, setTab] = useState('all');

  const unread = notifications.filter((n) => !n.read);
  const list = tab === 'unread' ? unread : notifications;

  function markRead(id) {
    db.update('ADMIN_NOTIFICATIONS', id, { read: true });
  }

  function markAllRead() {
    for (const n of unread) db.update('ADMIN_NOTIFICATIONS', n.id, { read: true });
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Notifications</h1>
          <p className="ap-sub">System and clinic-wide notification history.</p>
        </div>
        <div className="ap-head__actions">
          <Button variant="secondary" onClick={markAllRead} disabled={unread.length === 0}>
            <CheckCheck size={15} strokeWidth={2.2} /> Mark all as read
          </Button>
        </div>
      </div>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[{ value: 'all', label: `All (${notifications.length})` }, { value: 'unread', label: `Unread (${unread.length})` }]}
      />

      <div className="an-list">
        {list.length === 0 && (
          <Card className="an-empty">
            <BellOff size={26} strokeWidth={1.8} />
            <p>{tab === 'unread' ? "You're all caught up." : 'No notifications yet.'}</p>
          </Card>
        )}
        {list.map((n) => (
          <Card key={n.id} className={`an-item ${!n.read ? 'is-unread' : ''}`} onClick={() => !n.read && markRead(n.id)}>
            <span className="an-item__icon"><Bell size={16} strokeWidth={2} /></span>
            <div className="an-item__body">
              <div className="an-item__top">
                <span className="an-item__title">{n.title}</span>
                <Badge tone="neutral">{n.category}</Badge>
              </div>
              <p className="an-item__desc">{n.body}</p>
              <span className="an-item__time">{n.time}</span>
            </div>
            {!n.read && <span className="an-item__dot" />}
          </Card>
        ))}
      </div>
    </div>
  );
}
