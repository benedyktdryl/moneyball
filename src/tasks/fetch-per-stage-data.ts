import fs from "fs";
import path from "path";
import { Page } from "puppeteer";

import { getCurrentRound } from "../helpers/get-current-round";
import { getFirstRound } from "../helpers/get-first-round";
import { getBrowserPage } from "../helpers/get-browser-page";

import { cache } from "../utils/cache";

import { STATS_URL } from "../consts";
import type { Player } from "../types";

export interface Params {
  page: Page;
  firstRound: number;
  currentRound: number;
}

export type ReturnType = Player[][];

export const fetchPerStageData = cache<Params>(
  async ({ page, firstRound, currentRound }: Params): Promise<ReturnType> => {
    const data: ReturnType = [];

    await page.goto(STATS_URL);

    for (let i = firstRound; i < currentRound; i++) {
      const fetchOp = new Promise<Player[]>(async (resolve) => {
        page.on("response", async (response) => {
          if (response.url().includes(`stats-list?round=${i}&team=-1`)) {
            resolve((await response.json()) as Player[]);
          }
        });
      });

      await page.select("#stats-round", i.toString());

      data.push(await fetchOp);
    }

    return data;
  },
  ({ args: { page, ...argsRest } }) => JSON.stringify(argsRest)
);

(async () => {
  if (require.main === module) {
    const { browser, page } = await getBrowserPage();
    const firstRound = await getFirstRound({ page });
    const currentRound = await getCurrentRound({ page });

    console.log(await fetchPerStageData({ page, firstRound, currentRound }));

    browser.close();
  }
})();
