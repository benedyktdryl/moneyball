import fs from "fs";
import path from "path";
import { Page } from "puppeteer";

import { STATS_URL } from "../consts";
import { getBrowserPage } from "./get-browser-page";

import type { Player } from "../types";

export const fetchOverallData = ({ page }: { page: Page }): Promise<Player[]> =>
  new Promise(async (resolve) => {
    page.on("response", async (response) => {
      if (response.url().includes("stats-list?round=-1&team=-1")) {
        resolve((await response.json()) as Player[]);
      }
    });

    await page.goto(STATS_URL);
  });

(async () => {
  if (require.main === module) {
    const { browser, page } = await getBrowserPage();

    console.log(await fetchOverallData({ page }));

    browser.close();
  }
})();
