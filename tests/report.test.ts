import { describe, expect, it } from "vitest";
import { computeRiskScore, daysBetween, enrichRiskRows, riskTier, summarizeGaps } from "../src/report";
import { GapRow, RiskRow } from "../src/types";

describe("report helpers", () => {
  it("computes days between two dates", () => {
    expect(daysBetween("2025-01-01", "2025-01-11")).toBe(10);
  });

  it("assigns risk tiers by score", () => {
    expect(riskTier(2)).toBe("low");
    expect(riskTier(5)).toBe("medium");
    expect(riskTier(9)).toBe("high");
  });

  it("adds a touchpoint gap penalty to risk score", () => {
    const row: RiskRow = {
      scholar_id: "sch_001",
      full_name: "Avery Jordan",
      cohort: "Cohort 2024",
      status: "active",
      region: "Midwest",
      risk_severity_sum: 3,
      last_risk_detected: null,
      last_touchpoint: null
    };

    const score = computeRiskScore(row);
    expect(score).toBeGreaterThan(3);
  });

  it("enriches risk rows with tier and score", () => {
    const rows: RiskRow[] = [
      {
        scholar_id: "sch_002",
        full_name: "Noah Patel",
        cohort: "Cohort 2024",
        status: "active",
        region: "South",
        risk_severity_sum: 6,
        last_risk_detected: "2025-10-01",
        last_touchpoint: "2025-12-01"
      }
    ];

    const enriched = enrichRiskRows(rows, "2025-12-10");
    expect(enriched[0].tier).toBe("medium");
  });

  it("summarizes engagement gaps", () => {
    const gaps: GapRow[] = [
      {
        scholar_id: "sch_003",
        full_name: "Mia Chen",
        cohort: "Cohort 2025",
        status: "paused",
        last_touchpoint: null,
        days_since_touchpoint: null
      },
      {
        scholar_id: "sch_004",
        full_name: "Liam Torres",
        cohort: "Cohort 2025",
        status: "active",
        last_touchpoint: "2025-11-01",
        days_since_touchpoint: 45
      }
    ];

    const summary = summarizeGaps(gaps);
    expect(summary.total).toBe(2);
    expect(summary.missing).toBe(1);
  });
});
