// ── CaseMind AI · Demo dataset ──────────────────────────────────────────────
// Every institution, officer, complainant, case and statistic below is FICTIONAL
// demonstration data created for Smart India Hackathon 2026. No live AICTE
// system is connected. Dates are generated relative to "today" so the demo
// always shows a live, coherent picture.

const NOW = new Date();
const DAY = 86400000;
const pad = (n) => String(n).padStart(2, '0');
// ISO date (YYYY-MM-DD) N days ago; negative = future
export const d = (days) => {
  const t = new Date(NOW.getTime() - days * DAY);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
};
// ISO timestamp N days ago at hh:mm
export const dt = (days, h = 10, m = 0) => {
  const t = new Date(NOW.getTime() - days * DAY);
  t.setHours(h, m, 0, 0);
  return t.toISOString();
};

export const DEMO_NOTICE =
  'Demo Environment — every institution, officer, complainant, case file and statistic shown here is fictional demonstration data created for Smart India Hackathon 2026. No live AICTE system is connected.';

export const BUREAUS = [
  { code: 'PGRC', name: 'Public Grievance Redressal Cell', color: '#22D3EE' },
  { code: 'RB', name: 'Regulation Bureau', color: '#A78BFA' },
  { code: 'AB', name: 'Approval Bureau', color: '#FBBF24' },
  { code: 'EAB', name: 'Examination & Academic Bureau', color: '#34D399' },
  { code: 'FAB', name: 'Finance & Fee Arbitration Bureau', color: '#FB7185' },
];

export const BUREAU_MAP = Object.fromEntries(BUREAUS.map((b) => [b.code, b]));

export const CATEGORIES = [
  'Withheld Certificates',
  'Examination Issues',
  'Fee Disputes',
  'Approval-Related Concerns',
  'Infrastructure Problems',
  'Student Grievance',
];

export const STATUSES = ['Received', 'Under Process', 'Pending', 'Transferred', 'Escalated', 'Disposed'];
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

export const OFFICERS = [
  { id: 'OF-01', name: 'Priya Nair', bureau: 'PGRC', designation: 'Grievance Officer II', initials: 'PN' },
  { id: 'OF-02', name: 'Arjun Mehta', bureau: 'RB', designation: 'Regulation Officer I', initials: 'AM' },
  { id: 'OF-03', name: 'Kavitha Reddy', bureau: 'AB', designation: 'Approval Officer II', initials: 'KR' },
  { id: 'OF-04', name: 'Rohan Deshpande', bureau: 'EAB', designation: 'Examination Cell Lead', initials: 'RD' },
  { id: 'OF-05', name: 'Sanjay Gupta', bureau: 'FAB', designation: 'Fee Arbitration Officer', initials: 'SG' },
  { id: 'OF-06', name: 'Meera Iyer', bureau: 'PGRC', designation: 'Senior Grievance Officer', initials: 'MI' },
  { id: 'OF-07', name: 'Vikram Singh', bureau: 'RB', designation: 'Joint Regulation Officer', initials: 'VS' },
];

export const CURRENT_USER = { ...OFFICERS[0], role: 'Grievance Officer · PGRC' };

export const INSTITUTIONS = [
  {
    id: 'INST-0001', name: 'National Institute of Applied Technology, Madurai',
    aliases: ['NIAT Madurai', 'N.I.A.T. Madurai'],
    city: 'Madurai', state: 'Tamil Nadu', region: 'South', type: 'Engineering',
    approvalStatus: 'Approved', aishe: 'AISHE-33-0274', established: 2004, students: 4820, programs: 14,
    head: 'Dr. R. Selvakumar', phone: '+91 452 611 4471', email: 'office@niat-madurai.ac.in',
    lastInspection: d(120),
    notes: 'Subject of the active PGRC ↔ RB cross-bureau conflict (CF-2026-0031).',
  },
  {
    id: 'INST-0002', name: 'Sri Venkateswara Institute of Engineering and Research, Tirupati',
    aliases: ['SVIER Tirupati'],
    city: 'Tirupati', state: 'Andhra Pradesh', region: 'South', type: 'Engineering',
    approvalStatus: 'Approved', aishe: 'AISHE-28-0119', established: 2008, students: 6110, programs: 18,
    head: 'Dr. P. Sarala Devi', phone: '+91 877 224 8890', email: 'registrar@svier.ac.in',
    lastInspection: d(210),
    notes: 'Large examination-related volume this quarter.',
  },
  {
    id: 'INST-0003', name: 'Eastern Valley College of Technology, Bhubaneswar',
    aliases: ['EVCT Bhubaneswar'],
    city: 'Bhubaneswar', state: 'Odisha', region: 'East', type: 'Engineering',
    approvalStatus: 'Conditional', aishe: 'AISHE-21-0446', established: 2011, students: 2980, programs: 11,
    head: 'Dr. A. K. Mohanty', phone: '+91 674 330 2210', email: 'admin@evct.ac.in',
    lastInspection: d(75),
    notes: 'Conditional approval — infrastructure compliance under AB watch.',
  },
  {
    id: 'INST-0004', name: 'Deccan School of Engineering, Hyderabad',
    aliases: ['DSE Hyderabad'],
    city: 'Hyderabad', state: 'Telangana', region: 'South', type: 'Engineering',
    approvalStatus: 'Approved', aishe: 'AISHE-29-0087', established: 2002, students: 5240, programs: 15,
    head: 'Dr. M. A. Rahiman', phone: '+91 40 552 9018', email: 'principal@dsehyd.ac.in',
    lastInspection: d(160),
    notes: 'Recurring fee-dispute complaints since 2024.',
  },
  {
    id: 'INST-0005', name: 'Western Coast Institute of Technology, Pune',
    aliases: ['WCIT Pune'],
    city: 'Pune', state: 'Maharashtra', region: 'West', type: 'Engineering',
    approvalStatus: 'Approved', aishe: 'AISHE-18-0302', established: 2006, students: 4410, programs: 13,
    head: 'Dr. S. N. Kulkarni', phone: '+91 20 448 7712', email: 'director@wcitpune.edu.in',
    lastInspection: d(140),
    notes: 'Model coordination outcome — CR-2026-019 resolved jointly with RB.',
  },
  {
    id: 'INST-0006', name: "Indraprastha Women's Institute of Management, Delhi",
    aliases: ['IWIM Delhi'],
    city: 'New Delhi', state: 'Delhi', region: 'North', type: 'Management',
    approvalStatus: 'Approved', aishe: 'AISHE-07-0521', established: 2013, students: 2260, programs: 8,
    head: 'Dr. Nandita Bose', phone: '+91 11 663 5420', email: 'info@iwim.ac.in',
    lastInspection: d(95), notes: '',
  },
  {
    id: 'INST-0007', name: 'Ganga Plains Technical University, Kanpur',
    aliases: ['GPTU Kanpur'],
    city: 'Kanpur', state: 'Uttar Pradesh', region: 'Central', type: 'University',
    approvalStatus: 'Approval Under Review', aishe: 'AISHE-09-0016', established: 1998, students: 11240, programs: 34,
    head: 'Prof. A. N. Dixit', phone: '+91 512 990 2231', email: 'vc.office@gptu.ac.in',
    lastInspection: d(50),
    notes: 'Extension-of-approval review in progress with the Approval Bureau.',
  },
  {
    id: 'INST-0008', name: 'Coastal Karnataka Institute of Science, Mangaluru',
    aliases: ['CKIS Mangaluru'],
    city: 'Mangaluru', state: 'Karnataka', region: 'South', type: 'Engineering',
    approvalStatus: 'Approved', aishe: 'AISHE-32-0233', established: 2015, students: 1870, programs: 9,
    head: 'Dr. Vinay Shetty', phone: '+91 824 771 3364', email: 'admin@ckis.ac.in',
    lastInspection: d(110), notes: '',
  },
  {
    id: 'INST-0009', name: 'Shivalik Institute of Pharmaceutical Sciences, Dehradun',
    aliases: ['SIPS Dehradun'],
    city: 'Dehradun', state: 'Uttarakhand', region: 'North', type: 'Pharmacy',
    approvalStatus: 'Approved', aishe: 'AISHE-05-0158', established: 2009, students: 1240, programs: 6,
    head: 'Dr. H. S. Rawat', phone: '+91 135 220 8845', email: 'contact@sips.edu.in',
    lastInspection: d(130), notes: '',
  },
  {
    id: 'INST-0010', name: 'Vidarbha College of Engineering, Nagpur',
    aliases: ['VCE Nagpur'],
    city: 'Nagpur', state: 'Maharashtra', region: 'West', type: 'Engineering',
    approvalStatus: 'Notice Issued', aishe: 'AISHE-18-0377', established: 2007, students: 3560, programs: 10,
    head: 'Dr. J. P. Waghmare', phone: '+91 712 884 5502', email: 'registrar@vcenagpur.ac.in',
    lastInspection: d(40),
    notes: 'Show-cause notice issued after infrastructure inspection.',
  },
  {
    id: 'INST-0011', name: 'Trinity Institute of Business Studies, Kochi',
    aliases: ['TIBS Kochi'],
    city: 'Kochi', state: 'Kerala', region: 'South', type: 'Management',
    approvalStatus: 'Approved', aishe: 'AISHE-15-0190', established: 2012, students: 2010, programs: 7,
    head: 'Dr. Annie Thomas', phone: '+91 484 550 6123', email: 'hello@tibs.ac.in',
    lastInspection: d(175), notes: '',
  },
  {
    id: 'INST-0012', name: 'Marathwada Institute of Technology, Aurangabad',
    aliases: ['MIT Aurangabad', 'Marathwada Inst. of Tech.'],
    city: 'Aurangabad', state: 'Maharashtra', region: 'West', type: 'Engineering',
    approvalStatus: 'Approved', aishe: 'AISHE-18-0144', established: 2001, students: 3980, programs: 12,
    head: 'Dr. R. G. Pathak', phone: '+91 240 663 7719', email: 'office@mitaurangabad.ac.in',
    lastInspection: d(85), notes: '',
  },
  {
    id: 'INST-0013', name: 'North East Frontier Polytechnic, Guwahati',
    aliases: ['NEFP Guwahati'],
    city: 'Guwahati', state: 'Assam', region: 'North-East', type: 'Polytechnic',
    approvalStatus: 'Approved', aishe: 'AISHE-13-0095', established: 2016, students: 980, programs: 5,
    head: 'Smt. D. Bhattacharya', phone: '+91 361 447 2230', email: 'admin@nefp.ac.in',
    lastInspection: d(70), notes: '',
  },
  {
    id: 'INST-0014', name: 'Sabarmati Institute of Design, Ahmedabad',
    aliases: ['SID Ahmedabad'],
    city: 'Ahmedabad', state: 'Gujarat', region: 'West', type: 'Design',
    approvalStatus: 'Approved', aishe: 'AISHE-12-0268', established: 2018, students: 760, programs: 4,
    head: 'Shri K. R. Joshi', phone: '+91 79 330 9902', email: 'desk@sidahd.in',
    lastInspection: d(125), notes: '',
  },
];

export const MATCH_CANDIDATES = [
  {
    id: 'MC-101', submitted: d(4), status: 'pending', source: 'Registry ingestion · State submission feed',
    rawName: 'National Inst. of Applied Tech., Madurai', rawCity: 'Madurai', rawState: 'Tamil Nadu', rawAishe: '—',
    matchesInstitution: 'INST-0001', confidence: 0.93,
    evidence: [
      { label: 'Name similarity', detail: 'Token overlap on "National / Applied / Technology / Madurai" — 93% string similarity', strength: 0.93 },
      { label: 'Location match', detail: 'City "Madurai" and state "Tamil Nadu" match the registry record exactly', strength: 1.0 },
      { label: 'Contact fingerprint', detail: 'Phone last-4 digits 4471 match the registry contact for INST-0001', strength: 0.8 },
      { label: 'Complaint linkage', detail: 'Two active complaints reference both spellings in their case narratives', strength: 0.86 },
    ],
  },
  {
    id: 'MC-102', submitted: d(6), status: 'pending', source: 'Registry ingestion · State submission feed',
    rawName: 'Deccan School of Engg. & Technology', rawCity: 'Hyderabad', rawState: 'Telangana', rawAishe: '—',
    matchesInstitution: 'INST-0004', confidence: 0.88,
    evidence: [
      { label: 'Name similarity', detail: 'Expanded abbreviation "Engg." → "Engineering"; 88% string similarity', strength: 0.88 },
      { label: 'Location match', detail: 'City "Hyderabad" matches exactly; state match "Telangana"', strength: 1.0 },
      { label: 'AISHE proximity', detail: 'Nearest registry AISHE code within the same district code block', strength: 0.72 },
    ],
  },
  {
    id: 'MC-103', submitted: d(7), status: 'pending', source: 'Registry ingestion · State submission feed',
    rawName: 'Eastern Valley Institute of Technology', rawCity: 'Ranchi', rawState: 'Jharkhand', rawAishe: '—',
    matchesInstitution: 'INST-0003', confidence: 0.46,
    evidence: [
      { label: 'Name similarity', detail: 'Token overlap "Eastern / Valley / Technology" — 74% string similarity', strength: 0.74 },
      { label: 'Location mismatch', detail: 'City "Ranchi" does not match "Bhubaneswar"; state mismatch (Jharkhand vs Odisha)', strength: 0.1 },
      { label: 'No shared activity', detail: 'No complaints, inspections or contact fingerprints shared with INST-0003', strength: 0.2 },
    ],
  },
];

const T = (ts, actor, type, text) => ({ ts, actor, type, text });

export const COMPLAINTS = [
  {
    id: 'C-142', caseId: 'PGRC-2026-0142', institutionId: 'INST-0001',
    category: 'Withheld Certificates', bureau: 'PGRC', priority: 'High', officerId: 'OF-01',
    complainant: { name: 'Ananya Sharma', type: 'Student' },
    subject: 'Original certificates withheld pending fee arrears settlement',
    description:
      'I completed B.Tech (ECE) in 2023. The institution is withholding my original degree and migration certificates, citing an alleged fee arrears of ₹38,000 that my parents have already paid — receipts are attached. Without the certificates I cannot join my assigned position. Several classmates from the same batch face the same issue.',
    status: 'Under Process', submitted: d(10), updated: d(2), slaDue: d(-4),
    docs: [
      { name: 'Original fee receipts (2023–2026)', requestedOn: d(8), status: 'Received' },
    ],
    conflictId: 'CF-2026-0031', coordinationIds: [],
    timeline: [
      T(dt(10, 9, 14), 'Ananya Sharma', 'received', 'Complaint registered in PGRC through the public grievance portal.'),
      T(dt(10, 15, 40), 'Priya Nair · PGRC', 'ack', 'Complaint acknowledged. Case assigned to Grievance Officer II, Priya Nair.'),
      T(dt(8, 11, 2), 'Priya Nair · PGRC', 'docs', 'Document request issued: Original fee receipts (2023–2026).'),
      T(dt(5, 10, 26), 'Ananya Sharma', 'note', 'Fee receipts uploaded by complainant.'),
      T(dt(2, 12, 5), 'Priya Nair · PGRC', 'status', 'Status moved to Under Process — verifying arrears claim against institutional records.'),
    ],
    notes: [
      { ts: d(5), author: 'Priya Nair', text: 'Receipts appear genuine; institution ledger must be verified. RB has an open case on the same institution — check before requesting approval records.' },
    ],
  },
  {
    id: 'C-087', caseId: 'RB-2026-0087', institutionId: 'INST-0001',
    category: 'Approval-Related Concerns', bureau: 'RB', priority: 'Medium', officerId: 'OF-02',
    complainant: { name: 'HoD, Dept. of ECE (via RB desk)', type: 'Staff' },
    subject: 'Approval records discrepancy affecting ECE 2023–24 batch certification',
    description:
      'Intake records for the ECE programme (2023–24) do not reconcile with the approval letters on file. The institution has been unable to produce consistent approval documentation, which is affecting certificate issuance for the batch.',
    status: 'Under Process', submitted: d(16), updated: d(6), slaDue: d(-12),
    docs: [
      { name: 'AICTE approval letters & affiliation records', requestedOn: d(13), status: 'Awaited' },
    ],
    conflictId: 'CF-2026-0031', coordinationIds: [],
    timeline: [
      T(dt(16, 10, 0), 'RB Desk', 'received', 'Case registered with the Regulation Bureau.'),
      T(dt(13, 14, 22), 'Arjun Mehta · RB', 'docs', 'Document request issued: AICTE approval letters & affiliation records.'),
      T(dt(8, 9, 48), 'Arjun Mehta · RB', 'note', 'Institution requested a 10-day extension for producing approval records.'),
      T(dt(6, 16, 10), 'Arjun Mehta · RB', 'status', 'Status remains Under Process — extension granted.'),
    ],
    notes: [
      { ts: d(8), author: 'Arjun Mehta', text: 'Annexure lists affected students incl. Ananya Sharma (ECE, 2023 batch).' },
    ],
  },
  {
    id: 'C-054', caseId: 'EAB-2026-0054', institutionId: 'INST-0002',
    category: 'Examination Issues', bureau: 'EAB', priority: 'High', officerId: 'OF-04',
    complainant: { name: 'Batch representatives (62 students)', type: 'Student' },
    subject: 'Mass revaluation delay affecting 62 final-year students',
    description: 'Revaluation results for Semester VII have been pending for 11 weeks, delaying higher-studies applications for 62 students.',
    status: 'Under Process', submitted: d(13), updated: d(5), slaDue: d(-8),
    docs: [{ name: 'Revaluation application register & fee challans', requestedOn: d(12), status: 'Received' }],
    conflictId: 'CF-2026-0028', coordinationIds: [],
    timeline: [
      T(dt(13, 9, 30), 'EAB Desk', 'received', 'Complaint registered with the Examination & Academic Bureau.'),
      T(dt(12, 11, 15), 'Rohan Deshpande · EAB', 'docs', 'Document request issued: Revaluation application register & fee challans.'),
      T(dt(5, 14, 0), 'Rohan Deshpande · EAB', 'status', 'University confirmed revaluation window extended by two weeks.'),
    ],
    notes: [],
  },
  {
    id: 'C-139', caseId: 'PGRC-2026-0139', institutionId: 'INST-0002',
    category: 'Student Grievance', bureau: 'PGRC', priority: 'High', officerId: 'OF-06',
    complainant: { name: 'Kiran Yadav', type: 'Student' },
    subject: 'Results withheld after fee payment dispute',
    description: 'Semester VII result withheld citing an unpaid examination fee that my bank statement shows was paid on time. The same delay is hitting my whole class.',
    status: 'Pending', submitted: d(9), updated: d(4), slaDue: d(-6),
    docs: [{ name: 'Bank statement & fee challan', requestedOn: d(7), status: 'Received' }],
    conflictId: 'CF-2026-0028', coordinationIds: [],
    timeline: [
      T(dt(9, 8, 20), 'Kiran Yadav', 'received', 'Complaint registered in PGRC.'),
      T(dt(7, 10, 44), 'Meera Iyer · PGRC', 'docs', 'Document request issued: Bank statement & fee challan.'),
      T(dt(4, 9, 12), 'Meera Iyer · PGRC', 'status', 'Status moved to Pending — appears linked to the wider revaluation delay.'),
    ],
    notes: [],
  },
  {
    id: 'C-021', caseId: 'FAB-2026-0021', institutionId: 'INST-0004',
    category: 'Fee Disputes', bureau: 'FAB', priority: 'Medium', officerId: 'OF-05',
    complainant: { name: 'Raghavendra Parents’ Association', type: 'Association' },
    subject: 'Unscheduled fee revision for the current batch',
    description: 'Institution increased tuition by 22% mid-programme without regulatory approval or prior notice, affecting 300+ families.',
    status: 'Under Process', submitted: d(25), updated: d(7), slaDue: d(-1),
    docs: [{ name: 'Fee structure approval correspondence', requestedOn: d(21), status: 'Awaited' }],
    conflictId: 'CF-2026-0029', coordinationIds: [],
    timeline: [
      T(dt(25, 12, 0), 'FAB Desk', 'received', 'Case registered with the Finance & Fee Arbitration Bureau.'),
      T(dt(21, 15, 30), 'Sanjay Gupta · FAB', 'docs', 'Document request issued: Fee structure approval correspondence.'),
      T(dt(7, 10, 0), 'Sanjay Gupta · FAB', 'status', 'Awaiting institution response; reminder issued.'),
    ],
    notes: [],
  },
  {
    id: 'C-131', caseId: 'PGRC-2026-0131', institutionId: 'INST-0004',
    category: 'Fee Disputes', bureau: 'PGRC', priority: 'Medium', officerId: 'OF-01',
    complainant: { name: 'Divya M.', type: 'Parent' },
    subject: 'Hostel & transport refund pending after withdrawal',
    description: 'Daughter withdrew in week 2 of the term; hostel and transport fees (₹86,000) remain unrefunded after 4 months despite written assurances.',
    status: 'Disposed', submitted: d(31), updated: d(3), slaDue: d(-6),
    docs: [],
    conflictId: 'CF-2026-0029', coordinationIds: [],
    timeline: [
      T(dt(31, 9, 0), 'Divya M.', 'received', 'Complaint registered in PGRC.'),
      T(dt(23, 11, 30), 'Priya Nair · PGRC', 'status', 'Status moved to Under Process; institution response sought.'),
      T(dt(3, 16, 45), 'Priya Nair · PGRC', 'resolve', 'Refund of ₹86,000 confirmed by institution. Case disposed with satisfaction note.'),
    ],
    notes: [],
  },
  {
    id: 'C-128', caseId: 'PGRC-2026-0128', institutionId: 'INST-0003',
    category: 'Infrastructure Problems', bureau: 'PGRC', priority: 'High', officerId: 'OF-06',
    complainant: { name: 'Anonymous (Hostel Warden)', type: 'Staff' },
    subject: 'Hostel block safety: electrical wiring hazards in Block B',
    description: 'Exposed wiring and repeated short-circuits in a 400-capacity boys’ hostel block. Fire officer flagged the block in an internal memo last month.',
    status: 'Escalated', submitted: d(34), updated: d(4), slaDue: d(6),
    docs: [{ name: 'Internal fire-safety memo', requestedOn: d(31), status: 'Received' }],
    conflictId: 'CF-2026-0030', coordinationIds: [],
    timeline: [
      T(dt(34, 8, 15), 'Anonymous', 'received', 'Complaint registered in PGRC.'),
      T(dt(31, 14, 20), 'Meera Iyer · PGRC', 'docs', 'Document request issued: Internal fire-safety memo.'),
      T(dt(15, 10, 5), 'Meera Iyer · PGRC', 'escalate', 'Escalated to Joint Secretary — institution missed the compliance deadline.'),
      T(dt(4, 9, 40), 'Meera Iyer · PGRC', 'status', 'Escalation reminder issued; AB parallel case noted.'),
    ],
    notes: [],
  },
  {
    id: 'C-067', caseId: 'AB-2026-0067', institutionId: 'INST-0003',
    category: 'Approval-Related Concerns', bureau: 'AB', priority: 'Critical', officerId: 'OF-03',
    complainant: { name: 'AB Field Inspection Cell', type: 'Internal' },
    subject: 'Conditional approval conditions not met — lab infrastructure',
    description: 'April inspection found 6 of 10 mandatory conditions unmet, including workshop electrical safety and lab capacity shortfalls.',
    status: 'Under Process', submitted: d(21), updated: d(12), slaDue: d(-18),
    docs: [{ name: 'Inspection report & compliance photographs', requestedOn: d(20), status: 'Received' }],
    conflictId: 'CF-2026-0030', coordinationIds: [],
    timeline: [
      T(dt(21, 9, 0), 'AB Cell', 'received', 'Compliance case opened following field inspection.'),
      T(dt(20, 10, 30), 'Kavitha Reddy · AB', 'docs', 'Document request issued: Inspection report & compliance photographs.'),
      T(dt(12, 12, 0), 'Kavitha Reddy · AB', 'status', 'Institution compliance hearing scheduled for next week.'),
    ],
    notes: [],
  },
  {
    id: 'C-049', caseId: 'EAB-2026-0049', institutionId: 'INST-0005',
    category: 'Examination Issues', bureau: 'EAB', priority: 'Medium', officerId: 'OF-04',
    complainant: { name: 'Aditya Kulkarni', type: 'Student' },
    subject: 'Transcript issuance delays for foreign-university applications',
    description: 'Official transcripts promised in 15 days have taken 9 weeks, causing missed application deadlines for 14 students.',
    status: 'Disposed', submitted: d(37), updated: d(23), slaDue: d(-23),
    docs: [],
    conflictId: 'CF-2026-0026', coordinationIds: ['CR-2026-019'],
    timeline: [
      T(dt(37, 10, 0), 'Aditya Kulkarni', 'received', 'Complaint registered with EAB.'),
      T(dt(30, 11, 0), 'Rohan Deshpande · EAB', 'coordination', 'Coordinated with RB (CR-2026-019) — joint document strategy adopted.'),
      T(dt(23, 15, 20), 'Rohan Deshpande · EAB', 'resolve', 'All pending transcripts issued; process formalised. Case disposed.'),
    ],
    notes: [],
  },
  {
    id: 'C-081', caseId: 'RB-2026-0081', institutionId: 'INST-0005',
    category: 'Approval-Related Concerns', bureau: 'RB', priority: 'Low', officerId: 'OF-07',
    complainant: { name: 'Office of the Director, WCIT', type: 'Staff' },
    subject: 'Nomenclature correction request for B.Tech programme',
    description: 'Requesting correction of programme nomenclature on the approval record from "B.Tech (Mechatronics)" to the sanctioned "B.Tech (Mechanical & Automation)".',
    status: 'Disposed', submitted: d(33), updated: d(25), slaDue: d(-25),
    docs: [],
    conflictId: 'CF-2026-0026', coordinationIds: ['CR-2026-019'],
    timeline: [
      T(dt(33, 9, 40), 'RB Desk', 'received', 'Case registered with the Regulation Bureau.'),
      T(dt(27, 12, 0), 'Vikram Singh · RB', 'coordination', 'Acknowledged joint document strategy under CR-2026-019 with EAB.'),
      T(dt(25, 10, 15), 'Vikram Singh · RB', 'resolve', 'Nomenclature corrected on the approval record. Case disposed.'),
    ],
    notes: [],
  },
  {
    id: 'C-071', caseId: 'AB-2026-0071', institutionId: 'INST-0007',
    category: 'Approval-Related Concerns', bureau: 'AB', priority: 'High', officerId: 'OF-03',
    complainant: { name: 'AB Documentation Cell', type: 'Internal' },
    subject: 'Extension of approval — missing faculty records',
    description: 'Extension-of-approval application lacks faculty qualification records for 3 departments; repeated reminders unanswered.',
    status: 'Under Process', submitted: d(11), updated: d(3), slaDue: d(-17),
    docs: [{ name: 'Faculty qualification records (CSE, ECE, MBA)', requestedOn: d(10), status: 'Awaited' }],
    conflictId: null, coordinationIds: ['CR-2026-021'],
    timeline: [
      T(dt(11, 10, 0), 'AB Cell', 'received', 'Compliance case opened.'),
      T(dt(10, 11, 30), 'Kavitha Reddy · AB', 'docs', 'Document request issued: Faculty qualification records.'),
      T(dt(3, 9, 0), 'Kavitha Reddy · AB', 'coordination', 'PGRC grievance history requested via CR-2026-021.'),
    ],
    notes: [],
  },
  {
    id: 'C-135', caseId: 'PGRC-2026-0135', institutionId: 'INST-0007',
    category: 'Student Grievance', bureau: 'PGRC', priority: 'Medium', officerId: 'OF-06',
    complainant: { name: 'Farhan Qureshi', type: 'Student' },
    subject: 'Pending scholarships after affiliation change',
    description: 'State scholarship disbursements stopped after the university changed affiliation status; 200+ students affected this semester.',
    status: 'Received', submitted: d(7), updated: d(7), slaDue: d(-14),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(7, 13, 25), 'Farhan Qureshi', 'received', 'Complaint registered in PGRC.'),
    ],
    notes: [],
  },
  {
    id: 'C-057', caseId: 'EAB-2026-0057', institutionId: 'INST-0008',
    category: 'Infrastructure Problems', bureau: 'EAB', priority: 'Medium', officerId: 'OF-04',
    complainant: { name: 'Student Council, CKIS', type: 'Student' },
    subject: 'Computing lab capacity shortfall for data-science elective',
    description: 'Only 40 workstations for 140 enrolled students in the data-science elective; practicals running at half capacity.',
    status: 'Received', submitted: d(5), updated: d(5), slaDue: d(-19),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(5, 10, 10), 'Student Council, CKIS', 'received', 'Complaint registered with EAB.'),
    ],
    notes: [],
  },
  {
    id: 'C-073', caseId: 'AB-2026-0073', institutionId: 'INST-0008',
    category: 'Approval-Related Concerns', bureau: 'AB', priority: 'Low', officerId: 'OF-03',
    complainant: { name: 'AB Compliance Desk', type: 'Internal' },
    subject: 'Intake variance report submission overdue',
    description: 'Annual intake variance report has not been filed; automatic reminder cycle initiated.',
    status: 'Pending', submitted: d(15), updated: d(8), slaDue: d(-13),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(15, 9, 0), 'AB Desk', 'received', 'Compliance follow-up opened.'),
      T(dt(8, 15, 0), 'Kavitha Reddy · AB', 'status', 'Status moved to Pending — institution promised filing shortly.'),
    ],
    notes: [],
  },
  {
    id: 'C-121', caseId: 'PGRC-2026-0121', institutionId: 'INST-0010',
    category: 'Infrastructure Problems', bureau: 'PGRC', priority: 'Critical', officerId: 'OF-01',
    complainant: { name: 'Faculty Representative, VCE', type: 'Staff' },
    subject: 'Structural cracks in academic Block C',
    description: 'Load-bearing cracks detected in academic Block C after recent construction nearby. 1,200 students attend classes in this block daily.',
    status: 'Escalated', submitted: d(29), updated: d(2), slaDue: d(4),
    docs: [{ name: 'Structural engineer’s assessment report', requestedOn: d(28), status: 'Received' }],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(29, 7, 50), 'Faculty Representative, VCE', 'received', 'Complaint registered in PGRC.'),
      T(dt(22, 11, 0), 'Priya Nair · PGRC', 'status', 'Institution ordered to restrict Block C pending assessment.'),
      T(dt(10, 9, 30), 'Priya Nair · PGRC', 'escalate', 'Escalated — institution failed to submit remediation plan by deadline.'),
      T(dt(2, 8, 0), 'Priya Nair · PGRC', 'status', 'SLA breached; listed as priority alert on the command dashboard.'),
    ],
    notes: [],
  },
  {
    id: 'C-124', caseId: 'PGRC-2026-0124', institutionId: 'INST-0010',
    category: 'Student Grievance', bureau: 'PGRC', priority: 'High', officerId: 'OF-06',
    complainant: { name: 'Sneha Thakre', type: 'Student' },
    subject: 'Withholding of internship letters by placement cell',
    description: 'Placement cell is withholding internship offer letters until students sign a "full-semester availability" bond.',
    status: 'Under Process', submitted: d(23), updated: d(9), slaDue: d(-5),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(23, 10, 40), 'Sneha Thakre', 'received', 'Complaint registered in PGRC.'),
      T(dt(9, 14, 10), 'Meera Iyer · PGRC', 'status', 'Institution response received; verifying bond legality.'),
    ],
    notes: [],
  },
  {
    id: 'C-018', caseId: 'FAB-2026-0018', institutionId: 'INST-0012',
    category: 'Fee Disputes', bureau: 'FAB', priority: 'High', officerId: 'OF-05',
    complainant: { name: 'Anonymous (Parent)', type: 'Parent' },
    subject: 'Capitation fee allegation at admission stage',
    description: 'Alleged demand of ₹1.5 lakh as "development contribution" outside the official fee structure at the admission stage.',
    status: 'Under Process', submitted: d(35), updated: d(10), slaDue: d(-3),
    docs: [{ name: 'Admission fee receipts & correspondence', requestedOn: d(31), status: 'Received' }],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(35, 9, 20), 'Anonymous (Parent)', 'received', 'Case registered with FAB.'),
      T(dt(31, 11, 0), 'Sanjay Gupta · FAB', 'docs', 'Document request issued: Admission fee receipts & correspondence.'),
      T(dt(10, 16, 30), 'Sanjay Gupta · FAB', 'status', 'Forensic review of receipts under way.'),
    ],
    notes: [],
  },
  {
    id: 'C-119', caseId: 'PGRC-2026-0119', institutionId: 'INST-0012',
    category: 'Withheld Certificates', bureau: 'PGRC', priority: 'Medium', officerId: 'OF-06',
    complainant: { name: 'Omkar Deshmukh', type: 'Student' },
    subject: 'TC and migration certificate delay',
    description: 'Transfer certificate promised in 30 days pending for 3 months, blocking a state-level sports admission.',
    status: 'Disposed', submitted: d(39), updated: d(16), slaDue: d(-16),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(39, 10, 0), 'Omkar Deshmukh', 'received', 'Complaint registered in PGRC.'),
      T(dt(16, 12, 0), 'Meera Iyer · PGRC', 'resolve', 'TC and migration certificate issued. Case disposed.'),
    ],
    notes: [],
  },
  {
    id: 'C-052', caseId: 'EAB-2026-0052', institutionId: 'INST-0011',
    category: 'Examination Issues', bureau: 'EAB', priority: 'Medium', officerId: 'OF-04',
    complainant: { name: 'Anjali Menon', type: 'Student' },
    subject: 'Revaluation results inconsistency across centres',
    description: 'Same answer scripts show 18-mark differences between revaluation centres; transparency concerns for the MBA programme.',
    status: 'Under Process', submitted: d(17), updated: d(6), slaDue: d(-11),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(17, 9, 45), 'Anjali Menon', 'received', 'Complaint registered with EAB.'),
      T(dt(6, 11, 20), 'Rohan Deshpande · EAB', 'status', 'Third-party moderation requested from the university.'),
    ],
    notes: [],
  },
  {
    id: 'C-133', caseId: 'PGRC-2026-0133', institutionId: 'INST-0011',
    category: 'Student Grievance', bureau: 'PGRC', priority: 'Low', officerId: 'OF-01',
    complainant: { name: 'Rahul Nambiar', type: 'Student' },
    subject: 'Anti-ragging follow-up request',
    description: 'Requesting a status update on an anti-ragging committee complaint filed recently; no hearing date communicated.',
    status: 'Received', submitted: d(8), updated: d(8), slaDue: d(-13),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(8, 12, 15), 'Rahul Nambiar', 'received', 'Complaint registered in PGRC.'),
    ],
    notes: [],
  },
  {
    id: 'C-055', caseId: 'EAB-2026-0055', institutionId: 'INST-0013',
    category: 'Examination Issues', bureau: 'EAB', priority: 'Critical', officerId: 'OF-04',
    complainant: { name: 'Anonymous (Examination Invigilator)', type: 'Staff' },
    subject: 'Question paper leak allegation, Semester VI',
    description: 'Alleged leak of Semester VI Electrical Engineering paper circulating on messaging apps hours before the exam.',
    status: 'Escalated', submitted: d(11), updated: d(2), slaDue: d(2),
    docs: [{ name: 'Sealed question-paper custody log', requestedOn: d(10), status: 'Awaited' }],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(11, 8, 5), 'Anonymous (Examination Invigilator)', 'received', 'Case registered with EAB under confidentiality protocol.'),
      T(dt(10, 9, 0), 'Rohan Deshpande · EAB', 'docs', 'Document request issued: Sealed question-paper custody log.'),
      T(dt(6, 14, 0), 'Rohan Deshpande · EAB', 'escalate', 'Escalated to Examinations Board — re-examination recommended for affected paper.'),
      T(dt(2, 9, 30), 'Rohan Deshpande · EAB', 'status', 'Re-examination scheduled; vigilance review under way.'),
    ],
    notes: [],
  },
  {
    id: 'C-069', caseId: 'AB-2026-0069', institutionId: 'INST-0009',
    category: 'Approval-Related Concerns', bureau: 'AB', priority: 'Medium', officerId: 'OF-03',
    complainant: { name: 'SIPS Compliance Desk', type: 'Internal' },
    subject: 'PCI approval renewal documentation',
    description: 'Pharmacy Council renewal documentation submitted incomplete; missing infrastructure annexure.',
    status: 'Disposed', submitted: d(27), updated: d(11), slaDue: d(-11),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(27, 10, 30), 'AB Desk', 'received', 'Compliance case opened.'),
      T(dt(11, 11, 45), 'Kavitha Reddy · AB', 'resolve', 'Complete annexure received and verified. Case disposed.'),
    ],
    notes: [],
  },
  {
    id: 'C-137', caseId: 'PGRC-2026-0137', institutionId: 'INST-0006',
    category: 'Student Grievance', bureau: 'PGRC', priority: 'Medium', officerId: 'OF-06',
    complainant: { name: 'Name withheld (Student)', type: 'Student' },
    subject: 'Hostel warden conduct complaint',
    description: 'Complaint regarding evening curfew enforcement conduct; mediation requested rather than formal action.',
    status: 'Under Process', submitted: d(10), updated: d(4), slaDue: d(-15),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(10, 15, 0), 'Name withheld (Student)', 'received', 'Complaint registered in PGRC.'),
      T(dt(4, 10, 30), 'Meera Iyer · PGRC', 'status', 'Mediation session scheduled with student counsellor present.'),
    ],
    notes: [],
  },
  {
    id: 'C-023', caseId: 'FAB-2026-0023', institutionId: 'INST-0002',
    category: 'Fee Disputes', bureau: 'FAB', priority: 'Low', officerId: 'OF-05',
    complainant: { name: 'Harish Kumar', type: 'Parent' },
    subject: 'Duplicate payment of examination fee',
    description: 'Examination fee paid twice due to a gateway error; refund not yet processed.',
    status: 'Received', submitted: d(4), updated: d(4), slaDue: d(-20),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(4, 11, 5), 'Harish Kumar', 'received', 'Case registered with FAB.'),
    ],
    notes: [],
  },
  {
    id: 'C-084', caseId: 'RB-2026-0084', institutionId: 'INST-0014',
    category: 'Approval-Related Concerns', bureau: 'RB', priority: 'Low', officerId: 'OF-07',
    complainant: { name: 'Office of the Director, SID', type: 'Staff' },
    subject: 'Design programme nomenclature alignment',
    description: 'Request to align B.Des (Spatial Design) nomenclature with the UGC framework record.',
    status: 'Transferred', submitted: d(19), updated: d(9), slaDue: d(-16),
    docs: [],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(19, 9, 15), 'AB Desk', 'received', 'Case received with the Approval Bureau.'),
      T(dt(9, 13, 40), 'Kavitha Reddy · AB', 'transfer', 'Transferred to the Regulation Bureau — nomenclature falls under RB mandate.'),
      T(dt(9, 13, 41), 'RB Desk', 'status', 'Case accepted by RB; ownership updated without merging history.'),
    ],
    notes: [],
  },
  {
    id: 'C-126', caseId: 'PGRC-2026-0126', institutionId: 'INST-0006',
    category: 'Infrastructure Problems', bureau: 'PGRC', priority: 'High', officerId: 'OF-01',
    complainant: { name: 'Hostel Committee, IWIM', type: 'Student' },
    subject: 'Fire-safety equipment expiry across hostel blocks',
    description: '42 of 80 fire extinguishers show expired service dates; sprinkler audit overdue since January.',
    status: 'Pending', submitted: d(25), updated: d(7), slaDue: d(-2),
    docs: [{ name: 'Fire-safety service register', requestedOn: d(22), status: 'Received' }],
    conflictId: null, coordinationIds: [],
    timeline: [
      T(dt(25, 9, 50), 'Hostel Committee, IWIM', 'received', 'Complaint registered in PGRC.'),
      T(dt(7, 15, 20), 'Priya Nair · PGRC', 'status', 'Status moved to Pending — awaiting vendor replacement schedule from institution.'),
    ],
    notes: [],
  },
];

export const CONFLICTS = [
  {
    id: 'CF-2026-0031', type: 'Overlapping Document Request',
    caseA: 'PGRC-2026-0142', caseB: 'RB-2026-0087', institutionId: 'INST-0001',
    confidence: 0.87, status: 'detected', detected: d(3), updated: d(3),
    summary: 'PGRC document request on the withheld-certificates case would duplicate the approval records already requested by the Regulation Bureau.',
    evidence: [
      { label: 'Institution match', weight: 25, strength: 1.0, detail: 'Both cases reference National Institute of Applied Technology, Madurai (INST-0001).' },
      { label: 'Document request overlap', weight: 35, strength: 0.92, detail: 'PGRC is about to request "AICTE approval letters & affiliation records" — the identical set was requested by RB 6 days earlier and is still awaited.' },
      { label: 'Thematic similarity', weight: 20, strength: 0.84, detail: 'Certificate withholding in the PGRC case is linked to the approval discrepancy under review in the RB case.' },
      { label: 'Complainant linkage', weight: 10, strength: 0.7, detail: 'Ananya Sharma appears in the affected-students annexure of the RB case.' },
      { label: 'Timeline proximity', weight: 10, strength: 0.88, detail: 'Both document requests fall within an 8-day window on the same record set.' },
    ],
    actions: [],
  },
  {
    id: 'CF-2026-0028', type: 'Possible Duplicate Complaint',
    caseA: 'EAB-2026-0054', caseB: 'PGRC-2026-0139', institutionId: 'INST-0002',
    confidence: 0.72, status: 'under-review', detected: d(7), updated: d(4),
    summary: 'Two complaints from the same cohort describe the results-withholding episode; EAB is verifying whether one case subsumes the other.',
    evidence: [
      { label: 'Institution match', weight: 25, strength: 1.0, detail: 'Both cases reference Sri Venkateswara Institute of Engineering and Research, Tirupati.' },
      { label: 'Complainant overlap', weight: 30, strength: 0.78, detail: 'PGRC complainant belongs to the same 62-student cohort named in the EAB case.' },
      { label: 'Thematic similarity', weight: 25, strength: 0.82, detail: 'Results withheld ↔ revaluation delay describe the same examination cycle.' },
      { label: 'Timeline proximity', weight: 20, strength: 0.6, detail: 'Complaints filed 3 days apart on the same examination cycle.' },
    ],
    actions: [],
  },
  {
    id: 'CF-2026-0030', type: 'Related Infrastructure & Approval Case',
    caseA: 'PGRC-2026-0128', caseB: 'AB-2026-0067', institutionId: 'INST-0003',
    confidence: 0.54, status: 'flagged', detected: d(10), updated: d(4),
    summary: 'Hostel electrical hazards (PGRC) may be a subset of the conditional-approval infrastructure lapses under AB review.',
    evidence: [
      { label: 'Institution match', weight: 25, strength: 1.0, detail: 'Both cases reference Eastern Valley College of Technology, Bhubaneswar.' },
      { label: 'Thematic similarity', weight: 30, strength: 0.62, detail: 'Electrical safety hazards appear in the AB inspection findings as a subset of the conditional approval lapses.' },
      { label: 'Evidence overlap', weight: 25, strength: 0.5, detail: 'PGRC fire-safety memo mirrors the AB inspection photographs (same block, same month).' },
      { label: 'Timeline proximity', weight: 20, strength: 0.55, detail: 'Findings recorded within 3 weeks of each other.' },
    ],
    actions: [],
  },
  {
    id: 'CF-2026-0026', type: 'Overlapping Document Request',
    caseA: 'EAB-2026-0049', caseB: 'RB-2026-0081', institutionId: 'INST-0005',
    confidence: 0.91, status: 'coordinated', detected: d(25), updated: d(13),
    summary: 'Model outcome — transcript and nomenclature cases jointly handled through CR-2026-019; single document strategy adopted.',
    evidence: [
      { label: 'Institution match', weight: 25, strength: 1.0, detail: 'Both cases reference Western Coast Institute of Technology, Pune.' },
      { label: 'Document request overlap', weight: 35, strength: 0.95, detail: 'Both bureaus required the academic records register for the same programme.' },
      { label: 'Thematic similarity', weight: 20, strength: 0.8, detail: 'Transcript issuance delays and nomenclature correction share the academic-records root cause.' },
      { label: 'Timeline proximity', weight: 20, strength: 0.9, detail: 'Requests issued within 4 days of each other.' },
    ],
    actions: [
      { ts: d(22), kind: 'coordinated', actor: 'Rohan Deshpande · EAB', detail: 'Coordination request CR-2026-019 sent to RB.' },
      { ts: d(13), kind: 'resolved', actor: 'Rohan Deshpande · EAB', detail: 'Joint document strategy completed; both cases disposed. Conflict closed as Coordinated.' },
    ],
  },
  {
    id: 'CF-2026-0029', type: 'Related Fee Cases',
    caseA: 'FAB-2026-0021', caseB: 'PGRC-2026-0131', institutionId: 'INST-0004',
    confidence: 0.68, status: 'dismissed', detected: d(18), updated: d(14),
    summary: 'Flagged for shared fee themes at Deccan School of Engineering; reviewed and dismissed as unrelated.',
    evidence: [
      { label: 'Institution match', weight: 25, strength: 1.0, detail: 'Both cases reference Deccan School of Engineering, Hyderabad.' },
      { label: 'Thematic similarity', weight: 30, strength: 0.55, detail: 'Both involve fee matters, but different programmes and years.' },
      { label: 'No shared requests', weight: 25, strength: 0.1, detail: 'No document, evidence or complainant overlap found.' },
      { label: 'Timeline distance', weight: 20, strength: 0.2, detail: 'Cases concern different academic years respectively.' },
    ],
    actions: [
      { ts: d(14), kind: 'dismissed', actor: 'Sanjay Gupta · FAB', detail: 'Dismissed as false positive — different academic years and no shared requests. PGRC refund case handled independently.' },
    ],
  },
];

export const COORDINATIONS = [
  {
    id: 'CR-2026-019', fromBureau: 'PGRC', toBureau: 'RB', initiatorName: 'Priya Nair',
    subject: 'WCIT academic records — joint document strategy',
    priority: 'High', linkedCases: ['EAB-2026-0049', 'RB-2026-0081'], conflictId: 'CF-2026-0026',
    status: 'Resolved', initiated: d(22), updated: d(13),
    messages: [
      { ts: dt(22, 10, 0), from: 'PGRC · Priya Nair', kind: 'request', text: 'Our transcript case and your nomenclature case both need the WCIT academic records register. Proposing a single joint document strategy to avoid duplicate requests to the institution.' },
      { ts: dt(21, 9, 30), from: 'RB · Arjun Mehta', kind: 'ack', text: 'Acknowledged. Agreed — we will stand down our separate request and adopt the joint register.' },
      { ts: dt(17, 14, 0), from: 'RB · Vikram Singh', kind: 'reply', text: 'Register received and shared. Our nomenclature correction can proceed on the verified record.' },
      { ts: dt(13, 15, 20), from: 'PGRC · Priya Nair', kind: 'resolve', text: 'Both cases disposed on the shared record. Marking coordination resolved — thank you, team.' },
    ],
  },
  {
    id: 'CR-2026-018', fromBureau: 'EAB', toBureau: 'PGRC', initiatorName: 'Rohan Deshpande',
    subject: 'TIBS revaluation grievances — joint response draft',
    priority: 'Medium', linkedCases: ['EAB-2026-0052', 'PGRC-2026-0133'], conflictId: null,
    status: 'In Discussion', initiated: d(11), updated: d(5),
    messages: [
      { ts: dt(11, 11, 30), from: 'EAB · Rohan Deshpande', kind: 'request', text: 'We are drafting a joint response on the TIBS revaluation consistency issue. Sharing our moderation findings — please align your communication to affected students.' },
      { ts: dt(9, 9, 15), from: 'PGRC · Priya Nair', kind: 'ack', text: 'Acknowledged. Reviewing your findings with the grievance notes on file.' },
      { ts: dt(7, 16, 45), from: 'PGRC · Meera Iyer', kind: 'reply', text: 'Findings reviewed. We suggest the joint response include a committed hearing date for the affected cohort.' },
      { ts: dt(5, 10, 5), from: 'EAB · Rohan Deshpande', kind: 'reply', text: 'Agreed — hearing date included in the revised draft.' },
    ],
  },
  {
    id: 'CR-2026-021', fromBureau: 'AB', toBureau: 'PGRC', initiatorName: 'Kavitha Reddy',
    subject: 'GPTU approval review — request for grievance history',
    priority: 'Medium', linkedCases: ['AB-2026-0071', 'PGRC-2026-0135'], conflictId: null,
    status: 'Acknowledged', initiated: d(3), updated: d(2),
    messages: [
      { ts: dt(3, 9, 0), from: 'AB · Kavitha Reddy', kind: 'request', text: 'Our extension-of-approval review for GPTU would benefit from the PGRC grievance history (scholarship disbursement complaints). Requesting a summary.' },
      { ts: dt(2, 11, 20), from: 'PGRC · Meera Iyer', kind: 'ack', text: 'Acknowledged. Compiling the grievance summary — will share within 2 working days.' },
    ],
  },
  {
    id: 'CR-2026-022', fromBureau: 'AB', toBureau: 'EAB', initiatorName: 'Kavitha Reddy',
    subject: 'CKIS lab infrastructure — shared inspection visit',
    priority: 'Low', linkedCases: ['AB-2026-0073', 'EAB-2026-0057'], conflictId: null,
    status: 'Pending Acknowledgement', initiated: d(3), updated: d(3),
    messages: [
      { ts: dt(3, 14, 30), from: 'AB · Kavitha Reddy', kind: 'request', text: 'Proposing a single joint inspection visit to CKIS covering both the intake variance report and the computing-lab capacity complaint. Please confirm availability for next week.' },
    ],
  },
  {
    id: 'CR-2026-023', fromBureau: 'PGRC', toBureau: 'FAB', initiatorName: 'Priya Nair',
    subject: 'DSE refund policy clarification (draft)',
    priority: 'Medium', linkedCases: ['PGRC-2026-0131'], conflictId: null,
    status: 'Draft', initiated: d(4), updated: d(4), draftMessage: 'Draft: requesting FAB to clarify the refund policy position before we close PGRC-2026-0131…',
    messages: [],
  },
];

export const NOTIFICATIONS = [
  { id: 'N-1', kind: 'conflict', severity: 'high', read: false, ts: dt(3, 9, 12),
    title: 'High-confidence conflict detected — CF-2026-0031',
    detail: 'PGRC-2026-0142 ↔ RB-2026-0087 · National Institute of Applied Technology, Madurai',
    link: '/app/conflicts/CF-2026-0031' },
  { id: 'N-2', kind: 'sla', severity: 'critical', read: false, ts: dt(2, 8, 0),
    title: 'SLA breach — PGRC-2026-0121 overdue',
    detail: 'Structural cracks case at Vidarbha College of Engineering is overdue and escalated.',
    link: '/app/complaints/PGRC-2026-0121' },
  { id: 'N-3', kind: 'match', severity: 'medium', read: false, ts: dt(4, 17, 30),
    title: 'Potential duplicate institutions awaiting review',
    detail: 'High-confidence registry matches need human review (MC-101, MC-102).',
    link: '/app/registry?tab=matches' },
  { id: 'N-4', kind: 'coordination', severity: 'medium', read: false, ts: dt(2, 11, 20),
    title: 'CR-2026-021 acknowledged by PGRC',
    detail: 'AB’s grievance-history request for GPTU was acknowledged by Meera Iyer.',
    link: '/app/coordination/CR-2026-021' },
  { id: 'N-5', kind: 'sla', severity: 'medium', read: true, ts: dt(5, 9, 0),
    title: 'SLA due soon — EAB-2026-0055',
    detail: 'Question-paper leak case reaches its deadline shortly.',
    link: '/app/complaints/EAB-2026-0055' },
  { id: 'N-6', kind: 'system', severity: 'low', read: true, ts: dt(7, 18, 0),
    title: 'Weekly bureau summary ready',
    detail: 'Complaint volumes rose 12% week-on-week; conflicts under review: 3.',
    link: '/app' },
];

export const ACTIVITY = [
  { id: 'A-1', ts: dt(2, 12, 5), kind: 'complaint', text: 'PGRC-2026-0142 moved to Under Process by Priya Nair', link: '/app/complaints/PGRC-2026-0142' },
  { id: 'A-2', ts: dt(2, 11, 20), kind: 'coordination', text: 'CR-2026-021 acknowledged by PGRC (Meera Iyer)', link: '/app/coordination/CR-2026-021' },
  { id: 'A-3', ts: dt(3, 17, 45), kind: 'conflict', text: 'Conflict CF-2026-0031 flagged for review by the matching engine', link: '/app/conflicts/CF-2026-0031' },
  { id: 'A-4', ts: dt(3, 14, 30), kind: 'coordination', text: 'CR-2026-022 sent from AB to EAB (CKIS joint inspection)', link: '/app/coordination/CR-2026-022' },
  { id: 'A-5', ts: dt(2, 8, 0), kind: 'sla', text: 'SLA breach recorded on PGRC-2026-0121 (overdue, escalated)', link: '/app/complaints/PGRC-2026-0121' },
  { id: 'A-6', ts: dt(4, 16, 45), kind: 'complaint', text: 'PGRC-2026-0131 disposed — refund confirmed at Deccan School of Engineering', link: '/app/complaints/PGRC-2026-0131' },
  { id: 'A-7', ts: dt(4, 17, 30), kind: 'registry', text: 'Potential duplicate institutions queued for human review', link: '/app/registry?tab=matches' },
  { id: 'A-8', ts: dt(5, 10, 26), kind: 'complaint', text: 'Fee receipts uploaded on PGRC-2026-0142 by the complainant', link: '/app/complaints/PGRC-2026-0142' },
  { id: 'A-9', ts: dt(6, 14, 0), kind: 'complaint', text: 'EAB-2026-0055 escalated — re-examination recommended (NEFP Guwahati)', link: '/app/complaints/EAB-2026-0055' },
  { id: 'A-10', ts: dt(9, 13, 41), kind: 'complaint', text: 'RB-2026-0084 transferred from AB to RB — ownership updated, history retained', link: '/app/complaints/RB-2026-0084' },
];

// Historical monthly volumes used by the dashboard trend chart (8 buckets before
// the current month). The current month's bucket is computed live from complaints.
export const TREND_HISTORY = [
  { received: 14, disposed: 9 },
  { received: 17, disposed: 12 },
  { received: 12, disposed: 14 },
  { received: 19, disposed: 11 },
  { received: 22, disposed: 16 },
  { received: 18, disposed: 17 },
  { received: 21, disposed: 15 },
  { received: 24, disposed: 18 },
];
