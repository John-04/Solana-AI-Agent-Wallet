import { WalletManager } from "../wallet/walletManager";

interface AgentWallet {
  publicKey: string;
  privateKey: string;
  balance: number;
}

interface AgentAction {
  type: "SEND" | "AIRDROP" | "CHECK_BALANCE" | "CREATE_WALLET";
  payload: any;
  timestamp: string;
  result?: string;
}

export class AIAgent {
  private walletManager: WalletManager;
  private agentWallet: AgentWallet | null = null;
  private actionHistory: AgentAction[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.walletManager = new WalletManager();
  }

  async initialize(): Promise<void> {
    console.log("🤖 Initializing AI Agent...");
    const wallet = this.walletManager.createWallet();

    // Request airdrop to fund the agent
    await this.walletManager.requestAirdrop(wallet.publicKey, 1);

    const balance = await this.walletManager.getBalance(wallet.publicKey);

    this.agentWallet = {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      balance,
    };

    console.log(`🤖 Agent wallet ready: ${this.agentWallet.publicKey}`);
    console.log(`💰 Agent balance: ${balance} SOL`);
  }

  private async logAction(action: AgentAction): Promise<void> {
    this.actionHistory.push(action);
    console.log(`📝 Action logged: ${action.type} at ${action.timestamp}`);
  }

  async decideAndAct(): Promise<AgentAction> {
    if (!this.agentWallet) throw new Error("Agent not initialized");

    // Refresh balance
    this.agentWallet.balance = await this.walletManager.getBalance(
      this.agentWallet.publicKey
    );

    console.log(`🧠 Agent thinking... Current balance: ${this.agentWallet.balance} SOL`);

    let action: AgentAction;

    // Agent decision logic
    if (this.agentWallet.balance < 0.5) {
      // Low balance — request airdrop
      console.log("🤖 Decision: Balance low, requesting airdrop...");
      const result = await this.walletManager.requestAirdrop(
        this.agentWallet.publicKey,
        1
      );
      action = {
        type: "AIRDROP",
        payload: { amount: 1, wallet: this.agentWallet.publicKey },
        timestamp: new Date().toISOString(),
        result,
      };
    } else if (this.agentWallet.balance > 1.5) {
      // High balance — create a new wallet and send some SOL to it
      console.log("🤖 Decision: Balance high, creating sub-wallet and distributing SOL...");
      const newWallet = this.walletManager.createWallet();
      await this.walletManager.requestAirdrop(newWallet.publicKey, 0.1);

      const result = await this.walletManager.sendSOL(
        this.agentWallet.privateKey,
        newWallet.publicKey,
        0.1
      );
      action = {
        type: "SEND",
        payload: {
          from: this.agentWallet.publicKey,
          to: newWallet.publicKey,
          amount: 0.1,
        },
        timestamp: new Date().toISOString(),
        result,
      };
    } else {
      // Just check balance
      console.log("🤖 Decision: Balance nominal, monitoring...");
      action = {
        type: "CHECK_BALANCE",
        payload: {
          wallet: this.agentWallet.publicKey,
          balance: this.agentWallet.balance,
        },
        timestamp: new Date().toISOString(),
        result: `Balance: ${this.agentWallet.balance} SOL`,
      };
    }

    await this.logAction(action);
    return action;
  }

  async startAutonomousLoop(intervalSeconds: number = 30): Promise<void> {
    this.isRunning = true;
    console.log(`🚀 Agent autonomous loop started (every ${intervalSeconds}s)`);

    while (this.isRunning) {
      try {
        await this.decideAndAct();
      } catch (error) {
        console.error("❌ Agent error:", error);
      }
      await new Promise((resolve) =>
        setTimeout(resolve, intervalSeconds * 1000)
      );
    }
  }

  stopLoop(): void {
    this.isRunning = false;
    console.log("🛑 Agent loop stopped");
  }

  getActionHistory(): AgentAction[] {
    return this.actionHistory;
  }

  getAgentWallet(): AgentWallet | null {
    return this.agentWallet;
  }
}