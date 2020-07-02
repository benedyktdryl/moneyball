import { Page } from "puppeteer";

import { BASE_URL } from "../consts";
import { goToIddle } from "./goToIddle";
import { getBrowserPage } from "./get-browser-page";

export const getFirstRound = async ({ page }: { page: Page }) => {
  await goToIddle({ page, url: BASE_URL });

  const text = await page.evaluate(() => {
    return document.querySelectorAll("#round-sel option")?.[0].textContent;
  });

  if (text) {
    const match = /([0-9]{1,2})\. kolejka/.exec(text);

    if (match) {
      return +match[1];
    }
  }

  return 0;
};

(async () => {
  if (require.main === module) {
    const { browser, page } = await getBrowserPage();
    console.log(await getFirstRound({ page }));
    browser.close();
  }
})();
