import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useNakama } from "@/context/NakamaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const { login } = useNakama();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    setError(null);
    setLoading(true);

    try {
      await login(username.trim());
      navigate("/lobby");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Lila</h1>
          <p className="text-muted-foreground mt-2">Multiplayer Tic-Tac-Toe</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Pick a username</CardTitle>
            <CardDescription>This is how other players will see you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="username"
                placeholder="e.g. stormbreaker"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                autoFocus
                disabled={loading}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" disabled={loading || !username.trim()}>
                {loading ? "Connecting…" : "Play"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
