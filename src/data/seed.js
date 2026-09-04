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
  // September 2026 — current month, org-wide
  { id: 'ps_st1_sep', staffId: 'st1', month: 'September 2026', basic: 28000, overtime: 1500, incentives: 1000, deductions: 800, netPay: 29700, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st2_sep', staffId: 'st2', month: 'September 2026', basic: 24000, overtime: 600, incentives: 0, deductions: 650, netPay: 23950, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st3_sep', staffId: 'st3', month: 'September 2026', basic: 26000, overtime: 900, incentives: 500, deductions: 700, netPay: 26700, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st4_sep', staffId: 'st4', month: 'September 2026', basic: 25000, overtime: 1100, incentives: 0, deductions: 700, netPay: 25400, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st5_sep', staffId: 'st5', month: 'September 2026', basic: 23000, overtime: 0, incentives: 0, deductions: 3200, netPay: 19800, status: 'Processing', paidOn: null },
  { id: 'ps_st6_sep', staffId: 'st6', month: 'September 2026', basic: 27000, overtime: 700, incentives: 800, deductions: 750, netPay: 27750, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st7_sep', staffId: 'st7', month: 'September 2026', basic: 26000, overtime: 400, incentives: 0, deductions: 700, netPay: 25700, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st8_sep', staffId: 'st8', month: 'September 2026', basic: 25000, overtime: 1300, incentives: 0, deductions: 700, netPay: 25600, status: 'Pending', paidOn: null },
  { id: 'ps_st9_sep', staffId: 'st9', month: 'September 2026', basic: 32000, overtime: 0, incentives: 1200, deductions: 900, netPay: 32300, status: 'Paid', paidOn: '2026-09-01' },
  { id: 'ps_st10_sep', staffId: 'st10', month: 'September 2026', basic: 24000, overtime: 500, incentives: 0, deductions: 650, netPay: 23850, status: 'Paid', paidOn: '2026-09-01' },
  // August 2026 — prior month, org-wide
  { id: 'ps_st1_aug', staffId: 'st1', month: 'August 2026', basic: 28000, overtime: 1500, incentives: 1000, deductions: 800, netPay: 29700, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st2_aug', staffId: 'st2', month: 'August 2026', basic: 24000, overtime: 400, incentives: 0, deductions: 650, netPay: 23750, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st3_aug', staffId: 'st3', month: 'August 2026', basic: 26000, overtime: 800, incentives: 0, deductions: 700, netPay: 26100, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st4_aug', staffId: 'st4', month: 'August 2026', basic: 25000, overtime: 900, incentives: 0, deductions: 700, netPay: 25200, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st5_aug', staffId: 'st5', month: 'August 2026', basic: 23000, overtime: 300, incentives: 0, deductions: 600, netPay: 22700, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st6_aug', staffId: 'st6', month: 'August 2026', basic: 27000, overtime: 500, incentives: 0, deductions: 750, netPay: 26750, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st7_aug', staffId: 'st7', month: 'August 2026', basic: 26000, overtime: 200, incentives: 0, deductions: 700, netPay: 25500, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st8_aug', staffId: 'st8', month: 'August 2026', basic: 25000, overtime: 1000, incentives: 500, deductions: 700, netPay: 25800, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st9_aug', staffId: 'st9', month: 'August 2026', basic: 32000, overtime: 0, incentives: 0, deductions: 900, netPay: 31100, status: 'Paid', paidOn: '2026-08-01' },
  { id: 'ps_st10_aug', staffId: 'st10', month: 'August 2026', basic: 24000, overtime: 300, incentives: 0, deductions: 650, netPay: 23650, status: 'Paid', paidOn: '2026-08-01' },
  // July 2026
  { id: 'ps_st1_jul', staffId: 'st1', month: 'July 2026', basic: 28000, overtime: 900, incentives: 500, deductions: 800, netPay: 28600, status: 'Paid', paidOn: '2026-07-01' },
  { id: 'ps_st9_jul', staffId: 'st9', month: 'July 2026', basic: 32000, overtime: 0, incentives: 0, deductions: 900, netPay: 31100, status: 'Paid', paidOn: '2026-07-01' },
];

export const PAYMENTS = [
  { id: 'pay1', patientId: 'p1', clinicId: 'cl1', appointmentId: 'ap1', description: 'General Consultation — Dr. Ananya Rao', category: 'Consultation', amount: 500, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay2', patientId: 'p1', clinicId: 'cl1', appointmentId: 'lt1', description: 'Complete Blood Count', category: 'Laboratory', amount: 650, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay3', patientId: 'p1', clinicId: 'cl1', appointmentId: 'ap11', description: 'Cardiology Follow-up — Dr. Karan Mehta', category: 'Consultation', amount: 500, status: 'Due', date: '2026-09-06', method: null },
  { id: 'pay4', patientId: 'p1', clinicId: 'cl1', appointmentId: null, description: 'Pharmacy — Paracetamol, Cetirizine, ORS', category: 'Pharmacy', amount: 240, status: 'Paid', date: '2026-08-30', method: 'Cash' },
  { id: 'pay5', patientId: 'p1', clinicId: 'cl1', appointmentId: null, description: 'Full Body Health Checkup Package', category: 'Package', amount: 2499, status: 'Paid', date: '2026-08-10', method: 'Card' },
  { id: 'pay6', patientId: 'p2', clinicId: 'cl1', appointmentId: 'ap2', description: 'Cardiology Consultation — Dr. Karan Mehta', category: 'Consultation', amount: 900, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay7', patientId: 'p2', clinicId: 'cl1', appointmentId: 'lt2', description: 'Lipid Profile', category: 'Laboratory', amount: 480, status: 'Due', date: T, method: null },
  { id: 'pay8', patientId: 'p9', clinicId: 'cl1', appointmentId: 'ap3', description: 'Follow-up Consultation — Dr. Ananya Rao', category: 'Consultation', amount: 300, status: 'Paid', date: T, method: 'Cash' },
  { id: 'pay9', patientId: 'p3', clinicId: 'cl2', appointmentId: 'ap4', description: 'Orthopedic Consultation — Dr. Farhan Sheikh', category: 'Consultation', amount: 700, status: 'Paid', date: T, method: 'Card' },
  { id: 'pay10', patientId: 'p3', clinicId: 'cl2', appointmentId: 'lt4', description: 'X-Ray Knee', category: 'Laboratory', amount: 850, status: 'Paid', date: T, method: 'Card' },
  { id: 'pay11', patientId: 'p4', clinicId: 'cl2', appointmentId: 'ap5', description: 'Pediatric Checkup — Dr. Sneha Iyer', category: 'Consultation', amount: 450, status: 'Due', date: T, method: null },
  { id: 'pay12', patientId: 'p10', clinicId: 'cl2', appointmentId: 'ap6', description: 'Vaccination — Dr. Sneha Iyer', category: 'Consultation', amount: 350, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay13', patientId: 'p5', clinicId: 'cl3', appointmentId: 'ap7', description: 'Gynecology Consultation — Dr. Priya Nair', category: 'Consultation', amount: 650, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay14', patientId: 'p5', clinicId: 'cl3', appointmentId: 'lt3', description: 'Thyroid Panel', category: 'Laboratory', amount: 720, status: 'Paid', date: T, method: 'UPI' },
  { id: 'pay15', patientId: 'p6', clinicId: 'cl3', appointmentId: 'ap8', description: 'Skin Consultation — Dr. Ravi Shastri', category: 'Consultation', amount: 550, status: 'Due', date: T, method: null },
  { id: 'pay16', patientId: 'p7', clinicId: 'cl4', appointmentId: 'ap9', description: 'ENT Consultation — Dr. Meera Pillai', category: 'Consultation', amount: 500, status: 'Paid', date: T, method: 'Cash' },
  { id: 'pay17', patientId: 'p8', clinicId: 'cl4', appointmentId: 'ap10', description: 'Dental Checkup — Dr. Arjun Verma', category: 'Consultation', amount: 400, status: 'Due', date: T, method: null },
  { id: 'pay18', patientId: 'p8', clinicId: 'cl4', appointmentId: 'lt5', description: 'ECG', category: 'Laboratory', amount: 380, status: 'Due', date: T, method: null },
  { id: 'pay19', patientId: 'p7', clinicId: 'cl4', appointmentId: null, description: 'Pharmacy — Antibiotics course', category: 'Pharmacy', amount: 320, status: 'Paid', date: '2026-08-29', method: 'Cash' },
  { id: 'pay20', patientId: 'p6', clinicId: 'cl3', appointmentId: null, description: 'Skin Care Package', category: 'Package', amount: 1899, status: 'Paid', date: '2026-08-22', method: 'Card' },
  { id: 'pay21', patientId: 'p1', clinicId: 'cl1', appointmentId: null, description: 'Refund — Duplicate lab charge', category: 'Laboratory', amount: 150, status: 'Refunded', date: '2026-08-18', method: 'UPI' },
];

export const USERS = [
  { id: 'u_admin', role: 'admin', name: 'Ritu Sharma', title: 'Super Admin', avatar: 'RS', clinicId: null },
  { id: 'u_doctor', role: 'doctor', name: 'Dr. Ananya Rao', title: 'General Medicine', avatar: 'AR', clinicId: 'cl1', doctorId: 'doc1' },
  { id: 'u_staff', role: 'staff', name: 'Lakshmi Menon', title: 'Nurse', avatar: 'LM', clinicId: 'cl1', staffId: 'st1' },
  { id: 'u_patient', role: 'patient', name: 'Rohan Desai', title: 'Patient', avatar: 'RD', clinicId: 'cl1', patientId: 'p1' },
];

// Platform-wide user & access directory (Users & Roles module) — broader than the 4 login personas above.
export const PLATFORM_USERS = [
  { id: 'pu1', name: 'Ritu Sharma', email: 'ritu.sharma@mediconnect.in', role: 'Super Admin', clinicId: null, status: 'Active', lastActive: '2026-09-04 09:10' },
  { id: 'pu2', name: 'Dr. Ananya Rao', email: 'ananya.rao@mediconnect.in', role: 'Doctor', clinicId: 'cl1', status: 'Active', lastActive: '2026-09-04 08:55' },
  { id: 'pu3', name: 'Dr. Karan Mehta', email: 'karan.mehta@mediconnect.in', role: 'Doctor', clinicId: 'cl1', status: 'Active', lastActive: '2026-09-03 17:40' },
  { id: 'pu4', name: 'Dr. Sneha Iyer', email: 'sneha.iyer@mediconnect.in', role: 'Doctor', clinicId: 'cl2', status: 'Active', lastActive: '2026-09-04 09:02' },
  { id: 'pu5', name: 'Dr. Priya Nair', email: 'priya.nair@mediconnect.in', role: 'Doctor', clinicId: 'cl3', status: 'Active', lastActive: '2026-09-04 08:47' },
  { id: 'pu6', name: 'Lakshmi Menon', email: 'lakshmi.menon@mediconnect.in', role: 'Nurse', clinicId: 'cl1', status: 'Active', lastActive: '2026-09-04 08:52' },
  { id: 'pu7', name: 'Suresh Kumar', email: 'suresh.kumar@mediconnect.in', role: 'Receptionist', clinicId: 'cl1', status: 'Active', lastActive: '2026-09-04 09:01' },
  { id: 'pu8', name: 'Divya Shetty', email: 'divya.shetty@mediconnect.in', role: 'Lab Technician', clinicId: 'cl1', status: 'Active', lastActive: '2026-09-04 08:47' },
  { id: 'pu9', name: 'Ayesha Khan', email: 'ayesha.khan@mediconnect.in', role: 'Receptionist', clinicId: 'cl2', status: 'Inactive', lastActive: '2026-08-28 14:20' },
  { id: 'pu10', name: 'Vikram Singh', email: 'vikram.singh@mediconnect.in', role: 'Pharmacy Staff', clinicId: 'cl3', status: 'Active', lastActive: '2026-09-04 08:55' },
  { id: 'pu11', name: 'Fatima Ansari', email: 'fatima.ansari@mediconnect.in', role: 'HR Executive', clinicId: 'cl4', status: 'Active', lastActive: '2026-09-04 09:00' },
  { id: 'pu12', name: 'Rohan Desai', email: 'rohan.desai@gmail.com', role: 'Patient', clinicId: 'cl1', status: 'Active', lastActive: '2026-09-04 07:30' },
];

export const ROLE_PERMISSIONS = [
  { role: 'Super Admin', access: 'All branches, settings, analytics, and audit controls' },
  { role: 'Doctor', access: 'Assigned appointments and permitted clinical records' },
  { role: 'Nurse', access: 'Assigned patients, care tasks, and home visits' },
  { role: 'Receptionist', access: 'Registration, scheduling, and authorized billing' },
  { role: 'Lab Technician', access: 'Test orders, samples, results, and reports' },
  { role: 'Pharmacy Staff', access: 'Prescriptions, inventory, dispensing, and billing' },
  { role: 'HR Executive', access: 'Employees, attendance, leave, and payroll' },
  { role: 'Patient', access: "Only the patient's authorized personal information" },
];

export const AUDIT_LOGS = [
  { id: 'al1', actor: 'Ritu Sharma', action: 'Marked payment as Paid', target: 'Cardiology Follow-up — Rohan Desai', category: 'Billing', clinicId: 'cl1', timestamp: '2026-09-04 09:32' },
  { id: 'al2', actor: 'Dr. Ananya Rao', action: 'Completed consultation', target: 'Yash Kulkarni — Follow-up', category: 'Clinical', clinicId: 'cl1', timestamp: '2026-09-04 09:15' },
  { id: 'al3', actor: 'Lakshmi Menon', action: 'Checked in for shift', target: 'MediConnect Whitefield', category: 'Attendance', clinicId: 'cl1', timestamp: '2026-09-04 08:52' },
  { id: 'al4', actor: 'Ritu Sharma', action: 'Assigned complaint to staff', target: 'Wait Time complaint — Sharanya B', category: 'Complaints', clinicId: 'cl3', timestamp: '2026-09-04 08:40' },
  { id: 'al5', actor: 'Fatima Ansari', action: 'Processed payroll batch', target: 'September 2026 — Jayanagar branch', category: 'Payroll', clinicId: 'cl4', timestamp: '2026-09-04 08:15' },
  { id: 'al6', actor: 'Ritu Sharma', action: 'Updated clinic operating hours', target: 'MediConnect Koramangala', category: 'Settings', clinicId: 'cl3', timestamp: '2026-09-03 18:20' },
  { id: 'al7', actor: 'Dr. Karan Mehta', action: 'Issued prescription', target: 'Nisha Agarwal — Hypertension follow-up', category: 'Clinical', clinicId: 'cl1', timestamp: '2026-09-03 17:38' },
  { id: 'al8', actor: 'Ayesha Khan', action: 'Login failed — incorrect password', target: 'MediConnect Indiranagar', category: 'Security', clinicId: 'cl2', timestamp: '2026-09-03 09:12' },
  { id: 'al9', actor: 'Ritu Sharma', action: 'Exported financial report', target: 'August 2026 — All Clinics', category: 'Reports', clinicId: null, timestamp: '2026-09-02 16:05' },
  { id: 'al10', actor: 'Suresh Kumar', action: 'Booked new appointment', target: 'Rohan Desai — Skin Rash Consultation', category: 'Appointments', clinicId: 'cl1', timestamp: '2026-09-02 11:22' },
  { id: 'al11', actor: 'Ritu Sharma', action: 'Deactivated user account', target: 'Ayesha Khan — Receptionist', category: 'Users & Roles', clinicId: 'cl2', timestamp: '2026-08-28 14:25' },
  { id: 'al12', actor: 'Divya Shetty', action: 'Uploaded lab report', target: 'Complete Blood Count — Rohan Desai', category: 'Clinical', clinicId: 'cl1', timestamp: '2026-08-28 10:40' },
];

export const ADMIN_NOTIFICATIONS = [
  { id: 'an1', title: 'Payroll pending approval', body: '2 payslips for September 2026 are still pending disbursement.', time: '25m ago', read: false, category: 'Payroll' },
  { id: 'an2', title: 'High-priority complaint filed', body: 'Yash Kulkarni reported a double-booked appointment slot at Whitefield.', time: '1h ago', read: false, category: 'Complaints' },
  { id: 'an3', title: 'Staff checked in late', body: '2 staff members checked in after their scheduled shift start today.', time: '3h ago', read: false, category: 'Workforce' },
  { id: 'an4', title: 'Outstanding payments rising', body: '₹2,260 in patient payments remain unpaid across all clinics.', time: '4h ago', read: true, category: 'Billing' },
  { id: 'an5', title: 'Home visit delayed', body: 'The physiotherapy visit for Sharanya B is still marked Assigned past its scheduled time.', time: '6h ago', read: true, category: 'Home Visits' },
  { id: 'an6', title: 'New user account created', body: "Rohan Desai's patient account was created and verified.", time: '1d ago', read: true, category: 'Users & Roles' },
  { id: 'an7', title: 'Monthly report ready', body: 'The August 2026 organization-wide performance report is ready to export.', time: '2d ago', read: true, category: 'Reports' },
];
