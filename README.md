# GroupScholar Pathway Ledger

CLI for tracking scholar pathway milestones, engagement gaps, and risk rollups for Group Scholar operations teams.

## Features
- Cohort/status summaries for quick pipeline checks.
- Risk rollups that combine severity signals with touchpoint gap penalties.
- Engagement gap detection based on last touchpoint date.
- Milestone gap detection based on last recorded milestone.
- Seed script for production schema and sample data.

## Tech Stack
- TypeScript (Node.js)
- PostgreSQL (via `pg`)
- Vitest for tests

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set production DB credentials (set `PGSSLMODE=disable` for the current DB host).
3. Build the CLI:
   ```bash
   npm run build
   ```

## Usage
```bash
npm run dev -- summary --cohort "Cohort 2024"
npm run dev -- risks
npm run dev -- gaps --gap-days 45
npm run dev -- milestone-gaps --gap-days 90
```

## Seed Production Data
```bash
npm run seed:prod
```

## Tests
```bash
npm test
```
