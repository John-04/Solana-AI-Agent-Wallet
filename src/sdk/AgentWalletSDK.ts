import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import bs58 from "bs58";

const MEMO_PROGRAM_ID = new PublicKey(
  "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"
);

export interface WalletInfo {
  publicKey: string;
  balance: number;
  network: string;
}

export interface TransactionResult {
  success: boolean;
  signature: string;
  explorerUrl: string;
  timestamp: string;
}

export interface AgentAction {
  action: string;
  params: any;
  result: TransactionResult | any;
  timestamp: string;
}

/**
 * AgentWalletSDK — A programmable wallet SDK for AI agents
 * Can be used by any AI framework outside the browser context
 *
 * Example usage with LangChain:
 *   const sdk = new AgentWalletSDK({ privateKey: "your-key" });
 *   await sdk.sendMemo("Agent decision: BUY SOL");
 *   await sdk.sendSOL("destination-address", 0.01);
 */
export class AgentWalletSDK {
  private connection: Connection;
  private keypair: Keypair;
  private network: string;
  private actionLog: AgentAction[] = [];

  constructor(config: { privateKey?: string; network?: string }) {
    this.network = config.network || "devnet";
    const rpcUrl =
      this.network === "mainnet"
        ? "https://api.mainnet-beta.solana.com"
        : "https://api.devnet.solana.com";

    this.connection = new Connection(rpcUrl, "confirmed");

    if (config.privateKey) {
      const secretKey = bs58.decode(config.privateKey);
      this.keypair = Keypair.fromSecretKey(secretKey);
    } else {
      // Generate new keypair if none provided
      this.keypair = Keypair.generate();
      console.log(
        `🔑 New wallet generated: ${this.keypair.publicKey.toString()}`
      );
    }
  }

  /**
   * Get wallet information
   */
  async getWalletInfo(): Promise<WalletInfo> {
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return {
      publicKey: this.keypair.publicKey.toString(),
      balance: balance / LAMPORTS_PER_SOL,
      network: this.network,
    };
  }

  /**
   * Send SOL to any address — core wallet operation
   */
  async sendSOL(
    toAddress: string,
    amount: number
  ): Promise<TransactionResult> {
    const toPubkey = new PublicKey(toAddress);
    const lamports = amount * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair]
    );

    const result: TransactionResult = {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      timestamp: new Date().toISOString(),
    };

    this.logAction("SEND_SOL", { toAddress, amount }, result);
    console.log(`✅ Sent ${amount} SOL to ${toAddress}`);
    console.log(`🔍 Explorer: ${result.explorerUrl}`);
    return result;
  }

  /**
   * Write a memo to the Solana blockchain — proves real dApp/protocol interaction
   * The Memo program is an official Solana program (dApp)
   * This is a REAL on-chain transaction
   */
  async sendMemo(message: string): Promise<TransactionResult> {
    const memoInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: this.keypair.publicKey,
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(message, "utf-8"),
    });

    const transaction = new Transaction().add(memoInstruction);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.keypair]
    );

    const result: TransactionResult = {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      timestamp: new Date().toISOString(),
    };

    this.logAction("SEND_MEMO", { message }, result);
    console.log(`✅ Memo written on-chain: "${message}"`);
    console.log(`🔍 Explorer: ${result.explorerUrl}`);
    return result;
  }

  /**
   * Request devnet airdrop
   */
  async requestAirdrop(amount: number = 1): Promise<TransactionResult> {
    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await this.connection.confirmTransaction(signature);

    const result: TransactionResult = {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      timestamp: new Date().toISOString(),
    };

    this.logAction("AIRDROP", { amount }, result);
    console.log(`✅ Airdropped ${amount} SOL`);
    return result;
  }

  /**
   * Execute an autonomous DeFi decision and record it on-chain via memo
   * This is the core "agentic" function — AI passes its decision, SDK executes it
   */
  async executeAgentDecision(decision: {
    action: "BUY" | "SELL" | "HOLD" | "TRANSFER";
    reasoning: string;
    confidence: number;
    amount?: number;
    targetAddress?: string;
  }): Promise<TransactionResult> {
    // Write decision to blockchain as memo — permanent on-chain record
    const memoMessage = JSON.stringify({
      agent: "AI-Wallet-Agent",
      action: decision.action,
      reasoning: decision.reasoning,
      confidence: `${decision.confidence}%`,
      timestamp: new Date().toISOString(),
    });

    console.log(`🧠 Agent decision: ${decision.action} (${decision.confidence}% confidence)`);
    console.log(`📝 Writing decision to blockchain...`);

    // Record decision on-chain
    const memoResult = await this.sendMemo(memoMessage);

    // If action requires transfer, execute it
    if (
      decision.action === "TRANSFER" &&
      decision.targetAddress &&
      decision.amount
    ) {
      await this.sendSOL(decision.targetAddress, decision.amount);
    }

    return memoResult;
  }

  /**
   * Run autonomous agent loop — makes decisions and executes them on-chain
   */
  async runAutonomousLoop(cycles: number = 3): Promise<void> {
    console.log(`\n🚀 Starting autonomous agent loop (${cycles} cycles)...`);

    const decisions = [
      { action: "BUY" as const, reasoning: "Bullish momentum detected, MA crossover signal", confidence: 85 },
      { action: "HOLD" as const, reasoning: "Market consolidating, waiting for breakout", confidence: 70 },
      { action: "SELL" as const, reasoning: "Taking profits, RSI overbought", confidence: 78 },
    ];

    for (let i = 0; i < cycles; i++) {
      const decision = decisions[i % decisions.length];
      console.log(`\n📍 Cycle ${i + 1}/${cycles}`);

      try {
        await this.executeAgentDecision(decision);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Cycle ${i + 1} failed:`, error);
      }
    }

    console.log("\n✅ Autonomous loop complete!");
    console.log(`📊 Total actions logged: ${this.actionLog.length}`);
  }

  /**
   * Get full action history
   */
  getActionLog(): AgentAction[] {
    return this.actionLog;
  }

  /**
   * Export wallet (for use in other agents)
   */
  exportWallet(): { publicKey: string; privateKey: string } {
    return {
      publicKey: this.keypair.publicKey.toString(),
      privateKey: bs58.encode(this.keypair.secretKey),
    };
  }

  /**
   * Save wallet to file
   */
  saveWallet(filePath: string): void {
    const walletData = this.exportWallet();
    fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));
    console.log(`💾 Wallet saved to ${filePath}`);
  }

  /**
   * Load wallet from file
   */
  static loadFromFile(filePath: string, network?: string): AgentWalletSDK {
    const walletData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return new AgentWalletSDK({
      privateKey: walletData.privateKey,
      network,
    });
  }

  private logAction(action: string, params: any, result: any): void {
    this.actionLog.push({
      action,
      params,
      result,
      timestamp: new Date().toISOString(),
    });
  }
}