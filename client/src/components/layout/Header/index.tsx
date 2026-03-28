import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNakama } from "@/context/NakamaContext";
import { Trophy, LogOut } from "lucide-react";

export function Header() {
  const { currentUsername, logout } = useNakama();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => navigate("/lobby")}
          className="text-lg font-bold tracking-tight hover:text-primary transition-colors"
        >
          Lila
        </button>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/leaderboard")}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm text-muted-foreground">{currentUsername}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
