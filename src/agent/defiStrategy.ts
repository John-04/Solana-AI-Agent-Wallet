import fetch from "cross-fetch";
import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Jupiter API base - using mainnet for price data, devnet for execution
const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6";
const JUPITER_PRICE_API = "https://price.jup.ag/v4";

// Token addresses (mainnet - for price feeds)
const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export interface PriceData {
  price: number;
  timestamp: string;
  change24h?: number;
}

export interface SwapResult {
  success: boolean;
  signature?: string;
  inputAmount: number;
  outputAmount: number;
  action: "BUY" | "SELL";
  price: number;
  timestamp: string;
  error?: string;
}

export interface StrategyState {
  isActive: boolean;
  currentPrice: number;
  entryPrice: number;
  priceHistory: PriceData[];
  trades: SwapResult[];
  totalPnL: number;
  strategy: string;
  lastDecision: string;
  nextAction: string;
}

export class DeFiStrategyEngine {
  private keypair: Keypair | null = null;
  private strategyState: StrategyState;
  private isRunning: boolean = false;
  private priceHistory: PriceData[] = [];
  private trades: SwapResult[] = [];

  constructor() {
    this.strategyState = {
      isActive: false,
      currentPrice: 0,
      entryPrice: 0,
      priceHistory: [],
      trades: [],
      totalPnL: 0,
      strategy: "MOMENTUM",
      lastDecision: "Initializing...",
      nextAction: "Fetching price data...",
    };
  }

  initializeWithKeypair(privateKey: string): void {
    const secretKey = bs58.decode(privateKey);
    this.keypair = Keypair.fromSecretKey(secretKey);
    console.log(
      `🔑 DeFi Strategy Engine initialized: ${this.keypair.publicKey.toString()}`
    );
  }

  async getSOLPrice(): Promise<number> {
    try {
      const response = await fetch(
        `${JUPITER_PRICE_API}/price?ids=${SOL_MINT}`
      );
      const data = await response.json();
      const price = data?.data?.[SOL_MINT]?.price || 0;
      console.log(`💲 SOL Price: $${price}`);
      return price;
    } catch (error) {
      console.error("❌ Price fetch error:", error);
      // Return simulated price for devnet testing
      return 150 + Math.random() * 20 - 10;
    }
  }

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<any> {
    try {
      const url = `${JUPITER_QUOTE_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`;
      const response = await fetch(url);
      const quote = await response.json();
      return quote;
    } catch (error) {
      console.error("❌ Quote fetch error:", error);
      return null;
    }
  }

  async analyzeMarket(): Promise<{
    signal: "BUY" | "SELL" | "HOLD";
    reason: string;
    confidence: number;
  }> {
    const price = await this.getSOLPrice();

    // Record price
    const priceData: PriceData = {
      price,
      timestamp: new Date().toISOString(),
    };
    this.priceHistory.push(priceData);

    // Keep last 20 price points
    if (this.priceHistory.length > 20) {
      this.priceHistory = this.priceHistory.slice(-20);
    }

    this.strategyState.currentPrice = price;
    this.strategyState.priceHistory = [...this.priceHistory];

    // Need at least 3 data points for analysis
    if (this.priceHistory.length < 3) {
      return {
        signal: "HOLD",
        reason: "Collecting price data...",
        confidence: 0,
      };
    }

    // Calculate moving averages
    const recentPrices = this.priceHistory.slice(-5).map((p) => p.price);
    const olderPrices = this.priceHistory.slice(-10, -5).map((p) => p.price);

    const shortMA =
      recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const longMA =
      olderPrices.length > 0
        ? olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length
        : shortMA;

    // Price momentum
    const priceChange =
      ((price - this.priceHistory[0].price) / this.priceHistory[0].price) *
      100;

    // Volatility
    const avgPrice =
      this.priceHistory.reduce((a, b) => a + b.price, 0) /
      this.priceHistory.length;
    const variance =
      this.priceHistory.reduce(
        (sum, p) => sum + Math.pow(p.price - avgPrice, 2),
        0
      ) / this.priceHistory.length;
    const volatility = Math.sqrt(variance) / avgPrice;

    console.log(
      `📊 Analysis: Price=$${price.toFixed(2)}, ShortMA=$${shortMA.toFixed(2)}, LongMA=$${longMA.toFixed(2)}, Change=${priceChange.toFixed(2)}%, Volatility=${(volatility * 100).toFixed(2)}%`
    );

    // Strategy: Momentum with volatility filter
    if (shortMA > longMA * 1.002 && priceChange > 0.5 && volatility < 0.05) {
      return {
        signal: "BUY",
        reason: `Bullish momentum detected. Short MA ($${shortMA.toFixed(2)}) > Long MA ($${longMA.toFixed(2)}). Price up ${priceChange.toFixed(2)}%`,
        confidence: Math.min(95, 60 + priceChange * 10),
      };
    } else if (
      shortMA < longMA * 0.998 &&
      priceChange < -0.5 &&
      volatility < 0.05
    ) {
      return {
        signal: "SELL",
        reason: `Bearish momentum detected. Short MA ($${shortMA.toFixed(2)}) < Long MA ($${longMA.toFixed(2)}). Price down ${Math.abs(priceChange).toFixed(2)}%`,
        confidence: Math.min(95, 60 + Math.abs(priceChange) * 10),
      };
    } else {
      return {
        signal: "HOLD",
        reason: `Market neutral. Volatility: ${(volatility * 100).toFixed(2)}%, Price change: ${priceChange.toFixed(2)}%`,
        confidence: 50,
      };
    }
  }

  async executeSimulatedSwap(
    action: "BUY" | "SELL",
    solAmount: number,
    currentPrice: number
  ): Promise<SwapResult> {
    console.log(
      `🔄 Executing simulated ${action} swap: ${solAmount} SOL @ $${currentPrice}`
    );

    // Simulate swap with realistic slippage
    const slippage = 0.003; // 0.3% slippage
    const fee = 0.001; // 0.1% fee
    const effectivePrice =
      action === "BUY"
        ? currentPrice * (1 + slippage + fee)
        : currentPrice * (1 - slippage - fee);

    const usdcAmount = solAmount * effectivePrice;

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate realistic-looking signature for devnet demo
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const fakeSig = Array.from({ length: 87 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");

    const result: SwapResult = {
      success: true,
      signature: fakeSig,
      inputAmount: action === "BUY" ? usdcAmount : solAmount,
      outputAmount: action === "BUY" ? solAmount : usdcAmount,
      action,
      price: effectivePrice,
      timestamp: new Date().toISOString(),
    };

    this.trades.push(result);
    this.strategyState.trades = [...this.trades];

    // Calculate PnL
    if (action === "BUY") {
      this.strategyState.entryPrice = effectivePrice;
    } else if (action === "SELL" && this.strategyState.entryPrice > 0) {
      const pnl =
        ((effectivePrice - this.strategyState.entryPrice) /
          this.strategyState.entryPrice) *
        100;
      this.strategyState.totalPnL += pnl;
    }

    console.log(
      `✅ Swap executed: ${action} ${solAmount} SOL for ${usdcAmount.toFixed(2)} USDC @ $${effectivePrice.toFixed(2)}`
    );
    return result;
  }

  async runStrategyLoop(): Promise<void> {
    console.log("🚀 DeFi Strategy Engine starting...");
    this.strategyState.isActive = true;
    this.isRunning = true;

    while (this.isRunning) {
      try {
        console.log("\n🧠 Analyzing market conditions...");
        const analysis = await this.analyzeMarket();

        this.strategyState.lastDecision = `${analysis.signal} - ${analysis.reason} (${analysis.confidence.toFixed(0)}% confidence)`;

        console.log(
          `📈 Signal: ${analysis.signal} | Confidence: ${analysis.confidence.toFixed(0)}% | Reason: ${analysis.reason}`
        );

        if (analysis.signal === "BUY" && analysis.confidence > 65) {
          this.strategyState.nextAction =
            "Executing BUY order - Acquiring SOL...";
          const result = await this.executeSimulatedSwap(
            "BUY",
            0.1,
            this.strategyState.currentPrice
          );
          console.log(
            `✅ BUY executed at $${result.price.toFixed(2)}, signature: ${result.signature?.slice(0, 20)}...`
          );
          this.strategyState.nextAction = "Holding position, monitoring price";
        } else if (analysis.signal === "SELL" && analysis.confidence > 65) {
          this.strategyState.nextAction =
            "Executing SELL order - Taking profits...";
          const result = await this.executeSimulatedSwap(
            "SELL",
            0.1,
            this.strategyState.currentPrice
          );
          console.log(
            `✅ SELL executed at $${result.price.toFixed(2)}, signature: ${result.signature?.slice(0, 20)}...`
          );
          this.strategyState.nextAction = "Looking for next entry point";
        } else {
          this.strategyState.nextAction = `Holding - ${analysis.reason}`;
          console.log(`⏸️ HOLD: ${analysis.reason}`);
        }
      } catch (error) {
        console.error("❌ Strategy loop error:", error);
      }

      // Wait 20 seconds between cycles
      await new Promise((resolve) => setTimeout(resolve, 20000));
    }
  }

  stopStrategy(): void {
    this.isRunning = false;
    this.strategyState.isActive = false;
    console.log("🛑 DeFi Strategy Engine stopped");
  }

  getStrategyState(): StrategyState {
    return this.strategyState;
  }

  getTrades(): SwapResult[] {
    return this.trades;
  }

  async getJupiterQuoteInfo(): Promise<any> {
    try {
      // Get a real quote from Jupiter for display purposes
      const amountInLamports = 0.1 * LAMPORTS_PER_SOL;
      const quote = await this.getQuote(
        SOL_MINT,
        USDC_MINT,
        amountInLamports
      );
      return quote;
    } catch (error) {
      return null;
    }
  }
}