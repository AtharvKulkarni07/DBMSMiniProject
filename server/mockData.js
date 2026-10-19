export const initialDistricts = [
  { district_id: 1, district_code: 'MH-PUN', district_name: 'Pune', state_name: 'Maharashtra', population: 9429408 },
  { district_id: 2, district_code: 'MH-MUM', district_name: 'Mumbai Suburban', state_name: 'Maharashtra', population: 12442373 },
  { district_id: 3, district_code: 'MH-NAG', district_name: 'Nagpur', state_name: 'Maharashtra', population: 4653570 },
  { district_id: 4, district_code: 'MH-NAS', district_name: 'Nashik', state_name: 'Maharashtra', population: 6107187 },
  { district_id: 5, district_code: 'MH-KOL', district_name: 'Kolhapur', state_name: 'Maharashtra', population: 3876001 },
  { district_id: 6, district_code: 'MH-THA', district_name: 'Thane', state_name: 'Maharashtra', population: 11060148 },
];

export const initialFacilities = [
  { facility_id: 1, facility_code: 'FAC-PUN-001', facility_name: 'Pune Central Public Health Unit', facility_type: 'PUBLIC_HEALTH_OFFICE', district_id: 1, contact_phone: '+91-20-26123456', address_line: 'Station Road, Pune 411001' },
  { facility_id: 2, facility_code: 'FAC-PUN-002', facility_name: 'B.J. Govt Medical College & Sassoon Hospital', facility_type: 'HOSPITAL', district_id: 1, contact_phone: '+91-20-26128000', address_line: 'Near Pune Station, Pune 411001' },
  { facility_id: 3, facility_code: 'FAC-MUM-001', facility_name: 'King Edward Memorial (KEM) Hospital', facility_type: 'HOSPITAL', district_id: 2, contact_phone: '+91-22-24107000', address_line: 'Parel, Mumbai 400012' },
  { facility_id: 4, facility_code: 'FAC-MUM-002', facility_name: 'National Institute of Virology Mumbai Unit', facility_type: 'LABORATORY', district_id: 2, contact_phone: '+91-22-24135000', address_line: 'Haffkine Institute Compound, Mumbai' },
  { facility_id: 5, facility_code: 'FAC-NAG-001', facility_name: 'Govt Medical College & Hospital Nagpur', facility_type: 'HOSPITAL', district_id: 3, contact_phone: '+91-712-2744671', address_line: 'Hanuman Nagar, Nagpur 440009' },
  { facility_id: 6, facility_code: 'FAC-NAS-001', facility_name: 'Nashik District Civil Hospital', facility_type: 'HOSPITAL', district_id: 4, contact_phone: '+91-253-2572000', address_line: 'Trimbak Road, Nashik 422002' },
  { facility_id: 7, facility_code: 'FAC-KOL-001', facility_name: 'Chhatrapati Pramila Raje (CPR) General Hospital', facility_type: 'HOSPITAL', district_id: 5, contact_phone: '+91-231-2641177', address_line: 'Bhausinghji Road, Kolhapur 416002' },
];

export const initialDiseases = [
  { disease_id: 1, disease_code: 'DEN', disease_name: 'Dengue Fever', disease_category: 'VECTOR_BORNE', transmission_mode: 'Aedes mosquito bite', alert_threshold_weekly: 8, is_notifiable: true, description: 'Acute febrile viral illness transmitted by Aedes aegypti mosquitoes.' },
  { disease_id: 2, disease_code: 'MAL', disease_name: 'Malaria (Plasmodium falciparum)', disease_category: 'VECTOR_BORNE', transmission_mode: 'Anopheles mosquito bite', alert_threshold_weekly: 10, is_notifiable: true, description: 'Parasitic infection transmitted through bites of infected female Anopheles.' },
  { disease_id: 3, disease_code: 'INF', disease_name: 'Influenza-like Illness (H1N1/ILI)', disease_category: 'RESPIRATORY', transmission_mode: 'Airborne droplets & aerosols', alert_threshold_weekly: 15, is_notifiable: true, description: 'Contagious respiratory illness caused by influenza viruses.' },
  { disease_id: 4, disease_code: 'GAS', disease_name: 'Acute Gastroenteritis / Cholera', disease_category: 'WATER_BORNE', transmission_mode: 'Contaminated water/food', alert_threshold_weekly: 6, is_notifiable: true, description: 'Severe water-borne bacterial diarrheal infection.' },
  { disease_id: 5, disease_code: 'COV', disease_name: 'COVID-19 (SARS-CoV-2 Variant)', disease_category: 'RESPIRATORY', transmission_mode: 'Respiratory droplets & contacts', alert_threshold_weekly: 20, is_notifiable: true, description: 'Novel respiratory coronavirus infection.' },
  { disease_id: 6, disease_code: 'CHK', disease_name: 'Chikungunya', disease_category: 'VECTOR_BORNE', transmission_mode: 'Aedes mosquito bite', alert_threshold_weekly: 7, is_notifiable: true, description: 'Viral infection causing severe joint pain.' },
];

export const initialPatients = [
  { patient_id: 1, patient_code: 'PAT-PUN-001', full_name_masked: 'S. M. (Age 28)', date_of_birth: '1998-05-14', sex_at_birth: 'FEMALE', district_id: 1 },
  { patient_id: 2, patient_code: 'PAT-PUN-002', full_name_masked: 'A. K. (Age 40)', date_of_birth: '1986-11-03', sex_at_birth: 'MALE', district_id: 1 },
  { patient_id: 3, patient_code: 'PAT-PUN-003', full_name_masked: 'V. P. (Age 22)', date_of_birth: '2004-02-18', sex_at_birth: 'FEMALE', district_id: 1 },
  { patient_id: 4, patient_code: 'PAT-MUM-001', full_name_masked: 'R. J. (Age 55)', date_of_birth: '1971-08-25', sex_at_birth: 'MALE', district_id: 2 },
  { patient_id: 5, patient_code: 'PAT-MUM-002', full_name_masked: 'N. T. (Age 34)', date_of_birth: '1992-04-10', sex_at_birth: 'FEMALE', district_id: 2 },
  { patient_id: 6, patient_code: 'PAT-MUM-003', full_name_masked: 'K. S. (Age 62)', date_of_birth: '1964-12-01', sex_at_birth: 'MALE', district_id: 2 },
  { patient_id: 7, patient_code: 'PAT-NAG-001', full_name_masked: 'P. D. (Age 19)', date_of_birth: '2007-09-14', sex_at_birth: 'MALE', district_id: 3 },
  { patient_id: 8, patient_code: 'PAT-NAS-001', full_name_masked: 'M. B. (Age 47)', date_of_birth: '1979-03-30', sex_at_birth: 'FEMALE', district_id: 4 },
  { patient_id: 9, patient_code: 'PAT-KOL-001', full_name_masked: 'D. G. (Age 31)', date_of_birth: '1995-07-21', sex_at_birth: 'MALE', district_id: 5 },
  { patient_id: 10, patient_code: 'PAT-THA-001', full_name_masked: 'L. C. (Age 26)', date_of_birth: '2000-10-05', sex_at_birth: 'FEMALE', district_id: 6 },
  { patient_id: 11, patient_code: 'PAT-PUN-004', full_name_masked: 'T. N. (Age 38)', date_of_birth: '1988-06-12', sex_at_birth: 'MALE', district_id: 1 },
  { patient_id: 12, patient_code: 'PAT-MUM-004', full_name_masked: 'S. Y. (Age 45)', date_of_birth: '1981-01-29', sex_at_birth: 'FEMALE', district_id: 2 },
  { patient_id: 13, patient_code: 'PAT-PUN-005', full_name_masked: 'B. R. (Age 52)', date_of_birth: '1974-09-19', sex_at_birth: 'MALE', district_id: 1 },
  { patient_id: 14, patient_code: 'PAT-MUM-005', full_name_masked: 'H. K. (Age 29)', date_of_birth: '1997-11-14', sex_at_birth: 'FEMALE', district_id: 2 },
  { patient_id: 15, patient_code: 'PAT-KOL-002', full_name_masked: 'C. S. (Age 33)', date_of_birth: '1993-03-08', sex_at_birth: 'MALE', district_id: 5 },
];

export const initialCases = [
  { case_id: 1, case_code: 'CASE-2026-PUN-001', patient_id: 1, disease_id: 1, reporting_facility_id: 1, reported_by_user_id: 1, onset_date: '2026-10-05', report_date: '2026-10-07', case_status: 'CONFIRMED', severity: 'MODERATE', outcome: 'RECOVERED', hospitalized: false, notes: 'Patient presented with high grade fever, retro-orbital pain, severe myalgia.' },
  { case_id: 2, case_code: 'CASE-2026-PUN-002', patient_id: 2, disease_id: 3, reporting_facility_id: 2, reported_by_user_id: 1, onset_date: '2026-10-08', report_date: '2026-10-10', case_status: 'CONFIRMED', severity: 'SEVERE', outcome: 'ONGOING', hospitalized: true, notes: 'Acute respiratory distress, low SpO2, admitted to isolation ward.' },
  { case_id: 3, case_code: 'CASE-2026-PUN-003', patient_id: 3, disease_id: 1, reporting_facility_id: 1, reported_by_user_id: 1, onset_date: '2026-10-10', report_date: '2026-10-12', case_status: 'SUSPECTED', severity: 'MILD', outcome: 'ONGOING', hospitalized: false, notes: 'Suspected dengue with thrombocytopenia monitoring in outpatient care.' },
  { case_id: 4, case_code: 'CASE-2026-MUM-001', patient_id: 4, disease_id: 4, reporting_facility_id: 3, reported_by_user_id: 2, onset_date: '2026-10-06', report_date: '2026-10-07', case_status: 'CONFIRMED', severity: 'SEVERE', outcome: 'ONGOING', hospitalized: true, notes: 'Severe dehydration, profuse watery diarrhea. Stool culture positive.' },
  { case_id: 5, case_code: 'CASE-2026-MUM-002', patient_id: 5, disease_id: 5, reporting_facility_id: 3, reported_by_user_id: 2, onset_date: '2026-10-09', report_date: '2026-10-11', case_status: 'CONFIRMED', severity: 'MODERATE', outcome: 'RECOVERED', hospitalized: false, notes: 'COVID RT-PCR positive, quarantined at home residence.' },
  { case_id: 6, case_code: 'CASE-2026-MUM-003', patient_id: 6, disease_id: 2, reporting_facility_id: 4, reported_by_user_id: 2, onset_date: '2026-10-11', report_date: '2026-10-13', case_status: 'CONFIRMED', severity: 'CRITICAL', outcome: 'ONGOING', hospitalized: true, notes: 'Cerebral malaria presentation. ICU monitoring with IV artesunate.' },
  { case_id: 7, case_code: 'CASE-2026-NAG-001', patient_id: 7, disease_id: 1, reporting_facility_id: 5, reported_by_user_id: 1, onset_date: '2026-10-12', report_date: '2026-10-14', case_status: 'CONFIRMED', severity: 'MODERATE', outcome: 'ONGOING', hospitalized: false, notes: 'Dengue NS1 reactive; platelet count 75k.' },
  { case_id: 8, case_code: 'CASE-2026-NAS-001', patient_id: 8, disease_id: 6, reporting_facility_id: 6, reported_by_user_id: 1, onset_date: '2026-10-10', report_date: '2026-10-12', case_status: 'SUSPECTED', severity: 'MILD', outcome: 'ONGOING', hospitalized: false, notes: 'Acute fever with symmetrical polyarthralgia.' },
  { case_id: 9, case_code: 'CASE-2026-KOL-001', patient_id: 9, disease_id: 2, reporting_facility_id: 7, reported_by_user_id: 1, onset_date: '2026-10-08', report_date: '2026-10-10', case_status: 'CONFIRMED', severity: 'MODERATE', outcome: 'RECOVERED', hospitalized: false, notes: 'P. vivax smear confirmed, 14 days primaquine completed.' },
  { case_id: 10, case_code: 'CASE-2026-THA-001', patient_id: 10, disease_id: 4, reporting_facility_id: 3, reported_by_user_id: 2, onset_date: '2026-10-13', report_date: '2026-10-15', case_status: 'SUSPECTED', severity: 'MODERATE', outcome: 'ONGOING', hospitalized: true, notes: 'Cluster outbreak alert in Mumbra municipal ward.' },
  { case_id: 11, case_code: 'CASE-2026-PUN-004', patient_id: 11, disease_id: 1, reporting_facility_id: 2, reported_by_user_id: 1, onset_date: '2026-10-14', report_date: '2026-10-15', case_status: 'CONFIRMED', severity: 'SEVERE', outcome: 'ONGOING', hospitalized: true, notes: 'Dengue hemorrhagic fever warning signs present.' },
  { case_id: 12, case_code: 'CASE-2026-MUM-004', patient_id: 12, disease_id: 1, reporting_facility_id: 3, reported_by_user_id: 2, onset_date: '2026-10-12', report_date: '2026-10-14', case_status: 'CONFIRMED', severity: 'MODERATE', outcome: 'ONGOING', hospitalized: false, notes: 'Aedes surveillance intensified in Dadar ward.' },
  { case_id: 13, case_code: 'CASE-2026-PUN-005', patient_id: 13, disease_id: 3, reporting_facility_id: 1, reported_by_user_id: 1, onset_date: '2026-10-14', report_date: '2026-10-16', case_status: 'SUSPECTED', severity: 'MILD', outcome: 'ONGOING', hospitalized: false, notes: 'Mild flu symptoms, swab sent for multiplex PCR.' },
  { case_id: 14, case_code: 'CASE-2026-MUM-005', patient_id: 14, disease_id: 5, reporting_facility_id: 4, reported_by_user_id: 2, onset_date: '2026-10-15', report_date: '2026-10-16', case_status: 'SUSPECTED', severity: 'MILD', outcome: 'ONGOING', hospitalized: false, notes: 'Close contact of confirmed index case CASE-2026-MUM-002.' },
  { case_id: 15, case_code: 'CASE-2026-KOL-002', patient_id: 15, disease_id: 1, reporting_facility_id: 7, reported_by_user_id: 1, onset_date: '2026-10-11', report_date: '2026-10-13', case_status: 'CONFIRMED', severity: 'MODERATE', outcome: 'ONGOING', hospitalized: false, notes: 'Dengue IgM positive, hydration therapy given.' },
];

export const initialLabTests = [
  { lab_test_id: 1, case_id: 1, facility_id: 1, test_code: 'TEST-DEN-001', test_name: 'Dengue NS1 Antigen ELISA', specimen_collected_at: '2026-10-07 09:30:00', result_reported_at: '2026-10-07 15:45:00', test_result: 'POSITIVE', performed_by_user_id: 3, remarks: 'High OD index 4.2; confirms acute dengue episode.' },
  { lab_test_id: 2, case_id: 1, facility_id: 1, test_code: 'TEST-PLT-001', test_name: 'Automated Platelet Count', specimen_collected_at: '2026-10-07 09:30:00', result_reported_at: '2026-10-07 11:00:00', test_result: 'NEGATIVE', performed_by_user_id: 3, remarks: 'Platelet count stable at 112,000 /uL.' },
  { lab_test_id: 3, case_id: 2, facility_id: 2, test_code: 'TEST-INF-001', test_name: 'Influenza A/B Real-Time RT-PCR', specimen_collected_at: '2026-10-10 11:15:00', result_reported_at: '2026-10-10 18:30:00', test_result: 'POSITIVE', performed_by_user_id: 3, remarks: 'Ct value 21.4 for Influenza A H1N1 subtype.' },
  { lab_test_id: 4, case_id: 3, facility_id: 1, test_code: 'TEST-DEN-002', test_name: 'Dengue Rapid Duo (NS1 + IgM)', specimen_collected_at: '2026-10-12 10:00:00', result_reported_at: '2026-10-12 11:30:00', test_result: 'PENDING', performed_by_user_id: 3, remarks: 'Awaiting confirmation run on microplate reader.' },
  { lab_test_id: 5, case_id: 4, facility_id: 3, test_code: 'TEST-CHO-001', test_name: 'Hanging Drop & TCBS Stool Culture', specimen_collected_at: '2026-10-07 14:00:00', result_reported_at: '2026-10-08 16:00:00', test_result: 'POSITIVE', performed_by_user_id: 4, remarks: 'Vibrio cholerae O1 Ogawa serotype confirmed.' },
  { lab_test_id: 6, case_id: 5, facility_id: 4, test_code: 'TEST-COV-001', test_name: 'SARS-CoV-2 Real-Time PCR', specimen_collected_at: '2026-10-11 08:30:00', result_reported_at: '2026-10-11 14:00:00', test_result: 'POSITIVE', performed_by_user_id: 4, remarks: 'Ct value 24.1; genome sequencing sent to NIV.' },
  { lab_test_id: 7, case_id: 6, facility_id: 3, test_code: 'TEST-MAL-001', test_name: 'Peripheral Blood Smear (Giemsa)', specimen_collected_at: '2026-10-13 10:45:00', result_reported_at: '2026-10-13 12:15:00', test_result: 'POSITIVE', performed_by_user_id: 4, remarks: 'P. falciparum ring forms observed; 2% parasitemia.' },
  { lab_test_id: 8, case_id: 7, facility_id: 5, test_code: 'TEST-DEN-003', test_name: 'Dengue NS1 Antigen Test', specimen_collected_at: '2026-10-14 09:00:00', result_reported_at: '2026-10-14 13:30:00', test_result: 'POSITIVE', performed_by_user_id: 3, remarks: 'Seropositive for NS1 antigen.' },
  { lab_test_id: 9, case_id: 9, facility_id: 7, test_code: 'TEST-MAL-002', test_name: 'Malaria Rapid Diagnostic Test', specimen_collected_at: '2026-10-10 11:00:00', result_reported_at: '2026-10-10 11:45:00', test_result: 'POSITIVE', performed_by_user_id: 3, remarks: 'Plasmodium vivax line positive.' },
  { lab_test_id: 10, case_id: 11, facility_id: 2, test_code: 'TEST-DEN-004', test_name: 'Dengue IgM Capture ELISA', specimen_collected_at: '2026-10-15 08:15:00', result_reported_at: '2026-10-15 14:00:00', test_result: 'POSITIVE', performed_by_user_id: 3, remarks: 'IgM positive, indicating secondary infection risks.' },
  { lab_test_id: 11, case_id: 12, facility_id: 3, test_code: 'TEST-DEN-005', test_name: 'Dengue NS1 Antigen', specimen_collected_at: '2026-10-14 10:30:00', result_reported_at: '2026-10-14 17:00:00', test_result: 'POSITIVE', performed_by_user_id: 4, remarks: 'Reactive result.' },
  { lab_test_id: 12, case_id: 13, facility_id: 1, test_code: 'TEST-INF-002', test_name: 'Respiratory Viral Panel Multiplex', specimen_collected_at: '2026-10-16 09:00:00', result_reported_at: null, test_result: 'PENDING', performed_by_user_id: 3, remarks: 'Specimen received in viral transport medium.' },
];

export const initialRawLabFeed = [
  { feed_id: 1, case_code: 'CASE-2026-PUN-003', facility_code: 'FAC-PUN-001', test_code: 'FEED-TST-901', test_name: 'Dengue NS1 ELISA Batch confirmation', specimen_collected_at: '2026-10-16 10:00:00', result_reported_at: '2026-10-16 14:00:00', test_result: 'POSITIVE', technician_email: 'lab.pune@virology.gov.in', is_processed: false, process_status: 'PENDING_BATCH' },
  { feed_id: 2, case_code: 'CASE-2026-THA-001', facility_code: 'FAC-MUM-001', test_code: 'FEED-TST-902', test_name: 'Stool Microscopic Examination', specimen_collected_at: '2026-10-16 11:30:00', result_reported_at: '2026-10-16 15:30:00', test_result: 'POSITIVE', technician_email: 'lab.mumbai@niv.gov.in', is_processed: false, process_status: 'PENDING_BATCH' },
  { feed_id: 3, case_code: 'CASE-2026-PUN-005', facility_code: 'FAC-PUN-001', test_code: 'FEED-TST-903', test_name: 'Multiplex PCR Influenza Panel', specimen_collected_at: '2026-10-16 12:00:00', result_reported_at: '2026-10-16 17:00:00', test_result: 'NEGATIVE', technician_email: 'lab.pune@virology.gov.in', is_processed: false, process_status: 'PENDING_BATCH' },
  { feed_id: 4, case_code: 'CASE-2026-MUM-005', facility_code: 'FAC-MUM-002', test_code: 'FEED-TST-904', test_name: 'COVID Rapid Antigen Test', specimen_collected_at: '2026-10-16 13:15:00', result_reported_at: '2026-10-16 13:45:00', test_result: 'POSITIVE', technician_email: 'lab.mumbai@niv.gov.in', is_processed: false, process_status: 'PENDING_BATCH' },
  { feed_id: 5, case_code: 'CASE-2026-PUN-001', facility_code: 'FAC-PUN-001', test_code: 'TEST-DEN-001', test_name: 'Duplicate NS1 Antigen Check', specimen_collected_at: '2026-10-16 09:00:00', result_reported_at: '2026-10-16 12:00:00', test_result: 'POSITIVE', technician_email: 'lab.pune@virology.gov.in', is_processed: false, process_status: 'PENDING_BATCH' },
];

export const initialOutbreakAlerts = [
  { alert_id: 1, alert_code: 'ALT-PUN-DEN-2610', district_id: 1, disease_id: 1, alert_level: 'HIGH', alert_status: 'INVESTIGATING', window_start: '2026-10-05', window_end: '2026-10-18', observed_case_count: 14, threshold_case_count: 8, generated_at: '2026-10-16 08:00:00', resolution_notes: 'Surveillance teams deployed to Kothrud and Hadapsar wards for anti-larval fogging and source reduction.' },
  { alert_id: 2, alert_code: 'ALT-MUM-CHO-2610', district_id: 2, disease_id: 4, alert_level: 'CRITICAL', alert_status: 'OPEN', window_start: '2026-10-07', window_end: '2026-10-18', observed_case_count: 12, threshold_case_count: 6, generated_at: '2026-10-15 14:30:00', resolution_notes: 'Municipal water pipeline contamination suspected in F-South ward; emergency chlorination initiated.' },
  { alert_id: 3, alert_code: 'ALT-NAG-DEN-2610', district_id: 3, disease_id: 1, alert_level: 'MEDIUM', alert_status: 'ACKNOWLEDGED', window_start: '2026-10-08', window_end: '2026-10-18', observed_case_count: 9, threshold_case_count: 8, generated_at: '2026-10-16 11:00:00', resolution_notes: 'District vector control committee alerted; surveillance heightened in urban slums.' },
];

export const initialStatusHistory = [
  { history_id: 1, case_id: 1, old_status: 'SUSPECTED', new_status: 'CONFIRMED', changed_by_user: 'Dr. Rajesh Patil', change_reason: 'Laboratory confirmed via NS1 ELISA test', changed_at: '2026-10-07 16:00:00' },
  { history_id: 2, case_id: 1, old_status: 'CONFIRMED', new_status: 'RECOVERED', changed_by_user: 'Dr. Rajesh Patil', change_reason: 'Completed 7-day observation, afebrile 48h', changed_at: '2026-10-14 10:00:00' },
  { history_id: 3, case_id: 2, old_status: 'SUSPECTED', new_status: 'CONFIRMED', changed_by_user: 'Dr. Rajesh Patil', change_reason: 'RT-PCR positive for H1N1', changed_at: '2026-10-10 19:00:00' },
  { history_id: 4, case_id: 4, old_status: 'SUSPECTED', new_status: 'CONFIRMED', changed_by_user: 'Dr. Sunita Deshmukh', change_reason: 'Microbiological stool culture confirmed V. cholerae', changed_at: '2026-10-08 17:00:00' },
  { history_id: 5, case_id: 5, old_status: 'SUSPECTED', new_status: 'CONFIRMED', changed_by_user: 'Dr. Sunita Deshmukh', change_reason: 'RT-PCR confirmation', changed_at: '2026-10-11 15:00:00' },
];

export const initialAuditLogs = [
  { audit_id: 1, table_name: 'disease_case', record_key: '1', action_type: 'INSERT', actor: 'Dr. Rajesh Patil', changed_at: '2026-10-07 09:00:00', new_values: { case_code: 'CASE-2026-PUN-001', disease: 'DEN', status: 'SUSPECTED' }, old_values: null },
  { audit_id: 2, table_name: 'disease_case', record_key: '2', action_type: 'INSERT', actor: 'Dr. Rajesh Patil', changed_at: '2026-10-10 10:00:00', new_values: { case_code: 'CASE-2026-PUN-002', disease: 'INF', status: 'SUSPECTED' }, old_values: null },
  { audit_id: 3, table_name: 'disease_case', record_key: '4', action_type: 'INSERT', actor: 'Dr. Sunita Deshmukh', changed_at: '2026-10-07 12:00:00', new_values: { case_code: 'CASE-2026-MUM-001', disease: 'GAS', status: 'SUSPECTED' }, old_values: null },
];
