# Lila — Multiplayer Tic-Tac-Toe

Live game: **http://13.234.186.210**
Nakama server: **http://13.234.186.210:7350**
Nakama console: **http://13.234.186.210:7351** (admin / password)

---

## Stack

- **Nakama 3.37** — game server (matchmaking, authoritative match logic, leaderboard)
- **PostgreSQL 16** — Nakama's database
- **React + Vite + shadcn/ui** — frontend
- **Docker + PM2** — deployed on AWS EC2 (Amazon Linux 2023)

---

## Features

- Pick a username and get matched with another player automatically
- Two modes: Classic (no timer) and Timed (30s per turn, auto-forfeit on timeout)
- All move validation runs server-side — clients can't cheat
- Global leaderboard tracking wins, losses, draws, and current win streak

---

## Screenshots

<img width="2940" height="1592" alt="image" src="https://github.com/user-attachments/assets/ee544d4f-6a02-492a-8d83-4fb8035f46a9" />
<img width="2940" height="1602" alt="image" src="https://github.com/user-attachments/assets/6731634d-bd98-4b49-83dd-a4bbb0a5fd04" />


## Architecture

```
Browser
  │
  ├── HTTP :80   → PM2 (serves React build)
  └── WS   :7350 → Nakama (game server)
                       └── PostgreSQL :5432 (internal)
```

The client talks to Nakama directly over WebSocket for real-time match events. There's no separate API server — Nakama handles auth, matchmaking, match state, and the leaderboard RPC.

**Why server-authoritative?**
The server owns the game state. Clients send moves; the server validates and broadcasts the updated board to both players. With a relay model (clients trust each other) cheating is trivial.

**Match flow:**
1. Client enters the matchmaker with a `game_mode` property
2. When two players with matching mode are found, `matchmakerMatched` fires and creates a server-side match
3. Both clients join via a signed token
4. Match loop runs at 1 tick/sec — processes moves, checks win conditions, broadcasts state
5. On game over, results are written to the leaderboard

---

## Local Setup

**Requirements:** Docker, Node.js 20+

```bash
git clone https://github.com/Lakshya0257/Tic-Tac-Toe.git
cd Tic-Tac-Toe

# Start Nakama + Postgres
docker-compose up -d

# Build server runtime
cd server && npm install && npm run build

# Start client
cd ../client && npm install && npm run dev
```

Client runs at `http://localhost:5173`. Nakama console at `http://localhost:7351` (admin / password).

---

## Server Configuration

Config: `server/data/local.yml`

```yaml
runtime:
  path: "/nakama/data/modules"
  js_entrypoint: "index.js"
console:
  username: "admin"
  password: "password"
  port: 7351
socket:
  port: 7350
```

The server module is compiled from TypeScript (`server/src/`) into a single JS bundle (`server/build/index.js`) via Rollup. Nakama loads this bundle as its JavaScript runtime.

Nakama 3.37 requires all registered handler functions to be declared at the global scope in the bundle. The `rollup.config.mjs` footer declares them as top-level `function` statements so Nakama's AST check passes.

**Client env vars (baked in at build time):**

| Variable | Default | Description |
|---|---|---|
| `VITE_NAKAMA_HOST` | `localhost` | Nakama server IP or domain |
| `VITE_NAKAMA_PORT` | `7350` | Nakama port |
| `VITE_NAKAMA_USE_SSL` | `false` | Set `true` if behind HTTPS |
| `VITE_NAKAMA_SERVER_KEY` | `defaultkey` | Must match Nakama's server key |

---

## Deployment

**EC2 Security Group inbound rules needed:**

| Port | Source | Purpose |
|---|---|---|
| 22 | Your IP | SSH |
| 80 | 0.0.0.0/0 | Game frontend |
| 7350 | 0.0.0.0/0 | Nakama API + WebSocket |
| 7351 | Your IP | Nakama console |

**Deploy steps:**

```bash
# 1. Bootstrap EC2 once (installs Docker, Node.js, git)
bash deploy/setup-ec2.sh
newgrp docker

# 2. Clone and run
git clone https://github.com/Lakshya0257/Tic-Tac-Toe.git
cd Tic-Tac-Toe
bash deploy/deploy.sh
```

`deploy.sh` handles everything: adds swap (needed on small instances), detects the public IP, generates passwords, builds server + client with the correct env vars, starts Postgres + Nakama in Docker, and serves the frontend on port 80 via PM2.

**After any code change:**
```bash
cd ~/Tic-Tac-Toe && git pull && bash deploy/deploy.sh
```

---

## Testing Multiplayer

1. Open **http://13.234.186.210** in two separate browser windows (or two different devices)
2. Enter a username on each (min 6 characters) and click Play
3. Select the same game mode on both — Classic or Timed
4. Both browsers get matched and the game starts
5. Make moves, finish the game, check the leaderboard

To test Timed mode: queue up, then just don't move — the turn timer should count down and auto-forfeit when it hits 0.

---

## Project Structure

```
server/
  src/
    match-handler/   # matchInit, matchJoin, matchLoop, etc.
    matchmaker/      # creates match when two players are paired
    leaderboard/     # stats tracking and leaderboard RPC
  rollup.config.mjs  # bundles TS into single JS for Nakama

client/
  src/
    pages/           # Login, Lobby, Game, Leaderboard
    hooks/           # useMatch, useMatchmaker
    components/      # Board, GameInfo, TimerRing, ResultOverlay
    context/         # NakamaContext (auth + socket)

deploy/
  setup-ec2.sh            # one-time EC2 bootstrap
  deploy.sh               # full build + deploy
  docker-compose.prod.yml # Nakama + Postgres containers
