import puppeteer from "puppeteer";
import { isHeadless } from "../utils/is-headless";
import { LOGIN_URL } from "../consts";

export const getBrowserPage = async () => {
  const browser = await puppeteer.launch({ headless: isHeadless() });
  const page = await browser.newPage();

  return { browser, page };
};
