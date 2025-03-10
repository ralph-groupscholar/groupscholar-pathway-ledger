import { withClient } from "./db";
import { fetchGaps, fetchRiskReport, fetchSummary } from "./queries";
import { enrichRiskRows, summarizeGaps } from "./report";
import { formatGaps, formatRisk, formatSummary } from "./format";

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === "help" || command === "--help") {
  printHelp();
  process.exit(0);
}

const cohort = getArgValue("--cohort");
const gapDaysRaw = getArgValue("--gap-days");
const gapDays = gapDaysRaw ? Number(gapDaysRaw) : 30;

void (async () => {
  switch (command) {
    case "summary":
      await runSummary();
      break;
    case "risks":
      await runRisks();
      break;
    case "gaps":
      await runGaps();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
})();

async function runSummary(): Promise<void> {
  await withClient(async (client) => {
    const rows = await fetchSummary(client, cohort);
    console.log(formatSummary(rows));
  });
}

async function runRisks(): Promise<void> {
  await withClient(async (client) => {
    const rows = await fetchRiskReport(client, cohort);
    const enriched = enrichRiskRows(rows).map((row) => ({
      name: row.full_name,
      cohort: row.cohort,
      status: row.status,
      region: row.region,
      score: row.score,
      tier: row.tier,
      last_touchpoint: row.last_touchpoint
    }));
    console.log(formatRisk(enriched));
  });
}

async function runGaps(): Promise<void> {
  await withClient(async (client) => {
    const rows = await fetchGaps(client, gapDays, cohort);
    const summary = summarizeGaps(rows);
    console.log(formatGaps(rows));
    console.log(`\nTotal gaps: ${summary.total} | Missing touchpoints: ${summary.missing}`);
  });
}

function getArgValue(flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function printHelp(): void {
  console.log(`groupscholar-pathway-ledger

Usage:
  npm run dev -- <command> [--cohort <name>] [--gap-days <days>]

Commands:
  summary   Cohort/status summary counts
  risks     Risk severity rollup with touchpoint penalty
  gaps      Engagement gaps based on last touchpoint date

Options:
  --cohort <name>   Filter to a cohort (optional)
  --gap-days <days> Days since last touchpoint to flag gaps (default 30)
`);
}
