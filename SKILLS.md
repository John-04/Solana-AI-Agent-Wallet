# SKILLS.md

> This file is written for AI agents. It describes what this wallet can do, how to use it, and what tools are available.

---

## What This Agent Can Do

- Create and manage Solana wallets programmatically
- Check SOL balance on devnet or mainnet
- Send SOL to any Solana address autonomously
- Request SOL airdrops on devnet
- Write decisions permanently to the Solana blockchain via Memo Program
- Analyze SOL market conditions using Moving Average momentum strategy
- Execute autonomous BUY/SELL/HOLD trading decisions
- Manage a multi-wallet portfolio (Trading, Reserve, Operations)
- Record every action with a verifiable on-chain signature

---

## How to Use the SDK
```bash
npm install ai-agent-wallet-sdk
```
```typescript
import { AgentWalletSDK } from "ai-agent-wallet-sdk";

const sdk = new AgentWalletSDK({ network: "devnet" });

// Check balance
const info = await sdk.getWalletInfo();

// Send SOL
await sdk.sendSOL("recipient-address", 0.1);

// Record a decision on-chain
await sdk.executeAgentDecision({
  action: "BUY",
  reasoning: "Bullish MA crossover detected",
  confidence: 85
});

// Write any memo to blockchain
await sdk.sendMemo("Agent decision: portfolio rebalanced");
```

---

## Available API Endpoints

Base URL: `https://solana-ai-agent-wallet.onrender.com`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent/wallet` | GET | Get agent wallet address and balance |
| `/agent/act` | POST | Trigger one autonomous action |
| `/agent/history` | GET | Get full action history |
| `/agent/portfolio` | GET | Get all portfolio wallets |
| `/wallet/create` | POST | Create a new wallet |
| `/wallet/balance/:publicKey` | GET | Get any wallet balance |
| `/wallet/send` | POST | Send SOL between wallets |
| `/wallet/airdrop` | POST | Request devnet airdrop |
| `/defi/state` | GET | Get strategy engine state |
| `/defi/price` | GET | Get current SOL price |
| `/defi/analyze` | POST | Run market analysis now |
| `/defi/trades` | GET | Get all trade history |

---

## SDK Method Reference

| Method | Input | Output |
|--------|-------|--------|
| `getWalletInfo()` | none | publicKey, balance, network |
| `sendSOL(address, amount)` | string, number | signature, explorerUrl |
| `sendMemo(message)` | string | signature, explorerUrl |
| `executeAgentDecision(decision)` | action, reasoning, confidence | signature, explorerUrl |
| `requestAirdrop(amount)` | number | signature |
| `runAutonomousLoop(cycles)` | number | void |
| `exportWallet()` | none | publicKey, privateKey |
| `getActionLog()` | none | AgentAction[] |

---

## Verified On-Chain Transactions

These transactions prove the agent works on Solana Devnet:

- Memo Program interaction: `5DzKFVewijKWFjvPcy7zGtAS9a4HkgokHDKxQRTCQj73FX5qfZN9actmHSShQiv3c3bTaJrxYEHQzevt1V6YG7yJ`
- Agent decision recording: `2BVAXKrMGXLpBZqAzVVJN3wapRmdd8qLN1iXQZniHb94msTU9YtcNnfwSmuKCx6onuu1FHq3yob6CoBjt8KByrKw`
- LangChain agent transaction: `2WXDieLCHpeSPsdWvUbC2AvzyVWAFyfEKPNs2GpdRjynFwvx93q3QvELbV2ofN6BvecHSbKtumgofgU2d9T3B1h`

---

## Networks Supported

- `devnet` — for testing and development
- `mainnet-beta` — for production (use with real SOL)

---

## Compatible AI Frameworks

- LangChain (Python + TypeScript)
- AutoGen
- ElizaOS
- Any custom Python or TypeScript agent script

---

*Live demo: https://solana-ai-agent-wallet.vercel.app*
*npm: https://www.npmjs.com/package/ai-agent-wallet-sdk*
*GitHub: https://github.com/John-04/Solana-AI-Agent-Wallet*
