-- Practical query examples: Disease Surveillance DB
USE disease_surveillance;

-- 1. Join + aggregation: cases by disease and status
SELECT d.disease_name, c.case_status, COUNT(*) AS case_count
FROM disease_case c JOIN disease d ON d.disease_id=c.disease_id
GROUP BY d.disease_id, d.disease_name, c.case_status
ORDER BY case_count DESC;

-- 2. District-wise reported cases
SELECT di.district_name, COUNT(*) AS reported_cases
FROM disease_case c
JOIN health_facility f ON f.facility_id=c.reporting_facility_id
JOIN district di ON di.district_id=f.district_id
GROUP BY di.district_id, di.district_name
ORDER BY reported_cases DESC;

-- 3. Patient's case and laboratory history
SELECT p.patient_code, c.case_code, d.disease_name, c.report_date,
       l.test_name, l.test_result, l.result_reported_at
FROM patient p
JOIN disease_case c ON c.patient_id=p.patient_id
JOIN disease d ON d.disease_id=c.disease_id
LEFT JOIN lab_test l ON l.case_id=c.case_id
ORDER BY p.patient_code, c.report_date, l.specimen_collected_at;

-- 4. Subquery: diseases with more cases than the overall average per disease
SELECT d.disease_name, COUNT(*) AS total_cases
FROM disease d JOIN disease_case c ON c.disease_id=d.disease_id
GROUP BY d.disease_id, d.disease_name
HAVING COUNT(*) > (
  SELECT AVG(case_count) FROM (
    SELECT COUNT(*) AS case_count
    FROM disease_case GROUP BY disease_id
  ) AS disease_counts
);

-- 5. Window function: rank diseases by reported cases
WITH disease_counts AS (
  SELECT d.disease_name, COUNT(c.case_id) AS total_cases
  FROM disease d LEFT JOIN disease_case c ON c.disease_id=d.disease_id
  GROUP BY d.disease_id, d.disease_name
)
SELECT disease_name, total_cases,
       DENSE_RANK() OVER (ORDER BY total_cases DESC) AS case_rank
FROM disease_counts;

-- 6. Set operator example (UNION)
SELECT patient_id FROM disease_case WHERE case_status='CONFIRMED'
UNION
SELECT patient_id FROM disease_case WHERE case_status='SUSPECTED';

-- 7. Views
SELECT * FROM v_case_lab_summary;
SELECT * FROM v_district_daily_cases;
SELECT * FROM v_open_outbreak_alerts;

-- 8. Function example
SELECT fn_confirmation_rate(1, '2026-01-01', '2026-12-31') AS confirmation_rate_percent;

-- 9. Procedure example: change district id to a real id in your dataset
-- CALL sp_district_disease_counts(1, '2026-01-01', '2026-12-31');

-- 10. Explain plan for index review
EXPLAIN
SELECT case_id, case_status
FROM disease_case
WHERE disease_id = 1
  AND report_date BETWEEN '2026-01-01' AND '2026-12-31';

-- 11. TCL: transaction / savepoint demonstration (use a disposable test row)
-- START TRANSACTION;
-- UPDATE disease_case SET severity='SEVERE' WHERE case_code='CASE-DEMO-001';
-- SAVEPOINT after_update;
-- UPDATE disease_case SET severity='CRITICAL' WHERE case_code='CASE-DEMO-001';
-- ROLLBACK TO SAVEPOINT after_update;
-- COMMIT;

-- 12. DCL examples are documented in schema.sql. Run them as an administrator.
