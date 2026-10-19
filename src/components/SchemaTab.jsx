import React from 'react';
import { ShieldCheckIcon, TableIcon, DatabaseIcon } from './Icons';

export const SchemaTab = () => {
  const tables = [
    {
      name: 'district',
      pk: 'district_id',
      candidateKeys: ['district_id', 'district_code', 'district_name'],
      fds: ['district_id -> district_code, district_name, state_name, population'],
      bcnf: 'Every determinant is a superkey. Satisfies BCNF.',
    },
    {
      name: 'health_facility',
      pk: 'facility_id',
      candidateKeys: ['facility_id', 'facility_code'],
      fds: ['facility_id -> facility_code, facility_name, facility_type, district_id, contact_phone'],
      bcnf: 'Determinants are candidate keys. Satisfies BCNF.',
    },
    {
      name: 'disease',
      pk: 'disease_id',
      candidateKeys: ['disease_id', 'disease_code', 'disease_name'],
      fds: ['disease_id -> disease_code, disease_name, disease_category, alert_threshold_weekly'],
      bcnf: 'Determinants are candidate keys. Satisfies BCNF.',
    },
    {
      name: 'patient',
      pk: 'patient_id',
      candidateKeys: ['patient_id', 'patient_code'],
      fds: ['patient_id -> patient_code, full_name_masked, date_of_birth, sex_at_birth, district_id'],
      bcnf: 'Determinants are candidate keys. Satisfies BCNF.',
    },
    {
      name: 'disease_case',
      pk: 'case_id',
      candidateKeys: ['case_id', 'case_code', '(external_source, external_record_id)'],
      fds: ['case_id -> patient_id, disease_id, reporting_facility_id, reported_by_user_id, report_date, status, severity'],
      bcnf: 'No transitive dependencies on patient or disease attributes; determinants are candidate keys. Satisfies BCNF.',
    },
    {
      name: 'lab_test',
      pk: 'lab_test_id',
      candidateKeys: ['lab_test_id', 'test_code'],
      fds: ['lab_test_id -> case_id, facility_id, test_code, test_name, specimen_collected_at, test_result'],
      bcnf: 'Determinants are candidate keys. Satisfies BCNF.',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-semibold mb-2">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-700" />
          <span>Module I & Practical 1: Database Design & Normalization</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Relational Schema Normalization up to Boyce-Codd Normal Form (BCNF)
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          The database was designed starting from an unnormalized universal medical encounter and decomposed losslessly into
          specialized relations. Every non-trivial functional dependency \(X \to Y\) has a determinant \(X\) that is a superkey.
        </p>
      </div>

      {/* Normalization Stages Progression */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase">Stage 1</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">1NF (First Normal Form)</h4>
          <p className="text-[11px] text-slate-600 mt-1">
            All attributes contain atomic (single-valued) values. Multi-valued tests and status changes are moved to separate tables.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase">Stage 2</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">2NF (Second Normal Form)</h4>
          <p className="text-[11px] text-slate-600 mt-1">
            Table is in 1NF and no non-prime attribute is partially dependent on any candidate key.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase">Stage 3</span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">3NF (Third Normal Form)</h4>
          <p className="text-[11px] text-slate-600 mt-1">
            Table is in 2NF and no non-prime attribute is transitively dependent on candidate keys.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-teal-300 bg-teal-50/40 shadow-2xs">
          <span className="text-[10px] font-bold text-teal-800 uppercase">Stage 4 (Current)</span>
          <h4 className="text-sm font-bold text-teal-950 mt-0.5">BCNF (Boyce-Codd)</h4>
          <p className="text-[11px] text-teal-900 mt-1">
            Stricter version of 3NF: For every non-trivial FD \(X \to Y\), the determinant \(X\) is strictly a superkey.
          </p>
        </div>
      </div>

      {/* Table-by-Table FD Analysis Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Entity-wise Functional Dependencies & BCNF Proofs
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold bg-slate-50/80">
                <th className="py-2.5 px-3">Relation</th>
                <th className="py-2.5 px-3">Primary Key</th>
                <th className="py-2.5 px-3">Candidate Keys</th>
                <th className="py-2.5 px-3">Functional Dependencies (FDs)</th>
                <th className="py-2.5 px-3 text-right">BCNF Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {tables.map((tbl) => (
                <tr key={tbl.name} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-bold text-slate-900 font-sans">{tbl.name}</td>
                  <td className="py-3 px-3 text-teal-800">{tbl.pk}</td>
                  <td className="py-3 px-3 text-slate-600">{tbl.candidateKeys.join(', ')}</td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs">{tbl.fds.join('; ')}</td>
                  <td className="py-3 px-3 text-right font-sans">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified BCNF
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relational Algebra Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Module I: Relational Algebra Operators Mapping
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="font-bold text-slate-800">1. Selection (σ):</span>
            <div className="font-mono text-teal-800 text-[11px]">
              σ_&#123;case_status = 'CONFIRMED'&#125;(DISEASE_CASE)
            </div>
            <p className="text-slate-500 text-[11px]">
              Filters horizontal tuples based on a predicate (SQL: <code className="font-mono">WHERE case_status = 'CONFIRMED'</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="font-bold text-slate-800">2. Projection (π):</span>
            <div className="font-mono text-teal-800 text-[11px]">
              π_&#123;patient_code, sex_at_birth&#125;(PATIENT)
            </div>
            <p className="text-slate-500 text-[11px]">
              Extracts vertical attributes from the relation (SQL: <code className="font-mono">SELECT patient_code, sex_at_birth FROM patient</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="font-bold text-slate-800">3. Natural Join (⋈):</span>
            <div className="font-mono text-teal-800 text-[11px]">
              DISEASE_CASE ⋈ DISEASE
            </div>
            <p className="text-slate-500 text-[11px]">
              Combines tuples from both relations where matching attribute <code className="font-mono">disease_id</code> agrees.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="font-bold text-slate-800">4. Set Union (∪):</span>
            <div className="font-mono text-teal-800 text-[11px]">
              π_&#123;patient_id&#125;(σ_&#123;status='CONFIRMED'&#125;) ∪ π_&#123;patient_id&#125;(σ_&#123;severity='CRITICAL'&#125;)
            </div>
            <p className="text-slate-500 text-[11px]">
              Combines tuples from two union-compatible relations without duplicate rows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
