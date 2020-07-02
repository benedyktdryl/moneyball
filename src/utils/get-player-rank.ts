/**
 * Player rank basic version: simply calculate how much points we get for 1 unit of price, for example:
 *
 * Player A price is 2.80 and he has 80 points so far
 * Player B price is 1.30 and he has 70 points so far
 *
 * For A, rank is 2.80/80 = 0.035 -> means each point cost 0.035 unit of price
 * For B, rank is 1.30/80 = 0.01625 -> means each point cost 0.01625 unit of price
 *
 * Lower result is better, as it means that we can get more points for less price
 */
export const calculatePlayerScore = (points: number, price: number) => points / price;
