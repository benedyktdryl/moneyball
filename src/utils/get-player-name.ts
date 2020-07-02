/**
 * Simple util to strip unnecessary links to players from names for same of readability
 */
export const getPlayerName = (name: string) => name.replace(/<a href=\"\/player\/[0-9]+\">/, "").replace("</a>", "");
