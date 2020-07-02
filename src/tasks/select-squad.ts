import fs from "fs";
import Table from "cli-table3";
import * as math from "mathjs";
import { map, round, findIndex, ceil, sumBy, floor, sortBy, orderBy, groupBy, reduce } from "lodash";

import { POSITIONS_ORDER, MAX_PLAYERS_FROM_SAME_TEAM, MAX_BUDGET, MAX_PLAYERS_PER_FORMATION } from "../consts";

import { RankedPlayer } from "../types";

export const selectSquad = ({ data }: { data: RankedPlayer[] }) => {
  /**
   * Calculate median of score of whole players set
   * and remove from set players below it
   */
  const medianScore = math.median(map(data, "score"));
  const dataBestRank = data.filter(({ score }) => score >= medianScore);

  /**
   * Here picking starts actually, let's start with declaring used budget
   */
  let currentBudgetSpent = 0;

  /**
   * Teams count store number of players from same teams used for our team
   */
  const teamsCount: { [key: string]: number } = {};

  /**
   * Number of players on particular position already picked
   */
  const playersCount = { B: 0, O: 0, P: 0, N: 0 };

  /**
   * Array of players picked for team
   */
  const selectedTeam = [];

  /**
   * Run iteration of players picking until:
   *
   *  - there is enough players to pick from "below median score set"
   *    (it's more like safeguard for silly errors)
   *
   *  - currently used budget is lower than max allowed budget
   *    (also shouldn't happen, we cannot pick player which will exhaust limit)
   *
   *  - not allrequired players are picked for each position
   */
  while (
    dataBestRank.length > 0 &&
    currentBudgetSpent < MAX_BUDGET &&
    (playersCount.B < MAX_PLAYERS_PER_FORMATION.B ||
      playersCount.O < MAX_PLAYERS_PER_FORMATION.O ||
      playersCount.P < MAX_PLAYERS_PER_FORMATION.P ||
      playersCount.N < MAX_PLAYERS_PER_FORMATION.N)
  ) {
    /**
     * Take player and remove it from best players set (yes, it's mutating collection)
     */
    const player = dataBestRank.shift() as RankedPlayer;

    /**
     * Initialise players from same team count if needed
     */
    if (typeof teamsCount[player.team] === "undefined") {
      teamsCount[player.team] = 0;
    }

    /**
     * Add player to team if:
     *
     *  - we have room for players on this position in team
     *  - picking him will not exhaust allowed budget
     *  - we have room for players from same team as player
     */
    if (
      playersCount[player.position] < MAX_PLAYERS_PER_FORMATION[player.position] &&
      currentBudgetSpent + player.price <= MAX_BUDGET &&
      teamsCount[player.team] < MAX_PLAYERS_FROM_SAME_TEAM
    ) {
      teamsCount[player.team] += 1;
      playersCount[player.position] += 1;

      currentBudgetSpent += player.price;

      selectedTeam.push(player);
    }
  }

  const selectedTeamIds = map(selectedTeam, "id");

  /**
   * Replace worst player with best player if we have enough money for that
   */
  const dataByPoints = orderBy(data, "points", "desc").filter((player) => !selectedTeamIds.includes(player.id));

  let cheapestPlayerPrice = sortBy(selectedTeam, "price")[0].price;
  let budgetLeft = round(MAX_BUDGET - currentBudgetSpent, 1);

  while (budgetLeft > cheapestPlayerPrice) {
    let bestPlayer = null;
    let rotatedPlayer = null;

    while (bestPlayer === null && dataByPoints.length) {
      const potentialBestPlayer = dataByPoints.shift() as RankedPlayer;
      const priceIsLowerThanBudget = potentialBestPlayer.price < budgetLeft;

      const selectedTeamsWithSamePosition = selectedTeam.filter(
        (player) => player.position === potentialBestPlayer.position
      );

      const selectedTeamByPositionAndPoints = sortBy(selectedTeamsWithSamePosition, "points");

      rotatedPlayer = selectedTeamByPositionAndPoints[0] as RankedPlayer;

      const isBetterThanSelectedPlayer = rotatedPlayer.points < potentialBestPlayer.points;

      if (priceIsLowerThanBudget && isBetterThanSelectedPlayer) {
        bestPlayer = potentialBestPlayer;
      }
    }

    if (bestPlayer) {
      const rotatedPlayerIndex = findIndex(selectedTeam, {
        id: (rotatedPlayer as RankedPlayer).id,
      });

      /* eslint no-console: 0 */
      console.log("Replacing", (rotatedPlayer as RankedPlayer).name, "with", bestPlayer.name);

      selectedTeam.splice(rotatedPlayerIndex, 1, bestPlayer);

      currentBudgetSpent = ceil(sumBy(selectedTeam, "price"), 1);
    } else {
      break;
    }

    budgetLeft = floor(MAX_BUDGET - currentBudgetSpent, 1);
    cheapestPlayerPrice = sortBy(selectedTeam, "price")[0].price;
  }

  /**
   * Sort team by points gathered so far
   */
  const teamByPoints = orderBy(selectedTeam, "points", "desc");

  /**
   * Most scoring players will be our captains to multiply points
   */
  const captain = teamByPoints[0];
  const viceCaptain = teamByPoints[1];

  /**
   * Various stats which can be shown later for statistical purposes
   */
  const teamByPosition = groupBy(selectedTeam, "position");
  const teamPointsSum = sumBy(selectedTeam, "points");
  const teamBudgetSum = sumBy(selectedTeam, "price");
  const teamByTeams = groupBy(selectedTeam, "team");

  /**
   * Calculate how much points each position gather PER PLAYER (as there is different number of players on each formation),
   * so we can now which formation is strongest. We will use this values later to pick best formation
   */
  // @ts-ignore
  const avaragePointsPerPosition = reduce(
    groupBy(selectedTeam, "position"),
    (result, positionPlayers, position: RankedPlayer["position"]) => {
      result[position] = sumBy(positionPlayers, "points") / MAX_PLAYERS_PER_FORMATION[position];

      return result;
    },
    { B: 0, O: 0, P: 0, N: 0 }
  );

  /**
   * Choosen formation, start from only parameter we are sure: 1 goalkeeper
   */
  const formation = { B: 1, O: 0, P: 0, N: 0 };

  /**
   * In general, this conditional is based on very basic assumption:
   *  - check if particular position win in points per player per position (is it strongest formation)
   *    - if yes, allocate max allowed players number on this position
   *      - find second strongest formation and leave maximum allowed value on this position as well
   *    - if not, move to another formation
   */
  if (
    avaragePointsPerPosition.O > avaragePointsPerPosition.P &&
    avaragePointsPerPosition.O > avaragePointsPerPosition.N
  ) {
    formation.O = 5;

    if (avaragePointsPerPosition.P > avaragePointsPerPosition.N) {
      formation.P = 4;
      formation.N = 1;
    } else {
      formation.P = 3;
      formation.N = 2;
    }
  } else if (
    avaragePointsPerPosition.P > avaragePointsPerPosition.O &&
    avaragePointsPerPosition.P > avaragePointsPerPosition.N
  ) {
    formation.P = 5;

    if (avaragePointsPerPosition.O > avaragePointsPerPosition.N) {
      formation.O = 4;
      formation.N = 1;
    } else {
      formation.O = 3;
      formation.N = 2;
    }
  } else {
    formation.N = 3;

    if (avaragePointsPerPosition.P > avaragePointsPerPosition.O) {
      formation.O = 3;
      formation.P = 4;
    } else {
      formation.O = 4;
      formation.P = 3;
    }
  }

  /**
   * First team players collection
   */
  const firstTeam = [];

  /**
   * Check if we fullfilled number of players expected for all positions
   */
  while (formation.B > 0 || formation.O > 0 || formation.P > 0 || formation.N > 0) {
    /**
     * Take player from collection of players sorted by points (it's mutating array)
     */
    const player = teamByPoints.shift();

    /**
     * If player for this position is needed, add it to team and decrease number of needed formation players count
     */
    if (player && formation[player.position] !== 0) {
      firstTeam.push(player);
      formation[player.position] -= 1;
    }
  }

  /**
   * First team collection by position
   */
  firstTeam.sort(({ position: positionA }, { position: positionB }) => {
    if (POSITIONS_ORDER[positionA] > POSITIONS_ORDER[positionB]) {
      return 1;
    }

    if (POSITIONS_ORDER[positionA] < POSITIONS_ORDER[positionB]) {
      return -1;
    }

    return 0;
  });

  /**
   * Show it with nice table
   */
  const table = new Table({
    head: ["Position", "Team", "Name", "Points", "Rank", "C", "VC"],
  });

  firstTeam.forEach(({ name, team, position, points, score }) => {
    // firstTeam.forEach(({ name, team, position, points }) => {
    // @ts-ignore
    table.push([
      position,
      team,
      name,
      points,
      score,
      name === captain.name ? "x" : "",
      name === viceCaptain.name ? "x" : "",
    ]);
  });

  // /* eslint no-console: 0 */
  // console.log(table.toString());
  // /* eslint no-console: 0 */
  // console.log(currentBudgetSpent);

  const firstTeamPoints = sumBy(firstTeam, "points");
  return { selectedTeam, firstTeam, currentBudgetSpent, table, firstTeamPoints };
};
