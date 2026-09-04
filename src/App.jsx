import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminClinics from './pages/admin/AdminClinics.jsx';
import AdminAppointments from './pages/admin/AdminAppointments.jsx';
import AdminPatients from './pages/admin/AdminPatients.jsx';
import AdminStaff from './pages/admin/AdminStaff.jsx';
import AdminComplaints from './pages/admin/AdminComplaints.jsx';
import AdminHomeVisits from './pages/admin/AdminHomeVisits.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminBilling from './pages/admin/AdminBilling.jsx';
import AdminPayroll from './pages/admin/AdminPayroll.jsx';
import AdminClinical from './pages/admin/AdminClinical.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminAuditLogs from './pages/admin/AdminAuditLogs.jsx';
import AdminNotifications from './pages/admin/AdminNotifications.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import PatientLayout from './pages/patient/PatientLayout.jsx';
import PatientHome from './pages/patient/PatientHome.jsx';
import PatientAppointments from './pages/patient/PatientAppointments.jsx';
import PatientRecords from './pages/patient/PatientRecords.jsx';
import PatientPayments from './pages/patient/PatientPayments.jsx';
import PatientProfile from './pages/patient/PatientProfile.jsx';
import StaffLayout from './pages/staff/StaffLayout.jsx';
import StaffHome from './pages/staff/StaffHome.jsx';
import StaffTasks from './pages/staff/StaffTasks.jsx';
import StaffVisits from './pages/staff/StaffVisits.jsx';
import StaffLeave from './pages/staff/StaffLeave.jsx';
import StaffProfile from './pages/staff/StaffProfile.jsx';
import DoctorLayout from './pages/doctor/DoctorLayout.jsx';
import DoctorQueue from './pages/doctor/DoctorQueue.jsx';
import DoctorPatients from './pages/doctor/DoctorPatients.jsx';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions.jsx';
import DoctorLabs from './pages/doctor/DoctorLabs.jsx';

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminOverview />} />
        <Route path="clinics" element={<AdminClinics />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="patients" element={<AdminPatients />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="home-visits" element={<AdminHomeVisits />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="clinical" element={<AdminClinical />} />
        <Route path="billing" element={<AdminBilling />} />
        <Route path="payroll" element={<AdminPayroll />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route
        path="/patient"
        element={
          <RequireRole role="patient">
            <PatientLayout />
          </RequireRole>
        }
      >
        <Route index element={<PatientHome />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="records" element={<PatientRecords />} />
        <Route path="payments" element={<PatientPayments />} />
        <Route path="profile" element={<PatientProfile />} />
      </Route>
      <Route
        path="/staff"
        element={
          <RequireRole role="staff">
            <StaffLayout />
          </RequireRole>
        }
      >
        <Route index element={<StaffHome />} />
        <Route path="tasks" element={<StaffTasks />} />
        <Route path="visits" element={<StaffVisits />} />
        <Route path="leave" element={<StaffLeave />} />
        <Route path="profile" element={<StaffProfile />} />
      </Route>
      <Route
        path="/doctor"
        element={
          <RequireRole role="doctor">
            <DoctorLayout />
          </RequireRole>
        }
      >
        <Route index element={<DoctorQueue />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="prescriptions" element={<DoctorPrescriptions />} />
        <Route path="labs" element={<DoctorLabs />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
