# National Disease Surveillance & Epidemiology Database (DSED)
> **Comprehensive DBMS Mini-Project & Coursework Practical Implementation**  
> **Domain:** Biomedical & Public Health Surveillance  
> **Target DBMS:** MySQL 8.0.16+ / MySQL 8.4  
> **Repository:** [https://github.com/AtharvKulkarni07/DBMSMiniProject](https://github.com/AtharvKulkarni07/DBMSMiniProject)  
> **Design:** Minimalist Whitish Organizational UI • **Font:** Poppins • **Icons:** Icons8 Style • **Engine:** Node.js + Express + React + MySQL

---

## 🏛️ Executive Summary & Problem Statement

Public health emergencies and epidemic outbreaks demand real-time epidemiological surveillance, multi-facility lab tracking, and rigorous data consistency. The **Disease Surveillance and Epidemiology Database (DSED)** is a relational database system designed to monitor disease trends, detect outbreak signals, capture clinical test histories, and maintain immutable audit trails across health districts.

The project implements all curriculum modules (**Modules I, II, III, IV**) and **Group B Practicals (1 through 7)**, demonstrating:
- **Boyce-Codd Normal Form (BCNF)** relational decomposition with functional dependency proofs.
- Comprehensive **DDL Constraints** (`PK`, `FK CASCADE`, `UNIQUE`, `CHECK`, `NOT NULL`).
- **Complex SQL Queries** (Multi-table joins, correlated subqueries, set operators, and window functions).
- **Procedural SQL** blocks with variables, loops, conditional controls, and exception handlers.
- **Stored Procedures and User-Defined Functions** with parameter passing and transactional rollbacks.
- **Database Cursors** (`sp_ingest_lab_feed_cursor`) for batch ingestion of diagnostic feeds without duplicates.
- **Row-Level Triggers** for automated audit trails (`audit_log`), lifecycle tracking (`case_status_history`), and automatic case promotion.
- **Query Processing & Index Optimization** (B-Tree composite indexes benchmarked via `EXPLAIN`).
- **TCL & ACID Simulation** (`START TRANSACTION`, `SAVEPOINT`, `ROLLBACK TO SAVEPOINT`, `COMMIT`).
- **DCL Security** (`GRANT`, `REVOKE` role-based least privilege).

---

## 📚 Curriculum & Syllabus Alignment Matrix

| Module / Practical | Curriculum Requirement | Implementation in DSED | Project Location |
| :--- | :--- | :--- | :--- |
| **Module I & Practical 1** | ER/EER Modeling, Normalization to BCNF, Relational Algebra | 13 normalized entities; lossless join decomposition; dependency preservation proofs; mathematical relational algebra formulas (\(\sigma, \pi, \bowtie, \cup, -\)). | `ER_Model.md`<br/>`schema.sql` (Lines 26-244) |
| **Module II & Practical 2** | DDL, Constraints, Indexes, Views, DCL, TCL | Tables with strict `CHECK` constraints on status, severity, dates; 6 reporting views (`v_case_lab_summary`, `v_district_daily_cases`, etc.); DCL role scripts; TCL Savepoint scripts. | `schema.sql`<br/>`practical_queries.sql` |
| **Module II & Practical 3** | DML & Complex Queries | 5-way joins, `DENSE_RANK()`, `SUM() OVER`, `LAG()`, correlated subqueries, `UNION`, and `HAVING` aggregations. | `practical_queries.sql`<br/>UI: **DBMS Practical Workbench** |
| **Module II & Practical 4** | Procedural SQL Blocks | Variables, control structures, loops, and `DECLARE ... HANDLER FOR SQLEXCEPTION` with `RESIGNAL`. | `schema.sql`<br/>(Procedures & Functions) |
| **Module II & Practical 5** | Stored Procedures & Functions | `sp_register_disease_case` (atomic insert), `sp_district_disease_counts` (parameters), `fn_confirmation_rate`, `fn_calculate_risk_index`. | `schema.sql`<br/>`server/db.js` |
| **Module II & Practical 6** | Database Cursors & Triggers | **Explicit Cursor** `sp_ingest_lab_feed_cursor` with `OPEN`, `FETCH`, `NOT FOUND` handler for duplicate-free batch ingestion; 4 row-level triggers (`trg_case_audit_insert`, `trg_lab_test_auto_confirm`). | `schema.sql`<br/>UI: **Diagnostic Labs & Cursors** |
| **Module III & Practical 7** | Indexing & Query Optimization | Composite B-Tree indexes (`idx_case_disease_date`, `idx_facility_district`); `EXPLAIN` query execution plan verification (`type: ref`, `key_len`, row reduction). | `schema.sql`<br/>UI: **Query Optimizer Tab** |
| **Module III & TCL** | Transaction Management & ACID | Multi-step transaction demonstration using `START TRANSACTION`, `SAVEPOINT sp_severity`, `ROLLBACK TO SAVEPOINT`, and `COMMIT`. | `practical_queries.sql`<br/>UI: **TCL Simulation** |
| **Module IV** | Advanced Architectures & Data Warehousing | Star schema readiness for epidemiological OLAP; Lakehouse staging tables (`raw_lab_feed`); NoSQL comparison notes. | `ER_Model.md` |

---

## 🎨 UI Architecture & Screens

The application features a **minimalist whitish organizational design system** adhering to international public health portal guidelines (CDC / WHO / ICMR):
- **Typography:** Google Font **Poppins** (clean, crisp, legible).
- **Icons:** **Icons8** aesthetic (pixel-perfect minimalist outline icons).
- **Color Palette:** Whitish background (`#F8FAFC`), crisp slate typography, subtle medical teal accents (`#0D9488`), and alert status badges.
- **Scrolling & Transitions:** Smooth scrolling and micro-animations.

### Core Screens & Tabs
1. **Surveillance Hub (Executive Overview):** Real-time epidemiological KPIs, Pathogen threshold progress bars, and the Statewide District Risk Matrix calculated dynamically via MySQL Stored Function `fn_calculate_risk_index()`.
2. **Cases Registry (Full CRUD):** Filter by status, pathogen, severity, and district. Add cases atomically via `sp_register_disease_case()`, edit status (fires `trg_case_status_history`), or delete cases.
3. **Diagnostic Labs & Cursors (Practical 6):** Unprocessed batch staging feed with an interactive **"⚡ Execute Batch Cursor"** runner that invokes `sp_ingest_lab_feed_cursor` to sanitize, deduplicate, and auto-confirm cases in real-time.
4. **Outbreak Early Warning:** Visualizes surge percentages over statutory limits with action workflows (Investigate, Resolve) and an automated 14-day threshold scanning procedure (`sp_evaluate_outbreak_thresholds`).
5. **Interactive DBMS Practical Workbench:** Live query runner for all curriculum queries, interactive `EXPLAIN` plan visualizer, Stored Procedures runner with parameter inputs, and real-time `audit_log` feed.
6. **ER Model & BCNF Proofs:** Complete Mermaid ER diagram, Table-by-table Functional Dependency breakdown, and mathematical relational algebra equivalents.

---

## 🚀 Quick Setup & Installation Guide

The project is designed to be **100% turnkey**. It runs directly against a local **MySQL 8.x** server (Workbench / XAMPP / Command Line), and features an **intelligent in-memory surveillance simulator** so examiners and faculty can evaluate the complete system even before starting the MySQL daemon!

### Prerequisites
- **Node.js** v18+ or v20+ ([Download Node.js](https://nodejs.org/))
- **MySQL 8.0+** or **MySQL Workbench** or **XAMPP / WAMP** (Optional for live DB execution)

### 1. Clone the Repository
```bash
git clone https://github.com/AtharvKulkarni07/DBMSMiniProject.git
cd DBMSMiniProject
```

### 2. Install Dependencies
```bash
npm install
```

### 3. (Optional) Configure Local MySQL Database
If you have MySQL installed locally:
1. Open **MySQL Workbench** or MySQL CLI and execute `schema.sql`, then execute `seed.sql`:
   ```bash
   mysql -u root -p < schema.sql
   mysql -u root -p < seed.sql
   ```
2. Create or verify your `.env` configuration file in the project root:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=disease_surveillance
   DB_PORT=3306
   ```

*(Note: If MySQL is not running or credentials are not yet configured, the system automatically runs in fallback simulation mode and allows one-click connection via the UI navbar).*

### 4. Build & Start the Application
Build the production frontend and start the server:
```bash
npm run build
npm start
```

Open your browser and navigate to:
```
http://localhost:5000
```

---

## 📂 Project Repository Structure

```
DBMSMiniProject/
├── schema.sql              # Master DDL, BCNF relations, constraints, indexes, views, triggers, procedures, functions
├── seed.sql                # Synthetic epidemiological surveillance data across 6 districts and 7 facilities
├── practical_queries.sql   # Comprehensive SQL queries covering Practicals 1 to 7, Window Functions, EXPLAIN & TCL
├── ER_Model.md             # Mermaid ER diagram, Functional Dependencies, BCNF proofs, and Relational Algebra
├── package.json            # Unified dependencies, scripts, and build pipeline
├── vite.config.js          # Vite + React + Tailwind CSS configuration
├── index.html              # HTML shell with Google Poppins font and Icons8 styling
├── server/
│   ├── index.js            # Express REST API, query execution endpoints, and static file server
│   ├── db.js               # MySQL2 connection pool, fallback memory store, and cursor procedure runner
│   └── mockData.js         # Initial benchmark dataset
├── src/
│   ├── App.jsx             # Main application orchestrator with state and API integrations
│   ├── index.css           # Minimalist whitish styling, Poppins typography, and smooth scrolling animations
│   └── components/
│       ├── Navbar.jsx      # Institutional header, MySQL connection pill, and navigation tabs
│       ├── OverviewTab.jsx  # Real-time KPIs, pathogen thresholds, and district risk score matrix
│       ├── CasesTab.jsx    # Complete epidemiological case CRUD registry
│       ├── LabTestsTab.jsx # Diagnostic lab tests and Explicit Cursor batch ingestion runner
│       ├── AlertsTab.jsx   # Outbreak early warning cards and automated detection algorithm
│       ├── DBMSLabTab.jsx  # Interactive SQL playground, EXPLAIN plan analyzer, routines, and triggers
│       ├── SchemaTab.jsx   # ER model, 1NF to BCNF proofs, and relational algebra
│       ├── CaseModal.jsx   # Case registration and status update modal
│       ├── LabTestModal.jsx# Diagnostic lab test entry modal
│       └── Icons.jsx       # Custom Icons8-style outline SVG icons
└── dist/                   # Production build directory served statically by Express on port 5000
```

---

## 🔬 DBMS Theory & Practical Viva Guide

### Q1. How is BCNF achieved in this schema?
**Answer:** A relation is in BCNF if for every non-trivial functional dependency \(X \to Y\), \(X\) is a superkey.
In `disease_case`, storing patient attributes (like date of birth or district) would create transitive dependencies:
$$\text{case\_id} \to \text{patient\_id} \to \text{district\_id}$$
By decomposing patient demographics into `patient` and facility attributes into `health_facility`, `disease_case` references them purely via Foreign Keys. In every relation (`district`, `health_facility`, `disease`, `patient`, `disease_case`, `lab_test`), the determinant of every FD is a candidate key.

### Q2. How does the Database Cursor in Practical 6 prevent duplicate records?
**Answer:** In procedure `sp_ingest_lab_feed_cursor`:
```sql
DECLARE cur_feed CURSOR FOR
    SELECT feed_id, test_code, ... FROM raw_lab_feed WHERE is_processed = FALSE;
```
For each row fetched by the cursor, the routine queries `COUNT(*) FROM lab_test WHERE test_code = v_test_code`. If greater than zero, it updates `raw_lab_feed.process_status = 'SKIPPED_DUPLICATE'`. Otherwise, it inserts the record into `lab_test` and sets `is_processed = TRUE`.

### Q3. How do the Row-Level Triggers work?
**Answer:**
1. `trg_case_status_history`: Executes `AFTER UPDATE ON disease_case`. When `OLD.case_status <> NEW.case_status`, it automatically inserts an entry into `case_status_history` recording the transition timestamp, user, and previous/new status.
2. `trg_case_audit_update`: Captures old and new values as native MySQL `JSON` objects and appends them to `audit_log`.
3. `trg_lab_test_auto_confirm`: When a diagnostic test result is updated to `'POSITIVE'`, the trigger automatically promotes the associated `disease_case` from `'SUSPECTED'` to `'CONFIRMED'`.

### Q4. How does indexing improve query performance in Practical 7?
**Answer:** The composite index `idx_case_disease_date (disease_id, report_date)` enables the MySQL query optimizer to evaluate range queries using a B-Tree index lookup (`type: ref` or `type: range`) rather than scanning all rows sequentially (`type: ALL`). Running `EXPLAIN` confirms `key: idx_case_disease_date` with `key_len: 7` and `Extra: Using index condition`.

---

## 👨‍💻 Author & Acknowledgements
- **Author:** Atharv Kulkarni
- **Repository:** [AtharvKulkarni07/DBMSMiniProject](https://github.com/AtharvKulkarni07/DBMSMiniProject)
- **Coursework:** Database Management Systems (Modules I–IV, Group B Practicals)
