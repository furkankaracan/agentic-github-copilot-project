# Opportunity stages

Source: `src/domain/opportunities.ts` (`OPPORTUNITY_TRANSITIONS`, `transitionOpportunity`).

## Transition table

| From | Allowed next stages |
| --- | --- |
| Prospecting | Qualification, Closed Lost |
| Qualification | Proposal, Closed Lost |
| Proposal | Negotiation, Closed Lost |
| Negotiation | Closed Won, Closed Lost |
| Closed Won | — (terminal) |
| Closed Lost | — (terminal) |

New opportunities always start in **Prospecting**. Creating one in any other stage is a bug.

## Stage probabilities (spec — not yet implemented)

Used for the **weighted pipeline** (expected revenue). Store as a `STAGE_PROBABILITY` map next to `STAGE_LABELS`; never hard-code percentages in the UI.

| Stage | Probability |
| --- | --- |
| Prospecting | 10 % |
| Qualification | 25 % |
| Proposal | 50 % |
| Negotiation | 75 % |
| Closed Won | 100 % |
| Closed Lost | 0 % |

`getWeightedPipelineValue(opportunities)` = Σ amount × probability over **open** stages only, rounded to whole euros.

## Loss reasons (spec — not yet implemented)

Moving to **Closed Lost** requires a reason. Without one, `transitionOpportunity` must throw `VALIDATION_FAILED` with `details.field = 'lossReason'`.

```ts
export const LossReason = {
  Price: 'Price',
  Competitor: 'Competitor',
  NoBudget: 'NoBudget',
  NoDecision: 'NoDecision',
  Other: 'Other',
} as const;
```

- `lossReason` is an optional field on `Opportunity`, set only when closed lost.
- `Other` additionally requires a non-empty `lossNote` (max 280 characters).
- Seed records `opp-007` and `opp-009` are already Closed Lost without a reason — they stay valid (old data); the rule applies to new transitions only.

## Pipeline metrics

Source: `src/domain/metrics.ts`.

| Metric | Definition |
| --- | --- |
| Open pipeline value | Σ amount where stage is **open** (`OPEN_STAGES` — excludes Closed Won **and** Closed Lost) |
| Won revenue | Σ amount where stage = Closed Won |
| Win rate | won / (won + lost); 0 when nothing is closed |
| Open pipeline by stage | One row per `OPEN_STAGES` entry, in display order |

The "Open pipeline" figure on the dashboard must always equal the sum of the "Open pipeline by stage" table. If it does not, a metric is filtering stages incorrectly.
