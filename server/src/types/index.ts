export enum OpCode {
  MOVE = 1,
  GAME_STATE = 2,
  GAME_OVER = 4,
  PLAYER_LEFT = 5,
}

export type CellSymbol = "X" | "O";
export type GamePhase = "waiting" | "playing" | "finished";
export type GameMode = "classic" | "timed";
export type GameOverReason = "normal" | "forfeit" | "disconnect";

export interface PlayerInfo {
  userId: string;
  username: string;
  symbol: CellSymbol;
}

export interface MatchState {
  board: (CellSymbol | null)[];
  players: { [userId: string]: PlayerInfo };
  presences: { [userId: string]: nkruntime.Presence };
  playerOrder: string[];
  currentTurn: string;
  phase: GamePhase;
  winner: string | null;
  winnerId: string | null;
  timed: boolean;
  turnDuration: number;
  turnDeadline: number;
}

export interface MovePayload {
  position: number;
}

export interface GameStatePayload {
  board: (CellSymbol | null)[];
  players: { [userId: string]: { username: string; symbol: CellSymbol } };
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

export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}
