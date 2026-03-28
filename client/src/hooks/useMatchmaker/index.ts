import { useCallback, useEffect, useRef, useState } from "react";
import { useNakama } from "@/context/NakamaContext";
import { GameMode } from "@/types/game";

interface MatchmakerState {
  status: "idle" | "searching" | "matched" | "error";
  ticket: string | null;
  matchId: string | null;
  matchToken: string | null;
  error: string | null;
}

export function useMatchmaker() {
  const { socket } = useNakama();
  const [state, setState] = useState<MatchmakerState>({
    status: "idle",
    ticket: null,
    matchId: null,
    matchToken: null,
    error: null,
  });
  const ticketRef = useRef<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.onmatchmakermatched = (matched) => {
      ticketRef.current = null;

      // Nakama 3.22+ server-authoritative matches arrive with a signed JWT
      // token (not a plain match_id). Decode the payload to get "mid".
      let matchId = matched.match_id ?? null;
      if (!matchId && matched.token) {
        try {
          const payload = JSON.parse(atob(matched.token.split(".")[1]));
          matchId = payload.mid ?? null;
        } catch {}
      }

      setState({ status: "matched", ticket: null, matchId, matchToken: matched.token ?? null, error: null });
    };

    return () => {
      socket.onmatchmakermatched = () => {};
    };
  }, [socket]);

  const startSearch = useCallback(
    async (mode: GameMode) => {
      if (!socket) return;
      setState({ status: "searching", ticket: null, matchId: null, matchToken: null, error: null });
      try {
        const query = `+properties.game_mode:${mode}`;
        const result = await socket.addMatchmaker(query, 2, 2, { game_mode: mode }, {});
        ticketRef.current = result.ticket;
        setState((prev) => ({ ...prev, ticket: result.ticket }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to join matchmaker";
        setState({ status: "error", ticket: null, matchId: null, matchToken: null, error: msg });
      }
    },
    [socket]
  );

  const cancelSearch = useCallback(async () => {
    if (!socket || !ticketRef.current) return;
    try {
      await socket.removeMatchmaker(ticketRef.current);
    } catch (_) {}
    finally {
      ticketRef.current = null;
      setState({ status: "idle", ticket: null, matchId: null, matchToken: null, error: null });
    }
  }, [socket]);

  const reset = useCallback(() => {
    ticketRef.current = null;
    setState({ status: "idle", ticket: null, matchId: null, matchToken: null, error: null });
  }, []);

  return { ...state, startSearch, cancelSearch, reset };
}
