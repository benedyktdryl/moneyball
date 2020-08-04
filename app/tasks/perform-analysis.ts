import { selectSquad } from "./puppeteer/select-squad";

export const performAnalysis = () => {
  /**
   * - this should be separated into selecting squad and first team
   * - for each selection we should have separate method for generating some useful stats
   */
  const { table, selectedTeam, firstTeam, currentBudgetSpent, firstTeamPoints } = await selectSquad({
    data: overallDataCleaned,
  });
};

if (require.main === module) {
  performAnalysis();
}
