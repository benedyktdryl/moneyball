import fs from "fs";
import hasha from "hasha";
import { getCacheFilename } from "./get-filename";
import { result } from "lodash";
import { SKIP_CACHE } from "../consts";

export const cache = <Params>(
  callback: (params: Params) => unknown,
  getHashString: ({ args }: { args: Params }) => string
) => async (proxiedParams: Params) => {
  const fullHashString = `${callback.toString()}${getHashString({ args: proxiedParams })}`;
  const hash = hasha(fullHashString);
  const filename = getCacheFilename(hash);

  if ((process.env.CACHE as string) !== SKIP_CACHE && fs.existsSync(filename)) {
    return JSON.parse(fs.readFileSync(filename).toString());
  }

  const result = await callback(proxiedParams);
  const resultStringified = JSON.stringify(result, null, 2);

  fs.writeFileSync(filename, resultStringified);

  return result;
};
