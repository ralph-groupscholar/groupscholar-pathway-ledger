export type SummaryRow = {
  cohort: string;
  status: string;
  scholar_count: number;
};

export type RiskRow = {
  scholar_id: string;
  full_name: string;
  cohort: string;
  status: string;
  region: string;
  risk_severity_sum: number;
  last_risk_detected: string | null;
  last_touchpoint: string | null;
};

export type GapRow = {
  scholar_id: string;
  full_name: string;
  cohort: string;
  status: string;
  last_touchpoint: string | null;
  days_since_touchpoint: number | null;
};

export type MilestoneGapRow = {
  scholar_id: string;
  full_name: string;
  cohort: string;
  status: string;
  last_milestone: string | null;
  days_since_milestone: number | null;
  milestone_count: number;
};
