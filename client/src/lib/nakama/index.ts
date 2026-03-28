import { Client } from "@heroiclabs/nakama-js";
import {
  NAKAMA_HOST,
  NAKAMA_PORT,
  NAKAMA_SERVER_KEY,
  NAKAMA_USE_SSL,
} from "../constants/index";

let _client: Client | null = null;

export function getNakamaClient(): Client {
  if (!_client) {
    _client = new Client(NAKAMA_SERVER_KEY, NAKAMA_HOST, NAKAMA_PORT, NAKAMA_USE_SSL);
  }
  return _client;
}
