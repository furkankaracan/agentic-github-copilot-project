import { OPEN_STAGES } from './opportunities';
import { OpportunityStage, type Opportunity } from './types';

/** Dashboard metrics. Pure functions over the opportunity list. */

export function getOpenPipelineValue(opportunities: readonly Opportunity[]): number {
  return opportunities
    .filter((o) => OPEN_STAGES.includes(o.stage))
    .reduce((sum, o) => sum + o.amount, 0);
}

export function getWonRevenue(opportunities: readonly Opportunity[]): number {
  return opportunities
    .filter((o) => o.stage === OpportunityStage.ClosedWon)
    .reduce((sum, o) => sum + o.amount, 0);
}

/** Win rate over closed opportunities, as a 0..1 ratio. Returns 0 when nothing is closed yet. */
export function getWinRate(opportunities: readonly Opportunity[]): number {
  const won = opportunities.filter((o) => o.stage === OpportunityStage.ClosedWon).length;
  const lost = opportunities.filter((o) => o.stage === OpportunityStage.ClosedLost).length;
  const closed = won + lost;
  return closed === 0 ? 0 : won / closed;
}

export interface StageSummary {
  stage: OpportunityStage;
  count: number;
  amount: number;
}

export function summarizeOpenPipeline(opportunities: readonly Opportunity[]): StageSummary[] {
  return OPEN_STAGES.map((stage) => {
    const inStage = opportunities.filter((o) => o.stage === stage);
    return {
      stage,
      count: inStage.length,
      amount: inStage.reduce((sum, o) => sum + o.amount, 0),
    };
  });
}
