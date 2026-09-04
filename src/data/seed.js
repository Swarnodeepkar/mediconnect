// Seed data for MediConnect prototype.
// This represents the "day one" state of the platform across all four clinics.

export const CLINICS = [
  { id: 'cl1', name: 'MediConnect Whitefield', code: 'C1', city: 'Bengaluru', address: '4th Cross, Whitefield Main Rd', color: '#1aa8a1' },
  { id: 'cl2', name: 'MediConnect Indiranagar', code: 'C2', city: 'Bengaluru', address: '100 Feet Rd, Indiranagar', color: '#2f6fed' },
  { id: 'cl3', name: 'MediConnect Koramangala', code: 'C3', city: 'Bengaluru', address: '5th Block, Koramangala', color: '#e9a520' },
  { id: 'cl4', name: 'MediConnect Jayanagar', code: 'C4', city: 'Bengaluru', address: '3rd Block, Jayanagar', color: '#e0483f' },
];

export const DEPARTMENTS = [
  'General Medicine', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Gynecology', 'Cardiology', 'ENT', 'Dental',
];

export const DOCTORS = [
  { id: 'doc1', name: 'Dr. Ananya Rao', dept: 'General Medicine', clinicId: 'cl1', qualification: 'MBBS, MD', experience: 9, rating: 4.8, avatar: 'AR', consultFee: 500 },
  { id: 'doc2', name: 'Dr. Karan Mehta', dept: 'Cardiology', clinicId: 'cl1', qualification: 'MBBS, DM Cardiology', experience: 14, rating: 4.9, avatar: 'KM', consultFee: 900 },
  { id: 'doc3', name: 'Dr. Sneha Iyer', dept: 'Pediatrics', clinicId: 'cl2', qualification: 'MBBS, MD Pediatrics', experience: 7, rating: 4.7, avatar: 'SI', consultFee: 450 },
  { id: 'doc4', name: 'Dr. Farhan Sheikh', dept: 'Orthopedics', clinicId: 'cl2', qualification: 'MBBS, MS Ortho', experience: 11, rating: 4.6, avatar: 'FS', consultFee: 700 },
  { id: 'doc5', name: 'Dr. Priya Nair', dept: 'Gynecology', clinicId: 'cl3', qualification: 'MBBS, MS OBG', experience: 12, rating: 4.9, avatar: 'PN', consultFee: 650 },
  { id: 'doc6', name: 'Dr. Ravi Shastri', dept: 'Dermatology', clinicId: 'cl3', qualification: 'MBBS, MD Derm', experience: 6, rating: 4.5, avatar: 'RS', consultFee: 550 },
  { id: 'doc7', name: 'Dr. Meera Pillai', dept: 'ENT', clinicId: 'cl4', qualification: 'MBBS, MS ENT', experience: 8, rating: 4.7, avatar: 'MP', consultFee: 500 },
  { id: 'doc8', name: 'Dr. Arjun Verma', dept: 'Dental', clinicId: 'cl4', qualification: 'BDS, MDS', experience: 10, rating: 4.8, avatar: 'AV', consultFee: 400 },
];

export const STAFF = [
  { id: 'st1', name: 'Lakshmi Menon', role: 'Nurse', clinicId: 'cl1', phone: '98450 11223', status: 'Active', joined: '2021-03-14' },
  { id: 'st2', name: 'Suresh Kumar', role: 'Receptionist', clinicId: 'cl1', phone: '98450 11224', status: 'Active', joined: '2020-06-01' },
  { id: 'st3', name: 'Divya Shetty', role: 'Lab Technician', clinicId: 'cl1', phone: '98450 11225', status: 'Active', joined: '2022-01-10' },
  { id: 'st4', name: 'Naveen Gowda', role: 'Field Nurse', clinicId: 'cl2', phone: '98450 11226', status: 'Active', joined: '2021-09-19' },
  { id: 'st5', name: 'Ayesha Khan', role: 'Receptionist', clinicId: 'cl2', phone: '98450 11227', status: 'On Leave', joined: '2022-04-02' },
  { id: 'st6', name: 'Vikram Singh', role: 'Pharmacy Staff', clinicId: 'cl3', phone: '98450 11228', status: 'Active', joined: '2019-11-23' },
  { id: 'st7', name: 'Pooja Reddy', role: 'Nurse', clinicId: 'cl3', phone: '98450 11229', status: 'Active', joined: '2023-02-17' },
  { id: 'st8', name: 'Rahul Nair', role: 'Field Nurse', clinicId: 'cl4', phone: '98450 11230', status: 'Active', joined: '2020-08-05' },
  { id: 'st9', name: 'Fatima Ansari', role: 'HR Executive', clinicId: 'cl4', phone: '98450 11231', status: 'Active', joined: '2018-05-30' },
  { id: 'st10', name: 'Gopal Krishnan', role: 'Receptionist', clinicId: 'cl3', phone: '98450 11232', status: 'Active', joined: '2021-12-11' },
];

export const PATIENTS = [
  { id: 'p1', name: 'Rohan Desai', age: 34, gender: 'Male', phone: '90000 11111', clinicId: 'cl1', bloodGroup: 'O+', lastVisit: '2026-08-29' },
  { id: 'p2', name: 'Nisha Agarwal', age: 28, gender: 'Female', phone: '90000 22222', clinicId: 'cl1', bloodGroup: 'A+', lastVisit: '2026-08-30' },
  { id: 'p3', name: 'Amit Trivedi', age: 45, gender: 'Male', phone: '90000 33333', clinicId: 'cl2', bloodGroup: 'B+', lastVisit: '2026-09-01' },
  { id: 'p4', name: 'Kavya Suresh', age: 6, gender: 'Female', phone: '90000 44444', clinicId: 'cl2', bloodGroup: 'AB+', lastVisit: '2026-08-27' },
  { id: 'p5', name: 'Manoj Pillai', age: 52, gender: 'Male', phone: '90000 55555', clinicId: 'cl3', bloodGroup: 'O-', lastVisit: '2026-09-02' },
  { id: 'p6', name: 'Sharanya B', age: 31, gender: 'Female', phone: '90000 66666', clinicId: 'cl3', bloodGroup: 'A-', lastVisit: '2026-08-25' },
  { id: 'p7', name: 'Imran Qureshi', age: 39, gender: 'Male', phone: '90000 77777', clinicId: 'cl4', bloodGroup: 'B-', lastVisit: '2026-08-31' },
  { id: 'p8', name: 'Deepa Rajan', age: 60, gender: 'Female', phone: '90000 88888', clinicId: 'cl4', bloodGroup: 'O+', lastVisit: '2026-09-03' },
  { id: 'p9', name: 'Yash Kulkarni', age: 22, gender: 'Male', phone: '90000 99999', clinicId: 'cl1', bloodGroup: 'A+', lastVisit: '2026-09-03' },
  { id: 'p10', name: 'Ritika Chawla', age: 27, gender: 'Female', phone: '90000 10101', clinicId: 'cl2', bloodGroup: 'B+', lastVisit: '2026-08-20' },
];

const T = '2026-09-04';
export const APPOINTMENTS = [
  { id: 'ap1', patientId: 'p1', doctorId: 'doc1', clinicId: 'cl1', date: T, time: '09:30', status: 'Completed', service: 'General Consultation', fee: 500 },
  { id: 'ap2', patientId: 'p2', doctorId: 'doc2', clinicId: 'cl1', date: T, time: '10:00', status: 'Completed', service: 'Cardiology Consultation', fee: 900 },
  { id: 'ap3', patientId: 'p9', doctorId: 'doc1', clinicId: 'cl1', date: T, time: '11:15', status: 'In Progress', service: 'Follow-up', fee: 300 },
  { id: 'ap13', patientId: 'p2', doctorId: 'doc1', clinicId: 'cl1', date: T, time: '13:00', status: 'Waiting', service: 'General Consultation', fee: 500 },
  { id: 'ap14', patientId: 'p1', doctorId: 'doc1', clinicId: 'cl1', date: T, time: '15:30', status: 'Scheduled', service: 'Skin Rash Consultation', fee: 500 },
  { id: 'ap4', patientId: 'p3', doctorId: 'doc4', clinicId: 'cl2', date: T, time: '09:00', status: 'Completed', service: 'Orthopedic Consultation', fee: 700 },
  { id: 'ap5', patientId: 'p4', doctorId: 'doc3', clinicId: 'cl2', date: T, time: '10:30', status: 'Waiting', service: 'Pediatric Checkup', fee: 450 },
  { id: 'ap6', patientId: 'p10', doctorId: 'doc3', clinicId: 'cl2', date: T, time: '12:00', status: 'Scheduled', service: 'Vaccination', fee: 350 },
  { id: 'ap7', patientId: 'p5', doctorId: 'doc5', clinicId: 'cl3', date: T, time: '09:45', status: 'Completed', service: 'Gynecology Consultation', fee: 650 },
  { id: 'ap8', patientId: 'p6', doctorId: 'doc6', clinicId: 'cl3', date: T, time: '11:00', status: 'Waiting', service: 'Skin Consultation', fee: 550 },
  { id: 'ap9', patientId: 'p7', doctorId: 'doc7', clinicId: 'cl4', date: T, time: '10:15', status: 'Completed', service: 'ENT Consultation', fee: 500 },
  { id: 'ap10', patientId: 'p8', doctorId: 'doc8', clinicId: 'cl4', date: T, time: '14:00', status: 'Scheduled', service: 'Dental Checkup', fee: 400 },
  { id: 'ap11', patientId: 'p1', doctorId: 'doc2', clinicId: 'cl1', date: '2026-09-06', time: '10:00', status: 'Scheduled', service: 'Cardiology Follow-up', fee: 500 },
  { id: 'ap12', patientId: 'p5', doctorId: 'doc5', clinicId: 'cl3', date: '2026-09-05', time: '09:30', status: 'Scheduled', service: 'Follow-up', fee: 300 },
];

export const LAB_TESTS = [
  { id: 'lt1', patientId: 'p1', clinicId: 'cl1', test: 'Complete Blood Count', status: 'Report Ready', date: T },
  { id: 'lt2', patientId: 'p2', clinicId: 'cl1', test: 'Lipid Profile', status: 'Processing', date: T },
  { id: 'lt3', patientId: 'p5', clinicId: 'cl3', test: 'Thyroid Panel', status: 'Report Ready', date: T },
  { id: 'lt4', patientId: 'p3', clinicId: 'cl2', test: 'X-Ray Knee', status: 'Report Ready', date: T },
  { id: 'lt5', patientId: 'p8', clinicId: 'cl4', test: 'ECG', status: 'Sample Collected', date: T },
];

export const HOME_VISITS = [
  { id: 'hv1', patientId: 'p8', staffId: 'st8', clinicId: 'cl4', service: 'Post-op dressing', address: '22 Jayanagar 4th Block', scheduled: `${T} 15:00`, status: 'In Progress' },
  { id: 'hv2', patientId: 'p6', staffId: 'st7', clinicId: 'cl3', service: 'Physiotherapy', address: '9 Koramangala 5th Block', scheduled: `${T} 16:30`, status: 'Assigned' },
  { id: 'hv3', patientId: 'p2', staffId: 'st1', clinicId: 'cl1', service: 'Blood sample collection', address: '17 Whitefield Main Rd', scheduled: `${T} 08:30`, status: 'Completed' },
  { id: 'hv4', patientId: 'p4', staffId: 'st4', clinicId: 'cl2', service: 'Vaccination visit', address: '3 Indiranagar 100ft Rd', scheduled: '2026-09-05 10:00', status: 'Scheduled' },
];

export const COMPLAINTS = [
  { id: 'cp1', patientId: 'p3', clinicId: 'cl2', category: 'Billing', description: 'Overcharged for lab test package', priority: 'High', status: 'In Progress', assignedTo: 'st5', raised: '2026-09-02' },
  { id: 'cp2', patientId: 'p6', clinicId: 'cl3', category: 'Wait Time', description: 'Waited over an hour past appointment slot', priority: 'Medium', status: 'Assigned', assignedTo: 'st10', raised: '2026-09-03' },
  { id: 'cp3', patientId: 'p7', clinicId: 'cl4', category: 'Staff Behaviour', description: 'Receptionist was unresponsive to queries', priority: 'Medium', status: 'Submitted', assignedTo: null, raised: '2026-09-04' },
  { id: 'cp4', patientId: 'p1', clinicId: 'cl1', category: 'Reports', description: 'Lab report delayed by 2 days', priority: 'Low', status: 'Resolved', assignedTo: 'st3', raised: '2026-08-28' },
  { id: 'cp5', patientId: 'p9', clinicId: 'cl1', category: 'Appointment', description: 'Double booked in same slot', priority: 'High', status: 'Submitted', assignedTo: null, raised: '2026-09-04' },
];

export const ATTENDANCE_TODAY = [
  { staffId: 'st1', checkIn: '08:52', checkOut: null, status: 'Present' },
  { staffId: 'st2', checkIn: '09:01', checkOut: null, status: 'Present' },
  { staffId: 'st3', checkIn: '08:47', checkOut: null, status: 'Present' },
  { staffId: 'st4', checkIn: '09:10', checkOut: null, status: 'Late' },
  { staffId: 'st5', checkIn: null, checkOut: null, status: 'On Leave' },
  { staffId: 'st6', checkIn: '08:55', checkOut: null, status: 'Present' },
  { staffId: 'st7', checkIn: '08:40', checkOut: null, status: 'Present' },
  { staffId: 'st8', checkIn: '09:15', checkOut: null, status: 'Late' },
  { staffId: 'st9', checkIn: '09:00', checkOut: null, status: 'Present' },
  { staffId: 'st10', checkIn: null, checkOut: null, status: 'Absent' },
];

export const REVENUE_TREND = [
  { day: 'Mon', cl1: 32000, cl2: 28000, cl3: 24000, cl4: 21000 },
  { day: 'Tue', cl1: 35000, cl2: 26000, cl3: 27000, cl4: 22500 },
  { day: 'Wed', cl1: 31000, cl2: 30000, cl3: 25000, cl4: 24000 },
  { day: 'Thu', cl1: 38000, cl2: 29500, cl3: 28500, cl4: 23000 },
  { day: 'Fri', cl1: 41000, cl2: 33000, cl3: 30000, cl4: 26500 },
  { day: 'Sat', cl1: 46500, cl2: 37000, cl3: 34500, cl4: 29000 },
  { day: 'Sun', cl1: 29500, cl2: 21000, cl3: 20000, cl4: 18500 },
];

export const NOTIFICATIONS = [
  { id: 'n1', title: 'Lab report ready', body: 'Your Complete Blood Count report is ready to view.', time: '2h ago', read: false, role: 'patient', patientId: 'p1' },
  { id: 'n2', title: 'Appointment reminder', body: 'Cardiology follow-up with Dr. Karan Mehta on Sep 6, 10:00 AM.', time: '5h ago', read: false, role: 'patient', patientId: 'p1' },
  { id: 'n3', title: 'Health camp this weekend', body: 'Free diabetes screening camp at Koramangala branch.', time: '1d ago', read: true, role: 'patient', patientId: 'p1' },
  { id: 'n4', title: 'Payment received', body: 'Your payment of ₹500 for General Consultation was successful.', time: '2d ago', read: true, role: 'patient', patientId: 'p1' },
  { id: 'n5', title: 'Offer: Full body checkup', body: '20% off on comprehensive health packages this month at Whitefield branch.', time: '3d ago', read: true, role: 'patient', patientId: 'p1' },
];

export const PRESCRIPTIONS = [
  {
    id: 'rx1', appointmentId: 'ap1', patientId: 'p1', doctorId: 'doc1', clinicId: 'cl1', date: T,
    diagnosis: 'Seasonal viral fever with mild throat congestion',
    notes: 'Advised rest and adequate hydration for 3-4 days. Review if fever persists beyond 3 days.',
    medicines: [
      { name: 'Paracetamol 650mg', dosage: '1 tablet', frequency: 'Twice daily after food', duration: '4 days' },
      { name: 'Cetirizine 10mg', dosage: '1 tablet', frequency: 'Once at night', duration: '5 days' },
      { name: 'ORS Sachets', dosage: '1 sachet in 1L water', frequency: 'As needed', duration: '4 days' },
    ],
  },
  {
    id: 'rx2', appointmentId: 'ap11', patientId: 'p1', doctorId: 'doc2', clinicId: 'cl1', date: '2026-08-15',
    diagnosis: 'Routine cardiac follow-up — stable, well-controlled hypertension',
    notes: 'Continue current medication. Low-sodium diet advised. Repeat lipid profile in 3 months.',
    medicines: [
      { name: 'Telmisartan 40mg', dosage: '1 tablet', frequency: 'Once daily, morning', duration: '90 days' },
      { name: 'Aspirin 75mg', dosage: '1 tablet', frequency: 'Once daily, after dinner', duration: '90 days' },
    ],
  },
];

export const LEAVE_REQUESTS = [
  { id: 'lv1', staffId: 'st1', type: 'Sick Leave', from: '2026-08-10', to: '2026-08-11', days: 2, status: 'Approved', reason: 'Fever and body ache', appliedOn: '2026-08-09' },
  { id: 'lv2', staffId: 'st1', type: 'Casual Leave', from: '2026-09-15', to: '2026-09-15', days: 1, status: 'Pending', reason: 'Personal work', appliedOn: '2026-09-03' },
  { id: 'lv3', staffId: 'st5', type: 'Sick Leave', from: '2026-09-04', to: '2026-09-06', days: 3, status: 'Approved', reason: 'Viral fever', appliedOn: '2026-09-03' },
];

export const LEAVE_BALANCE = { st1: { casual: 8, sick: 6, earned: 12 } };

export const TASKS = [
  { id: 'tk1', staffId: 'st1', clinicId: 'cl1', title: 'Restock consultation room 2 supplies', priority: 'Medium', status: 'Pending', dueDate: T },
  { id: 'tk2', staffId: 'st1', clinicId: 'cl1', title: 'Update vitals for Nisha Agarwal before consult', priority: 'High', status: 'Pending', dueDate: T },
  { id: 'tk3', staffId: 'st1', clinicId: 'cl1', title: 'Assist Dr. Ananya Rao — 11:15 AM follow-up', priority: 'High', status: 'In Progress', dueDate: T },
  { id: 'tk4', staffId: 'st1', clinicId: 'cl1', title: 'Sterilize equipment tray after morning shift', priority: 'Low', status: 'Completed', dueDate: '2026-09-03' },
  { id: 'tk5', staffId: 'st1', clinicId: 'cl1', title: 'Submit weekly vitals log to admin', priority: 'Medium', status: 'Completed', dueDate: '2026-09-02' },
];

export const PAYSLIPS = [
  { id: 'ps1', staffId: 'st1', month: 'August 2026', basic: 28000, overtime: 1500, incentives: 1000, deductions: 800, netPay: 29700, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps2', staffId: 'st1', month: 'July 2026', basic: 28000, overtime: 900, incentives: 500, deductions: 800, netPay: 28600, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps3', staffId: 'st1', month: 'June 2026', basic: 28000, overtime: 1200, incentives: 0, deductions: 800, netPay: 28400, status: 'Paid', paidOn: '2026-07-01' },
];

export const PAYMENTS = [
  { id: 'pay1', patientId: 'p1', clinicId: 'cl1', appointmentId: 'ap1', description: 'General Consultation — Dr. Ananya Rao', category: 'Consultation', amount: 500, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay2', patientId: 'p1', clinicId: 'cl1', appointmentId: 'lt1', description: 'Complete Blood Count', category: 'Laboratory', amount: 650, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay3', patientId: 'p1', clinicId: 'cl1', appointmentId: 'ap11', description: 'Cardiology Follow-up — Dr. Karan Mehta', category: 'Consultation', amount: 500, status: 'Due', date: '2026-09-06', method: null },
  { id: 'pay4', patientId: 'p1', clinicId: 'cl1', appointmentId: null, description: 'Pharmacy — Paracetamol, Cetirizine, ORS', category: 'Pharmacy', amount: 240, status: 'Paid', date: '2026-08-30', method: 'Cash' },
  { id: 'pay5', patientId: 'p1', clinicId: 'cl1', appointmentId: null, description: 'Full Body Health Checkup Package', category: 'Package', amount: 2499, status: 'Paid', date: '2026-08-10', method: 'Card' },
];

export const USERS = [
  { id: 'u_admin', role: 'admin', name: 'Ritu Sharma', title: 'Super Admin', avatar: 'RS', clinicId: null },
  { id: 'u_doctor', role: 'doctor', name: 'Dr. Ananya Rao', title: 'General Medicine', avatar: 'AR', clinicId: 'cl1', doctorId: 'doc1' },
  { id: 'u_staff', role: 'staff', name: 'Lakshmi Menon', title: 'Nurse', avatar: 'LM', clinicId: 'cl1', staffId: 'st1' },
  { id: 'u_patient', role: 'patient', name: 'Rohan Desai', title: 'Patient', avatar: 'RD', clinicId: 'cl1', patientId: 'p1' },
];
