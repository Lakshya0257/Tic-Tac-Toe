import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMatch } from "@/hooks/useMatch";
import { useNakama } from "@/context/NakamaContext";
import { Board } from "@/components/board/Board";
import { GameInfo } from "@/components/game/GameInfo";
import { TimerRing } from "@/components/game/TimerRing";
import { ResultOverlay } from "@/components/game/ResultOverlay";
import { TURN_DURATION_SECONDS } from "@/lib/constants";

export function GamePage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUserId } = useNakama();
  const matchToken =
    (location.state as { matchToken?: string } | null)?.matchToken ?? null;

  const { matchState, mySymbol, isMyTurn, sendMove, joinError } = useMatch(
    matchId ?? null,
    matchToken,
  );

  const { board, players, currentTurn, phase, timed, timeLeft, gameOver } =
    matchState;
  const hasPlayers = Object.keys(players).length === 2;

  if (joinError) {
    return (
      <div className="flex flex-1 items-center justify-center flex-col gap-4 text-center px-4">
        <p className="text-destructive font-medium">{joinError}</p>
        <button
          className="text-sm text-muted-foreground underline"
          onClick={() => navigate("/lobby")}
        >
          Back to lobby
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 gap-6 animate-fade-in">
      {!hasPlayers || phase === "waiting" ? (
        <p className="text-muted-foreground animate-pulse">
          Waiting for opponent…
        </p>
      ) : (
        <>
          <GameInfo
            players={players}
            currentTurn={currentTurn}
            currentUserId={currentUserId}
            phase={phase}
          />

          {timed && phase === "playing" && (
            <TimerRing
              timeLeft={timeLeft}
              total={TURN_DURATION_SECONDS}
              isMyTurn={isMyTurn}
            />
          )}

          {phase === "playing" && (
            <p className="text-sm text-muted-foreground">
              {isMyTurn ? `Your turn (${mySymbol})` : "Opponent's turn…"}
            </p>
          )}

          <div className="relative w-full max-w-sm">
            <Board
              board={board}
              onCellClick={sendMove}
              disabled={!isMyTurn || phase !== "playing"}
            />
            {gameOver && (
              <ResultOverlay
                gameOver={gameOver}
                players={players}
                currentUserId={currentUserId}
                onPlayAgain={() => navigate("/lobby")}
                onLobby={() => navigate("/lobby")}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
