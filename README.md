# 🤖 AI Agent Wallet

> An autonomous DeFi wallet on Solana Devnet — built for AI agents to control programmatically without any human intervention.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://solana-ai-agent-wallet.vercel.app)
[![API](https://img.shields.io/badge/API-Render-blue?style=for-the-badge)](https://solana-ai-agent-wallet.onrender.com)
[![npm](https://img.shields.io/badge/npm-ai--agent--wallet--sdk-red?style=for-the-badge&logo=npm)](https://www.npmjs.com/package/ai-agent-wallet-sdk)
[![GitHub](https://img.shields.io/badge/GitHub-Open%20Source-green?style=for-the-badge&logo=github)](https://github.com/John-04/Solana-AI-Agent-Wallet)

Built for the **Superteam Nigeria DeFi Developer Challenge 2026** — demonstrating that AI agents can be first-class participants in DeFi, not just observers.

---

## 🌐 Live Links

| Resource | URL |
|----------|-----|
| Frontend Dashboard | https://solana-ai-agent-wallet.vercel.app |
| Backend REST API | https://solana-ai-agent-wallet.onrender.com |
| npm SDK Package | https://www.npmjs.com/package/ai-agent-wallet-sdk |
| GitHub Repository | https://github.com/John-04/Solana-AI-Agent-Wallet |

---

## ✅ Verified On-Chain Transactions

These are **real transactions on Solana Devnet** — permanently recorded and verifiable by anyone:

| Description | Transaction Signature |
|-------------|----------------------|
| AI Agent Memo — dApp Interaction | [5DzKFVewijKW...](https://explorer.solana.com/tx/5DzKFVewijKWFjvPcy7zGtAS9a4HkgokHDKxQRTCQj73FX5qfZN9actmHSShQiv3c3bTaJrxYEHQzevt1V6YG7yJ?cluster=devnet) |
| Agent Decision Recording | [2BVAXKrMGXL...](https://explorer.solana.com/tx/2BVAXKrMGXLpBZqAzVVJN3wapRmdd8qLN1iXQZniHb94msTU9YtcNnfwSmuKCx6onuu1FHq3yob6CoBjt8KByrKw?cluster=devnet) |
| LangChain AI Agent Transaction | [2WXDieLCHpe...](https://explorer.solana.com/tx/2WXDieLCHpeSPsdWvUbC2AvzyVWAFyfEKPNs2GpdRjynFwvx93q3QvELbV2ofN6BvecHSbKtumgofgU2d9T3B1h?cluster=devnet) |

All transactions show **Result: SUCCESS**, **Confirmation Status: FINALIZED**, **Confirmations: MAX**.

---

## 🧠 What is an AI Agent Wallet?

Traditional crypto wallets require **human approval** for every transaction. This project builds a wallet that AI agents control autonomously — no human needed.

The agent:
- Creates and manages Solana wallets programmatically
- Signs transactions automatically without human input
- Monitors market conditions and makes DeFi decisions every 20 seconds
- Records every decision permanently on the Solana blockchain
- Manages a portfolio of 3 wallets with autonomous rebalancing
- Can be controlled by any AI framework via a published npm SDK

---

## 🚀 Key Features

### 1. Autonomous Wallet Management
- Programmatic keypair generation using `@solana/web3.js`
- Secure key storage on server side — never exposed to frontend
- SOL transfers between wallets without human input
- Multi-wallet portfolio: Trading (40%), Reserve (40%), Operations (20%)

### 2. DeFi Strategy Engine
- Momentum-based trading strategy with Moving Average crossovers
- Real-time SOL price feed from Jupiter Price API
- BUY/SELL/HOLD signals with confidence percentages
- Runs autonomously every 20 seconds
- Paper trading in sandboxed environment (as required by bounty)

### 3. Real On-Chain dApp Interaction
- Every agent decision written to Solana blockchain via **Memo Program V1**
- Official Solana on-chain program (used by real DeFi protocols)
- Permanent, immutable audit trail of all autonomous decisions
- 3 verified transactions with Solana Explorer links

### 4. AgentWalletSDK — Published npm Package
```bash
npm install ai-agent-wallet-sdk
```
A standalone TypeScript SDK compatible with:
- **LangChain** — use as a tool in LangChain agents
- **AutoGen** — wrap as AutoGen function tool
- **ElizaOS** — plugin for Eliza AI agents
- **Any custom script** — works outside any browser context

### 5. Proven LangChain Integration
A real LangChain AI agent was built and demonstrated:
- Installed the SDK from npm
- Checked wallet balance on Solana devnet
- Analyzed live market conditions
- Executed a BUY decision
- Recorded it permanently on-chain: [verify here](https://explorer.solana.com/tx/2WXDieLCHpeSPsdWvUbC2AvzyVWAFyfEKPNs2GpdRjynFwvx93q3QvELbV2ofN6BvecHSbKtumgofgU2d9T3B1h?cluster=devnet)

### 6. Full REST API
Complete REST API deployed on Render with 15+ endpoints for wallet management, agent control, and DeFi strategy.

---

## 🏗️ Architecture
```
AI Decision Layer          SDK Layer              Wallet Layer         Blockchain
─────────────────    ─────────────────────    ─────────────────    ─────────────
  AIAgent            AgentWalletSDK (npm)      WalletManager        Solana Devnet
  DeFiStrategy   →   executeAgentDecision() →  signTransaction() →  Memo Program
  LangChain          sendMemo()                sendSOL()            On-chain Txns
  AutoGen            getWalletInfo()           createWallet()
```

### Project Structure
```
ai-agent-wallet/
├── src/
│   ├── wallet/
│   │   └── walletManager.ts        # Core Solana wallet operations
│   ├── agent/
│   │   ├── agent.ts                # AI decision engine + portfolio management
│   │   └── defiStrategy.ts         # DeFi momentum strategy engine
│   ├── api/
│   │   └── server.ts               # Express REST API (15+ endpoints)
│   └── index.ts                    # Entry point
├── sdk-package/                    # Published npm SDK
│   ├── src/
│   │   ├── AgentWalletSDK.ts       # Core SDK class
│   │   └── index.ts                # Exports
│   └── package.json                # npm: ai-agent-wallet-sdk
├── frontend/                       # React 18 + Vite dashboard
│   └── src/
│       └── App.jsx                 # 5-tab dashboard UI
├── langchain_agent_demo.py         # LangChain AI agent integration demo
├── wallets/                        # Generated wallet JSON files
├── SKILLS.md                       # Agent skills documentation
└── README.md                       # This file
```

---

## 📦 AgentWalletSDK — API Reference
```typescript
import { AgentWalletSDK } from "ai-agent-wallet-sdk";

// Initialize — works outside any browser context
const sdk = new AgentWalletSDK({
  privateKey: "your-base58-private-key", // optional
  network: "devnet" // or "mainnet"
});
```

| Method | Description | Returns |
|--------|-------------|---------|
| `getWalletInfo()` | Get public key, balance, network | `WalletInfo` |
| `sendSOL(address, amount)` | Transfer SOL to any address | `TransactionResult` |
| `sendMemo(message)` | Write text permanently on-chain | `TransactionResult` |
| `executeAgentDecision(decision)` | Execute + record AI decision on-chain | `TransactionResult` |
| `requestAirdrop(amount)` | Request devnet SOL airdrop | `TransactionResult` |
| `runAutonomousLoop(cycles)` | Run fully autonomous decision loop | `void` |
| `exportWallet()` | Export wallet credentials | `{publicKey, privateKey}` |
| `getActionLog()` | Get full action history | `AgentAction[]` |

### LangChain Example
```python
from langchain_core.tools import Tool

def execute_wallet_action(decision: str) -> str:
    import subprocess
    result = subprocess.run(['node', '-e', f'''
        const {{ AgentWalletSDK }} = require("ai-agent-wallet-sdk");
        const sdk = new AgentWalletSDK({{ network: "devnet" }});
        sdk.executeAgentDecision({{
            action: "{decision}",
            reasoning: "LangChain agent autonomous decision",
            confidence: 85
        }}).then(r => console.log(r.explorerUrl));
    '''], capture_output=True, text=True)
    return result.stdout

wallet_tool = Tool(
    name="SolanaWallet",
    func=execute_wallet_action,
    description="Execute DeFi decisions on Solana blockchain"
)
```

---

## 🔌 REST API Reference

Base URL: `https://solana-ai-agent-wallet.onrender.com`

### Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agent/wallet` | Get agent wallet info and balance |
| GET | `/agent/history` | Get autonomous action history |
| GET | `/agent/portfolio` | Get all portfolio wallets |
| POST | `/agent/act` | Trigger one autonomous action |
| POST | `/agent/start` | Start autonomous loop |
| POST | `/agent/stop` | Stop autonomous loop |

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wallet/create` | Create a new wallet |
| GET | `/wallet/balance/:publicKey` | Get wallet balance |
| POST | `/wallet/send` | Send SOL between wallets |
| POST | `/wallet/airdrop` | Request devnet airdrop |

### DeFi Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/defi/state` | Get strategy engine state |
| GET | `/defi/trades` | Get all trade history |
| GET | `/defi/price` | Get current SOL price |
| POST | `/defi/analyze` | Run market analysis |
| POST | `/defi/swap` | Execute manual trade |
| POST | `/defi/start` | Start strategy loop |
| POST | `/defi/stop` | Stop strategy loop |

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v20+
- npm v9+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/John-04/Solana-AI-Agent-Wallet.git
cd Solana-AI-Agent-Wallet

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env: set PORT=3000, SOLANA_NETWORK=devnet

# Run backend
npm run dev

# In a new terminal, run frontend
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
PORT=3000
SOLANA_NETWORK=devnet
```

### Available Scripts
```bash
npm run dev          # Start backend with ts-node
npm run build        # Compile TypeScript
npm run start        # Run compiled JS
npm run sdk:demo     # Run AgentWalletSDK demo with real on-chain transactions
```

### Run LangChain Demo
```bash
# Install Python dependencies
pip3 install langchain langchain-community --break-system-packages

# Run the LangChain AI agent demo
python3 langchain_agent_demo.py
```

---

## 🔒 Security

- Private keys are stored server-side and never exposed through the API or frontend
- All keys use Ed25519 cryptography via `@solana/web3.js`
- Agent autonomy is bounded: maximum 0.05 SOL per transfer action
- All actions are logged with full audit trail
- Strategy loop can be stopped via API at any time
- HTTPS enforced on all deployed endpoints

**Production considerations** (not implemented for devnet prototype):
- HSM or AWS KMS for key storage
- JWT authentication on API endpoints
- Rate limiting and IP allowlisting
- Multi-signature for large transfers

---

## 📊 Bounty Requirements

| Requirement | Status |
|-------------|--------|
| Create wallet programmatically | ✅ |
| Sign transactions automatically | ✅ |
| Hold SOL tokens | ✅ 5 SOL on devnet |
| Interact with test dApp/protocol | ✅ Solana Memo Program — 3 verified txns |
| Deep dive document (video or written) | ✅ |
| Open-source code with README | ✅ |
| SKILLS.md file | ✅ |
| Working prototype on devnet | ✅ Live 24/7 |
| Safe key management | ✅ Server-side only |
| Multiple agents independently | ✅ 4 wallets managed |
| External AI agent integration | ✅ Published npm SDK + LangChain proof |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Solana Devnet, @solana/web3.js v1.98.4 |
| Backend | Node.js v20, TypeScript, Express.js v5 |
| Frontend | React 18, Vite 5, IBM Plex Mono |
| SDK | TypeScript, published on npm |
| AI Integration | LangChain, Python 3.12 |
| Hosting | Render (backend), Vercel (frontend) |
| Key Encoding | bs58 |

---

## 📄 License

MIT License — open source, free to use and modify.
