import { LogStatus } from '../types/behavioral';

/**
 * Resilience constants
 */
const C_GROWTH = 10;     // Base growth for a completed habit
const NEUTRAL_DECAY = 0.5; // Stasis/Entropy decay
const M_MISS_PENALTY = 5;  // Base penalty for missing

/**
 * Calculates the new Resilience Score (0-100) based on the latest log status.
 *
 * @param currentScore The current resilience score before logging (0-100)
 * @param status The status of the current day's log
 * @param consecutiveMisses The number of consecutive days skipped PRIOR to this log. 
 *                          If status is SKIPPED, this means it's the (consecutiveMisses + 1)th skip.
 * @returns The new resilience score, bounded between 0 and 100
 */
export function calculateNewResilience(
  currentScore: number,
  status: LogStatus,
  consecutiveMisses: number = 0
): number {
  let newScore = currentScore;

  switch (status) {
    case LogStatus.COMPLETED:
      // Diminishing returns formula: The closer to 100, the harder it is to move the needle
      newScore = currentScore + C_GROWTH * (1 - currentScore / 100);
      break;

    case LogStatus.NEUTRAL:
      // Micro-decay. A rest day or excused skip prevents a crash but loses a tiny bit of momentum.
      // Keeps the habit mentally alive without punishment.
      newScore = currentScore - NEUTRAL_DECAY;
      break;

    case LogStatus.SKIPPED:
      // Accelerating decay curve.
      // Missing 1 day drops M_MISS_PENALTY.
      // Missing 3 days drops M_MISS_PENALTY * 1.5^2, accelerating the decline.
      // We use consecutiveMisses + 1 because this current skip adds to the streak of failures.
      const missCount = consecutiveMisses + 1;
      const compoundPenalty = M_MISS_PENALTY * Math.pow(1.5, missCount - 1);
      newScore = currentScore - compoundPenalty;
      break;
  }

  // Ensure score stays firmly between 0 and 100 bounds
  return Math.max(0, Math.min(100, newScore));
}
