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
import bs58 from "bs58";

const MEMO_PROGRAM_ID = new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo");

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
 * AgentWalletSDK — A programmable Solana wallet SDK for AI agents
 * 
 * Compatible with: LangChain, AutoGen, ElizaOS, and any AI framework
 * 
 * @example
 * const sdk = new AgentWalletSDK({ network: "devnet" });
 * await sdk.executeAgentDecision({ action: "BUY", reasoning: "Bullish signal", confidence: 85 });
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
      this.keypair = Keypair.generate();
      console.log(`🔑 New wallet generated: ${this.keypair.publicKey.toString()}`);
    }
  }

  /** Get wallet info — public key, balance, network */
  async getWalletInfo(): Promise<WalletInfo> {
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return {
      publicKey: this.keypair.publicKey.toString(),
      balance: balance / LAMPORTS_PER_SOL,
      network: this.network,
    };
  }

  /** Send SOL to any address */
  async sendSOL(toAddress: string, amount: number): Promise<TransactionResult> {
    const toPubkey = new PublicKey(toAddress);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.keypair.publicKey,
        toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair]);
    const result: TransactionResult = {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`,
      timestamp: new Date().toISOString(),
    };
    this.logAction("SEND_SOL", { toAddress, amount }, result);
    return result;
  }

  /** Write any message permanently to the Solana blockchain via Memo Program */
  async sendMemo(message: string): Promise<TransactionResult> {
    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: this.keypair.publicKey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(message, "utf-8"),
    });
    const transaction = new Transaction().add(memoInstruction);
    const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keypair]);
    const result: TransactionResult = {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`,
      timestamp: new Date().toISOString(),
    };
    this.logAction("SEND_MEMO", { message }, result);
    console.log(`✅ Memo written on-chain: "${message}"`);
    console.log(`🔍 Explorer: ${result.explorerUrl}`);
    return result;
  }

  /** Request devnet airdrop */
  async requestAirdrop(amount: number = 1): Promise<TransactionResult> {
    const signature = await this.connection.requestAirdrop(
      this.keypair.publicKey,
      amount * LAMPORTS_PER_SOL
    );
    await this.connection.confirmTransaction(signature);
    const result: TransactionResult = {
      success: true,
      signature,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`,
      timestamp: new Date().toISOString(),
    };
    this.logAction("AIRDROP", { amount }, result);
    return result;
  }

  /**
   * Execute an AI agent decision and record it permanently on-chain
   * This is the core agentic function — pass your AI's decision, SDK executes and records it
   */
  async executeAgentDecision(decision: {
    action: "BUY" | "SELL" | "HOLD" | "TRANSFER";
    reasoning: string;
    confidence: number;
    amount?: number;
    targetAddress?: string;
  }): Promise<TransactionResult> {
    const memoMessage = JSON.stringify({
      agent: "AgentWalletSDK",
      action: decision.action,
      reasoning: decision.reasoning,
      confidence: `${decision.confidence}%`,
      timestamp: new Date().toISOString(),
    });

    console.log(`🧠 Agent decision: ${decision.action} (${decision.confidence}% confidence)`);
    const memoResult = await this.sendMemo(memoMessage);

    if (decision.action === "TRANSFER" && decision.targetAddress && decision.amount) {
      await this.sendSOL(decision.targetAddress, decision.amount);
    }

    return memoResult;
  }

  /** Get full action history */
  getActionLog(): AgentAction[] {
    return this.actionLog;
  }

  /** Export wallet credentials */
  exportWallet(): { publicKey: string; privateKey: string } {
    return {
      publicKey: this.keypair.publicKey.toString(),
      privateKey: bs58.encode(this.keypair.secretKey),
    };
  }

  /** Save wallet to file */
  saveWallet(filePath: string): void {
    fs.writeFileSync(filePath, JSON.stringify(this.exportWallet(), null, 2));
    console.log(`💾 Wallet saved to ${filePath}`);
  }

  /** Load wallet from file */
  static loadFromFile(filePath: string, network?: string): AgentWalletSDK {
    const walletData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return new AgentWalletSDK({ privateKey: walletData.privateKey, network });
  }

  private logAction(action: string, params: any, result: any): void {
    this.actionLog.push({ action, params, result, timestamp: new Date().toISOString() });
  }
}
