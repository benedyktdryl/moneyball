import { orderBy } from "lodash";

import { MINIMAL_TIME_THRESHOLD } from "../consts";

import { calculatePlayerScore } from "./get-player-rank";
import { getPlayerName } from "./get-player-name";

import type { Player, RankedPlayer } from "../types";

export const getCleanedData = ({ data, roundsCount }: { data: Player[]; roundsCount: number }): RankedPlayer[] => {
  /**
   * Calculate time based on league stage, so later we can filter out
   * players who are playing less then 3/4 of possible games
   */
  const MAX_TIME = roundsCount * 90;
  const MINIMAL_TIME = MAX_TIME * MINIMAL_TIME_THRESHOLD;

  /**
   * We can sort output by `points` too but results will be same as rank will be low
   * only if player had a lot of points comparing to his value, sorting by points will not show any suprises
   * just most valuable players
   */
  return orderBy(
    data
      /**
       * We need to filter out noisy results: when player was playing only short amount of time (for example 2 games)
       * and had a lot of points, it doesn't mean he will play well in next games but also it means that he is not playin
       * a lot right now - such players are not needed for us
       */
      .filter(({ playTime }) => parseInt(playTime) >= MINIMAL_TIME)
      .map(({ points, id, position, price, team, name }) => ({
        id,
        team,
        position,
        points: parseInt(points),
        price: parseFloat(price),
        name: getPlayerName(name),
        score: calculatePlayerScore(parseInt(points), parseFloat(price)),
      })),
    "score",
    "desc"
  );
};
