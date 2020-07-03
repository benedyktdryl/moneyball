import { fetchLatestData } from "./tasks/fetch-latest-data";

import { getBrowserPage } from "./helpers/get-browser-page";
import { getCurrentRound } from "./helpers/get-current-round";
import { getFirstRound } from "./helpers/get-first-round";
import { signIn } from "./helpers/sign-in";

import { getCleanedData } from "./utils/get-cleaned-data";
import { selectSquad } from "./tasks/select-squad";

export const main = async () => {
  const { browser, page } = await getBrowserPage();

  const currentRound = await getCurrentRound({ page });
  const firstRound = await getFirstRound({ page });

  if (currentRound === 0 || firstRound === 0) {
    throw new Error("Round not found - something goes wrong");
  }

  const roundsCount = currentRound - firstRound;

  await signIn({ page });

  const latestData = await fetchLatestData({ page });
  const latestDataCleaned = await getCleanedData({ data: latestData, roundsCount });

  /**
   * - this should be separated into selecting squad and first team
   * - for each selection we should have separate method for generating some useful stats
   */
  const { table, selectedTeam, firstTeam, currentBudgetSpent, firstTeamPoints } = await selectSquad({
    data: latestDataCleaned,
  });

  /**
   * - select squad should be done as a strategy with shared utils
   * - we should retrieve config and apply strategy for each team (how to do array in .env)
   * - from here, everything should be done per team
   */

  /* eslint no-console: 0 */
  console.log(selectedTeam);

  /* eslint no-console: 0 */
  console.log(currentBudgetSpent);

  /* eslint no-console: 0 */
  console.log(firstTeamPoints);

  /* eslint no-console: 0 */
  console.log(table.toString());

  browser.close();
};

if (require.main === module) {
  main();
}

/**
 * - kontuzje
 * - terminarz: jakie statystyki? łączne punkty? pozycja w tabeli? liczba goli?
 * - regresja liniowa/trend?
 * - trend druzyny?
 */
