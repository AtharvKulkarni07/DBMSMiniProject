# Disease Surveillance and Epidemiology Database

MySQL-based DBMS mini-project for demonstrating relational design and DBMS practicals.

## Repository structure

- `schema.sql` — database, tables, constraints, indexes, views, triggers, stored procedures and function.
- `seed.sql` — synthetic sample records.
- `practical_queries.sql` — joins, aggregation, subqueries, UNION, window functions, EXPLAIN and TCL examples.
- `ER_Model.md` — Mermaid ER diagram and normalization notes.

## Requirements

- MySQL 8.0.16+ (or MySQL 8.4)
- MySQL Workbench recommended

## Setup

Run scripts in this order:

1. Open `schema.sql` in MySQL Workbench and execute it.
2. Execute `seed.sql`.
3. Execute individual statements from `practical_queries.sql`.

`schema.sql` drops and recreates the project's tables. Do not run it against an existing database containing data you need to keep.

## Design scope

The core operational schema includes district, facility, disease, roles, users, health-officer profiles, patients, disease cases, lab tests, status history, outbreak alerts and audit logs.

## Important implementation notes

- Sample data is fictional. The password hashes in seed data are placeholders and are not valid login credentials.
- The trigger reads the optional session variable `@app_user_id`. Set it in a database session if you want the actor recorded; do not treat a client-controlled session variable as a trusted authentication mechanism.
- MySQL triggers are row-level; MySQL does not support statement-level triggers.
- MySQL has stored procedures and functions but not Oracle packages, `BULK COLLECT` or `FORALL`. Use Oracle separately if your faculty explicitly requires those exact constructs.
- DCL statements are commented out and should be executed as a privileged database administrator after choosing a secure password.
- `CHECK` constraints are enforced in MySQL 8.0.16 and later.
- `v_case_lab_summary` aggregates lab results at case level; it is not a clinical decision rule.
- The alert table stores potential surveillance signals, not medical diagnoses.

## Next steps

1. Review and approve the ER model with faculty.
2. Add a data dictionary and functional-dependency/BCNF analysis to the report.
3. Add more synthetic records to benchmark query plans meaningfully.
4. Build a Node.js API and React frontend only after database scripts pass.
