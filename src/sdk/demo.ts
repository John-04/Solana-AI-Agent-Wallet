import { AgentWalletSDK } from "./AgentWalletSDK";

/**
 * This demo shows how ANY AI agent framework can use the SDK
 * outside the browser — LangChain, AutoGen, ElizaOS, custom scripts
 */
async function runSDKDemo() {
  console.log("🚀 AgentWalletSDK Demo");
  console.log("==============================================");
  console.log("This demonstrates an AI agent using the wallet");
  console.log("programmatically, outside any browser context");
  console.log("==============================================\n");

  // Initialize SDK — any AI agent does this
  const sdk = new AgentWalletSDK({ 
  privateKey: "5aeqyaxtgQj1dfkkHZyNMeA1gkk5RSmPzHmeYQVBwNsub9ho4puZwQJdy1wecZkzM6dWFUm9dLvyKWtoUUXiTiSG",
  network: "devnet" 
});

  // Step 1: Check wallet
  console.log("📌 STEP 1: Getting wallet info...");
  const walletInfo = await sdk.getWalletInfo();
  console.log(`   Address: ${walletInfo.publicKey}`);
  console.log(`   Balance: ${walletInfo.balance} SOL`);
  console.log(`   Network: ${walletInfo.network}`);

  // Step 2: Request airdrop
  console.log("\n📌 STEP 2: Requesting airdrop...");
  try {
    await sdk.requestAirdrop(1);
    const updated = await sdk.getWalletInfo();
    console.log(`   New balance: ${updated.balance} SOL`);
  } catch {
    console.log("   ⚠️ Airdrop rate limited — using faucet.solana.com");
  }

  // Step 3: Write agent decision to blockchain (REAL on-chain tx)
  console.log("\n📌 STEP 3: Writing AI decision to Solana blockchain...");
  console.log("   This is a REAL on-chain transaction via Memo program");
  try {
    const memoResult = await sdk.sendMemo(
      "AI Agent Decision: Analyzing Solana DeFi opportunities on devnet"
    );
    console.log(`   ✅ On-chain signature: ${memoResult.signature}`);
    console.log(`   🔍 View on Explorer: ${memoResult.explorerUrl}`);
  } catch (error) {
    console.log(`   ⚠️ Memo failed (need SOL): ${error}`);
  }

  // Step 4: Execute autonomous decision
  console.log("\n📌 STEP 4: Executing autonomous agent decision...");
  try {
    const decision = await sdk.executeAgentDecision({
      action: "BUY",
      reasoning: "Bullish momentum: Short MA crossed above Long MA with 85% confidence",
      confidence: 85,
    });
    console.log(`   ✅ Decision recorded on-chain: ${decision.signature}`);
    console.log(`   🔍 Explorer: ${decision.explorerUrl}`);
  } catch (error) {
    console.log(`   ⚠️ Decision recording failed (need SOL): ${error}`);
  }

  // Step 5: Show action log
  console.log("\n📌 STEP 5: Agent action log...");
  const log = sdk.getActionLog();
  console.log(`   Total actions: ${log.length}`);
  log.forEach((entry, i) => {
    console.log(`   ${i + 1}. ${entry.action} at ${entry.timestamp}`);
  });

  // Step 6: Export wallet for other agents
  console.log("\n📌 STEP 6: Exporting wallet for other AI agents...");
  const exported = sdk.exportWallet();
  console.log(`   Public Key: ${exported.publicKey}`);
  console.log(`   (Private key hidden for security)`);

  console.log("\n==============================================");
  console.log("✅ SDK Demo Complete!");
  console.log("This wallet can be used by ANY AI agent:");
  console.log("  - LangChain tools");
  console.log("  - AutoGen agents");
  console.log("  - ElizaOS plugins");
  console.log("  - Custom AI scripts");
  console.log("==============================================");
}

runSDKDemo().catch(console.error);