import { WalletManager } from "../wallet/walletManager";
import { AgentWalletSDK } from "../sdk/AgentWalletSDK";

interface AgentWallet {
  publicKey: string;
  privateKey: string;
  balance: number;
}

interface AgentAction {
  type: "SEND" | "AIRDROP" | "CHECK_BALANCE" | "CREATE_WALLET" | "MEMO" | "PORTFOLIO_REBALANCE";
  payload: any;
  timestamp: string;
  result?: string;
  onChainSignature?: string;
  explorerUrl?: string;
}

interface PortfolioWallet {
  publicKey: string;
  privateKey: string;
  label: string;
  balance: number;
  allocation: number;
}

export class AIAgent {
  private walletManager: WalletManager;
  private sdk: AgentWalletSDK | null = null;
  private agentWallet: AgentWallet | null = null;
  private actionHistory: AgentAction[] = [];
  private isRunning: boolean = false;
  private portfolio: PortfolioWallet[] = [];
  private cycleCount: number = 0;

  constructor() {
    this.walletManager = new WalletManager();
  }

  async initialize(): Promise<void> {
    console.log("🤖 Initializing AI Agent...");
    const wallet = this.walletManager.createWallet();
    await this.walletManager.requestAirdrop(wallet.publicKey, 1);
    const balance = await this.walletManager.getBalance(wallet.publicKey);

    this.agentWallet = {
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
      balance,
    };

    // Initialize SDK with agent wallet
    this.sdk = new AgentWalletSDK({
      privateKey: wallet.privateKey,
      network: "devnet",
    });

    // Create initial portfolio wallets
    await this.initializePortfolio();

    console.log(`🤖 Agent wallet ready: ${this.agentWallet.publicKey}`);
    console.log(`💰 Agent balance: ${balance} SOL`);
  }

  private async initializePortfolio(): Promise<void> {
    console.log("📊 Initializing portfolio...");
    const labels = ["Trading", "Reserve", "Operations"];
    const allocations = [0.4, 0.4, 0.2];

    for (let i = 0; i < 3; i++) {
      const wallet = this.walletManager.createWallet();
      this.portfolio.push({
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey,
        label: labels[i],
        balance: 0,
        allocation: allocations[i],
      });
      console.log(`✅ Portfolio wallet created: ${labels[i]} — ${wallet.publicKey}`);
    }
  }

  private async updatePortfolioBalances(): Promise<void> {
    for (const wallet of this.portfolio) {
      wallet.balance = await this.walletManager.getBalance(wallet.publicKey);
    }
  }

  private async logAction(action: AgentAction): Promise<void> {
    this.actionHistory.push(action);
    console.log(`📝 Action logged: ${action.type} at ${action.timestamp}`);
  }

  async decideAndAct(): Promise<AgentAction> {
    if (!this.agentWallet || !this.sdk) throw new Error("Agent not initialized");

    this.cycleCount++;
    this.agentWallet.balance = await this.walletManager.getBalance(
      this.agentWallet.publicKey
    );

    await this.updatePortfolioBalances();

    console.log(`\n🧠 Agent thinking... Cycle #${this.cycleCount}`);
    console.log(`💰 Current balance: ${this.agentWallet.balance} SOL`);

    let action: AgentAction;

    // Cycle 1: Write strategy memo on-chain
    if (this.cycleCount % 5 === 1) {
      console.log("🤖 Decision: Writing strategy memo on-chain...");
      try {
        const memo = `AI Agent Cycle #${this.cycleCount}: Balance=${this.agentWallet.balance} SOL, Portfolio=${this.portfolio.length} wallets, Strategy=MOMENTUM`;
        const result = await this.sdk.sendMemo(memo);
        action = {
          type: "MEMO",
          payload: { memo },
          timestamp: new Date().toISOString(),
          result: `Memo written on-chain`,
          onChainSignature: result.signature,
          explorerUrl: result.explorerUrl,
        };
      } catch (error) {
        action = {
          type: "CHECK_BALANCE",
          payload: { balance: this.agentWallet.balance },
          timestamp: new Date().toISOString(),
          result: `Balance: ${this.agentWallet.balance} SOL`,
        };
      }
    }
    // Low balance: request airdrop
    else if (this.agentWallet.balance < 0.5) {
      console.log("🤖 Decision: Balance low, requesting airdrop...");
      const result = await this.walletManager.requestAirdrop(
        this.agentWallet.publicKey, 1
      );
      action = {
        type: "AIRDROP",
        payload: { amount: 1, wallet: this.agentWallet.publicKey },
        timestamp: new Date().toISOString(),
        result,
      };
    }
    // High balance: rebalance portfolio
    else if (this.agentWallet.balance > 1.5) {
      console.log("🤖 Decision: Rebalancing portfolio...");
      const targetWallet = this.portfolio[this.cycleCount % this.portfolio.length];
      const amount = 0.05;

      try {
        const signature = await this.walletManager.sendSOL(
          this.agentWallet.privateKey,
          targetWallet.publicKey,
          amount
        );

        // Record rebalance decision on-chain
        try {
          await this.sdk.sendMemo(
            `Portfolio rebalance: Sent ${amount} SOL to ${targetWallet.label} wallet`
          );
        } catch {}

        action = {
          type: "PORTFOLIO_REBALANCE",
          payload: {
            from: this.agentWallet.publicKey,
            to: targetWallet.publicKey,
            label: targetWallet.label,
            amount,
          },
          timestamp: new Date().toISOString(),
          result: signature,
          onChainSignature: signature,
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        };
      } catch (error: any) {
        action = {
          type: "CHECK_BALANCE",
          payload: { balance: this.agentWallet.balance },
          timestamp: new Date().toISOString(),
          result: `Rebalance failed: ${error.message}`,
        };
      }
    }
    // Normal: monitor and log
    else {
      console.log("🤖 Decision: Monitoring portfolio...");
      const portfolioSummary = this.portfolio
        .map((w) => `${w.label}:${w.balance.toFixed(4)}SOL`)
        .join(", ");

      action = {
        type: "CHECK_BALANCE",
        payload: {
          wallet: this.agentWallet.publicKey,
          balance: this.agentWallet.balance,
          portfolio: portfolioSummary,
        },
        timestamp: new Date().toISOString(),
        result: `Balance: ${this.agentWallet.balance} SOL | Portfolio: ${portfolioSummary}`,
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

  getPortfolio(): PortfolioWallet[] {
    return this.portfolio;
  }
}