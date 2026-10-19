-- Synthetic seed data for Disease Surveillance project
USE disease_surveillance;

INSERT INTO district (district_code, district_name) VALUES
('MH-PUN','Pune'), ('MH-KOL','Kolhapur'), ('MH-NAS','Nashik')
ON DUPLICATE KEY UPDATE district_name = VALUES(district_name);

INSERT INTO health_facility (facility_code, facility_name, facility_type, district_id, address_line)
SELECT 'FAC-PUN-001','Pune Central Public Health Unit','PUBLIC_HEALTH_OFFICE',district_id,'Synthetic demo address'
FROM district WHERE district_code='MH-PUN'
ON DUPLICATE KEY UPDATE facility_name=VALUES(facility_name);

INSERT INTO health_facility (facility_code, facility_name, facility_type, district_id, address_line)
SELECT 'FAC-KOL-001','Kolhapur District Hospital Demo','HOSPITAL',district_id,'Synthetic demo address'
FROM district WHERE district_code='MH-KOL'
ON DUPLICATE KEY UPDATE facility_name=VALUES(facility_name);

INSERT INTO disease (disease_code, disease_name, disease_category, is_notifiable, description) VALUES
('DEN','Dengue','VECTOR_BORNE',TRUE,'Synthetic educational surveillance category'),
('MAL','Malaria','VECTOR_BORNE',TRUE,'Synthetic educational surveillance category'),
('INF','Influenza-like illness','RESPIRATORY',TRUE,'Synthetic educational surveillance category'),
('GAS','Acute gastroenteritis','WATER_BORNE',TRUE,'Synthetic educational surveillance category')
ON DUPLICATE KEY UPDATE disease_name=VALUES(disease_name);

INSERT INTO app_role (role_name, role_description) VALUES
('ADMIN','System administrator for academic demonstration'),
('HEALTH_OFFICER','Reviews district surveillance records'),
('LAB_TECHNICIAN','Records laboratory test results'),
('DATA_ANALYST','Reads approved reporting views')
ON DUPLICATE KEY UPDATE role_description=VALUES(role_description);

-- Demo password_hash values are placeholders, not usable login credentials.
INSERT INTO app_user (full_name, email, password_hash, role_id, facility_id)
SELECT 'Demo Health Officer','officer.demo@example.test','NOT_A_REAL_PASSWORD_HASH',
       r.role_id, f.facility_id
FROM app_role r CROSS JOIN health_facility f
WHERE r.role_name='HEALTH_OFFICER' AND f.facility_code='FAC-PUN-001'
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO app_user (full_name, email, password_hash, role_id, facility_id)
SELECT 'Demo Lab Technician','lab.demo@example.test','NOT_A_REAL_PASSWORD_HASH',
       r.role_id, f.facility_id
FROM app_role r CROSS JOIN health_facility f
WHERE r.role_name='LAB_TECHNICIAN' AND f.facility_code='FAC-KOL-001'
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO health_officer (user_id, district_id, employee_code, designation, appointed_on)
SELECT u.user_id, d.district_id, 'OFF-DEMO-001', 'District Surveillance Officer', '2025-01-01'
FROM app_user u
JOIN health_facility f ON f.facility_id=u.facility_id
JOIN district d ON d.district_id=f.district_id
WHERE u.email='officer.demo@example.test'
ON DUPLICATE KEY UPDATE designation=VALUES(designation);

INSERT INTO patient (patient_code, date_of_birth, sex_at_birth, district_id)
SELECT 'PAT-DEMO-001','1998-05-14','FEMALE',district_id FROM district WHERE district_code='MH-PUN'
ON DUPLICATE KEY UPDATE patient_code=VALUES(patient_code);

INSERT INTO patient (patient_code, date_of_birth, sex_at_birth, district_id)
SELECT 'PAT-DEMO-002','1986-11-03','MALE',district_id FROM district WHERE district_code='MH-KOL'
ON DUPLICATE KEY UPDATE patient_code=VALUES(patient_code);

INSERT INTO disease_case
(case_code, patient_id, disease_id, reporting_facility_id, reported_by_user_id,
 onset_date, report_date, case_status, severity, outcome, external_source, external_record_id, notes)
SELECT 'CASE-DEMO-001', p.patient_id, d.disease_id, f.facility_id, u.user_id,
       '2026-10-10','2026-10-12','CONFIRMED','MODERATE','ONGOING',
       'DEMO_IMPORT','DEMO-REC-001','Synthetic case for query demonstrations'
FROM patient p
JOIN district di ON di.district_id=p.district_id
JOIN disease d ON d.disease_code='DEN'
JOIN health_facility f ON f.facility_code='FAC-PUN-001'
JOIN app_user u ON u.email='officer.demo@example.test'
WHERE p.patient_code='PAT-DEMO-001'
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

INSERT INTO disease_case
(case_code, patient_id, disease_id, reporting_facility_id, reported_by_user_id,
 onset_date, report_date, case_status, severity, outcome, external_source, external_record_id, notes)
SELECT 'CASE-DEMO-002', p.patient_id, d.disease_id, f.facility_id, u.user_id,
       '2026-10-11','2026-10-13','SUSPECTED','MILD','UNKNOWN',
       'DEMO_IMPORT','DEMO-REC-002','Synthetic case for query demonstrations'
FROM patient p
JOIN disease d ON d.disease_code='INF'
JOIN health_facility f ON f.facility_code='FAC-KOL-001'
JOIN app_user u ON u.email='officer.demo@example.test'
WHERE p.patient_code='PAT-DEMO-002'
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

INSERT INTO lab_test (case_id, facility_id, test_code, test_name, specimen_collected_at,
                      result_reported_at, test_result, performed_by_user_id, remarks)
SELECT c.case_id, f.facility_id, 'TEST-DEMO-001','Dengue NS1 Antigen',
       '2026-10-12 09:00:00','2026-10-12 16:00:00','POSITIVE',u.user_id,
       'Synthetic result; not a real clinical record'
FROM disease_case c
JOIN health_facility f ON f.facility_code='FAC-PUN-001'
JOIN app_user u ON u.email='lab.demo@example.test'
WHERE c.case_code='CASE-DEMO-001'
AND NOT EXISTS (
    SELECT 1 FROM lab_test l WHERE l.test_code='TEST-DEMO-001'
);
