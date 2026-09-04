import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCollection } from '../../data/store.js';
import { Card, Table, Avatar, Input, Badge } from '../../components/ui.jsx';
import { formatDate } from '../../lib/format.js';
import PatientHistoryModal from './PatientHistoryModal.jsx';
import '../admin/AdminPage.css';

export default function DoctorPatients() {
  const { user } = useAuth();
  const appointments = useCollection('APPOINTMENTS');
  const patients = useCollection('PATIENTS');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(null);

  const myPatientIds = [...new Set(appointments.filter((a) => a.doctorId === user.doctorId).map((a) => a.patientId))];
  const myPatients = patients.filter((p) => myPatientIds.includes(p.id));

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return myPatients.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [myPatients, search]);

  const visitCount = (patientId) => appointments.filter((a) => a.doctorId === user.doctorId && a.patientId === patientId).length;
  const lastVisit = (patientId) => {
    const visits = appointments.filter((a) => a.doctorId === user.doctorId && a.patientId === patientId).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    return visits[0]?.date;
  };

  return (
    <div>
      <div className="ap-head">
        <div>
          <h1>My Patients</h1>
          <p className="ap-sub">{myPatients.length} patients under your care</p>
        </div>
      </div>

      <div className="ap-toolbar">
        <Input className="ap-search" placeholder="Search patients…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card className="ap-card">
        <Table
          empty="No patients match your search."
          onRowClick={(r) => setActive(r)}
          columns={[
            { key: 'name', header: 'Patient', render: (r) => (
              <div className="ap-person-cell">
                <Avatar name={r.name} size={32} />
                <div>
                  <div className="ap-cell-primary">{r.name}</div>
                  <div className="ap-cell-sub">{r.age}y &middot; {r.gender} &middot; {r.bloodGroup}</div>
                </div>
              </div>
            ) },
            { key: 'phone', header: 'Phone' },
            { key: 'visits', header: 'Visits with you', render: (r) => <Badge tone="neutral">{visitCount(r.id)}</Badge> },
            { key: 'last', header: 'Last Visit', render: (r) => formatDate(lastVisit(r.id)) },
          ]}
          rows={rows}
        />
      </Card>

      <PatientHistoryModal patient={active} onClose={() => setActive(null)} doctorId={user.doctorId} />
    </div>
  );
}
