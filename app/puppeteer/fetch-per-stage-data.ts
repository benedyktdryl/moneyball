import { Page } from "puppeteer";

import { getCurrentRound } from "./get-current-round";
import { getInitialRound } from "./get-initial-round";
import { getBrowserPage } from "./get-browser-page";

import { STATS_URL } from "../consts";
import type { Player } from "../types";

export interface Params {
  page: Page;
  initialRound: number;
  currentRound: number;
}

export type ReturnType = Player[][];

export const fetchPerStageData = async ({ page, initialRound, currentRound }: Params): Promise<ReturnType> => {
  const data: ReturnType = [];

  await page.goto(STATS_URL);

  for (let i = initialRound; i < currentRound; i++) {
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
};

(async () => {
  if (require.main === module) {
    const { browser, page } = await getBrowserPage();
    const initialRound = await getInitialRound({ page });
    const currentRound = await getCurrentRound({ page });

    console.log(await fetchPerStageData({ page, initialRound, currentRound }));

    browser.close();
  }
})();
