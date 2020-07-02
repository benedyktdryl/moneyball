import { Page } from "puppeteer";

export const goToIddle = async ({ page, url }: { page: Page; url: string }) => {
  await page.goto(url, { waitUntil: "networkidle2" });
};
