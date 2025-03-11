import { GapRow, MilestoneGapRow, RiskRow } from "./types";

export type RiskTier = "low" | "medium" | "high";

export function computeRiskScore(row: RiskRow, asOf?: string): number {
  const severity = row.risk_severity_sum ?? 0;
  const gapPenalty = gapPenaltyFromTouchpoint(row.last_touchpoint, asOf);
  return severity + gapPenalty;
}

export function riskTier(score: number): RiskTier {
  if (score >= 8) return "high";
  if (score >= 4) return "medium";
  return "low";
}

export function gapPenaltyFromTouchpoint(lastTouchpoint: string | null, asOf?: string): number {
  if (!lastTouchpoint) return 3;
  const days = daysBetween(lastTouchpoint, asOf ?? todayISO());
  if (days >= 60) return 3;
  if (days >= 30) return 2;
  if (days >= 14) return 1;
  return 0;
}

export function enrichRiskRows(
  rows: RiskRow[],
  asOf?: string
): Array<RiskRow & { score: number; tier: RiskTier }> {
  return rows.map((row) => {
    const score = computeRiskScore(row, asOf);
    return { ...row, score, tier: riskTier(score) };
  });
}

export function summarizeGaps(rows: GapRow[]): { total: number; missing: number } {
  const missing = rows.filter((row) => row.last_touchpoint === null).length;
  return { total: rows.length, missing };
}

export function summarizeMilestoneGaps(
  rows: MilestoneGapRow[]
): { total: number; missing: number } {
  const missing = rows.filter((row) => row.last_milestone === null).length;
  return { total: rows.length, missing };
}

export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start + "T00:00:00Z");
  const endDate = new Date(end + "T00:00:00Z");
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
