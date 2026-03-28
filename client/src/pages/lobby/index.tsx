import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMatchmaker } from "@/hooks/useMatchmaker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Clock, Hash } from "lucide-react";
import { GameMode } from "@/types/game";

export function LobbyPage() {
  const navigate = useNavigate();
  const { status, matchId, matchToken, error, startSearch, cancelSearch, reset } =
    useMatchmaker();

  useEffect(() => {
    if (status === "matched" && matchId) {
      navigate(`/game/${matchId}`, { state: { matchToken } });
    }
  }, [status, matchId, matchToken, navigate]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  function handleStart(mode: GameMode) {
    startSearch(mode);
  }

  const isSearching = status === "searching";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Find a Match</h1>
          <p className="text-muted-foreground mt-1">
            Choose your game mode to get started.
          </p>
        </div>

        {isSearching ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-medium">Searching for an opponent…</p>
              <Button variant="outline" size="sm" onClick={cancelSearch}>
                Cancel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleStart("classic")}
            >
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Hash className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Classic</CardTitle>
                  <CardDescription>
                    No time limit. Take your time.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleStart("timed")}
            >
              <CardHeader className="flex-row items-center gap-4">
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle>Timed</CardTitle>
                  <CardDescription>
                    30 seconds per turn. Don't hesitate.
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
