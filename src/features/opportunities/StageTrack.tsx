import { OPEN_STAGES, STAGE_LABELS } from '@/domain/opportunities';
import { OpportunityStage } from '@/domain/types';

/** Horizontal stage track: completed stages, the current stage, and the closing outcome. */
export function StageTrack({ stage }: { stage: OpportunityStage }) {
  const closed = stage === OpportunityStage.ClosedWon || stage === OpportunityStage.ClosedLost;
  const currentIndex = closed ? OPEN_STAGES.length : OPEN_STAGES.indexOf(stage);
  const outcomeLabel = closed ? STAGE_LABELS[stage] : 'Closed';

  return (
    <ol className="stage-track" aria-label="Opportunity stage">
      {OPEN_STAGES.map((s, i) => {
        const status = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'todo';
        return (
          <li key={s} className={`stage-step stage-step-${status}`} aria-current={status === 'current' ? 'step' : undefined}>
            {STAGE_LABELS[s]}
          </li>
        );
      })}
      <li
        className={`stage-step stage-step-outcome ${closed ? `stage-step-${stage}` : 'stage-step-todo'}`}
        aria-current={closed ? 'step' : undefined}
      >
        {outcomeLabel}
      </li>
    </ol>
  );
}
