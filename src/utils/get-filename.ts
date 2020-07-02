require("dotenv").config();

import path from "path";

export const getLatestDataFilename = (round: number) => `latest-stage-${round}.json`;

export const getCacheFilename = (filename: string) => path.join(process.env.DATA_PATH as string, `${filename}.json`);
