import { useEffect, useState } from "react";
import { useNakama } from "@/context/NakamaContext";
import { LeaderboardEntry } from "@/types/game";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Flame } from "lucide-react";

export function LeaderboardPage() {
  const { client, session } = useNakama();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    client
      .rpc(session, "get_leaderboard", {})
      .then((res) => {
        const data = res.payload as { records: LeaderboardEntry[] };
        setEntries(data?.records ?? []);
      })
      .catch((err: Error) => {
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard",
        );
      })
      .finally(() => setLoading(false));
  }, [client, session]);

  console.log(entries);

  return (
    <div className="flex flex-1 flex-col max-w-2xl mx-auto px-4 py-8 gap-6 animate-fade-in w-full">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top 20 players by total wins.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}

      {!loading && !error && entries.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No games played yet. Be the first!
        </p>
      )}

      {!loading && entries.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">W</TableHead>
                <TableHead className="text-right">L</TableHead>
                <TableHead className="text-right">D</TableHead>
                <TableHead className="text-right">Streak</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.userId}>
                  <TableCell className="font-mono text-muted-foreground">
                    {entry.rank <= 3 ? (
                      <span>{["🥇", "🥈", "🥉"][entry.rank - 1]}</span>
                    ) : (
                      entry.rank
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {entry.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {entry.wins}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {entry.losses}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {entry.draws}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="gap-1">
                      <Flame className="h-3 w-3" />
                      {entry.bestStreak}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
