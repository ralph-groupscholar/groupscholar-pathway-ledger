import { GapRow, SummaryRow } from "./types";
import { RiskTier } from "./report";

export function formatSummary(rows: SummaryRow[]): string {
  if (rows.length === 0) return "No scholars match the current filter.";

  const lines = ["Cohort | Status | Scholars", "---|---|---"];

  for (const row of rows) {
    lines.push(`${row.cohort} | ${row.status} | ${row.scholar_count}`);
  }

  return lines.join("\n");
}

export function formatRisk(rows: Array<{ name: string; cohort: string; status: string; region: string; score: number; tier: RiskTier; last_touchpoint: string | null }>): string {
  if (rows.length === 0) return "No scholars match the current filter.";

  const lines = [
    "Name | Cohort | Status | Region | Score | Tier | Last Touchpoint",
    "---|---|---|---|---|---|---"
  ];

  for (const row of rows) {
    lines.push(
      `${row.name} | ${row.cohort} | ${row.status} | ${row.region} | ${row.score} | ${row.tier} | ${row.last_touchpoint ?? "none"}`
    );
  }

  return lines.join("\n");
}

export function formatGaps(rows: GapRow[]): string {
  if (rows.length === 0) return "No engagement gaps found.";

  const lines = ["Name | Cohort | Status | Last Touchpoint | Days Since", "---|---|---|---|---"];

  for (const row of rows) {
    lines.push(
      `${row.full_name} | ${row.cohort} | ${row.status} | ${row.last_touchpoint ?? "none"} | ${row.days_since_touchpoint ?? "n/a"}`
    );
  }

  return lines.join("\n");
}
