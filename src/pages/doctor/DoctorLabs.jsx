import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Table, Avatar, StatusBadge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import '../admin/AdminPage.css';

export default function DoctorLabs() {
  const { user } = useAuth();
  const labTests = useCollection('LAB_TESTS');
  const patients = useCollection('PATIENTS');

  const mine = labTests
    .filter((l) => l.requestedBy === user.doctorId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const patientById = (id) => patients.find((p) => p.id === id);

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>Lab Requests</h1>
          <p className="ap-sub">{mine.length} investigations requested by you</p>
        </div>
      </div>

      <Card className="ap-card">
        <Table
          empty="You haven't requested any lab investigations yet. Requests you place during a consultation will appear here."
          columns={[
            { key: 'patient', header: 'Patient', render: (r) => {
              const p = patientById(r.patientId);
              return (
                <div className="ap-person-cell">
                  <Avatar name={p?.name || '?'} size={30} />
                  <span className="ap-cell-primary">{p?.name}</span>
                </div>
              );
            } },
            { key: 'test', header: 'Test' },
            { key: 'date', header: 'Requested On', render: (r) => formatDate(r.date) },
            { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={mine}
        />
      </Card>
    </div>
  );
}
