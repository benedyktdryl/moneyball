import { Page } from "puppeteer";

import { goToIddle } from "./goToIddle";
import { LOGIN_URL } from "../consts";

export const signIn = async ({ page }: { page: Page }) => {
  await goToIddle({ page, url: LOGIN_URL });

  await page.type("#username", process.env.FANTASY_USER as string);
  await page.type("#password", process.env.FANTASY_PASS as string);

  await page.click("#_submit");
  await page.waitForSelector('[href="/user-team/index"]');
};
