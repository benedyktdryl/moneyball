require("dotenv").config();

import fs from "fs";
import path from "path";

import { fetchOverallData } from "../puppeteer/fetch-overall-data";
import { fetchPerStageData } from "../puppeteer/fetch-per-stage-data";

import { getBrowserPage } from "../puppeteer/get-browser-page";
import { getCurrentRound } from "../puppeteer/get-current-round";
import { getInitialRound } from "../puppeteer/get-initial-round";
import { signIn } from "../puppeteer/sign-in";

import { getCleanedData } from "../utils/get-cleaned-data";

export const scrapData = async () => {
  const { browser, page } = await getBrowserPage();

  const currentRound = await getCurrentRound({ page });
  const initialRound = await getInitialRound({ page });

  if (currentRound === 0 || initialRound === 0) {
    throw new Error("Round not found - something goes wrong");
  }

  const roundsCount = currentRound - initialRound;

  await signIn({ page });

  const overallData = await fetchOverallData({ page });
  const overallDataCleaned = await getCleanedData({ data: overallData, roundsCount });
  const perRoundData = await fetchPerStageData({ page, initialRound, currentRound });

  const dataPath = process.env.DATA_PATH as string;
  const filename = path.join(dataPath, "data-all.json");

  if (fs.existsSync(filename)) {
    const data = JSON.parse(fs.readFileSync(filename).toString());
    const newFilename = path.join(dataPath, `data-${data.currentRound}.json`);

    fs.copyFileSync(filename, newFilename);
  }

  const data = { overallData: overallDataCleaned, perRoundData, currentRound, initialRound };

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));

  /**
   * - select squad should be done as a strategy with shared utils
   * - we should retrieve config and apply strategy for each team (how to do array in .env)
   * - from here, everything should be done per team
   */
  browser.close();
};

if (require.main === module) {
  scrapData();
}

/**
 * - kontuzje
 * - terminarz: jakie statystyki? łączne punkty? pozycja w tabeli? liczba goli?
 * - regresja liniowa/trend?
 * - trend druzyny?
 */
