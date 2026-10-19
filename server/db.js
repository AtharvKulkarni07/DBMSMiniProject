import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialDistricts,
  initialFacilities,
  initialDiseases,
  initialPatients,
  initialCases,
  initialLabTests,
  initialRawLabFeed,
  initialOutbreakAlerts,
  initialStatusHistory,
  initialAuditLogs
} from './mockData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'disease_surveillance',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isConnected = false;
let connectionError = null;

// In-Memory state fallback for offline / quick demo mode
export const memoryStore = {
  districts: JSON.parse(JSON.stringify(initialDistricts)),
  facilities: JSON.parse(JSON.stringify(initialFacilities)),
  diseases: JSON.parse(JSON.stringify(initialDiseases)),
  patients: JSON.parse(JSON.stringify(initialPatients)),
  cases: JSON.parse(JSON.stringify(initialCases)),
  labTests: JSON.parse(JSON.stringify(initialLabTests)),
  rawLabFeed: JSON.parse(JSON.stringify(initialRawLabFeed)),
  outbreakAlerts: JSON.parse(JSON.stringify(initialOutbreakAlerts)),
  statusHistory: JSON.parse(JSON.stringify(initialStatusHistory)),
  auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
};

export async function tryConnectMySQL() {
  try {
    // First test connection without database name to allow creating DB if needed
    const tempConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    // Now initialize pool with target database
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT VERSION() AS version');
    conn.release();
    isConnected = true;
    connectionError = null;
    console.log(`[Database] Connected successfully to MySQL (${rows[0].version}) at ${dbConfig.host}:${dbConfig.port}`);
    return { success: true, version: rows[0].version };
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`[Database] MySQL not reachable on ${dbConfig.host}:${dbConfig.port} (${err.code || err.message}).`);
    console.log('[Database] Active fallback: Rich In-Memory Surveillance Database is running.');
    return { success: false, error: err.message };
  }
}

// Auto-run connection check on startup
tryConnectMySQL();

export function getDbStatus() {
  return {
    isConnected,
    mode: isConnected ? 'MySQL 8.x Live Database' : 'In-Memory Simulation Store',
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    error: connectionError,
    records: {
      districts: memoryStore.districts.length,
      facilities: memoryStore.facilities.length,
      diseases: memoryStore.diseases.length,
      patients: memoryStore.patients.length,
      cases: memoryStore.cases.length,
      labTests: memoryStore.labTests.length,
      rawLabFeed: memoryStore.rawLabFeed.length,
      outbreakAlerts: memoryStore.outbreakAlerts.length,
      statusHistory: memoryStore.statusHistory.length,
      auditLogs: memoryStore.auditLogs.length,
    }
  };
}

export async function executeSQL(sqlString) {
  const startTime = Date.now();
  if (isConnected && pool) {
    try {
      const [results] = await pool.query(sqlString);
      const executionTimeMs = Date.now() - startTime;
      return {
        success: true,
        data: Array.isArray(results) ? results : [results],
        executionTimeMs,
        source: 'MySQL Engine'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        sqlState: err.sqlState,
        executionTimeMs: Date.now() - startTime,
        source: 'MySQL Engine'
      };
    }
  }

  // Fallback simulator for predefined queries when MySQL is offline
  const executionTimeMs = Date.now() - startTime;
  return simulateQueryInStore(sqlString, executionTimeMs);
}

function simulateQueryInStore(sql, executionTimeMs) {
  const cleanSql = sql.trim().toLowerCase();
  
  if (cleanSql.startsWith('explain')) {
    return {
      success: true,
      data: [
        { id: 1, select_type: 'SIMPLE', table: 'disease_case', partitions: null, type: 'ref', possible_keys: 'idx_case_disease_date', key: 'idx_case_disease_date', key_len: '7', ref: 'const', rows: 8, filtered: 100.0, Extra: 'Using index condition; Using where' }
      ],
      executionTimeMs,
      source: 'Simulated Query Optimizer (B+ Tree Index Scan)'
    };
  }

  if (cleanSql.includes('v_case_lab_summary')) {
    const data = memoryStore.cases.map(c => {
      const d = memoryStore.diseases.find(x => x.disease_id === c.disease_id);
      const f = memoryStore.facilities.find(x => x.facility_id === c.reporting_facility_id);
      const tests = memoryStore.labTests.filter(t => t.case_id === c.case_id);
      return {
        case_id: c.case_id,
        case_code: c.case_code,
        report_date: c.report_date,
        case_status: c.case_status,
        severity: c.severity,
        disease_name: d?.disease_name || 'Unknown',
        facility_name: f?.facility_name || 'Unknown',
        total_tests: tests.length,
        positive_tests: tests.filter(t => t.test_result === 'POSITIVE').length,
        latest_result_at: tests[0]?.result_reported_at || 'N/A'
      };
    });
    return { success: true, data, executionTimeMs, source: 'Memory Simulation (View: v_case_lab_summary)' };
  }

  if (cleanSql.includes('v_district_daily_cases') || cleanSql.includes('group by di.district')) {
    const data = memoryStore.districts.map(di => {
      const facs = memoryStore.facilities.filter(f => f.district_id === di.district_id).map(f => f.facility_id);
      const cases = memoryStore.cases.filter(c => facs.includes(c.reporting_facility_id));
      return {
        district_id: di.district_id,
        district_name: di.district_name,
        total_cases: cases.length,
        confirmed_cases: cases.filter(c => c.case_status === 'CONFIRMED').length,
        suspected_cases: cases.filter(c => c.case_status === 'SUSPECTED').length,
        fatal_cases: cases.filter(c => c.case_status === 'FATAL').length,
      };
    });
    return { success: true, data, executionTimeMs, source: 'Memory Simulation (District Aggregations)' };
  }

  if (cleanSql.includes('dense_rank') || cleanSql.includes('window function')) {
    const counts = memoryStore.diseases.map(d => {
      const total = memoryStore.cases.filter(c => c.disease_id === d.disease_id).length;
      return { disease_category: d.disease_category, disease_name: d.disease_name, total_cases: total };
    }).sort((a,b) => b.total_cases - a.total_cases);
    
    let rank = 1;
    const rankedData = counts.map((item, idx) => {
      if (idx > 0 && item.total_cases < counts[idx-1].total_cases) rank++;
      return { ...item, category_rank: rank, running_cumulative_cases: counts.slice(0, idx + 1).reduce((s, x) => s + x.total_cases, 0) };
    });
    return { success: true, data: rankedData, executionTimeMs, source: 'Memory Simulation (Window Functions: DENSE_RANK & SUM OVER)' };
  }

  // Default fallback response
  return {
    success: true,
    data: memoryStore.cases.slice(0, 10).map(c => ({
      case_code: c.case_code,
      status: c.case_status,
      severity: c.severity,
      report_date: c.report_date,
      notes: c.notes
    })),
    executionTimeMs,
    source: 'Memory Simulation'
  };
}

export async function runCursorFeedBatch() {
  if (isConnected && pool) {
    try {
      const conn = await pool.getConnection();
      await conn.query('CALL sp_ingest_lab_feed_cursor(@processed, @dups, @errors);');
      const [[summary]] = await conn.query('SELECT @processed AS processed_count, @dups AS duplicates_skipped, @errors AS errors_encountered;');
      conn.release();
      return {
        success: true,
        source: 'MySQL Stored Procedure (sp_ingest_lab_feed_cursor with Explicit Cursor)',
        summary: {
          processed: summary.processed_count || 0,
          duplicatesSkipped: summary.duplicates_skipped || 0,
          errors: summary.errors_encountered || 0,
        }
      };
    } catch (err) {
      console.error('[Cursor Stored Procedure Error]', err);
    }
  }

  // Memory Cursor Simulation
  let processed = 0;
  let duplicatesSkipped = 0;
  let errors = 0;

  for (const feed of memoryStore.rawLabFeed) {
    if (!feed.is_processed) {
      const existingTest = memoryStore.labTests.find(t => t.test_code === feed.test_code);
      if (existingTest) {
        feed.is_processed = true;
        feed.process_status = 'SKIPPED_DUPLICATE';
        duplicatesSkipped++;
      } else {
        const targetCase = memoryStore.cases.find(c => c.case_code === feed.case_code);
        const targetFacility = memoryStore.facilities.find(f => f.facility_code === feed.facility_code);
        if (targetCase && targetFacility) {
          const newTest = {
            lab_test_id: memoryStore.labTests.length + 1,
            case_id: targetCase.case_id,
            facility_id: targetFacility.facility_id,
            test_code: feed.test_code,
            test_name: feed.test_name,
            specimen_collected_at: feed.specimen_collected_at,
            result_reported_at: feed.result_reported_at || new Date().toISOString().replace('T', ' ').substring(0, 19),
            test_result: feed.test_result,
            performed_by_user_id: 3,
            remarks: 'Ingested via Batch Cursor Procedure'
          };
          memoryStore.labTests.push(newTest);

          // Trigger Simulation: Auto-confirm case if positive
          if (feed.test_result === 'POSITIVE' && targetCase.case_status === 'SUSPECTED') {
            const oldStatus = targetCase.case_status;
            targetCase.case_status = 'CONFIRMED';
            memoryStore.statusHistory.unshift({
              history_id: memoryStore.statusHistory.length + 1,
              case_id: targetCase.case_id,
              old_status: oldStatus,
              new_status: 'CONFIRMED',
              changed_by_user: 'Trigger: trg_lab_test_auto_confirm',
              change_reason: `Auto-promoted via POSITIVE lab result (${feed.test_code})`,
              changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
            });
          }

          feed.is_processed = true;
          feed.process_status = 'SUCCESS_INGESTED';
          processed++;
        } else {
          feed.is_processed = true;
          feed.process_status = 'SKIPPED_MISSING_FOREIGN_KEY';
          errors++;
        }
      }
    }
  }

  return {
    success: true,
    source: 'In-Memory Explicit Cursor Engine (sp_ingest_lab_feed_cursor)',
    summary: { processed, duplicatesSkipped, errors }
  };
}
