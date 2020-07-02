import { signIn } from "./sign-in";
import { STATS_URL } from "../consts";

(async () => {
  const { browser, page } = await signIn();

  page.on("response", async (response) => {
    if (response.url().includes("stats-list?round=-1&team=-1")) {
      const data = await response.json();

      // browser.close();
    }
  });

  await page.goto(STATS_URL, { waitUntil: "networkidle2" });

  setTimeout(browser.close, 5000);
})();
