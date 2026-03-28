import { Navigate, Route, Routes } from "react-router-dom";
import { useNakama } from "@/context/NakamaContext";
import { Header } from "@/components/layout/Header";
import { LoginPage } from "@/pages/login";
import { LobbyPage } from "@/pages/lobby";
import { GamePage } from "@/pages/game/[matchId]";
import { LeaderboardPage } from "@/pages/leaderboard";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useNakama();
  if (!session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  const { session } = useNakama();

  return (
    <div className="flex flex-col min-h-dvh">
      {session && <Header />}
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/lobby" replace /> : <LoginPage />}
        />
        <Route
          path="/lobby"
          element={
            <ProtectedRoute>
              <LobbyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:matchId"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <LeaderboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
