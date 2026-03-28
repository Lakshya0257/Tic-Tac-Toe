import { Button } from "@/components/ui/button";
import { GameOverPayload, PlayerInfo } from "@/types/game";

interface ResultOverlayProps {
  gameOver: GameOverPayload;
  players: Record<string, PlayerInfo>;
  currentUserId: string | null;
  onPlayAgain: () => void;
  onLobby: () => void;
}

export function ResultOverlay({
  gameOver,
  players,
  currentUserId,
  onPlayAgain,
  onLobby,
}: ResultOverlayProps) {
  const isDraw = gameOver.winner === "draw";
  const iWon = !isDraw && gameOver.winnerId === currentUserId;

  let title = "It's a Draw!";
  let subtitle = "Well played by both sides.";

  if (!isDraw) {
    const winnerName = gameOver.winnerId
      ? players[gameOver.winnerId]?.username
      : "Unknown";
    if (iWon) {
      title = "You Won! 🎉";
      subtitle = "Outstanding move!";
    } else if (gameOver.reason === "disconnect") {
      title = "Opponent Disconnected";
      subtitle = `${winnerName} wins by forfeit.`;
    } else if (gameOver.reason === "forfeit") {
      title = iWon ? "You Won!" : "You Ran Out of Time";
      subtitle = iWon ? "Opponent ran out of time." : "The turn timer expired.";
    } else {
      title = "You Lost";
      subtitle = `${winnerName} had the better strategy.`;
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl z-10 animate-fade-in">
      <div className="flex flex-col items-center gap-6 p-8 text-center">
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onLobby}>Back to Lobby</Button>
          {/* <Button variant="outline" onClick={onLobby}>
            Back to Lobby
          </Button> */}
        </div>
      </div>
    </div>
  );
}
