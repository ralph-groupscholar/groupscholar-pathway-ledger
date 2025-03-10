import { Client } from "pg";
import { loadDbConfig } from "../src/config";

const schema = "gs_pathway_ledger";

const statements = [
  `CREATE SCHEMA IF NOT EXISTS ${schema};`,
  `CREATE TABLE IF NOT EXISTS ${schema}.scholars (
      scholar_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      cohort TEXT NOT NULL,
      status TEXT NOT NULL,
      region TEXT NOT NULL,
      joined_on DATE NOT NULL
    );`,
  `CREATE TABLE IF NOT EXISTS ${schema}.milestones (
      milestone_id TEXT PRIMARY KEY,
      scholar_id TEXT NOT NULL REFERENCES ${schema}.scholars(scholar_id),
      milestone_type TEXT NOT NULL,
      achieved_on DATE NOT NULL,
      notes TEXT
    );`,
  `CREATE TABLE IF NOT EXISTS ${schema}.touchpoints (
      touchpoint_id TEXT PRIMARY KEY,
      scholar_id TEXT NOT NULL REFERENCES ${schema}.scholars(scholar_id),
      channel TEXT NOT NULL,
      occurred_on DATE NOT NULL,
      engagement_score INT NOT NULL,
      notes TEXT
    );`,
  `CREATE TABLE IF NOT EXISTS ${schema}.risk_signals (
      risk_id TEXT PRIMARY KEY,
      scholar_id TEXT NOT NULL REFERENCES ${schema}.scholars(scholar_id),
      category TEXT NOT NULL,
      severity INT NOT NULL,
      detected_on DATE NOT NULL,
      details TEXT
    );`
];

const seedStatements = [
  `INSERT INTO ${schema}.scholars (scholar_id, full_name, cohort, status, region, joined_on) VALUES
    ('sch_001', 'Avery Jordan', 'Cohort 2024', 'active', 'Midwest', '2024-02-10'),
    ('sch_002', 'Noah Patel', 'Cohort 2024', 'active', 'South', '2024-03-05'),
    ('sch_003', 'Mia Chen', 'Cohort 2025', 'paused', 'West', '2025-01-20'),
    ('sch_004', 'Liam Torres', 'Cohort 2025', 'active', 'Northeast', '2025-02-14'),
    ('sch_005', 'Sophia Ruiz', 'Cohort 2023', 'graduated', 'Midwest', '2023-06-01')
  ON CONFLICT (scholar_id) DO NOTHING;`,
  `INSERT INTO ${schema}.milestones (milestone_id, scholar_id, milestone_type, achieved_on, notes) VALUES
    ('ms_001', 'sch_001', 'internship_placement', '2024-06-15', 'Placed at community partner'),
    ('ms_002', 'sch_002', 'first_year_completion', '2024-12-20', 'Completed fall term'),
    ('ms_003', 'sch_004', 'mentorship_onboarding', '2025-03-01', 'Matched with mentor'),
    ('ms_004', 'sch_005', 'graduation', '2025-05-10', 'Completed capstone')
  ON CONFLICT (milestone_id) DO NOTHING;`,
  `INSERT INTO ${schema}.touchpoints (touchpoint_id, scholar_id, channel, occurred_on, engagement_score, notes) VALUES
    ('tp_001', 'sch_001', 'email', '2025-12-15', 4, 'Shared midyear update'),
    ('tp_002', 'sch_002', 'call', '2025-11-20', 3, 'Discussed internship search'),
    ('tp_003', 'sch_003', 'text', '2025-09-05', 2, 'Check-in after pause'),
    ('tp_004', 'sch_004', 'in_person', '2026-01-18', 5, 'Leadership workshop'),
    ('tp_005', 'sch_005', 'email', '2025-06-15', 5, 'Alumni spotlight')
  ON CONFLICT (touchpoint_id) DO NOTHING;`,
  `INSERT INTO ${schema}.risk_signals (risk_id, scholar_id, category, severity, detected_on, details) VALUES
    ('rk_001', 'sch_002', 'financial', 3, '2025-11-15', 'Aid gap reported'),
    ('rk_002', 'sch_003', 'engagement', 4, '2025-10-01', 'Low response rate'),
    ('rk_003', 'sch_003', 'academic', 2, '2025-10-15', 'Tutoring requested'),
    ('rk_004', 'sch_001', 'engagement', 1, '2025-12-10', 'Late survey response')
  ON CONFLICT (risk_id) DO NOTHING;`
];

async function run(): Promise<void> {
  const client = new Client(loadDbConfig());
  await client.connect();
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    for (const statement of seedStatements) {
      await client.query(statement);
    }
    console.log("Seed complete.");
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
