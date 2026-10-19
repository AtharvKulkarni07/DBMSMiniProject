-- ============================================================================
-- DISEASE SURVEILLANCE & EPIDEMIOLOGY DATABASE (DSED)
-- Comprehensive Practical Queries (Module II, III & Practical 1 - 7)
-- ============================================================================
USE disease_surveillance;

-- ----------------------------------------------------------------------------
-- PRACTICAL 3: DML AND COMPLEX QUERIES
-- ----------------------------------------------------------------------------

-- Query 1: Multi-Table INNER & LEFT JOIN
-- Comprehensive epidemiological case dossier with patient, disease, facility, and diagnostic test details
SELECT
    c.case_code,
    p.patient_code,
    p.sex_at_birth,
    d.disease_name,
    d.disease_category,
    f.facility_name,
    di.district_name,
    c.report_date,
    c.case_status,
    c.severity,
    COALESCE(lt.test_name, 'No Lab Test Ordered') AS lab_test_name,
    COALESCE(lt.test_result, 'N/A') AS lab_result
FROM disease_case c
JOIN patient p ON p.patient_id = c.patient_id
JOIN disease d ON d.disease_id = c.disease_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
LEFT JOIN lab_test lt ON lt.case_id = c.case_id
ORDER BY c.report_date DESC, c.case_id ASC;

-- Query 2: Aggregate Grouping with HAVING & Filtering
-- Districts with high disease diversity having more than 1 distinct pathogen reported
SELECT
    di.district_name,
    COUNT(c.case_id) AS total_cases,
    COUNT(DISTINCT c.disease_id) AS distinct_pathogens,
    SUM(c.case_status = 'CONFIRMED') AS confirmed_cases,
    ROUND(SUM(c.case_status = 'CONFIRMED') * 100.0 / COUNT(c.case_id), 1) AS confirmation_pct
FROM disease_case c
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
GROUP BY di.district_id, di.district_name
HAVING COUNT(c.case_id) >= 2
ORDER BY total_cases DESC;

-- Query 3: Correlated Subquery
-- Cases whose onset-to-report delay exceeds the average delay for that specific disease
SELECT
    c.case_code,
    d.disease_name,
    c.onset_date,
    c.report_date,
    DATEDIFF(c.report_date, c.onset_date) AS delay_days
FROM disease_case c
JOIN disease d ON d.disease_id = c.disease_id
WHERE c.onset_date IS NOT NULL
  AND DATEDIFF(c.report_date, c.onset_date) > (
      SELECT AVG(DATEDIFF(c2.report_date, c2.onset_date))
      FROM disease_case c2
      WHERE c2.disease_id = c.disease_id
        AND c2.onset_date IS NOT NULL
  )
ORDER BY delay_days DESC;

-- Query 4: Non-Correlated Subquery with IN / NOT EXISTS
-- Diseases that have active cases but zero fatal outcomes
SELECT disease_code, disease_name, disease_category
FROM disease
WHERE disease_id IN (
    SELECT DISTINCT disease_id FROM disease_case WHERE case_status = 'CONFIRMED'
)
AND disease_id NOT IN (
    SELECT DISTINCT disease_id FROM disease_case WHERE case_status = 'FATAL'
);

-- Query 5: Window Function - Running Total & Caseload Ranking (DENSE_RANK)
-- Computes the epidemiological rank and running total of cases per disease category
SELECT
    d.disease_category,
    d.disease_name,
    COUNT(c.case_id) AS total_cases,
    DENSE_RANK() OVER (
        PARTITION BY d.disease_category
        ORDER BY COUNT(c.case_id) DESC
    ) AS category_rank,
    SUM(COUNT(c.case_id)) OVER (
        PARTITION BY d.disease_category
        ORDER BY COUNT(c.case_id) DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_cumulative_cases
FROM disease d
LEFT JOIN disease_case c ON c.disease_id = d.disease_id
GROUP BY d.disease_category, d.disease_id, d.disease_name
ORDER BY d.disease_category, category_rank;

-- Query 6: Window Function - Lead / Lag for Epidemic Progression
-- Tracks daily reporting trends and compares today's cases with previous day
WITH daily_trend AS (
    SELECT report_date, COUNT(*) AS daily_cases
    FROM disease_case
    GROUP BY report_date
)
SELECT
    report_date,
    daily_cases,
    LAG(daily_cases, 1, 0) OVER (ORDER BY report_date) AS prev_day_cases,
    daily_cases - LAG(daily_cases, 1, 0) OVER (ORDER BY report_date) AS day_over_day_change
FROM daily_trend
ORDER BY report_date;

-- Query 7: Set Operator (UNION)
-- Combines patients requiring immediate epidemiological intervention:
-- (a) Patients with Severe/Critical status UNION (b) Patients with positive high-consequence pathogens
SELECT p.patient_code, p.full_name_masked, di.district_name, 'CRITICAL_SEVERITY' AS trigger_reason
FROM disease_case c
JOIN patient p ON p.patient_id = c.patient_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
WHERE c.severity IN ('SEVERE', 'CRITICAL')
UNION
SELECT p.patient_code, p.full_name_masked, di.district_name, 'CONFIRMED_VIBRIO_CHOLERAE' AS trigger_reason
FROM disease_case c
JOIN patient p ON p.patient_id = c.patient_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
JOIN lab_test lt ON lt.case_id = c.case_id
WHERE lt.test_result = 'POSITIVE' AND lt.test_name LIKE '%Cholera%'
ORDER BY patient_code;

-- ----------------------------------------------------------------------------
-- PRACTICAL 2: DATABASE VIEWS FOR RESTRICTED ACCESS
-- ----------------------------------------------------------------------------

-- View Query 1: Case & Laboratory Summary View
SELECT * FROM v_case_lab_summary ORDER BY report_date DESC;

-- View Query 2: Daily District Surveillance Aggregations
SELECT * FROM v_district_daily_cases ORDER BY report_date DESC;

-- View Query 3: Active Outbreak Early Warning Alerts
SELECT * FROM v_open_outbreak_alerts;

-- View Query 4: High-Risk District Surveillance Summary
SELECT * FROM v_high_risk_surveillance_summary;

-- ----------------------------------------------------------------------------
-- PRACTICAL 5 & 6: STORED PROCEDURES, FUNCTIONS & CURSORS
-- ----------------------------------------------------------------------------

-- Function 1: Disease Confirmation Rate Calculation
SELECT
    disease_name,
    fn_confirmation_rate(disease_id, '2026-10-01', '2026-10-31') AS confirmation_pct
FROM disease;

-- Function 2: Multi-Factor Epidemiological Risk Index
SELECT
    di.district_name,
    d.disease_name,
    fn_calculate_risk_index(di.district_id, d.disease_id) AS dynamic_risk_score
FROM district di
CROSS JOIN disease d
WHERE d.disease_code IN ('DEN', 'GAS', 'COV')
ORDER BY dynamic_risk_score DESC;

-- Procedure 1 Execution: District Surveillance Summary
CALL sp_district_disease_counts(1, '2026-10-01', '2026-10-31');

-- Procedure 2 Execution: Cursor Batch Processing of Raw Lab Feeds (Practical 6)
-- Reads raw staging table, inserts clean tests, updates status, avoids duplicates
SET @proc_count = 0, @dup_count = 0, @err_count = 0;
CALL sp_ingest_lab_feed_cursor(@proc_count, @dup_count, @err_count);
SELECT @proc_count AS records_ingested, @dup_count AS duplicates_skipped, @err_count AS errors_encountered;

-- Procedure 3 Execution: Automated Outbreak Threshold Evaluator
SET @new_alerts = 0;
CALL sp_evaluate_outbreak_thresholds(14, @new_alerts);
SELECT @new_alerts AS automated_alerts_spawned;

-- ----------------------------------------------------------------------------
-- PRACTICAL 7 & MODULE III: QUERY PROCESSING & INDEX OPTIMIZATION (EXPLAIN)
-- ----------------------------------------------------------------------------

-- EXPLAIN Query 1: Verifies composite index `idx_case_disease_date` usage (ref/range scan vs full scan)
EXPLAIN
SELECT case_id, case_code, severity, outcome
FROM disease_case
WHERE disease_id = 1
  AND report_date BETWEEN '2026-10-01' AND '2026-10-31';

-- EXPLAIN Query 2: Verifies index `idx_facility_district` on facility lookup
EXPLAIN
SELECT f.facility_name, COUNT(c.case_id)
FROM health_facility f
LEFT JOIN disease_case c ON c.reporting_facility_id = f.facility_id
WHERE f.district_id = 1
GROUP BY f.facility_id, f.facility_name;

-- ----------------------------------------------------------------------------
-- MODULE II: TCL TRANSACTION WITH SAVEPOINT & ROLLBACK
-- ----------------------------------------------------------------------------
START TRANSACTION;
-- Step 1: Update severity
UPDATE disease_case
SET severity = 'SEVERE'
WHERE case_code = 'CASE-2026-PUN-001';

SAVEPOINT sp_severity_updated;

-- Step 2: Tentative premature status change to be rolled back
UPDATE disease_case
SET case_status = 'FATAL'
WHERE case_code = 'CASE-2026-PUN-001';

-- Step 3: Clinical audit discovers mistake, rollback to savepoint
ROLLBACK TO SAVEPOINT sp_severity_updated;

-- Step 4: Commit only legitimate changes
COMMIT;

-- Verify final status after rollback (should remain CONFIRMED, not FATAL)
SELECT case_code, case_status, severity FROM disease_case WHERE case_code = 'CASE-2026-PUN-001';
