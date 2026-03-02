import { AIAgent } from "./agent/agent";
import { WalletManager } from "./wallet/walletManager";

async function main() {
  console.log("🚀 Starting AI Agent Wallet System...");
  console.log("==========================================");

  const walletManager = new WalletManager();

  // Demo 1: Create a wallet
  console.log("\n📌 STEP 1: Creating agent wallet...");
  const wallet = walletManager.createWallet();
  console.log(`   Public Key: ${wallet.publicKey}`);

  // Demo 2: Request airdrop
  console.log("\n📌 STEP 2: Requesting devnet airdrop...");
  await walletManager.requestAirdrop(wallet.publicKey, 1);

  // Demo 3: Check balance
  console.log("\n📌 STEP 3: Checking balance...");
  const balance = await walletManager.getBalance(wallet.publicKey);
  console.log(`   Balance: ${balance} SOL`);

  // Demo 4: Initialize AI Agent
  console.log("\n📌 STEP 4: Initializing AI Agent...");
  const agent = new AIAgent();
  await agent.initialize();

  // Demo 5: Agent makes a decision
  console.log("\n📌 STEP 5: Agent making autonomous decision...");
  const action = await agent.decideAndAct();
  console.log(`   Action taken: ${action.type}`);
  console.log(`   Result: ${action.result}`);

  // Demo 6: Show action history
  console.log("\n📌 STEP 6: Action history...");
  const history = agent.getActionHistory();
  console.log(`   Total actions taken: ${history.length}`);

  console.log("\n==========================================");
  console.log("✅ AI Agent Wallet System Demo Complete!");
  console.log("==========================================");
  console.log("\n🌐 Starting API server...");

  // Start the API server
  require("./api/server");
}

main().catch(console.error);