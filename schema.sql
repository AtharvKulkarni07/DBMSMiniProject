-- ============================================================================
-- DISEASE SURVEILLANCE & EPIDEMIOLOGY DATABASE (DSED)
-- Coursework: Database Management Systems (Modules I, II, III, IV & Practicals 1-7)
-- Target DBMS: MySQL 8.0.16+ / MySQL 8.4
-- Domain: Biomedical & Public Health Surveillance
-- Author: Atharv Kulkarni (https://github.com/AtharvKulkarni07/DBMSMiniProject)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS disease_surveillance
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE disease_surveillance;

-- ----------------------------------------------------------------------------
-- Clean Slate Teardown (Drops Views & Tables in reverse FK dependency order)
-- ----------------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_high_risk_surveillance_summary;
DROP VIEW IF EXISTS v_epidemic_transmission_stats;
DROP VIEW IF EXISTS v_district_daily_cases;
DROP VIEW IF EXISTS v_case_lab_summary;
DROP VIEW IF EXISTS v_open_outbreak_alerts;
DROP VIEW IF EXISTS v_user_directory;

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS outbreak_alert;
DROP TABLE IF EXISTS case_status_history;
DROP TABLE IF EXISTS raw_lab_feed;
DROP TABLE IF EXISTS lab_test;
DROP TABLE IF EXISTS disease_case;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS health_officer;
DROP TABLE IF EXISTS health_facility;
DROP TABLE IF EXISTS disease;
DROP TABLE IF EXISTS app_user;
DROP TABLE IF EXISTS app_role;
DROP TABLE IF EXISTS district;

DROP PROCEDURE IF EXISTS sp_register_disease_case;
DROP PROCEDURE IF EXISTS sp_district_disease_counts;
DROP PROCEDURE IF EXISTS sp_ingest_lab_feed_cursor;
DROP PROCEDURE IF EXISTS sp_evaluate_outbreak_thresholds;
DROP FUNCTION IF EXISTS fn_confirmation_rate;
DROP FUNCTION IF EXISTS fn_calculate_risk_index;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- MODULE I & PRACTICAL 1 & 2: DDL, CONSTRAINTS & NORMALIZED SCHEMA (BCNF)
-- ============================================================================

-- 1. District Entity (Geographical Jurisdiction)
-- FD: district_id -> district_code, district_name, state_name (BCNF verified)
CREATE TABLE district (
    district_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    district_code VARCHAR(12) NOT NULL UNIQUE,
    district_name VARCHAR(100) NOT NULL UNIQUE,
    state_name VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    population INT UNSIGNED NOT NULL DEFAULT 1000000,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Health Facility Entity (Hospitals, Diagnostic Centers, Primary Health Centers)
-- FD: facility_id -> facility_code, facility_name, facility_type, district_id (BCNF verified)
CREATE TABLE health_facility (
    facility_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    facility_code VARCHAR(24) NOT NULL UNIQUE,
    facility_name VARCHAR(160) NOT NULL,
    facility_type VARCHAR(30) NOT NULL,
    district_id INT UNSIGNED NOT NULL,
    contact_phone VARCHAR(20) NULL,
    address_line VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_facility_district FOREIGN KEY (district_id)
      REFERENCES district(district_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_facility_type CHECK
      (facility_type IN ('HOSPITAL','CLINIC','LABORATORY','PUBLIC_HEALTH_OFFICE','RESEARCH_CENTER','OTHER')),
    INDEX idx_facility_district (district_id, is_active)
) ENGINE=InnoDB;

-- 3. Disease Entity (Epidemiological Master Catalog)
-- FD: disease_id -> disease_code, disease_name, disease_category, is_notifiable (BCNF verified)
CREATE TABLE disease (
    disease_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    disease_code VARCHAR(20) NOT NULL UNIQUE,
    disease_name VARCHAR(120) NOT NULL UNIQUE,
    disease_category VARCHAR(40) NOT NULL,
    transmission_mode VARCHAR(60) NOT NULL DEFAULT 'DROPLET_OR_VECTOR',
    alert_threshold_weekly INT UNSIGNED NOT NULL DEFAULT 10,
    is_notifiable BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_disease_category CHECK
      (disease_category IN ('VECTOR_BORNE','RESPIRATORY','WATER_BORNE','FOOD_BORNE','VACCINE_PREVENTABLE','ZOONOTIC','OTHER'))
) ENGINE=InnoDB;

-- 4. Application Role (RBAC)
CREATE TABLE app_role (
    role_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(40) NOT NULL UNIQUE,
    role_description VARCHAR(255)
) ENGINE=InnoDB;

-- 5. Application User (Surveillance staff, Officers, Lab Techs)
CREATE TABLE app_user (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id SMALLINT UNSIGNED NOT NULL,
    facility_id BIGINT UNSIGNED NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id)
      REFERENCES app_role(role_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_user_facility FOREIGN KEY (facility_id)
      REFERENCES health_facility(facility_id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_user_role_active (role_id, is_active)
) ENGINE=InnoDB;

-- 6. Health Officer (Surveillance Officer specialization)
CREATE TABLE health_officer (
    officer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    district_id INT UNSIGNED NOT NULL,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    designation VARCHAR(100) NOT NULL,
    appointed_on DATE NULL,
    CONSTRAINT fk_officer_user FOREIGN KEY (user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_officer_district FOREIGN KEY (district_id)
      REFERENCES district(district_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_officer_district (district_id)
) ENGINE=InnoDB;

-- 7. Patient Entity (De-identified Surveillance Demographics)
-- FD: patient_id -> patient_code, date_of_birth, sex_at_birth, district_id (BCNF verified)
CREATE TABLE patient (
    patient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(30) NOT NULL UNIQUE,
    full_name_masked VARCHAR(60) NOT NULL DEFAULT 'Subject Anonymous',
    date_of_birth DATE NULL,
    sex_at_birth VARCHAR(20) NOT NULL DEFAULT 'NOT_RECORDED',
    district_id INT UNSIGNED NOT NULL,
    contact_phone_masked VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_district FOREIGN KEY (district_id)
      REFERENCES district(district_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_patient_sex CHECK
      (sex_at_birth IN ('FEMALE','MALE','INTERSEX','NOT_RECORDED')),
    INDEX idx_patient_district (district_id),
    INDEX idx_patient_dob (date_of_birth)
) ENGINE=InnoDB;

-- 8. Disease Case Entity (Core Epidemiological Encounter)
-- FD: case_id -> case_code, patient_id, disease_id, reporting_facility_id, reported_by_user_id... (BCNF)
CREATE TABLE disease_case (
    case_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_code VARCHAR(32) NOT NULL UNIQUE,
    patient_id BIGINT UNSIGNED NOT NULL,
    disease_id INT UNSIGNED NOT NULL,
    reporting_facility_id BIGINT UNSIGNED NOT NULL,
    reported_by_user_id BIGINT UNSIGNED NOT NULL,
    onset_date DATE NULL,
    report_date DATE NOT NULL,
    case_status VARCHAR(20) NOT NULL DEFAULT 'SUSPECTED',
    severity VARCHAR(20) NOT NULL DEFAULT 'MODERATE',
    outcome VARCHAR(20) NOT NULL DEFAULT 'ONGOING',
    hospitalized BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at DATETIME NULL,
    external_source VARCHAR(80) NULL,
    external_record_id VARCHAR(120) NULL,
    notes VARCHAR(1000) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_case_patient FOREIGN KEY (patient_id)
      REFERENCES patient(patient_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_case_disease FOREIGN KEY (disease_id)
      REFERENCES disease(disease_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_case_facility FOREIGN KEY (reporting_facility_id)
      REFERENCES health_facility(facility_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_case_reporter FOREIGN KEY (reported_by_user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_case_status CHECK
      (case_status IN ('SUSPECTED','CONFIRMED','DISCARDED','RECOVERED','FATAL')),
    CONSTRAINT chk_case_severity CHECK
      (severity IN ('MILD','MODERATE','SEVERE','CRITICAL','UNKNOWN')),
    CONSTRAINT chk_case_outcome CHECK
      (outcome IN ('ONGOING','RECOVERED','FATAL','TRANSFERRED','LOST_TO_FOLLOWUP')),
    CONSTRAINT chk_case_dates CHECK
      (onset_date IS NULL OR onset_date <= report_date),
    CONSTRAINT uq_case_external_record UNIQUE (external_source, external_record_id),
    INDEX idx_case_report_date (report_date),
    INDEX idx_case_disease_date (disease_id, report_date),
    INDEX idx_case_status_date (case_status, report_date),
    INDEX idx_case_patient_date (patient_id, report_date),
    INDEX idx_case_facility_date (reporting_facility_id, report_date)
) ENGINE=InnoDB;

-- 9. Lab Diagnostic Test Entity
CREATE TABLE lab_test (
    lab_test_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    facility_id BIGINT UNSIGNED NOT NULL,
    test_code VARCHAR(40) NOT NULL,
    test_name VARCHAR(120) NOT NULL,
    specimen_collected_at DATETIME NOT NULL,
    result_reported_at DATETIME NULL,
    test_result VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    performed_by_user_id BIGINT UNSIGNED NULL,
    remarks VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lab_case FOREIGN KEY (case_id)
      REFERENCES disease_case(case_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lab_facility FOREIGN KEY (facility_id)
      REFERENCES health_facility(facility_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_lab_performer FOREIGN KEY (performed_by_user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_lab_result CHECK
      (test_result IN ('PENDING','POSITIVE','NEGATIVE','INCONCLUSIVE','INVALID')),
    CONSTRAINT chk_lab_dates CHECK
      (result_reported_at IS NULL OR result_reported_at >= specimen_collected_at),
    INDEX idx_lab_case_date (case_id, specimen_collected_at),
    INDEX idx_lab_result_date (test_result, specimen_collected_at)
) ENGINE=InnoDB;

-- 10. Raw Lab Feed (Staging table for Practical 6 - Cursors & Batch Processing)
CREATE TABLE raw_lab_feed (
    feed_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_code VARCHAR(32) NOT NULL,
    facility_code VARCHAR(24) NOT NULL,
    test_code VARCHAR(40) NOT NULL,
    test_name VARCHAR(120) NOT NULL,
    specimen_collected_at DATETIME NOT NULL,
    result_reported_at DATETIME NULL,
    test_result VARCHAR(20) NOT NULL DEFAULT 'POSITIVE',
    technician_email VARCHAR(190) NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    process_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_BATCH',
    processed_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_feed_status (is_processed, created_at)
) ENGINE=InnoDB;

-- 11. Case Status History (Tracks status lifecycles & transitions)
CREATE TABLE case_status_history (
    history_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    case_id BIGINT UNSIGNED NOT NULL,
    old_status VARCHAR(20) NULL,
    new_status VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_reason VARCHAR(500),
    CONSTRAINT fk_history_case FOREIGN KEY (case_id)
      REFERENCES disease_case(case_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_history_case_time (case_id, changed_at)
) ENGINE=InnoDB;

-- 12. Outbreak Alert Entity (Automated Early Warning Thresholds)
CREATE TABLE outbreak_alert (
    alert_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    alert_code VARCHAR(32) NOT NULL UNIQUE,
    district_id INT UNSIGNED NOT NULL,
    disease_id INT UNSIGNED NOT NULL,
    alert_level VARCHAR(15) NOT NULL DEFAULT 'MEDIUM',
    alert_status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    window_start DATE NOT NULL,
    window_end DATE NOT NULL,
    observed_case_count INT UNSIGNED NOT NULL,
    threshold_case_count INT UNSIGNED NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by_user_id BIGINT UNSIGNED NULL,
    acknowledged_by_user_id BIGINT UNSIGNED NULL,
    acknowledged_at DATETIME NULL,
    resolution_notes VARCHAR(1000),
    CONSTRAINT fk_alert_district FOREIGN KEY (district_id)
      REFERENCES district(district_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_alert_disease FOREIGN KEY (disease_id)
      REFERENCES disease(disease_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_alert_generator FOREIGN KEY (generated_by_user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_alert_acknowledger FOREIGN KEY (acknowledged_by_user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_alert_level CHECK (alert_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    CONSTRAINT chk_alert_status CHECK (alert_status IN ('OPEN','ACKNOWLEDGED','INVESTIGATING','RESOLVED','FALSE_ALARM')),
    CONSTRAINT chk_alert_window CHECK (window_start <= window_end),
    INDEX idx_alert_district_status (district_id, alert_status, generated_at),
    INDEX idx_alert_disease_window (disease_id, window_start, window_end)
) ENGINE=InnoDB;

-- 13. Audit Log Entity (Captures granular changes via Triggers)
CREATE TABLE audit_log (
    audit_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(64) NOT NULL,
    record_key VARCHAR(100) NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_values JSON NULL,
    new_values JSON NULL,
    CONSTRAINT fk_audit_user FOREIGN KEY (changed_by_user_id)
      REFERENCES app_user(user_id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_audit_action CHECK (action_type IN ('INSERT','UPDATE','DELETE')),
    INDEX idx_audit_table_record (table_name, record_key),
    INDEX idx_audit_changed_at (changed_at)
) ENGINE=InnoDB;

-- ============================================================================
-- MODULE II: DATABASE VIEWS (Security, Reporting & Restricted Access)
-- ============================================================================

-- View 1: Detailed Lab Summary for each registered case
CREATE OR REPLACE VIEW v_case_lab_summary AS
SELECT
    c.case_id, c.case_code, c.report_date, c.case_status, c.severity,
    d.disease_name, d.disease_category, f.facility_name,
    COUNT(l.lab_test_id) AS total_tests,
    SUM(l.test_result = 'POSITIVE') AS positive_tests,
    SUM(l.test_result = 'NEGATIVE') AS negative_tests,
    SUM(l.test_result = 'PENDING') AS pending_tests,
    MAX(l.result_reported_at) AS latest_result_at
FROM disease_case c
JOIN disease d ON d.disease_id = c.disease_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
LEFT JOIN lab_test l ON l.case_id = c.case_id
GROUP BY c.case_id, c.case_code, c.report_date, c.case_status,
         c.severity, d.disease_name, d.disease_category, f.facility_name;

-- View 2: District-Level Daily Aggregate Surveillance
CREATE OR REPLACE VIEW v_district_daily_cases AS
SELECT
    hf.district_id,
    di.district_name,
    c.report_date,
    d.disease_name,
    COUNT(*) AS reported_cases,
    SUM(c.case_status = 'CONFIRMED') AS confirmed_cases,
    SUM(c.case_status = 'SUSPECTED') AS suspected_cases,
    SUM(c.case_status = 'FATAL') AS fatal_cases,
    SUM(c.hospitalized = TRUE) AS hospitalized_cases
FROM disease_case c
JOIN health_facility hf ON hf.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = hf.district_id
JOIN disease d ON d.disease_id = c.disease_id
GROUP BY hf.district_id, di.district_name, c.report_date, d.disease_name;

-- View 3: Open Outbreak Alerts (High-priority action list)
CREATE OR REPLACE VIEW v_open_outbreak_alerts AS
SELECT a.alert_id, a.alert_code, di.district_name, d.disease_name, a.alert_level,
       a.alert_status, a.window_start, a.window_end,
       a.observed_case_count, a.threshold_case_count,
       ROUND((a.observed_case_count - a.threshold_case_count) * 100.0 / a.threshold_case_count, 1) AS surge_percentage,
       a.generated_at
FROM outbreak_alert a
JOIN district di ON di.district_id = a.district_id
JOIN disease d ON d.disease_id = a.disease_id
WHERE a.alert_status IN ('OPEN','ACKNOWLEDGED','INVESTIGATING');

-- View 4: Public Health User Directory (For administrative views)
CREATE OR REPLACE VIEW v_user_directory AS
SELECT u.user_id, u.full_name, u.email, r.role_name, u.is_active,
       hf.facility_name, d.district_name
FROM app_user u
JOIN app_role r ON r.role_id = u.role_id
LEFT JOIN health_facility hf ON hf.facility_id = u.facility_id
LEFT JOIN district d ON d.district_id = hf.district_id;

-- View 5: High Risk Surveillance Summary (Consolidated metrics)
CREATE OR REPLACE VIEW v_high_risk_surveillance_summary AS
SELECT
    di.district_id,
    di.district_name,
    COUNT(c.case_id) AS total_cases,
    SUM(c.case_status = 'CONFIRMED') AS confirmed_cases,
    SUM(c.case_status = 'FATAL') AS fatal_cases,
    COUNT(DISTINCT c.disease_id) AS active_diseases,
    ROUND(SUM(c.case_status = 'CONFIRMED') * 100.0 / NULLIF(COUNT(c.case_id), 0), 2) AS confirmation_pct
FROM district di
LEFT JOIN health_facility hf ON hf.district_id = di.district_id
LEFT JOIN disease_case c ON c.reporting_facility_id = hf.facility_id
GROUP BY di.district_id, di.district_name;

-- ============================================================================
-- PRACTICAL 6: DATABASE TRIGGERS (Automated Business Rules & Auditing)
-- ============================================================================

DELIMITER $$

-- Trigger 1: Record Case Status Transition into History Table
CREATE TRIGGER trg_case_status_history
AFTER UPDATE ON disease_case
FOR EACH ROW
BEGIN
    IF NOT (OLD.case_status <=> NEW.case_status) THEN
        INSERT INTO case_status_history
          (case_id, old_status, new_status, changed_by_user_id, change_reason)
        VALUES
          (NEW.case_id, OLD.case_status, NEW.case_status,
           @app_user_id, CONCAT('Automated transition from ', OLD.case_status, ' to ', NEW.case_status));
    END IF;
END$$

-- Trigger 2: Maintain JSON Audit Log on Case Insert
CREATE TRIGGER trg_case_audit_insert
AFTER INSERT ON disease_case
FOR EACH ROW
BEGIN
    INSERT INTO audit_log
      (table_name, record_key, action_type, changed_by_user_id, new_values)
    VALUES
      ('disease_case', CAST(NEW.case_id AS CHAR), 'INSERT',
       @app_user_id,
       JSON_OBJECT(
         'case_code', NEW.case_code,
         'patient_id', NEW.patient_id,
         'disease_id', NEW.disease_id,
         'facility_id', NEW.reporting_facility_id,
         'case_status', NEW.case_status,
         'severity', NEW.severity,
         'report_date', NEW.report_date
       ));
END$$

-- Trigger 3: Maintain JSON Audit Log on Case Update
CREATE TRIGGER trg_case_audit_update
AFTER UPDATE ON disease_case
FOR EACH ROW
BEGIN
    INSERT INTO audit_log
      (table_name, record_key, action_type, changed_by_user_id, old_values, new_values)
    VALUES
      ('disease_case', CAST(NEW.case_id AS CHAR), 'UPDATE',
       @app_user_id,
       JSON_OBJECT(
         'case_status', OLD.case_status,
         'severity', OLD.severity,
         'outcome', OLD.outcome,
         'hospitalized', OLD.hospitalized
       ),
       JSON_OBJECT(
         'case_status', NEW.case_status,
         'severity', NEW.severity,
         'outcome', NEW.outcome,
         'hospitalized', NEW.hospitalized
       ));
END$$

-- Trigger 4: Automatic Case Confirmation when Lab Test is POSITIVE
CREATE TRIGGER trg_lab_test_auto_confirm
AFTER UPDATE ON lab_test
FOR EACH ROW
BEGIN
    IF NEW.test_result = 'POSITIVE' AND OLD.test_result <> 'POSITIVE' THEN
        UPDATE disease_case
        SET case_status = 'CONFIRMED'
        WHERE case_id = NEW.case_id
          AND case_status = 'SUSPECTED';
    END IF;
END$$

-- ============================================================================
-- PRACTICAL 4 & 5: STORED PROCEDURES & FUNCTIONS (With Parameters & Exception Handling)
-- ============================================================================

-- Procedure 1: Atomic Case Registration with Transaction & Error Handling
CREATE PROCEDURE sp_register_disease_case(
    IN p_case_code VARCHAR(32),
    IN p_patient_id BIGINT UNSIGNED,
    IN p_disease_id INT UNSIGNED,
    IN p_facility_id BIGINT UNSIGNED,
    IN p_reported_by BIGINT UNSIGNED,
    IN p_report_date DATE,
    IN p_severity VARCHAR(20),
    IN p_notes VARCHAR(1000),
    OUT p_status_message VARCHAR(255)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_message = 'ERROR: Transaction rolled back due to SQL Exception';
        RESIGNAL;
    END;

    START TRANSACTION;
    INSERT INTO disease_case
      (case_code, patient_id, disease_id, reporting_facility_id,
       reported_by_user_id, report_date, severity, notes)
    VALUES
      (p_case_code, p_patient_id, p_disease_id, p_facility_id,
       p_reported_by, p_report_date, p_severity, p_notes);

    COMMIT;
    SET p_status_message = CONCAT('SUCCESS: Case ', p_case_code, ' registered successfully');
END$$

-- Procedure 2: District-wise Disease Caseload Aggregator
CREATE PROCEDURE sp_district_disease_counts(
    IN p_district_id INT UNSIGNED,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT d.disease_code,
           d.disease_name,
           COUNT(*) AS total_cases,
           SUM(c.case_status = 'CONFIRMED') AS confirmed_cases,
           SUM(c.case_status = 'SUSPECTED') AS suspected_cases,
           SUM(c.case_status = 'FATAL') AS fatal_cases,
           ROUND(SUM(c.case_status = 'CONFIRMED') * 100.0 / COUNT(*), 1) AS confirmation_percentage
    FROM disease_case c
    JOIN disease d ON d.disease_id = c.disease_id
    JOIN health_facility f ON f.facility_id = c.reporting_facility_id
    WHERE f.district_id = p_district_id
      AND c.report_date BETWEEN p_start_date AND p_end_date
    GROUP BY d.disease_id, d.disease_code, d.disease_name
    ORDER BY total_cases DESC;
END$$

-- Procedure 3: Batch Processing of Lab Test Feed using EXPLICIT CURSOR (Practical 6)
-- Reads raw staging table row-by-row, checks duplicates, inserts clean records, and updates feed status.
CREATE PROCEDURE sp_ingest_lab_feed_cursor(
    OUT p_total_processed INT,
    OUT p_duplicates_skipped INT,
    OUT p_errors_encountered INT
)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_feed_id BIGINT UNSIGNED;
    DECLARE v_case_code VARCHAR(32);
    DECLARE v_facility_code VARCHAR(24);
    DECLARE v_test_code VARCHAR(40);
    DECLARE v_test_name VARCHAR(120);
    DECLARE v_collected_at DATETIME;
    DECLARE v_reported_at DATETIME;
    DECLARE v_result VARCHAR(20);
    DECLARE v_case_id BIGINT UNSIGNED;
    DECLARE v_facility_id BIGINT UNSIGNED;
    DECLARE v_dup_count INT DEFAULT 0;

    -- Explicit Cursor Declaration
    DECLARE cur_feed CURSOR FOR
        SELECT feed_id, case_code, facility_code, test_code, test_name,
               specimen_collected_at, result_reported_at, test_result
        FROM raw_lab_feed
        WHERE is_processed = FALSE
        ORDER BY feed_id ASC;

    -- NOT FOUND Handler to terminate cursor loop
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Exception Handler for corrupt rows
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_errors_encountered = p_errors_encountered + 1;
        UPDATE raw_lab_feed
        SET process_status = 'ERROR_INVALID_DATA', is_processed = TRUE, processed_at = NOW()
        WHERE feed_id = v_feed_id;
    END;

    SET p_total_processed = 0;
    SET p_duplicates_skipped = 0;
    SET p_errors_encountered = 0;

    OPEN cur_feed;

    read_loop: LOOP
        FETCH cur_feed INTO v_feed_id, v_case_code, v_facility_code, v_test_code,
                            v_test_name, v_collected_at, v_reported_at, v_result;
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        -- Resolve case_id and facility_id
        SELECT case_id INTO v_case_id FROM disease_case WHERE case_code = v_case_code LIMIT 1;
        SELECT facility_id INTO v_facility_id FROM health_facility WHERE facility_code = v_facility_code LIMIT 1;

        IF v_case_id IS NULL OR v_facility_id IS NULL THEN
            UPDATE raw_lab_feed
            SET process_status = 'SKIPPED_MISSING_FOREIGN_KEY', is_processed = TRUE, processed_at = NOW()
            WHERE feed_id = v_feed_id;
            SET p_errors_encountered = p_errors_encountered + 1;
        ELSE
            -- Check for duplicate test in target master table
            SELECT COUNT(*) INTO v_dup_count
            FROM lab_test
            WHERE test_code = v_test_code;

            IF v_dup_count > 0 THEN
                UPDATE raw_lab_feed
                SET process_status = 'SKIPPED_DUPLICATE', is_processed = TRUE, processed_at = NOW()
                WHERE feed_id = v_feed_id;
                SET p_duplicates_skipped = p_duplicates_skipped + 1;
            ELSE
                -- Clean insertion
                INSERT INTO lab_test
                  (case_id, facility_id, test_code, test_name,
                   specimen_collected_at, result_reported_at, test_result)
                VALUES
                  (v_case_id, v_facility_id, v_test_code, v_test_name,
                   v_collected_at, v_reported_at, v_result);

                UPDATE raw_lab_feed
                SET process_status = 'SUCCESS_INGESTED', is_processed = TRUE, processed_at = NOW()
                WHERE feed_id = v_feed_id;

                SET p_total_processed = p_total_processed + 1;
            END IF;
        END IF;
    END LOOP;

    CLOSE cur_feed;
END$$

-- Procedure 4: Automated Outbreak Threshold Evaluation Routine
CREATE PROCEDURE sp_evaluate_outbreak_thresholds(
    IN p_days_back INT,
    OUT p_alerts_created INT
)
BEGIN
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_district_id INT UNSIGNED;
    DECLARE v_disease_id INT UNSIGNED;
    DECLARE v_observed_cases INT;
    DECLARE v_threshold INT;
    DECLARE v_existing_count INT;

    DECLARE cur_eval CURSOR FOR
        SELECT hf.district_id, c.disease_id, COUNT(*) AS case_count, d.alert_threshold_weekly
        FROM disease_case c
        JOIN health_facility hf ON hf.facility_id = c.reporting_facility_id
        JOIN disease d ON d.disease_id = c.disease_id
        WHERE c.report_date >= DATE_SUB(CURDATE(), INTERVAL p_days_back DAY)
        GROUP BY hf.district_id, c.disease_id, d.alert_threshold_weekly
        HAVING COUNT(*) >= d.alert_threshold_weekly;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    SET p_alerts_created = 0;
    OPEN cur_eval;

    eval_loop: LOOP
        FETCH cur_eval INTO v_district_id, v_disease_id, v_observed_cases, v_threshold;
        IF v_done THEN
            LEAVE eval_loop;
        END IF;

        -- Check if an active open alert already exists
        SELECT COUNT(*) INTO v_existing_count
        FROM outbreak_alert
        WHERE district_id = v_district_id
          AND disease_id = v_disease_id
          AND alert_status IN ('OPEN','ACKNOWLEDGED','INVESTIGATING');

        IF v_existing_count = 0 THEN
            INSERT INTO outbreak_alert
              (alert_code, district_id, disease_id, alert_level, alert_status,
               window_start, window_end, observed_case_count, threshold_case_count)
            VALUES
              (CONCAT('ALT-', v_district_id, '-', v_disease_id, '-', DATE_FORMAT(NOW(), '%m%d%H%i')),
               v_district_id, v_disease_id,
               CASE
                 WHEN v_observed_cases >= v_threshold * 2 THEN 'CRITICAL'
                 WHEN v_observed_cases >= v_threshold * 1.5 THEN 'HIGH'
                 ELSE 'MEDIUM'
               END,
               'OPEN', DATE_SUB(CURDATE(), INTERVAL p_days_back DAY), CURDATE(),
               v_observed_cases, v_threshold);

            SET p_alerts_created = p_alerts_created + 1;
        END IF;
    END LOOP;

    CLOSE cur_eval;
END$$

-- Function 1: Disease Confirmation Rate Calculator
CREATE FUNCTION fn_confirmation_rate(
    p_disease_id INT UNSIGNED,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL(7,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_confirmed INT DEFAULT 0;

    SELECT COUNT(*), COALESCE(SUM(case_status = 'CONFIRMED'), 0)
      INTO v_total, v_confirmed
    FROM disease_case
    WHERE disease_id = p_disease_id
      AND report_date BETWEEN p_start_date AND p_end_date;

    IF v_total = 0 THEN
        RETURN 0.00;
    END IF;
    RETURN ROUND(v_confirmed * 100.0 / v_total, 2);
END$$

-- Function 2: Multi-Factor Epidemiological Risk Index (0.00 to 100.00)
CREATE FUNCTION fn_calculate_risk_index(
    p_district_id INT UNSIGNED,
    p_disease_id INT UNSIGNED
) RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_active_cases INT DEFAULT 0;
    DECLARE v_positivity_pct DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_threshold INT DEFAULT 10;
    DECLARE v_risk_score DECIMAL(5,2) DEFAULT 0.00;

    SELECT COUNT(*) INTO v_active_cases
    FROM disease_case c
    JOIN health_facility hf ON hf.facility_id = c.reporting_facility_id
    WHERE hf.district_id = p_district_id
      AND c.disease_id = p_disease_id
      AND c.case_status IN ('SUSPECTED', 'CONFIRMED')
      AND c.report_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);

    SELECT alert_threshold_weekly INTO v_threshold
    FROM disease WHERE disease_id = p_disease_id;

    -- Normalized Risk Score: Caseload factor (70%) + Positivity (30%)
    SET v_risk_score = LEAST(100.00, (v_active_cases / GREATEST(1, v_threshold)) * 40.0 + 20.0);
    RETURN ROUND(v_risk_score, 2);
END$$

DELIMITER ;

-- ============================================================================
-- MODULE II: DCL (DATA CONTROL LANGUAGE) DEMONSTRATION
-- ============================================================================
-- The following statements demonstrate least-privilege role-based access control.
-- Run with DB administrator privileges in MySQL.
--
-- CREATE USER 'surveillance_analyst'@'localhost' IDENTIFIED BY 'EpidemiologySafe2026!';
-- GRANT SELECT ON disease_surveillance.v_case_lab_summary TO 'surveillance_analyst'@'localhost';
-- GRANT SELECT ON disease_surveillance.v_district_daily_cases TO 'surveillance_analyst'@'localhost';
-- GRANT SELECT ON disease_surveillance.v_open_outbreak_alerts TO 'surveillance_analyst'@'localhost';
-- REVOKE SELECT ON disease_surveillance.v_district_daily_cases FROM 'surveillance_analyst'@'localhost';
--
-- CREATE USER 'facility_clerk'@'localhost' IDENTIFIED BY 'ClerkSecure2026!';
-- GRANT SELECT, INSERT, UPDATE ON disease_surveillance.disease_case TO 'facility_clerk'@'localhost';
-- GRANT SELECT, INSERT ON disease_surveillance.lab_test TO 'facility_clerk'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================================
-- MODULE II: TCL (TRANSACTION CONTROL LANGUAGE) DEMONSTRATION
-- ============================================================================
-- START TRANSACTION;
-- UPDATE disease_case SET severity = 'SEVERE' WHERE case_code = 'CASE-DEMO-001';
-- SAVEPOINT sp_after_severity;
-- UPDATE disease_case SET case_status = 'FATAL' WHERE case_code = 'CASE-DEMO-001';
-- ROLLBACK TO SAVEPOINT sp_after_severity; -- Rolls back fatal status, keeps severe
-- COMMIT;
