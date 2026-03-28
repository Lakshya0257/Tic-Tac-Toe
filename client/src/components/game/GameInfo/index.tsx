import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CellSymbol, PlayerInfo } from "@/types/game";

interface GameInfoProps {
  players: Record<string, PlayerInfo>;
  currentTurn: string;
  currentUserId: string | null;
  phase: string;
}

export function GameInfo({ players, currentTurn, currentUserId, phase }: GameInfoProps) {
  const playerList = Object.entries(players);

  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto gap-4">
      {playerList.map(([userId, info]) => {
        const isActive = phase === "playing" && currentTurn === userId;
        const isMe = userId === currentUserId;

        return (
          <div
            key={userId}
            className={`flex flex-col items-center gap-2 flex-1 rounded-xl p-3 border transition-colors ${
              isActive ? "border-primary bg-primary/5" : "border-border bg-card"
            }`}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className={info.symbol === "X" ? "text-primary" : "text-destructive"}>
                {info.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate max-w-[80px]">
              {info.username} {isMe && <span className="text-muted-foreground">(you)</span>}
            </span>
            <Badge variant={info.symbol === "X" ? "default" : "destructive"}>
              {info.symbol}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
