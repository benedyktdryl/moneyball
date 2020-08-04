require("dotenv").config();

import { HEADLESS_MODE } from "../consts";

export const isHeadless = () => process.env.HEADLESS_MODE === HEADLESS_MODE;
