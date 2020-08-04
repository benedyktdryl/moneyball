import { number } from "yargs";

export interface Player {
  points: string;
  playTime: string;
  goals: string;
  assists: string;
  goalsReceived: string;
  ownGoals: string;
  penaltyWon: string;
  penaltyCaused: string;
  penaltyWasted: string;
  penaltySaved: string;
  penaltyTaken: string;
  mvp: string;
  shotsCleared: string;
  yellowCards: string;
  redCards: string;
  firstSquad: string;
  name: string;
  position: "B" | "O" | "P" | "N";
  price: string;
  id: number;
  team: string;
}

export type RankedPlayer = Pick<Player, "id" | "team" | "position" | "name"> & {
  price: number;
  score: number;
  points: number;
};
