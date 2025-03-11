import { Client } from "pg";
import { GapRow, MilestoneGapRow, RiskRow, SummaryRow } from "./types";

const SCHEMA = "gs_pathway_ledger";

export async function fetchSummary(client: Client, cohort?: string): Promise<SummaryRow[]> {
  const result = await client.query(
    `
    SELECT cohort, status, COUNT(*)::int AS scholar_count
    FROM ${SCHEMA}.scholars
    WHERE ($1::text IS NULL OR cohort = $1)
    GROUP BY cohort, status
    ORDER BY cohort, status;
    `,
    [cohort ?? null]
  );

  return result.rows as SummaryRow[];
}

export async function fetchRiskReport(client: Client, cohort?: string): Promise<RiskRow[]> {
  const result = await client.query(
    `
    SELECT
      s.scholar_id,
      s.full_name,
      s.cohort,
      s.status,
      s.region,
      COALESCE(SUM(r.severity), 0)::int AS risk_severity_sum,
      MAX(r.detected_on) AS last_risk_detected,
      MAX(t.occurred_on) AS last_touchpoint
    FROM ${SCHEMA}.scholars s
    LEFT JOIN ${SCHEMA}.risk_signals r ON r.scholar_id = s.scholar_id
    LEFT JOIN ${SCHEMA}.touchpoints t ON t.scholar_id = s.scholar_id
    WHERE ($1::text IS NULL OR s.cohort = $1)
    GROUP BY s.scholar_id, s.full_name, s.cohort, s.status, s.region
    ORDER BY risk_severity_sum DESC, last_touchpoint NULLS FIRST;
    `,
    [cohort ?? null]
  );

  return result.rows as RiskRow[];
}

export async function fetchGaps(
  client: Client,
  gapDays: number,
  cohort?: string
): Promise<GapRow[]> {
  const result = await client.query(
    `
    SELECT
      s.scholar_id,
      s.full_name,
      s.cohort,
      s.status,
      MAX(t.occurred_on) AS last_touchpoint,
      CASE
        WHEN MAX(t.occurred_on) IS NULL THEN NULL
        ELSE (CURRENT_DATE - MAX(t.occurred_on))::int
      END AS days_since_touchpoint
    FROM ${SCHEMA}.scholars s
    LEFT JOIN ${SCHEMA}.touchpoints t ON t.scholar_id = s.scholar_id
    WHERE ($2::text IS NULL OR s.cohort = $2)
    GROUP BY s.scholar_id, s.full_name, s.cohort, s.status
    HAVING MAX(t.occurred_on) IS NULL OR MAX(t.occurred_on) < (CURRENT_DATE - ($1 * INTERVAL '1 day'))
    ORDER BY days_since_touchpoint DESC NULLS FIRST;
    `,
    [gapDays, cohort ?? null]
  );

  return result.rows as GapRow[];
}

export async function fetchMilestoneGaps(
  client: Client,
  gapDays: number,
  cohort?: string
): Promise<MilestoneGapRow[]> {
  const result = await client.query(
    `
    SELECT
      s.scholar_id,
      s.full_name,
      s.cohort,
      s.status,
      MAX(m.achieved_on) AS last_milestone,
      CASE
        WHEN MAX(m.achieved_on) IS NULL THEN NULL
        ELSE (CURRENT_DATE - MAX(m.achieved_on))::int
      END AS days_since_milestone,
      COUNT(m.milestone_id)::int AS milestone_count
    FROM ${SCHEMA}.scholars s
    LEFT JOIN ${SCHEMA}.milestones m ON m.scholar_id = s.scholar_id
    WHERE ($2::text IS NULL OR s.cohort = $2)
    GROUP BY s.scholar_id, s.full_name, s.cohort, s.status
    HAVING MAX(m.achieved_on) IS NULL OR MAX(m.achieved_on) < (CURRENT_DATE - ($1 * INTERVAL '1 day'))
    ORDER BY days_since_milestone DESC NULLS FIRST;
    `,
    [gapDays, cohort ?? null]
  );

  return result.rows as MilestoneGapRow[];
}
