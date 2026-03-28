export const NAKAMA_HOST = import.meta.env.VITE_NAKAMA_HOST ?? "localhost";
export const NAKAMA_PORT = import.meta.env.VITE_NAKAMA_PORT ?? "7350";
export const NAKAMA_USE_SSL = import.meta.env.VITE_NAKAMA_USE_SSL === "true";
export const NAKAMA_SERVER_KEY = import.meta.env.VITE_NAKAMA_SERVER_KEY ?? "defaultkey";

export const SESSION_STORAGE_KEY = "nakama_session_token";
export const USERNAME_STORAGE_KEY = "nakama_username";

export const MATCH_HANDLER_NAME = "tictactoe";
export const TURN_DURATION_SECONDS = 30;
