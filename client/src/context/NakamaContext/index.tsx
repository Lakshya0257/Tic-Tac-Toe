import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import { getNakamaClient } from "@/lib/nakama";
import { SESSION_STORAGE_KEY, USERNAME_STORAGE_KEY } from "@/lib/constants";

interface NakamaContextValue {
  client: Client;
  session: Session | null;
  socket: Socket | null;
  currentUserId: string | null;
  currentUsername: string | null;
  isConnected: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const NakamaContext = createContext<NakamaContextValue | null>(null);

export function NakamaProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => getNakamaClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(
    async (sess: Session): Promise<Socket> => {
      if (socketRef.current) {
        socketRef.current.disconnect(false);
      }
      const sock = client.createSocket(false, false);
      socketRef.current = sock;
      sock.ondisconnect = () => setIsConnected(false);
      await sock.connect(sess, true);
      setIsConnected(true);
      setSocket(sock);
      return sock;
    },
    [client]
  );

  useEffect(() => {
    const token = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!token) return;

    const restored = Session.restore(token, "");
    if (!restored || restored.isexpired(Date.now() / 1000)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(USERNAME_STORAGE_KEY);
      return;
    }

    setSession(restored);
    connectSocket(restored).catch(() => {
      setSession(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    });
  }, [connectSocket]);

  const login = useCallback(
    async (username: string) => {
      const trimmed = username.trim();
      if (!trimmed) throw new Error("Username is required");
      const sess = await client.authenticateCustom(trimmed, true, trimmed);
      localStorage.setItem(SESSION_STORAGE_KEY, sess.token);
      localStorage.setItem(USERNAME_STORAGE_KEY, trimmed);
      setSession(sess);
      await connectSocket(sess);
    },
    [client, connectSocket]
  );

  const logout = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect(false);
      socketRef.current = null;
    }
    setSession(null);
    setSocket(null);
    setIsConnected(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(USERNAME_STORAGE_KEY);
  }, []);

  const value: NakamaContextValue = {
    client,
    session,
    socket,
    currentUserId: session?.user_id ?? null,
    currentUsername: session?.username ?? localStorage.getItem(USERNAME_STORAGE_KEY),
    isConnected,
    login,
    logout,
  };

  return <NakamaContext.Provider value={value}>{children}</NakamaContext.Provider>;
}

export function useNakama(): NakamaContextValue {
  const ctx = useContext(NakamaContext);
  if (!ctx) throw new Error("useNakama must be used inside NakamaProvider");
  return ctx;
}
