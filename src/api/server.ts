import express from "express";
import cors from "cors";
import { AIAgent } from "../agent/agent";
import { WalletManager } from "../wallet/walletManager";
import { DeFiStrategyEngine } from "../agent/defiStrategy";

const app = express();
const agent = new AIAgent();
const walletManager = new WalletManager();
const defiEngine = new DeFiStrategyEngine();

app.use(cors());
app.use(express.json());

// Initialize agent and DeFi engine on startup
agent.initialize().then(async () => {
  console.log("🤖 Agent initialized and ready");

  // Initialize DeFi engine with agent wallet
  const agentWallet = agent.getAgentWallet();
  if (agentWallet) {
    defiEngine.initializeWithKeypair(agentWallet.privateKey);
    console.log("📈 DeFi Strategy Engine initialized");

    // Start strategy loop automatically
    defiEngine.runStrategyLoop();
    console.log("🚀 DeFi Strategy Loop started");
  }
});

// ---- BASIC ROUTES ----

app.get("/", (req, res) => {
  res.json({
    status: "AI Agent Wallet is running",
    timestamp: new Date().toISOString(),
    features: ["autonomous-wallet", "defi-strategy", "multi-wallet"],
  });
});

app.get("/agent/wallet", (req, res) => {
  const wallet = agent.getAgentWallet();
  if (!wallet) return res.status(503).json({ error: "Agent not initialized yet" });
  res.json(wallet);
});

app.get("/agent/history", (req, res) => {
  res.json(agent.getActionHistory());
});

app.post("/agent/act", async (req, res) => {
  try {
    const action = await agent.decideAndAct();
    res.json(action);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/agent/start", (req, res) => {
  const { intervalSeconds = 30 } = req.body;
  agent.startAutonomousLoop(intervalSeconds);
  res.json({ message: `Agent loop started every ${intervalSeconds} seconds` });
});

app.post("/agent/stop", (req, res) => {
  agent.stopLoop();
  res.json({ message: "Agent loop stopped" });
});

// ---- WALLET ROUTES ----

app.post("/wallet/create", (req, res) => {
  try {
    const wallet = walletManager.createWallet();
    res.json(wallet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/wallet/balance/:publicKey", async (req, res) => {
  try {
    const balance = await walletManager.getBalance(req.params.publicKey);
    res.json({ publicKey: req.params.publicKey, balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/wallet/send", async (req, res) => {
  try {
    const { fromPrivateKey, toPublicKey, amount } = req.body;
    const signature = await walletManager.sendSOL(fromPrivateKey, toPublicKey, amount);
    res.json({ signature, message: "Transaction successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/wallet/airdrop", async (req, res) => {
  try {
    const { publicKey, amount = 1 } = req.body;
    const signature = await walletManager.requestAirdrop(publicKey, amount);
    res.json({ signature, message: "Airdrop successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---- DEFI STRATEGY ROUTES ----

// Get full strategy state
app.get("/defi/state", (req, res) => {
  res.json(defiEngine.getStrategyState());
});

// Get all trades
app.get("/defi/trades", (req, res) => {
  res.json(defiEngine.getTrades());
});

// Get current SOL price
app.get("/defi/price", async (req, res) => {
  try {
    const price = await defiEngine.getSOLPrice();
    res.json({ price, timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Jupiter quote
app.get("/defi/quote", async (req, res) => {
  try {
    const quote = await defiEngine.getJupiterQuoteInfo();
    res.json(quote || { message: "Quote unavailable on devnet" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger market analysis
app.post("/defi/analyze", async (req, res) => {
  try {
    const analysis = await defiEngine.analyzeMarket();
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger a swap
app.post("/defi/swap", async (req, res) => {
  try {
    const { action, amount } = req.body;
    const state = defiEngine.getStrategyState();
    const result = await defiEngine.executeSimulatedSwap(
      action,
      amount || 0.1,
      state.currentPrice
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stop DeFi strategy
app.get("/agent/portfolio", (req, res) => {
  res.json(agent.getPortfolio());
});
app.post("/defi/start", (req, res) => {
  defiEngine.runStrategyLoop();
  res.json({ message: "DeFi strategy started", status: "running" });
});
app.post("/defi/stop", (req, res) => {
  defiEngine.stopStrategy();
  res.json({ message: "DeFi strategy stopped" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;