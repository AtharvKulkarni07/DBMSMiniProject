# ER model — Disease Surveillance and Epidemiology Database

```mermaid
erDiagram
    DISTRICT ||--o{ HEALTH_FACILITY : contains
    DISTRICT ||--o{ PATIENT : residence_area
    DISTRICT ||--o{ HEALTH_OFFICER : assigned_to
    HEALTH_FACILITY o|--o{ APP_USER : associated_with
    APP_ROLE ||--o{ APP_USER : grants_role
    APP_USER ||--o| HEALTH_OFFICER : officer_profile
    PATIENT ||--o{ DISEASE_CASE : has_episodes
    DISEASE ||--o{ DISEASE_CASE : classified_as
    HEALTH_FACILITY ||--o{ DISEASE_CASE : reports
    APP_USER ||--o{ DISEASE_CASE : submits
    DISEASE_CASE ||--o{ LAB_TEST : tested_by
    HEALTH_FACILITY ||--o{ LAB_TEST : performs
    APP_USER o|--o{ LAB_TEST : performs_test
    DISEASE_CASE ||--o{ CASE_STATUS_HISTORY : status_changes
    APP_USER o|--o{ CASE_STATUS_HISTORY : changes
    DISTRICT ||--o{ OUTBREAK_ALERT : raises
    DISEASE ||--o{ OUTBREAK_ALERT : concerns
    APP_USER o|--o{ OUTBREAK_ALERT : generates
    APP_USER o|--o{ OUTBREAK_ALERT : acknowledges
    APP_USER o|--o{ AUDIT_LOG : actor

    DISTRICT {
      int district_id PK
      varchar district_code UK
      varchar district_name UK
    }
    HEALTH_FACILITY {
      bigint facility_id PK
      varchar facility_code UK
      int district_id FK
      varchar facility_type
    }
    DISEASE {
      int disease_id PK
      varchar disease_code UK
      varchar disease_name UK
      varchar disease_category
    }
    APP_ROLE {
      smallint role_id PK
      varchar role_name UK
    }
    APP_USER {
      bigint user_id PK
      varchar email UK
      smallint role_id FK
      bigint facility_id FK
    }
    HEALTH_OFFICER {
      bigint officer_id PK
      bigint user_id FK,UK
      int district_id FK
      varchar employee_code UK
    }
    PATIENT {
      bigint patient_id PK
      varchar patient_code UK
      int district_id FK
      date date_of_birth
    }
    DISEASE_CASE {
      bigint case_id PK
      varchar case_code UK
      bigint patient_id FK
      int disease_id FK
      bigint reporting_facility_id FK
      bigint reported_by_user_id FK
      date report_date
      varchar case_status
    }
    LAB_TEST {
      bigint lab_test_id PK
      bigint case_id FK
      bigint facility_id FK
      varchar test_result
    }
    CASE_STATUS_HISTORY {
      bigint history_id PK
      bigint case_id FK
      bigint changed_by_user_id FK
    }
    OUTBREAK_ALERT {
      bigint alert_id PK
      int district_id FK
      int disease_id FK
      varchar alert_status
    }
    AUDIT_LOG {
      bigint audit_id PK
      bigint changed_by_user_id FK
      json old_values
      json new_values
    }
```

## Normalization notes

- Master data is separated into `district`, `health_facility`, `disease`, and `app_role`.
- User credentials/identity live in `app_user`; the district-specific officer attributes live in `health_officer`.
- `disease_case` represents one reported disease episode and references patient, disease, facility and reporting user.
- Laboratory tests and status transitions are separate child relations because each case can have many tests and many status changes.
- `outbreak_alert` stores the alert snapshot and counts used when the alert was generated.
- The schema is designed toward 3NF/BCNF under the stated key assumptions. In your report, explicitly list functional dependencies and verify BCNF for each relation; a diagram alone does not prove BCNF.
