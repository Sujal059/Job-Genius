/**
 * How long a candidate gets on a single question before it auto-advances.
 * Shared by both Mock Interviewer and Skill Assessment so the two features
 * behave consistently. Computed server-side (not left to the AI) so it's
 * predictable regardless of what any given model generates.
 */
export const TIME_LIMITS_SECONDS = {
  mcq: { Easy: 45, Medium: 60, Hard: 90 },
  text: { Easy: 120, Medium: 180, Hard: 240 },
  coding: { Easy: 420, Medium: 600, Hard: 900 },
};

export function getTimeLimitSeconds(type, difficulty) {
  const byType = TIME_LIMITS_SECONDS[type] || TIME_LIMITS_SECONDS.text;
  return byType[difficulty] || byType.Medium;
}

export default { TIME_LIMITS_SECONDS, getTimeLimitSeconds };
