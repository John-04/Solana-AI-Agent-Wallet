import express from "express";
import cors from "cors";
import { AIAgent } from "../agent/agent";
import { WalletManager } from "../wallet/walletManager";

const app = express();
const agent = new AIAgent();
const walletManager = new WalletManager();

app.use(cors());
app.use(express.json());

// Initialize agent on startup
agent.initialize().then(() => {
  console.log("🤖 Agent initialized and ready");
});

// ---- ROUTES ----

// Health check
app.get("/", (req, res) => {
  res.json({ status: "AI Agent Wallet is running", timestamp: new Date().toISOString() });
});

// Get agent wallet info
app.get("/agent/wallet", (req, res) => {
  const wallet = agent.getAgentWallet();
  if (!wallet) return res.status(503).json({ error: "Agent not initialized yet" });
  res.json(wallet);
});

// Get agent action history
app.get("/agent/history", (req, res) => {
  res.json(agent.getActionHistory());
});

// Trigger agent to make a decision manually
app.post("/agent/act", async (req, res) => {
  try {
    const action = await agent.decideAndAct();
    res.json(action);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start autonomous loop
app.post("/agent/start", (req, res) => {
  const { intervalSeconds = 30 } = req.body;
  agent.startAutonomousLoop(intervalSeconds);
  res.json({ message: `Agent loop started every ${intervalSeconds} seconds` });
});

// Stop autonomous loop
app.post("/agent/stop", (req, res) => {
  agent.stopLoop();
  res.json({ message: "Agent loop stopped" });
});

// Create a new wallet manually
app.post("/wallet/create", (req, res) => {
  try {
    const wallet = walletManager.createWallet();
    res.json(wallet);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check balance of any wallet
app.get("/wallet/balance/:publicKey", async (req, res) => {
  try {
    const balance = await walletManager.getBalance(req.params.publicKey);
    res.json({ publicKey: req.params.publicKey, balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send SOL between wallets
app.post("/wallet/send", async (req, res) => {
  try {
    const { fromPrivateKey, toPublicKey, amount } = req.body;
    const signature = await walletManager.sendSOL(fromPrivateKey, toPublicKey, amount);
    res.json({ signature, message: "Transaction successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request airdrop
app.post("/wallet/airdrop", async (req, res) => {
  try {
    const { publicKey, amount = 1 } = req.body;
    const signature = await walletManager.requestAirdrop(publicKey, amount);
    res.json({ signature, message: "Airdrop successful" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;