import { CellSymbol, GameOverPayload, GameStatePayload, MatchState, OpCode } from "../types";

const WIN_LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkWinner(board: (CellSymbol | null)[]): CellSymbol | null {
  for (var i = 0; i < WIN_LINES.length; i++) {
    var line = WIN_LINES[i];
    var a = line[0], b = line[1], c = line[2];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as CellSymbol;
    }
  }
  return null;
}

export function isBoardFull(board: (CellSymbol | null)[]): boolean {
  for (var i = 0; i < board.length; i++) {
    if (board[i] === null) return false;
  }
  return true;
}

export function isValidPosition(position: number): boolean {
  return typeof position === "number" && isFinite(position) && position >= 0 && position <= 8;
}

export function decodeData(data: ArrayBuffer): any {
  try {
    var arr = new Uint8Array(data);
    var str = "";
    for (var i = 0; i < arr.length; i++) {
      str += String.fromCharCode(arr[i]);
    }
    return JSON.parse(str);
  } catch (_) {
    return null;
  }
}

export function getOtherPlayerId(state: MatchState, userId: string): string | null {
  for (var i = 0; i < state.playerOrder.length; i++) {
    if (state.playerOrder[i] !== userId) return state.playerOrder[i];
  }
  return null;
}

export function buildGameStatePayload(state: MatchState): GameStatePayload {
  var timeLeft = 0;
  if (state.timed && state.turnDeadline > 0) {
    timeLeft = Math.max(0, Math.ceil((state.turnDeadline - Date.now()) / 1000));
  }

  var players: { [userId: string]: { username: string; symbol: CellSymbol } } = {};
  var ids = Object.keys(state.players);
  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    players[id] = { username: state.players[id].username, symbol: state.players[id].symbol };
  }

  return {
    board: state.board,
    players: players,
    currentTurn: state.currentTurn,
    phase: state.phase,
    timed: state.timed,
    timeLeft: timeLeft,
  };
}

export function buildGameOverPayload(state: MatchState, reason: GameOverPayload["reason"]): GameOverPayload {
  return { winner: state.winner, winnerId: state.winnerId, reason: reason, board: state.board };
}

export function broadcastState(dispatcher: nkruntime.MatchDispatcher, state: MatchState): void {
  dispatcher.broadcastMessage(OpCode.GAME_STATE, JSON.stringify(buildGameStatePayload(state)), null, null, true);
}

export function broadcastGameOver(dispatcher: nkruntime.MatchDispatcher, state: MatchState, reason: GameOverPayload["reason"]): void {
  dispatcher.broadcastMessage(OpCode.GAME_OVER, JSON.stringify(buildGameOverPayload(state, reason)), null, null, true);
}
