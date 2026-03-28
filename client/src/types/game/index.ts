export type CellSymbol = "X" | "O";
export type GamePhase = "waiting" | "playing" | "finished";
export type GameOverReason = "normal" | "forfeit" | "disconnect";
export type GameMode = "classic" | "timed";

export interface PlayerInfo {
  username: string;
  symbol: CellSymbol;
}

export interface GameStatePayload {
  board: (CellSymbol | null)[];
  players: Record<string, PlayerInfo>;
  currentTurn: string;
  phase: GamePhase;
  timed: boolean;
  timeLeft: number;
}

export interface GameOverPayload {
  winner: string | null;
  winnerId: string | null;
  reason: GameOverReason;
  board: (CellSymbol | null)[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  bestStreak: number;
}

export enum OpCode {
  MOVE = 1,
  GAME_STATE = 2,
  GAME_OVER = 4,
  PLAYER_LEFT = 5,
}
