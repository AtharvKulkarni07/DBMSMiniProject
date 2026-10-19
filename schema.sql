-- Disease Surveillance and Epidemiology Database
-- Target: MySQL 8.0.16+ / 8.4
-- Synthetic academic project only. Do not load identifiable real patient data.

CREATE DATABASE IF NOT EXISTS disease_surveillance
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE disease_surveillance;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS v_district_daily_cases;
DROP VIEW IF EXISTS v_case_lab_summary;
DROP VIEW IF EXISTS v_open_outbreak_alerts;
DROP VIEW IF EXISTS v_user_directory;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS outbreak_alert;
DROP TABLE IF EXISTS case_status_history;
DROP TABLE IF EXISTS lab_test;
DROP TABLE IF EXISTS disease_case;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS health_officer;
DROP TABLE IF EXISTS health_facility;
DROP TABLE IF EXISTS disease;
DROP TABLE IF EXISTS app_user;
DROP TABLE IF EXISTS app_role;
DROP TABLE IF EXISTS district;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE district (
    district_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    district_code VARCHAR(12) NOT NULL UNIQUE,
    district_name VARCHAR(100) NOT NULL UNIQUE,
    state_name VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE health_facility (
    facility_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    facility_code VARCHAR(24) NOT NULL UNIQUE,
    facility_name VARCHAR(160) NOT NULL,
    facility_type VARCHAR(30) NOT NULL,
    district_id INT UNSIGNED NOT NULL,
    address_line VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_facility_district FOREIGN KEY (district_id)
      REFERENCES district(district_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_facility_type CHECK
      (facility_type IN ('HOSPITAL','CLINIC','LABORATORY','PUBLIC_HEALTH_OFFICE','OTHER')),
    INDEX idx_facility_district (district_id, is_active)
) ENGINE=InnoDB;

CREATE TABLE disease (
    disease_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    disease_code VARCHAR(20) NOT NULL UNIQUE,
    disease_name VARCHAR(120) NOT NULL UNIQUE,
    disease_category VARCHAR(40) NOT NULL,
    is_notifiable BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_disease_category CHECK
      (disease_category IN ('VECTOR_BORNE','RESPIRATORY','WATER_BORNE','FOOD_BORNE','VACCINE_PREVENTABLE','OTHER'))
) ENGINE=InnoDB;

CREATE TABLE app_role (
    role_id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(40) NOT NULL UNIQUE,
    role_description VARCHAR(255)
) ENGINE=InnoDB;

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

CREATE TABLE patient (
    patient_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(30) NOT NULL UNIQUE,
    date_of_birth DATE NULL,
    sex_at_birth VARCHAR(20) NOT NULL DEFAULT 'NOT_RECORDED',
    district_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_patient_district FOREIGN KEY (district_id)
      REFERENCES district(district_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_patient_sex CHECK
      (sex_at_birth IN ('FEMALE','MALE','INTERSEX','NOT_RECORDED')),
    INDEX idx_patient_district (district_id),
    INDEX idx_patient_dob (date_of_birth)
) ENGINE=InnoDB;

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
    outcome VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
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
      (outcome IN ('UNKNOWN','RECOVERED','FATAL','ONGOING')),
    CONSTRAINT chk_case_dates CHECK
      (onset_date IS NULL OR onset_date <= report_date),
    CONSTRAINT uq_case_external_record UNIQUE (external_source, external_record_id),
    INDEX idx_case_report_date (report_date),
    INDEX idx_case_disease_date (disease_id, report_date),
    INDEX idx_case_status_date (case_status, report_date),
    INDEX idx_case_patient_date (patient_id, report_date),
    INDEX idx_case_facility_date (reporting_facility_id, report_date)
) ENGINE=InnoDB;

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

-- Views: provide reporting abstractions. Restrict actual access through GRANTs
-- on views and deny direct base-table access where appropriate.
CREATE OR REPLACE VIEW v_case_lab_summary AS
SELECT
    c.case_id, c.case_code, c.report_date, c.case_status, c.severity,
    d.disease_name, f.facility_name,
    COUNT(l.lab_test_id) AS total_tests,
    SUM(l.test_result = 'POSITIVE') AS positive_tests,
    MAX(l.result_reported_at) AS latest_result_at
FROM disease_case c
JOIN disease d ON d.disease_id = c.disease_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
LEFT JOIN lab_test l ON l.case_id = c.case_id
GROUP BY c.case_id, c.case_code, c.report_date, c.case_status,
         c.severity, d.disease_name, f.facility_name;

CREATE OR REPLACE VIEW v_district_daily_cases AS
SELECT
    hf.district_id,
    di.district_name,
    c.report_date,
    d.disease_name,
    COUNT(*) AS reported_cases,
    SUM(c.case_status = 'CONFIRMED') AS confirmed_cases,
    SUM(c.case_status = 'SUSPECTED') AS suspected_cases
FROM disease_case c
JOIN health_facility hf ON hf.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = hf.district_id
JOIN disease d ON d.disease_id = c.disease_id
GROUP BY hf.district_id, di.district_name, c.report_date, d.disease_name;

CREATE OR REPLACE VIEW v_open_outbreak_alerts AS
SELECT a.alert_code, di.district_name, d.disease_name, a.alert_level,
       a.alert_status, a.window_start, a.window_end,
       a.observed_case_count, a.threshold_case_count, a.generated_at
FROM outbreak_alert a
JOIN district di ON di.district_id = a.district_id
JOIN disease d ON d.disease_id = a.disease_id
WHERE a.alert_status IN ('OPEN','ACKNOWLEDGED','INVESTIGATING');

CREATE OR REPLACE VIEW v_user_directory AS
SELECT u.user_id, u.full_name, u.email, r.role_name, u.is_active,
       hf.facility_name
FROM app_user u
JOIN app_role r ON r.role_id = u.role_id
LEFT JOIN health_facility hf ON hf.facility_id = u.facility_id;

-- Trigger: record case status transitions.
DELIMITER $$
CREATE TRIGGER trg_case_status_history
AFTER UPDATE ON disease_case
FOR EACH ROW
BEGIN
    IF NOT (OLD.case_status <=> NEW.case_status) THEN
        INSERT INTO case_status_history
          (case_id, old_status, new_status, changed_by_user_id, change_reason)
        VALUES
          (NEW.case_id, OLD.case_status, NEW.case_status,
           @app_user_id, 'Status changed through database update');
    END IF;
END$$

-- Trigger: maintain audit log for case inserts.
CREATE TRIGGER trg_case_audit_insert
AFTER INSERT ON disease_case
FOR EACH ROW
BEGIN
    INSERT INTO audit_log
      (table_name, record_key, action_type, changed_by_user_id, new_values)
    VALUES
      ('disease_case', CAST(NEW.case_id AS CHAR), 'INSERT',
       @app_user_id,
       JSON_OBJECT('case_code', NEW.case_code, 'patient_id', NEW.patient_id,
                   'disease_id', NEW.disease_id, 'case_status', NEW.case_status,
                   'report_date', NEW.report_date));
END$$

CREATE TRIGGER trg_case_audit_update
AFTER UPDATE ON disease_case
FOR EACH ROW
BEGIN
    INSERT INTO audit_log
      (table_name, record_key, action_type, changed_by_user_id, old_values, new_values)
    VALUES
      ('disease_case', CAST(NEW.case_id AS CHAR), 'UPDATE',
       @app_user_id,
       JSON_OBJECT('case_status', OLD.case_status, 'severity', OLD.severity,
                   'outcome', OLD.outcome),
       JSON_OBJECT('case_status', NEW.case_status, 'severity', NEW.severity,
                   'outcome', NEW.outcome));
END$$

CREATE PROCEDURE sp_register_disease_case(
    IN p_case_code VARCHAR(32),
    IN p_patient_id BIGINT UNSIGNED,
    IN p_disease_id INT UNSIGNED,
    IN p_facility_id BIGINT UNSIGNED,
    IN p_reported_by BIGINT UNSIGNED,
    IN p_report_date DATE,
    IN p_severity VARCHAR(20)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    INSERT INTO disease_case
      (case_code, patient_id, disease_id, reporting_facility_id,
       reported_by_user_id, report_date, severity)
    VALUES
      (p_case_code, p_patient_id, p_disease_id, p_facility_id,
       p_reported_by, p_report_date, p_severity);
    COMMIT;
END$$

CREATE PROCEDURE sp_district_disease_counts(
    IN p_district_id INT UNSIGNED,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT d.disease_name,
           COUNT(*) AS total_cases,
           SUM(c.case_status = 'CONFIRMED') AS confirmed_cases
    FROM disease_case c
    JOIN disease d ON d.disease_id = c.disease_id
    JOIN health_facility f ON f.facility_id = c.reporting_facility_id
    WHERE f.district_id = p_district_id
      AND c.report_date BETWEEN p_start_date AND p_end_date
    GROUP BY d.disease_id, d.disease_name
    ORDER BY total_cases DESC;
END$$

CREATE FUNCTION fn_confirmation_rate(
    p_disease_id INT UNSIGNED,
    p_start_date DATE,
    p_end_date DATE
) RETURNS DECIMAL(7,2)
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
DELIMITER ;

-- DCL demonstration (run separately as an administrator; adjust host/password
-- to local policy). Create an app account with least privilege.
-- CREATE USER 'surveillance_reader'@'localhost' IDENTIFIED BY 'ReplaceWithStrongPassword!';
-- GRANT SELECT ON disease_surveillance.v_case_lab_summary TO 'surveillance_reader'@'localhost';
-- GRANT SELECT ON disease_surveillance.v_district_daily_cases TO 'surveillance_reader'@'localhost';
-- REVOKE SELECT ON disease_surveillance.v_district_daily_cases FROM 'surveillance_reader'@'localhost';

-- MySQL does not support Oracle packages, statement-level triggers, BULK COLLECT,
-- or FORALL. Use Oracle separately if your instructor requires those exact features.
