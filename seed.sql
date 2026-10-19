-- ============================================================================
-- DISEASE SURVEILLANCE & EPIDEMIOLOGY DATABASE (DSED)
-- Synthetic Benchmark & Demonstration Seed Data
-- ============================================================================
USE disease_surveillance;

-- ----------------------------------------------------------------------------
-- 1. Districts
-- ----------------------------------------------------------------------------
INSERT INTO district (district_id, district_code, district_name, state_name, population) VALUES
(1, 'MH-PUN', 'Pune', 'Maharashtra', 9429408),
(2, 'MH-MUM', 'Mumbai Suburban', 'Maharashtra', 12442373),
(3, 'MH-NAG', 'Nagpur', 'Maharashtra', 4653570),
(4, 'MH-NAS', 'Nashik', 'Maharashtra', 6107187),
(5, 'MH-KOL', 'Kolhapur', 'Maharashtra', 3876001),
(6, 'MH-THA', 'Thane', 'Maharashtra', 11060148)
ON DUPLICATE KEY UPDATE district_name = VALUES(district_name), population = VALUES(population);

-- ----------------------------------------------------------------------------
-- 2. Health Facilities
-- ----------------------------------------------------------------------------
INSERT INTO health_facility (facility_id, facility_code, facility_name, facility_type, district_id, contact_phone, address_line) VALUES
(1, 'FAC-PUN-001', 'Pune Central Public Health Unit', 'PUBLIC_HEALTH_OFFICE', 1, '+91-20-26123456', 'Station Road, Pune 411001'),
(2, 'FAC-PUN-002', 'B.J. Government Medical College & Sassoon Hospital', 'HOSPITAL', 1, '+91-20-26128000', 'Near Pune Station, Pune 411001'),
(3, 'FAC-MUM-001', 'King Edward Memorial (KEM) Hospital', 'HOSPITAL', 2, '+91-22-24107000', 'Parel, Mumbai 400012'),
(4, 'FAC-MUM-002', 'National Institute of Virology Mumbai Unit', 'LABORATORY', 2, '+91-22-24135000', 'Haffkine Institute Compound, Mumbai'),
(5, 'FAC-NAG-001', 'Government Medical College & Hospital Nagpur', 'HOSPITAL', 3, '+91-712-2744671', 'Hanuman Nagar, Nagpur 440009'),
(6, 'FAC-NAS-001', 'Nashik District Civil Hospital', 'HOSPITAL', 4, '+91-253-2572000', 'Trimbak Road, Nashik 422002'),
(7, 'FAC-KOL-001', 'Chhatrapati Pramila Raje (CPR) General Hospital', 'HOSPITAL', 5, '+91-231-2641177', 'Bhausinghji Road, Kolhapur 416002')
ON DUPLICATE KEY UPDATE facility_name = VALUES(facility_name);

-- ----------------------------------------------------------------------------
-- 3. Diseases Master Catalog
-- ----------------------------------------------------------------------------
INSERT INTO disease (disease_id, disease_code, disease_name, disease_category, transmission_mode, alert_threshold_weekly, is_notifiable, description) VALUES
(1, 'DEN', 'Dengue Fever', 'VECTOR_BORNE', 'Aedes mosquito bite', 8, TRUE, 'Acute febrile viral illness transmitted by Aedes aegypti mosquitoes.'),
(2, 'MAL', 'Malaria (Plasmodium falciparum)', 'VECTOR_BORNE', 'Anopheles mosquito bite', 10, TRUE, 'Parasitic infection transmitted through bites of infected female Anopheles.'),
(3, 'INF', 'Influenza-like Illness (H1N1/ILI)', 'RESPIRATORY', 'Airborne droplets & aerosols', 15, TRUE, 'Contagious respiratory illness caused by influenza viruses.'),
(4, 'GAS', 'Acute Gastroenteritis / Cholera', 'WATER_BORNE', 'Contaminated water/food', 6, TRUE, 'Severe water-borne bacterial diarrheal infection.'),
(5, 'COV', 'COVID-19 (SARS-CoV-2 Variant)', 'RESPIRATORY', 'Respiratory droplets & contacts', 20, TRUE, 'Novel respiratory coronavirus infection with variable clinical manifestations.'),
(6, 'CHK', 'Chikungunya', 'VECTOR_BORNE', 'Aedes mosquito bite', 7, TRUE, 'Viral infection causing severe, debilitating joint pain.')
ON DUPLICATE KEY UPDATE disease_name = VALUES(disease_name);

-- ----------------------------------------------------------------------------
-- 4. Application Roles & Users
-- ----------------------------------------------------------------------------
INSERT INTO app_role (role_id, role_name, role_description) VALUES
(1, 'ADMIN', 'Surveillance System Administrator'),
(2, 'HEALTH_OFFICER', 'District Surveillance Officer (DSO)'),
(3, 'LAB_TECHNICIAN', 'Diagnostic & Laboratory Specialist'),
(4, 'DATA_ANALYST', 'Epidemiological Data Scientist')
ON DUPLICATE KEY UPDATE role_description = VALUES(role_description);

INSERT INTO app_user (user_id, full_name, email, password_hash, role_id, facility_id) VALUES
(1, 'Dr. Rajesh Patil', 'officer.pune@surveillance.gov.in', '$2b$10$e8g3tY7s0H9jK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E', 2, 1),
(2, 'Dr. Sunita Deshmukh', 'officer.mumbai@surveillance.gov.in', '$2b$10$e8g3tY7s0H9jK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E', 2, 3),
(3, 'Anand Kulkarni', 'lab.pune@virology.gov.in', '$2b$10$e8g3tY7s0H9jK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E', 3, 2),
(4, 'Pooja Shinde', 'lab.mumbai@niv.gov.in', '$2b$10$e8g3tY7s0H9jK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E', 3, 4),
(5, 'Atharv Kulkarni (SysAdmin)', 'admin@surveillance.gov.in', '$2b$10$e8g3tY7s0H9jK1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E', 1, 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO health_officer (officer_id, user_id, district_id, employee_code, designation, appointed_on) VALUES
(1, 1, 1, 'OFF-PUN-001', 'Chief District Epidemiologist', '2024-01-15'),
(2, 2, 2, 'OFF-MUM-001', 'State Surveillance Coordinator', '2023-06-01')
ON DUPLICATE KEY UPDATE designation = VALUES(designation);

-- ----------------------------------------------------------------------------
-- 5. Patients (De-identified Surveillance Demographics)
-- ----------------------------------------------------------------------------
INSERT INTO patient (patient_id, patient_code, full_name_masked, date_of_birth, sex_at_birth, district_id) VALUES
(1, 'PAT-PUN-001', 'S. M. (Age 28)', '1998-05-14', 'FEMALE', 1),
(2, 'PAT-PUN-002', 'A. K. (Age 40)', '1986-11-03', 'MALE', 1),
(3, 'PAT-PUN-003', 'V. P. (Age 22)', '2004-02-18', 'FEMALE', 1),
(4, 'PAT-MUM-001', 'R. J. (Age 55)', '1971-08-25', 'MALE', 2),
(5, 'PAT-MUM-002', 'N. T. (Age 34)', '1992-04-10', 'FEMALE', 2),
(6, 'PAT-MUM-003', 'K. S. (Age 62)', '1964-12-01', 'MALE', 2),
(7, 'PAT-NAG-001', 'P. D. (Age 19)', '2007-09-14', 'MALE', 3),
(8, 'PAT-NAS-001', 'M. B. (Age 47)', '1979-03-30', 'FEMALE', 4),
(9, 'PAT-KOL-001', 'D. G. (Age 31)', '1995-07-21', 'MALE', 5),
(10, 'PAT-THA-001', 'L. C. (Age 26)', '2000-10-05', 'FEMALE', 6),
(11, 'PAT-PUN-004', 'T. N. (Age 38)', '1988-06-12', 'MALE', 1),
(12, 'PAT-MUM-004', 'S. Y. (Age 45)', '1981-01-29', 'FEMALE', 2),
(13, 'PAT-PUN-005', 'B. R. (Age 52)', '1974-09-19', 'MALE', 1),
(14, 'PAT-MUM-005', 'H. K. (Age 29)', '1997-11-14', 'FEMALE', 2),
(15, 'PAT-KOL-002', 'C. S. (Age 33)', '1993-03-08', 'MALE', 5)
ON DUPLICATE KEY UPDATE patient_code = VALUES(patient_code);

-- ----------------------------------------------------------------------------
-- 6. Disease Cases (Active & Historic Surveillance Episodes)
-- ----------------------------------------------------------------------------
INSERT INTO disease_case
(case_id, case_code, patient_id, disease_id, reporting_facility_id, reported_by_user_id,
 onset_date, report_date, case_status, severity, outcome, hospitalized, external_source, external_record_id, notes)
VALUES
(1, 'CASE-2026-PUN-001', 1, 1, 1, 1, '2026-10-05', '2026-10-07', 'CONFIRMED', 'MODERATE', 'RECOVERED', FALSE, 'IDSP_PORTAL', 'IDSP-PN-8821', 'Patient presented with high grade fever, retro-orbital pain, severe myalgia.'),
(2, 'CASE-2026-PUN-002', 2, 3, 2, 1, '2026-10-08', '2026-10-10', 'CONFIRMED', 'SEVERE', 'ONGOING', TRUE, 'HOSP_EMR', 'EMR-BJ-1920', 'Acute respiratory distress, low SpO2, admitted to isolation ward.'),
(3, 'CASE-2026-PUN-003', 3, 1, 1, 1, '2026-10-10', '2026-10-12', 'SUSPECTED', 'MILD', 'ONGOING', FALSE, 'OPD_LOG', 'OPD-PN-4412', 'Suspected dengue with thrombocytopenia monitoring in outpatient care.'),
(4, 'CASE-2026-MUM-001', 4, 4, 3, 2, '2026-10-06', '2026-10-07', 'CONFIRMED', 'SEVERE', 'ONGOING', TRUE, 'IDSP_PORTAL', 'IDSP-MM-1029', 'Severe dehydration, profuse watery diarrhea. Stool culture positive.'),
(5, 'CASE-2026-MUM-002', 5, 5, 3, 2, '2026-10-09', '2026-10-11', 'CONFIRMED', 'MODERATE', 'RECOVERED', FALSE, 'IDSP_PORTAL', 'IDSP-MM-1033', 'COVID RT-PCR positive, quarantined at home residence.'),
(6, 'CASE-2026-MUM-003', 6, 2, 4, 2, '2026-10-11', '2026-10-13', 'CONFIRMED', 'CRITICAL', 'ONGOING', TRUE, 'HOSP_EMR', 'EMR-KEM-8829', 'Cerebral malaria presentation. ICU monitoring with intravenous artesunate.'),
(7, 'CASE-2026-NAG-001', 7, 1, 5, 1, '2026-10-12', '2026-10-14', 'CONFIRMED', 'MODERATE', 'ONGOING', FALSE, 'HOSP_EMR', 'EMR-NG-3311', 'Dengue NS1 reactive; platelet count 75k.'),
(8, 'CASE-2026-NAS-001', 8, 6, 6, 1, '2026-10-10', '2026-10-12', 'SUSPECTED', 'MILD', 'ONGOING', FALSE, 'OPD_LOG', 'OPD-NS-2219', 'Acute fever with symmetrical polyarthralgia.'),
(9, 'CASE-2026-KOL-001', 9, 2, 7, 1, '2026-10-08', '2026-10-10', 'CONFIRMED', 'MODERATE', 'RECOVERED', FALSE, 'HOSP_EMR', 'EMR-KL-5091', 'P. vivax smear confirmed, 14 days primaquine regimen completed.'),
(10, 'CASE-2026-THA-001', 10, 4, 3, 2, '2026-10-13', '2026-10-15', 'SUSPECTED', 'MODERATE', 'ONGOING', TRUE, 'IDSP_PORTAL', 'IDSP-TH-0922', 'Cluster outbreak alert in Mumbra municipal ward.'),
(11, 'CASE-2026-PUN-004', 11, 1, 2, 1, '2026-10-14', '2026-10-15', 'CONFIRMED', 'SEVERE', 'ONGOING', TRUE, 'HOSP_EMR', 'EMR-BJ-2041', 'Dengue hemorrhagic fever warning signs present.'),
(12, 'CASE-2026-MUM-004', 12, 1, 3, 2, '2026-10-12', '2026-10-14', 'CONFIRMED', 'MODERATE', 'ONGOING', FALSE, 'OPD_LOG', 'OPD-KM-7721', 'Aedes surveillance intensified in Dadar ward.'),
(13, 'CASE-2026-PUN-005', 13, 3, 1, 1, '2026-10-14', '2026-10-16', 'SUSPECTED', 'MILD', 'ONGOING', FALSE, 'OPD_LOG', 'OPD-PN-5582', 'Mild flu symptoms, swab sent for multiplex PCR.'),
(14, 'CASE-2026-MUM-005', 14, 5, 4, 2, '2026-10-15', '2026-10-16', 'SUSPECTED', 'MILD', 'ONGOING', FALSE, 'IDSP_PORTAL', 'IDSP-MM-1190', 'Close contact of confirmed index case CASE-2026-MUM-002.'),
(15, 'CASE-2026-KOL-002', 15, 1, 7, 1, '2026-10-11', '2026-10-13', 'CONFIRMED', 'MODERATE', 'ONGOING', FALSE, 'HOSP_EMR', 'EMR-KL-5104', 'Dengue IgM positive, hydration therapy given.')
ON DUPLICATE KEY UPDATE notes = VALUES(notes);

-- ----------------------------------------------------------------------------
-- 7. Diagnostic Laboratory Tests
-- ----------------------------------------------------------------------------
INSERT INTO lab_test
(lab_test_id, case_id, facility_id, test_code, test_name, specimen_collected_at, result_reported_at, test_result, performed_by_user_id, remarks)
VALUES
(1, 1, 1, 'TEST-DEN-001', 'Dengue NS1 Antigen ELISA', '2026-10-07 09:30:00', '2026-10-07 15:45:00', 'POSITIVE', 3, 'High OD index 4.2; confirms acute dengue episode.'),
(2, 1, 1, 'TEST-PLT-001', 'Automated Platelet Count', '2026-10-07 09:30:00', '2026-10-07 11:00:00', 'NEGATIVE', 3, 'Platelet count stable at 112,000 /uL.'),
(3, 2, 2, 'TEST-INF-001', 'Influenza A/B Real-Time RT-PCR', '2026-10-10 11:15:00', '2026-10-10 18:30:00', 'POSITIVE', 3, 'Ct value 21.4 for Influenza A H1N1 subtype.'),
(4, 3, 1, 'TEST-DEN-002', 'Dengue Rapid Duo (NS1 + IgM)', '2026-10-12 10:00:00', '2026-10-12 11:30:00', 'PENDING', 3, 'Awaiting confirmation run on microplate reader.'),
(5, 4, 3, 'TEST-CHO-001', 'Hanging Drop & TCBS Stool Culture', '2026-10-07 14:00:00', '2026-10-08 16:00:00', 'POSITIVE', 4, 'Vibrio cholerae O1 Ogawa serotype confirmed.'),
(6, 5, 4, 'TEST-COV-001', 'SARS-CoV-2 Real-Time PCR (E/RdRp genes)', '2026-10-11 08:30:00', '2026-10-11 14:00:00', 'POSITIVE', 4, 'Ct value 24.1; genome sequencing sent to NIV.'),
(7, 6, 3, 'TEST-MAL-001', 'Peripheral Blood Smear (Giemsa stain)', '2026-10-13 10:45:00', '2026-10-13 12:15:00', 'POSITIVE', 4, 'P. falciparum ring forms and gametocytes observed; 2% parasitemia.'),
(8, 7, 5, 'TEST-DEN-003', 'Dengue NS1 Antigen Test', '2026-10-14 09:00:00', '2026-10-14 13:30:00', 'POSITIVE', 3, 'Seropositive for NS1 antigen.'),
(9, 9, 7, 'TEST-MAL-002', 'Malaria Rapid Diagnostic Test (Pf/Pv)', '2026-10-10 11:00:00', '2026-10-10 11:45:00', 'POSITIVE', 3, 'Plasmodium vivax line positive.'),
(10, 11, 2, 'TEST-DEN-004', 'Dengue IgM Capture ELISA', '2026-10-15 08:15:00', '2026-10-15 14:00:00', 'POSITIVE', 3, 'IgM positive, indicating secondary infection risks.'),
(11, 12, 3, 'TEST-DEN-005', 'Dengue NS1 Antigen', '2026-10-14 10:30:00', '2026-10-14 17:00:00', 'POSITIVE', 4, 'Reactive result.'),
(12, 13, 1, 'TEST-INF-002', 'Respiratory Viral Panel Multiplex', '2026-10-16 09:00:00', NULL, 'PENDING', 3, 'Specimen received in viral transport medium.')
ON DUPLICATE KEY UPDATE remarks = VALUES(remarks);

-- ----------------------------------------------------------------------------
-- 8. Raw Lab Feed (Staging data to demonstrate Practical 6 - CURSORS)
-- ----------------------------------------------------------------------------
INSERT INTO raw_lab_feed
(feed_id, case_code, facility_code, test_code, test_name, specimen_collected_at, result_reported_at, test_result, technician_email, is_processed, process_status)
VALUES
(1, 'CASE-2026-PUN-003', 'FAC-PUN-001', 'FEED-TST-901', 'Dengue NS1 ELISA Batch confirmation', '2026-10-16 10:00:00', '2026-10-16 14:00:00', 'POSITIVE', 'lab.pune@virology.gov.in', FALSE, 'PENDING_BATCH'),
(2, 'CASE-2026-THA-001', 'FAC-MUM-001', 'FEED-TST-902', 'Stool Microscopic Examination', '2026-10-16 11:30:00', '2026-10-16 15:30:00', 'POSITIVE', 'lab.mumbai@niv.gov.in', FALSE, 'PENDING_BATCH'),
(3, 'CASE-2026-PUN-005', 'FAC-PUN-001', 'FEED-TST-903', 'Multiplex PCR Influenza Panel', '2026-10-16 12:00:00', '2026-10-16 17:00:00', 'NEGATIVE', 'lab.pune@virology.gov.in', FALSE, 'PENDING_BATCH'),
(4, 'CASE-2026-MUM-005', 'FAC-MUM-002', 'FEED-TST-904', 'COVID Rapid Antigen Test', '2026-10-16 13:15:00', '2026-10-16 13:45:00', 'POSITIVE', 'lab.mumbai@niv.gov.in', FALSE, 'PENDING_BATCH'),
(5, 'CASE-2026-PUN-001', 'FAC-PUN-001', 'TEST-DEN-001', 'Duplicate NS1 Antigen Check', '2026-10-16 09:00:00', '2026-10-16 12:00:00', 'POSITIVE', 'lab.pune@virology.gov.in', FALSE, 'PENDING_BATCH')
ON DUPLICATE KEY UPDATE process_status = VALUES(process_status);

-- ----------------------------------------------------------------------------
-- 9. Case Status History (Trigger & lifecycle demo data)
-- ----------------------------------------------------------------------------
INSERT INTO case_status_history
(history_id, case_id, old_status, new_status, changed_by_user_id, change_reason, changed_at)
VALUES
(1, 1, 'SUSPECTED', 'CONFIRMED', 1, 'Laboratory confirmed via NS1 ELISA test', '2026-10-07 16:00:00'),
(2, 1, 'CONFIRMED', 'RECOVERED', 1, 'Completed 7-day observation, afebrile 48h', '2026-10-14 10:00:00'),
(3, 2, 'SUSPECTED', 'CONFIRMED', 1, 'RT-PCR positive for H1N1', '2026-10-10 19:00:00'),
(4, 4, 'SUSPECTED', 'CONFIRMED', 2, 'Microbiological stool culture confirmed V. cholerae', '2026-10-08 17:00:00'),
(5, 5, 'SUSPECTED', 'CONFIRMED', 2, 'RT-PCR confirmation', '2026-10-11 15:00:00'),
(6, 6, 'SUSPECTED', 'CONFIRMED', 2, 'Peripheral blood smear positive for P. falciparum', '2026-10-13 13:00:00')
ON DUPLICATE KEY UPDATE change_reason = VALUES(change_reason);

-- ----------------------------------------------------------------------------
-- 10. Outbreak Alerts (Early Warning System)
-- ----------------------------------------------------------------------------
INSERT INTO outbreak_alert
(alert_id, alert_code, district_id, disease_id, alert_level, alert_status,
 window_start, window_end, observed_case_count, threshold_case_count, generated_at, generated_by_user_id, resolution_notes)
VALUES
(1, 'ALT-PUN-DEN-2610', 1, 1, 'HIGH', 'INVESTIGATING', '2026-10-05', '2026-10-18', 14, 8, '2026-10-16 08:00:00', 1, 'Surveillance teams deployed to Kothrud and Hadapsar wards for anti-larval fogging and source reduction.'),
(2, 'ALT-MUM-CHO-2610', 2, 4, 'CRITICAL', 'OPEN', '2026-10-07', '2026-10-18', 12, 6, '2026-10-15 14:30:00', 2, 'Municipal water pipeline contamination suspected in F-South ward; emergency chlorination initiated.'),
(3, 'ALT-NAG-DEN-2610', 3, 1, 'MEDIUM', 'ACKNOWLEDGED', '2026-10-08', '2026-10-18', 9, 8, '2026-10-16 11:00:00', 1, 'District vector control committee alerted; surveillance heightened in urban slums.')
ON DUPLICATE KEY UPDATE resolution_notes = VALUES(resolution_notes);

-- ----------------------------------------------------------------------------
-- 11. Initial Audit Log Entries (Row-Level Audit Trail)
-- ----------------------------------------------------------------------------
INSERT INTO audit_log
(audit_id, table_name, record_key, action_type, changed_by_user_id, changed_at, new_values)
VALUES
(1, 'disease_case', '1', 'INSERT', 1, '2026-10-07 09:00:00', JSON_OBJECT('case_code', 'CASE-2026-PUN-001', 'disease', 'DEN', 'status', 'SUSPECTED')),
(2, 'disease_case', '2', 'INSERT', 1, '2026-10-10 10:00:00', JSON_OBJECT('case_code', 'CASE-2026-PUN-002', 'disease', 'INF', 'status', 'SUSPECTED')),
(3, 'disease_case', '4', 'INSERT', 2, '2026-10-07 12:00:00', JSON_OBJECT('case_code', 'CASE-2026-MUM-001', 'disease', 'GAS', 'status', 'SUSPECTED'))
ON DUPLICATE KEY UPDATE action_type = VALUES(action_type);
