
const K_FACTOR = 32;

/**
 * Calculates the expected score of player A against player B.
 * @param eloA ELO rating of player A.
 * @param eloB ELO rating of player B.
 * @returns The expected score for player A.
 */
function getExpectedScore(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

/**
 * Updates ELO ratings based on the match outcome.
 * @param winnerElo Current ELO of the winner.
 * @param loserElo Current ELO of the loser.
 * @returns New ELO ratings for the winner and loser.
 */
export function calculateElo(
  winnerElo: number,
  loserElo: number
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinnerScore = getExpectedScore(winnerElo, loserElo);
  const expectedLoserScore = getExpectedScore(loserElo, winnerElo);

  const newWinnerElo = Math.round(winnerElo + K_FACTOR * (1 - expectedWinnerScore));
  const newLoserElo = Math.round(loserElo + K_FACTOR * (0 - expectedLoserScore));

  return { newWinnerElo, newLoserElo };
}
