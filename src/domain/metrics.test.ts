import { describe, expect, it } from 'vitest';
import { getOpenPipelineValue, getWinRate, getWonRevenue, summarizeOpenPipeline } from './metrics';
import { OpportunityStage, type Opportunity } from './types';

function opp(stage: OpportunityStage, amount: number): Opportunity {
  return {
    id: `opp-${stage}-${amount}`,
    accountId: 'acc-1',
    name: `${stage} deal`,
    amount,
    currency: 'EUR',
    stage,
    expectedCloseDate: '2026-12-01',
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

const pipeline: Opportunity[] = [
  opp(OpportunityStage.Prospecting, 10),
  opp(OpportunityStage.Prospecting, 20),
  opp(OpportunityStage.Proposal, 100),
  opp(OpportunityStage.ClosedWon, 500),
  opp(OpportunityStage.ClosedWon, 300),
  opp(OpportunityStage.ClosedLost, 1000),
];

describe('getOpenPipelineValue', () => {
  it('sums only open-stage amounts, excluding ClosedWon and ClosedLost', () => {
    expect(getOpenPipelineValue(pipeline)).toBe(130);
  });

  it('equals the sum of the open pipeline by stage summary', () => {
    const byStage = summarizeOpenPipeline(pipeline).reduce((sum, row) => sum + row.amount, 0);
    expect(getOpenPipelineValue(pipeline)).toBe(byStage);
  });
});

describe('getWonRevenue', () => {
  it('sums only ClosedWon amounts', () => {
    expect(getWonRevenue(pipeline)).toBe(800);
  });
});

describe('getWinRate', () => {
  it('divides won by all closed opportunities', () => {
    expect(getWinRate(pipeline)).toBeCloseTo(2 / 3);
  });

  it('returns 0 when nothing is closed', () => {
    expect(getWinRate([opp(OpportunityStage.Prospecting, 1)])).toBe(0);
  });
});

describe('summarizeOpenPipeline', () => {
  it('returns one row per open stage in display order', () => {
    expect(summarizeOpenPipeline(pipeline)).toEqual([
      { stage: OpportunityStage.Prospecting, count: 2, amount: 30 },
      { stage: OpportunityStage.Qualification, count: 0, amount: 0 },
      { stage: OpportunityStage.Proposal, count: 1, amount: 100 },
      { stage: OpportunityStage.Negotiation, count: 0, amount: 0 },
    ]);
  });
});
