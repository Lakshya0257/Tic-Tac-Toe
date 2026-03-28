import { useCallback, useEffect, useRef, useState } from "react";
import { useNakama } from "@/context/NakamaContext";
import {
  CellSymbol,
  GameOverPayload,
  GamePhase,
  GameStatePayload,
  OpCode,
  PlayerInfo,
} from "@/types/game";

interface MatchState {
  board: (CellSymbol | null)[];
  players: Record<string, PlayerInfo>;
  currentTurn: string;
  phase: GamePhase;
  timed: boolean;
  timeLeft: number;
  gameOver: GameOverPayload | null;
}

const INITIAL_STATE: MatchState = {
  board: Array(9).fill(null),
  players: {},
  currentTurn: "",
  phase: "waiting",
  timed: false,
  timeLeft: 0,
  gameOver: null,
};

export function useMatch(matchId: string | null) {
  const { socket, currentUserId } = useNakama();
  const [matchState, setMatchState] = useState<MatchState>(INITIAL_STATE);
  const [joinError, setJoinError] = useState<string | null>(null);
  const matchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socket || !matchId) return;

    matchIdRef.current = matchId;
    setMatchState(INITIAL_STATE);
    setJoinError(null);

    socket.onmatchdata = (data) => {
      if (data.match_id !== matchId) return;

      let payload: unknown;
      try {
        const raw = new TextDecoder().decode(data.data as unknown as ArrayBuffer);
        payload = JSON.parse(raw);
      } catch {
        return;
      }

      if (data.op_code === OpCode.GAME_STATE) {
        const gs = payload as GameStatePayload;
        setMatchState((prev) => ({
          ...prev,
          board: gs.board,
          players: gs.players,
          currentTurn: gs.currentTurn,
          phase: gs.phase,
          timed: gs.timed,
          timeLeft: gs.timeLeft,
        }));
      } else if (data.op_code === OpCode.GAME_OVER) {
        const go = payload as GameOverPayload;
        setMatchState((prev) => ({
          ...prev,
          board: go.board,
          phase: "finished",
          gameOver: go,
        }));
      } else if (data.op_code === OpCode.PLAYER_LEFT) {
        setMatchState((prev) => ({
          ...prev,
          phase: "finished",
          gameOver: {
            winner: null,
            winnerId: null,
            reason: "disconnect",
            board: prev.board,
          },
        }));
      }
    };

    socket.joinMatch(matchId).catch((err) => {
      setJoinError(err instanceof Error ? err.message : "Failed to join match");
    });

    return () => {
      socket.onmatchdata = () => {};
      if (matchIdRef.current) {
        socket.leaveMatch(matchIdRef.current).catch(() => {});
        matchIdRef.current = null;
      }
    };
  }, [socket, matchId]);

  const sendMove = useCallback(
    async (position: number) => {
      if (!socket || !matchId) return;
      if (matchState.phase !== "playing") return;
      if (matchState.currentTurn !== currentUserId) return;
      if (matchState.board[position] !== null) return;
      await socket.sendMatchState(matchId, OpCode.MOVE, JSON.stringify({ position }));
    },
    [socket, matchId, matchState, currentUserId]
  );

  const mySymbol =
    currentUserId && matchState.players[currentUserId]
      ? matchState.players[currentUserId].symbol
      : null;

  const isMyTurn =
    matchState.phase === "playing" && matchState.currentTurn === currentUserId;

  return { matchState, mySymbol, isMyTurn, sendMove, joinError };
}
