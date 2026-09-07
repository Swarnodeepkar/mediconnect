import { useMemo, useState } from 'react';
import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';
import { ROLE_PERMISSIONS } from '../../data/seed.js';
import { useCollection, db } from '../../data/store.js';
import { useClinic } from '../../context/ClinicContext.jsx';
import {
  Card, Table, StatusBadge, StatTile, Input, Select, Button, Modal, Avatar, Badge,
} from '../../components/ui.jsx';
import './AdminPage.css';
import './AdminUsers.css';

const ROLE_OPTIONS = ['All', ...ROLE_PERMISSIONS.map((r) => r.role)];

export default function AdminUsers() {
  const { clinics } = useClinic();
  const users = useCollection('PLATFORM_USERS');

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('All');
  const [active, setActive] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const clinicById = (id) => clinics.find((c) => c.id === id);

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const inactiveCount = users.filter((u) => u.status === 'Inactive').length;

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter((u) => role === 'All' || u.role === role)
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search, role]);

  function toggleStatus(user) {
    db.update('PLATFORM_USERS', user.id, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
    setActive(null);
  }

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Users &amp; Roles</h1>
          <p className="ap-sub">Manage platform users, roles, and branch-level permissions.</p>
        </div>
        <div className="ap-head__actions">
          <Button onClick={() => setInviteOpen(true)}>+ Add User</Button>
        </div>
      </div>

      <div className="ap-stats-row">
        <StatTile label="Total Users" value={users.length} tone="neutral" icon={Users} iconTone="brand" />
        <StatTile label="Active" value={activeCount} tone="positive" icon={UserCheck} iconTone="success" />
        <StatTile label="Inactive" value={inactiveCount} tone={inactiveCount > 0 ? 'negative' : 'positive'} icon={UserX} iconTone="danger" />
        <StatTile label="Roles Defined" value={ROLE_PERMISSIONS.length} tone="neutral" icon={ShieldCheck} iconTone="purple" />
      </div>

      <Card className="au-roles-card">
        <div className="ov-card-head"><h3>Roles &amp; Access</h3></div>
        <div className="au-role-grid">
          {ROLE_PERMISSIONS.map((r) => {
            const count = users.filter((u) => u.role === r.role).length;
            return (
              <div className="au-role-tile" key={r.role}>
                <div className="au-role-tile__top">
                  <span className="au-role-tile__name">{r.role}</span>
                  <Badge tone="neutral">{count} user{count !== 1 ? 's' : ''}</Badge>
                </div>
                <p className="au-role-tile__access">{r.access}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="ap-toolbar" style={{ marginTop: 18 }}>
        <Input className="ap-search" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={role} onChange={(e) => setRole(e.target.value)} style={{ maxWidth: 200 }}>
          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
        </Select>
      </div>

      <Card className="ap-card">
        <Table
          empty="No users match your search."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'name', header: 'User', render: (r) => (
              <div className="ap-person-cell">
                <Avatar name={r.name} size={30} />
                <div>
                  <div className="ap-cell-primary">{r.name}</div>
                  <div className="ap-cell-sub">{r.email}</div>
                </div>
              </div>
            ) },
            { key: 'role', header: 'Role', render: (r) => <Badge tone="neutral">{r.role}</Badge> },
            { key: 'clinic', header: 'Branch Access', render: (r) => r.clinicId ? clinicById(r.clinicId)?.code : 'All Clinics' },
            { key: 'lastActive', header: 'Last Active', render: (r) => r.lastActive },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
        />
      </Card>

      <Modal open={!!active} onClose={() => setActive(null)} title="User Detail" width={400}>
        {active && (
          <>
            <div className="au-detail-head">
              <Avatar name={active.name} size={48} />
              <div>
                <div className="au-detail-head__name">{active.name}</div>
                <div className="au-detail-head__email">{active.email}</div>
              </div>
            </div>
            <div className="ap-detail-grid">
              <div className="ap-detail-item"><div className="k">Role</div><div className="v">{active.role}</div></div>
              <div className="ap-detail-item"><div className="k">Branch Access</div><div className="v">{active.clinicId ? clinicById(active.clinicId)?.name : 'All Clinics'}</div></div>
              <div className="ap-detail-item"><div className="k">Status</div><div className="v"><StatusBadge status={active.status} /></div></div>
              <div className="ap-detail-item"><div className="k">Last Active</div><div className="v">{active.lastActive}</div></div>
            </div>
            <div className="ap-modal-actions">
              <Button variant="secondary" onClick={() => setActive(null)}>Close</Button>
              <Button variant={active.status === 'Active' ? 'danger' : 'primary'} onClick={() => toggleStatus(active)}>
                {active.status === 'Active' ? 'Deactivate User' : 'Activate User'}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} clinics={clinics} />
    </div>
  );
}

function InviteUserModal({ open, onClose, clinics }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLE_PERMISSIONS[1]?.role || 'Doctor');
  const [clinicId, setClinicId] = useState(clinics[0]?.id || '');

  function handleClose() {
    setName(''); setEmail(''); onClose();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    db.insert('PLATFORM_USERS', {
      name, email, role, clinicId: clinicId || null, status: 'Active', lastActive: 'Just now',
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add User" width={420}>
      <form onSubmit={handleSubmit}>
        <div className="mc-field">
          <span className="mc-field__label">Full Name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dr. Neha Kapoor" required />
        </div>
        <div className="mc-field">
          <span className="mc-field__label">Email</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mediconnect.in" required />
        </div>
        <div className="mc-field">
          <span className="mc-field__label">Role</span>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_PERMISSIONS.map((r) => <option key={r.role} value={r.role}>{r.role}</option>)}
          </Select>
        </div>
        <div className="mc-field">
          <span className="mc-field__label">Branch Access</span>
          <Select value={clinicId} onChange={(e) => setClinicId(e.target.value)}>
            <option value="">All Clinics</option>
            {clinics.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="ap-modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add User</Button>
        </div>
      </form>
    </Modal>
  );
}
