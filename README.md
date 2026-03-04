# 🤖 AI Agent Wallet — Autonomous DeFi Wallet for Solana

> A fully autonomous AI agent wallet built on Solana Devnet, capable of creating wallets, signing transactions, managing SOL/SPL tokens, and interacting with DeFi protocols — all without human intervention.

---

## 📌 Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Agent Decision Logic](#agent-decision-logic)
- [Security Considerations](#security-considerations)
- [Live Demo](#live-demo)
- [Team](#team)

---

## 🧠 Overview

AI agents on Solana are becoming autonomous participants in the DeFi ecosystem. For these agents to act independently — executing trades, managing liquidity, or interacting with dApps — they need wallets they fully control.

This project implements a **prototype AI agent wallet** that demonstrates autonomous transaction capabilities in a sandboxed Solana Devnet environment. The agent:

- Creates and manages its own wallets programmatically
- Signs and sends transactions without any human input
- Makes real-time decisions based on its balance state
- Exposes a full REST API for external integrations
- Provides a live dashboard to observe all agent actions in real time

---

## ⚙️ How It Works

The system has three main layers:

### 1. Wallet Layer
The `WalletManager` class handles all low-level Solana operations:
- Generating new keypairs
- Storing wallet data securely as JSON files
- Checking SOL balances via RPC
- Sending SOL between wallets
- Requesting devnet airdrops

### 2. Agent Layer
The `AIAgent` class is the brain of the system:
- Initializes with its own wallet on startup
- Runs an autonomous decision loop every N seconds
- Evaluates current balance and decides what action to take
- Logs every action with timestamps and transaction signatures

### 3. API + Dashboard Layer
- Express.js REST API exposes all agent capabilities as HTTP endpoints
- React frontend dashboard shows live wallet state, balance, and full action history
- Dashboard auto-refreshes every 10 seconds

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔑 Wallet Creation | Programmatically generate Solana wallets |
| ✍️ Auto Transaction Signing | Sign and broadcast transactions autonomously |
| 💰 SOL Management | Hold, send, and receive SOL |
| 🧠 AI Decision Engine | Rule-based agent with autonomous logic |
| 🔄 Autonomous Loop | Continuously runs and acts every 30 seconds |
| 📝 Action History | Full log of every decision and transaction |
| 🌐 REST API | 10 endpoints for full programmatic control |
| 📊 Live Dashboard | Real-time React UI to observe the agent |
| 👛 Multi-Wallet Support | Agent can spawn and manage sub-wallets |
| 🔒 Key Security | Private keys never exposed via API |

---

## 🏗️ Architecture
```
Solana-AI-Agent-Wallet/
│
├── src/
│   ├── wallet/
│   │   └── walletManager.ts     # Core Solana wallet operations
│   ├── agent/
│   │   └── agent.ts             # AI decision engine + autonomous loop
│   ├── api/
│   │   └── server.ts            # Express REST API server
│   └── index.ts                 # Main entry point + demo runner
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main dashboard component
│   │   └── main.jsx             # React entry point
│   ├── index.html
│   └── vite.config.js
│
├── wallets/                     # Auto-generated wallet JSON files
├── .env                         # Environment config
├── tsconfig.json                # TypeScript config
├── package.json
├── SKILLS.md
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v20 + TypeScript |
| Blockchain | @solana/web3.js v1.98 |
| Backend | Express.js v5 |
| Frontend | React 18 + Vite 5 |
| Token Support | @solana/spl-token |
| Key Encoding | bs58 |
| Network | Solana Devnet |
| Version Control | Git + GitHub |

---

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js v20 or higher
- npm v9 or higher
- Git
- A Solana devnet wallet with SOL (get free SOL at faucet.solana.com)

---

## 🔧 Installation

**1. Clone the repository:**
```bash
git clone https://github.com/John-04/Solana-AI-Agent-Wallet.git
cd Solana-AI-Agent-Wallet
```

**2. Install backend dependencies:**
```bash
npm install
```

**3. Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

**4. Create environment file:**
```bash
cp .env.example .env
```

---

## 🚀 Running the Project

### Start the Backend (Terminal 1)
```bash
npm run dev
```

You will see:
```
🚀 Starting AI Agent Wallet System...
📌 STEP 1: Creating agent wallet...
✅ Wallet created: <public-key>
📌 STEP 2: Requesting devnet airdrop...
📌 STEP 3: Checking balance...
📌 STEP 4: Initializing AI Agent...
📌 STEP 5: Agent making autonomous decision...
📌 STEP 6: Action history...
✅ AI Agent Wallet System Demo Complete!
🚀 Server running on http://localhost:3000
```

### Start the Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173**

---

## 🔌 API Documentation

Base URL: `http://localhost:3000`

### Health Check
```
GET /
Response: { "status": "AI Agent Wallet is running", "timestamp": "..." }
```

### Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /agent/wallet | Get agent wallet public key and balance |
| GET | /agent/history | Get full list of all agent actions |
| POST | /agent/act | Manually trigger one autonomous decision |
| POST | /agent/start | Start the autonomous loop |
| POST | /agent/stop | Stop the autonomous loop |

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /wallet/create | Generate a new Solana wallet |
| GET | /wallet/balance/:publicKey | Get SOL balance of any wallet |
| POST | /wallet/send | Send SOL from one wallet to another |
| POST | /wallet/airdrop | Request devnet SOL airdrop |

### Example: Send SOL
```bash
curl -X POST http://localhost:3000/wallet/send \
  -H "Content-Type: application/json" \
  -d '{
    "fromPrivateKey": "YOUR_PRIVATE_KEY",
    "toPublicKey": "DESTINATION_ADDRESS",
    "amount": 0.1
  }'
```

### Example: Check Balance
```bash
curl http://localhost:3000/wallet/balance/YOUR_PUBLIC_KEY
```

---

## 🧠 Agent Decision Logic

The agent evaluates its balance on every cycle and autonomously decides what to do:
```
IF balance < 0.5 SOL
  → Request airdrop from devnet faucet

ELSE IF balance > 1.5 SOL
  → Create a new sub-wallet
  → Send 0.1 SOL to the sub-wallet autonomously

ELSE
  → Monitor and log current state
```

Every action is recorded with:
- Action type (SEND, AIRDROP, CHECK_BALANCE, CREATE_WALLET)
- Full payload (from, to, amount)
- Timestamp
- Transaction signature (verifiable on Solana Explorer)

---

## 🔒 Security Considerations

- **Private key isolation** — Keys are stored in local JSON files, never returned by the API
- **Devnet only** — All transactions happen on Solana Devnet, no real funds at risk
- **Environment variables** — Sensitive config managed via .env file
- **Input validation** — All API endpoints validate inputs before processing
- **Error boundaries** — All async operations wrapped in try/catch to prevent crashes
- **Separation of concerns** — Agent logic is completely decoupled from wallet operations

---

## 🌐 Live Demo
- 🖥️ Frontend Dashboard: https://solana-ai-agent-wallet.vercel.app
- 🔗 API Base URL: https://solana-ai-agent-wallet.onrender.com
- 📁 GitHub: https://github.com/John-04/Solana-AI-Agent-Wallet

---

## 👤 Team

Built for the **DeFi Developer Challenge — Agentic Wallets for AI Agents** bounty on Superteam Nigeria.

- **Developer**: John
- **Network**: Solana Devnet
- **Submission Date**: March 2026

---

## 📄 License

MIT License — see LICENSE file for details.
EOF
