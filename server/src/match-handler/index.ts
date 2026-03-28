import { CellSymbol, GamePhase, MatchState, MovePayload, OpCode, PlayerInfo } from "../types";
import {
  broadcastGameOver,
  broadcastState,
  checkWinner,
  decodeData,
  getOtherPlayerId,
  isBoardFull,
  isValidPosition,
} from "../utils";
import { recordMatchResult } from "../leaderboard";

const TICK_RATE = 1;
const DEFAULT_TURN_DURATION = 30;

function createEmptyBoard(): (CellSymbol | null)[] {
  return [null, null, null, null, null, null, null, null, null];
}

function finishGame(
  nk: nkruntime.Nakama,
  logger: nkruntime.Logger,
  dispatcher: nkruntime.MatchDispatcher,
  state: MatchState,
  reason: "normal" | "forfeit" | "disconnect"
): void {
  state.phase = "finished";
  try {
    recordMatchResult(nk, logger, state);
  } catch (e: any) {
    logger.error("Failed to record match result: %s", e.message);
  }
  broadcastGameOver(dispatcher, state, reason);
}

export const matchInit: nkruntime.MatchInitFunction = function (_ctx, _logger, _nk, params) {
  var isTimed = params["timed"] === "true";
  var turnDuration = parseInt(params["turnDuration"] || String(DEFAULT_TURN_DURATION), 10);

  var state: MatchState = {
    board: createEmptyBoard(),
    players: {},
    presences: {},
    playerOrder: [],
    currentTurn: "",
    phase: "waiting" as GamePhase,
    winner: null,
    winnerId: null,
    timed: isTimed,
    turnDuration: turnDuration,
    turnDeadline: 0,
  };

  var label = JSON.stringify({ mode: isTimed ? "timed" : "classic", phase: "waiting" });
  return { state: state, tickRate: TICK_RATE, label: label };
};

export const matchJoinAttempt: nkruntime.MatchJoinAttemptFunction = function (_ctx, _logger, _nk, _dispatcher, _tick, state, presence, _metadata) {
  var ms = state as MatchState;

  if (ms.phase === "finished") return { state: state, accept: false, rejectMessage: "match has ended" };
  if (Object.keys(ms.presences).length >= 2) return { state: state, accept: false, rejectMessage: "match is full" };
  if (ms.presences[presence.userId]) return { state: state, accept: false, rejectMessage: "already in match" };

  return { state: state, accept: true };
};

export const matchJoin: nkruntime.MatchJoinFunction = function (_ctx, logger, _nk, dispatcher, _tick, state, presences) {
  var ms = state as MatchState;

  for (var i = 0; i < presences.length; i++) {
    var presence = presences[i];
    ms.presences[presence.userId] = presence;

    var symbol: CellSymbol = ms.playerOrder.length === 0 ? "X" : "O";
    var player: PlayerInfo = { userId: presence.userId, username: presence.username, symbol: symbol };
    ms.players[presence.userId] = player;
    ms.playerOrder.push(presence.userId);

    logger.info("Player joined: %s as %s", presence.username, symbol);
  }

  if (Object.keys(ms.presences).length === 2) {
    ms.phase = "playing";
    ms.currentTurn = ms.playerOrder[0];
    if (ms.timed) ms.turnDeadline = Date.now() + ms.turnDuration * 1000;
    logger.info("Match started — timed: %s", String(ms.timed));
    broadcastState(dispatcher, ms);
  }

  return { state: ms };
};

export const matchLeave: nkruntime.MatchLeaveFunction = function (_ctx, logger, nk, dispatcher, _tick, state, presences) {
  var ms = state as MatchState;

  for (var i = 0; i < presences.length; i++) {
    delete ms.presences[presences[i].userId];
    logger.info("Player left: %s", presences[i].username);
  }

  if (ms.phase === "playing") {
    var remainingIds = Object.keys(ms.presences);
    if (remainingIds.length === 1) {
      var winnerId = remainingIds[0];
      ms.winner = ms.players[winnerId] ? ms.players[winnerId].symbol : null;
      ms.winnerId = winnerId;
      finishGame(nk, logger, dispatcher, ms, "disconnect");
    } else {
      ms.phase = "finished";
    }
  }

  if (Object.keys(ms.presences).length === 0) return null;
  return { state: ms };
};

export const matchLoop: nkruntime.MatchLoopFunction = function (_ctx, logger, nk, dispatcher, _tick, state, messages) {
  var ms = state as MatchState;

  if (ms.phase !== "playing") return { state: ms };

  if (ms.timed && ms.turnDeadline > 0 && Date.now() > ms.turnDeadline) {
    var forfeitedId = ms.currentTurn;
    var nextId = getOtherPlayerId(ms, forfeitedId);
    if (nextId) {
      ms.winner = ms.players[nextId].symbol;
      ms.winnerId = nextId;
    }
    logger.info("Turn timeout. %s forfeits.", ms.players[forfeitedId]?.username);
    finishGame(nk, logger, dispatcher, ms, "forfeit");
    return { state: ms };
  }

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    if (message.opCode !== OpCode.MOVE) continue;

    var senderId = message.sender.userId;
    if (senderId !== ms.currentTurn) {
      logger.warn("Out-of-turn move rejected from %s", message.sender.username);
      continue;
    }

    var payload = decodeData(message.data as ArrayBuffer) as MovePayload;
    if (!payload || !isValidPosition(payload.position)) {
      logger.warn("Invalid move payload from %s", message.sender.username);
      continue;
    }

    if (ms.board[payload.position] !== null) {
      logger.warn("Cell %d already occupied, move rejected", payload.position);
      continue;
    }

    ms.board[payload.position] = ms.players[senderId].symbol;

    var winner = checkWinner(ms.board);
    if (winner) {
      ms.winner = winner;
      ms.winnerId = senderId;
      finishGame(nk, logger, dispatcher, ms, "normal");
      return { state: ms };
    }

    if (isBoardFull(ms.board)) {
      ms.winner = "draw";
      ms.winnerId = null;
      finishGame(nk, logger, dispatcher, ms, "normal");
      return { state: ms };
    }

    var otherId = getOtherPlayerId(ms, senderId);
    if (otherId) ms.currentTurn = otherId;
    if (ms.timed) ms.turnDeadline = Date.now() + ms.turnDuration * 1000;
  }

  broadcastState(dispatcher, ms);
  return { state: ms };
};

export const matchTerminate: nkruntime.MatchTerminateFunction = function (_ctx, logger, _nk, dispatcher, _tick, state, _graceSeconds) {
  var ms = state as MatchState;
  logger.info("Match terminating.");
  if (ms.phase === "playing") {
    ms.phase = "finished";
    broadcastGameOver(dispatcher, ms, "disconnect");
  }
  return null;
};

export const matchSignal: nkruntime.MatchSignalFunction = function (_ctx, _logger, _nk, _dispatcher, _tick, state, _data) {
  return { state: state };
};
