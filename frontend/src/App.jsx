import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "https://solana-ai-agent-wallet.onrender.com";

const VERIFIED_TXS = [
  {
    label: "Memo Program Interaction",
    sig: "5DzKFVewijKWFjvPcy7zGtAS9a4HkgokHDKxQRTCQj73FX5qfZN9actmHSShQiv3c3bTaJrxYEHQzevt1V6YG7yJ",
    desc: "AI agent wrote decision on-chain via Solana Memo Program"
  },
  {
    label: "Agent Decision Recording",
    sig: "2BVAXKrMGXLpBZqAzVVJN3wapRmdd8qLN1iXQZniHb94msTU9YtcNnfwSmuKCx6onuu1FHq3yob6CoBjt8KByrKw",
    desc: "BUY decision recorded permanently on Solana devnet"
  }
];

const SDK_EXAMPLE = `import { AgentWalletSDK } from "ai-agent-wallet";

// Any AI agent can use this — LangChain, AutoGen, ElizaOS
const sdk = new AgentWalletSDK({ network: "devnet" });

// Execute autonomous decision & record it on-chain
await sdk.executeAgentDecision({
  action: "BUY",
  reasoning: "Bullish MA crossover detected",
  confidence: 85,
});

// Send SOL programmatically
await sdk.sendSOL("recipient-address", 0.1);

// Write any decision to blockchain permanently
await sdk.sendMemo("Agent: Portfolio rebalanced");`;

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [agentData, setAgentData] = useState(null);
  const [defiData, setDefiData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [actionHistory, setActionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [notification, setNotification] = useState(null);
  const tickerRef = useRef(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAll = async () => {
    try {
      const [walletRes, defiRes, tradesRes, historyRes] = await Promise.all([
        fetch(`${API}/agent/wallet`).then(r => r.json()).catch(() => null),
        fetch(`${API}/defi/state`).then(r => r.json()).catch(() => null),
        fetch(`${API}/defi/trades`).then(r => r.json()).catch(() => null),
        fetch(`${API}/agent/history`).then(r => r.json()).catch(() => null),
      ]);

      if (walletRes) { setAgentData(walletRes); setConnected(true); }
      if (defiRes) setDefiData(defiRes);
      if (tradesRes) setTrades(Array.isArray(tradesRes) ? tradesRes : tradesRes.trades || []);
      if (historyRes) setActionHistory(Array.isArray(historyRes) ? historyRes : historyRes.history || []);

      // Fetch portfolio
      const portRes = await fetch(`${API}/agent/portfolio`).then(r => r.json()).catch(() => null);
      if (portRes) setPortfolio(Array.isArray(portRes) ? portRes : []);
    } catch {}
  };

  useEffect(() => { fetchAll(); const i = setInterval(fetchAll, 8000); return () => clearInterval(i); }, []);

  const triggerAction = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`${API}/agent/act`, { method: "POST" });
      const data = await res.json();
      showNotification(`Action: ${data.type || data.action || "Executed"}`);
      await fetchAll();
    } catch { showNotification("Failed to trigger action", "error"); }
    setTriggering(false);
  };

  const solPrice = defiData?.currentPrice || agentData?.solPrice || 0;
  const agentBalance = agentData?.balance || 0;
  const totalTrades = trades.length;
  const pnl = defiData?.totalPnL || 0;

  const tabs = [
    { id: "overview", label: "Overview", icon: "◈" },
    { id: "agent", label: "Agent", icon: "⬡" },
    { id: "defi", label: "DeFi Strategy", icon: "◎" },
    { id: "sdk", label: "SDK", icon: "⟨⟩" },
    { id: "onchain", label: "On-Chain Proof", icon: "⛓" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      color: "#e2e8f0",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,163,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,163,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Glow orbs */}
      <div style={{
        position: "fixed", top: "-20%", left: "-10%", width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(0,255,163,0.06) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-20%", right: "-10%", width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 1000,
          background: notification.type === "error" ? "#ff4444" : "#00ffa3",
          color: "#080c14", padding: "12px 20px", borderRadius: "4px",
          fontFamily: "inherit", fontWeight: "700", fontSize: "13px",
          boxShadow: `0 0 30px ${notification.type === "error" ? "rgba(255,68,68,0.5)" : "rgba(0,255,163,0.5)"}`,
          animation: "slideIn 0.3s ease",
        }}>
          {notification.msg}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <div style={{
                  width: "40px", height: "40px", background: "linear-gradient(135deg, #00ffa3, #6366f1)",
                  borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", flexShrink: 0,
                }}>⬡</div>
                <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: "700", letterSpacing: "-0.5px",
                  background: "linear-gradient(135deg, #00ffa3 0%, #6366f1 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  AI Agent Wallet
                </h1>
              </div>
              <p style={{ margin: 0, color: "#64748b", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase" }}>
                Autonomous DeFi Agent · Solana Devnet · Superteam Nigeria Bounty
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px",
              background: connected ? "rgba(0,255,163,0.08)" : "rgba(255,68,68,0.08)",
              border: `1px solid ${connected ? "rgba(0,255,163,0.3)" : "rgba(255,68,68,0.3)"}`,
              borderRadius: "100px", padding: "8px 16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%",
                background: connected ? "#00ffa3" : "#ff4444",
                boxShadow: `0 0 8px ${connected ? "#00ffa3" : "#ff4444"}`,
                animation: connected ? "pulse 2s infinite" : "none" }} />
              <span style={{ fontSize: "12px", color: connected ? "#00ffa3" : "#ff4444", fontWeight: "600" }}>
                {connected ? "LIVE ON DEVNET" : "CONNECTING..."}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "SOL Price", value: solPrice ? `$${Number(solPrice).toFixed(2)}` : "—", accent: "#00ffa3" },
            { label: "Agent Balance", value: `${Number(agentBalance).toFixed(4)} SOL`, accent: "#6366f1" },
            { label: "Total Trades", value: totalTrades, accent: "#f59e0b" },
            { label: "Strategy PnL", value: pnl ? `${Number(pnl).toFixed(2)}%` : "—", accent: pnl >= 0 ? "#00ffa3" : "#ff6b6b" },
            { label: "Agent Actions", value: actionHistory.length, accent: "#06b6d4" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "8px", padding: "16px",
              borderTop: `2px solid ${stat.accent}`,
            }}>
              <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>{stat.label}</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: stat.accent }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "4px", flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: "1 1 auto", padding: "10px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: "12px", fontWeight: "600", letterSpacing: "0.5px",
              transition: "all 0.2s",
              background: activeTab === tab.id ? "linear-gradient(135deg, rgba(0,255,163,0.15), rgba(99,102,241,0.15))" : "transparent",
              color: activeTab === tab.id ? "#00ffa3" : "#64748b",
              borderBottom: activeTab === tab.id ? "2px solid #00ffa3" : "2px solid transparent",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div style={{ background: "rgba(0,255,163,0.05)", border: "1px solid rgba(0,255,163,0.15)",
              borderRadius: "12px", padding: "28px", marginBottom: "20px" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: "18px", color: "#00ffa3", display: "flex", alignItems: "center", gap: "10px" }}>
                ◈ What is an AI Agent Wallet?
              </h2>
              <p style={{ margin: "0 0 16px", color: "#94a3b8", lineHeight: "1.8", fontSize: "14px" }}>
                Traditional crypto wallets require <strong style={{color:"#e2e8f0"}}>human approval</strong> for every transaction.
                This project builds a wallet that <strong style={{color:"#00ffa3"}}>AI agents control autonomously</strong> —
                no human needed. The agent monitors markets, makes decisions, signs transactions, and records
                everything permanently on the Solana blockchain.
              </p>
              <p style={{ margin: 0, color: "#94a3b8", lineHeight: "1.8", fontSize: "14px" }}>
                Built for the <strong style={{color:"#e2e8f0"}}>Superteam Nigeria DeFi Developer Challenge</strong> —
                demonstrating that AI agents can be first-class participants in DeFi, not just observers.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              {[
                {
                  icon: "⬡", title: "Autonomous Wallet", color: "#00ffa3",
                  desc: "Creates and manages Solana wallets programmatically. Signs transactions without any human input. The agent controls its own private keys securely."
                },
                {
                  icon: "◎", title: "DeFi Strategy Engine", color: "#6366f1",
                  desc: "Momentum-based trading strategy with Moving Average crossover signals. Analyzes market conditions every 20 seconds and executes BUY/SELL/HOLD decisions autonomously."
                },
                {
                  icon: "⛓", title: "On-Chain Proof", color: "#f59e0b",
                  desc: "Every agent decision is permanently recorded on the Solana blockchain via the Memo Program. These are real, verifiable transactions — not simulations."
                },
                {
                  icon: "⟨⟩", title: "External Agent SDK", color: "#06b6d4",
                  desc: "A standalone SDK that LangChain, AutoGen, ElizaOS or any AI framework can import and use to control the wallet programmatically, outside any browser context."
                },
                {
                  icon: "◈", title: "Multi-Wallet Portfolio", color: "#ec4899",
                  desc: "Manages a portfolio of 3 specialized wallets: Trading, Reserve, and Operations. Automatically rebalances funds between them based on strategy signals."
                },
                {
                  icon: "⬡", title: "REST API", color: "#84cc16",
                  desc: "Full REST API at solana-ai-agent-wallet.onrender.com — any external system can interact with the agent programmatically via HTTP endpoints."
                },
              ].map(card => (
                <div key={card.title} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px", padding: "20px",
                  borderLeft: `3px solid ${card.color}`,
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "10px" }}>{card.icon}</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "14px", color: card.color, fontWeight: "700" }}>{card.title}</h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: "1.7" }}>{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Architecture flow */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "14px", color: "#64748b", letterSpacing: "2px", textTransform: "uppercase" }}>
                How It Works — Architecture Flow
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                {[
                  { label: "AI Agent", sub: "Makes decisions" },
                  { label: "→", sub: "", isArrow: true },
                  { label: "AgentWalletSDK", sub: "External SDK" },
                  { label: "→", sub: "", isArrow: true },
                  { label: "Wallet Manager", sub: "Signs txns" },
                  { label: "→", sub: "", isArrow: true },
                  { label: "Solana Devnet", sub: "On-chain" },
                ].map((step, i) => step.isArrow ? (
                  <div key={i} style={{ color: "#00ffa3", fontSize: "20px", fontWeight: "700" }}>→</div>
                ) : (
                  <div key={i} style={{
                    background: "rgba(0,255,163,0.06)", border: "1px solid rgba(0,255,163,0.2)",
                    borderRadius: "8px", padding: "12px 16px", textAlign: "center", minWidth: "110px",
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#00ffa3" }}>{step.label}</div>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>{step.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AGENT TAB */}
        {activeTab === "agent" && (
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "16px", color: "#00ffa3" }}>⬡ Agent Wallet</h2>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "12px" }}>
                This wallet is controlled entirely by the AI agent — no human signs transactions
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "center",
                background: "rgba(0,255,163,0.04)", border: "1px solid rgba(0,255,163,0.1)",
                borderRadius: "8px", padding: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1px", marginBottom: "6px" }}>PUBLIC KEY</div>
                  <div style={{ fontSize: "12px", color: "#e2e8f0", wordBreak: "break-all" }}>{agentData?.publicKey || "Loading..."}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1px", marginBottom: "6px" }}>BALANCE</div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "#00ffa3" }}>{Number(agentBalance).toFixed(4)} SOL</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>${(agentBalance * solPrice).toFixed(2)}</div>
                </div>
              </div>

              <button onClick={triggerAction} disabled={triggering} style={{
                width: "100%", padding: "14px", borderRadius: "8px", border: "none", cursor: triggering ? "not-allowed" : "pointer",
                background: triggering ? "rgba(0,255,163,0.1)" : "linear-gradient(135deg, #00ffa3, #06b6d4)",
                color: "#080c14", fontFamily: "inherit", fontSize: "14px", fontWeight: "700",
                letterSpacing: "1px", transition: "all 0.2s",
                boxShadow: triggering ? "none" : "0 0 30px rgba(0,255,163,0.3)",
              }}>
                {triggering ? "⟳ AGENT DECIDING..." : "⚡ TRIGGER AUTONOMOUS ACTION"}
              </button>
              <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#64748b", textAlign: "center" }}>
                Agent will analyze balance, market conditions, and autonomously decide what action to take
              </p>
            </div>

            {/* Portfolio Wallets */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "16px", color: "#6366f1" }}>◈ Portfolio Wallets</h2>
              <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "12px" }}>
                Agent manages 3 specialized wallets and rebalances funds between them autonomously
              </p>
              {portfolio.length > 0 ? (
                <div style={{ display: "grid", gap: "10px" }}>
                  {portfolio.map((w, i) => (
                    <div key={i} style={{
                      display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center",
                      background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)",
                      borderRadius: "8px", padding: "14px",
                    }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1",
                            background: "rgba(99,102,241,0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                            {w.label || `Wallet ${i+1}`}
                          </span>
                          <span style={{ fontSize: "10px", color: "#64748b" }}>
                            Allocation: {w.allocation ? `${(w.allocation * 100).toFixed(0)}%` : "—"}
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#475569", wordBreak: "break-all" }}>{w.publicKey}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0" }}>{Number(w.balance || 0).toFixed(4)}</div>
                        <div style={{ fontSize: "10px", color: "#64748b" }}>SOL</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px", color: "#475569", fontSize: "13px" }}>
                  Portfolio wallets loading... (agent initializes on startup)
                </div>
              )}
            </div>

            {/* Action History */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "16px", color: "#f59e0b" }}>
                ◎ Autonomous Action History ({actionHistory.length})
              </h2>
              <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "12px" }}>
                Every decision the agent makes is logged here — the agent runs continuously 24/7
              </p>
              {actionHistory.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px", color: "#475569", fontSize: "13px" }}>
                  No actions yet. Click "Trigger Autonomous Action" above to start.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {actionHistory.slice().reverse().map((action, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)",
                      borderRadius: "6px", padding: "12px",
                    }}>
                      <span style={{
                        fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "4px", flexShrink: 0,
                        background: action.type === "MEMO" ? "rgba(0,255,163,0.15)" :
                          action.type === "PORTFOLIO_REBALANCE" ? "rgba(99,102,241,0.15)" :
                          action.type === "AIRDROP" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.1)",
                        color: action.type === "MEMO" ? "#00ffa3" :
                          action.type === "PORTFOLIO_REBALANCE" ? "#6366f1" :
                          action.type === "AIRDROP" ? "#f59e0b" : "#94a3b8",
                      }}>{action.type}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", color: "#e2e8f0", marginBottom: "2px" }}>{action.result}</div>
                        {action.explorerUrl && (
                          <a href={action.explorerUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: "10px", color: "#00ffa3", textDecoration: "none" }}>
                            ⛓ View on Solana Explorer →
                          </a>
                        )}
                        <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>{action.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEFI TAB */}
        {activeTab === "defi" && (
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", color: "#6366f1" }}>◎ DeFi Strategy Engine</h2>
                <span style={{
                  fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "100px",
                  background: defiData?.isRunning ? "rgba(0,255,163,0.15)" : "rgba(255,107,107,0.15)",
                  color: defiData?.isRunning ? "#00ffa3" : "#ff6b6b",
                  border: `1px solid ${defiData?.isRunning ? "rgba(0,255,163,0.3)" : "rgba(255,107,107,0.3)"}`,
                }}>
                  {defiData?.isRunning ? "● ACTIVE" : "○ STOPPED"}
                </span>
              </div>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "12px" }}>
                Momentum strategy using Moving Average crossovers. Agent analyzes price every 20 seconds and autonomously decides to BUY, SELL, or HOLD.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                {[
                  { label: "Current SOL Price", value: defiData?.currentPrice ? `$${Number(defiData.currentPrice).toFixed(2)}` : "—", color: "#00ffa3" },
                  { label: "Entry Price", value: defiData?.entryPrice ? `$${Number(defiData.entryPrice).toFixed(2)}` : "—", color: "#6366f1" },
                  { label: "Total PnL", value: defiData?.totalPnL ? `${Number(defiData.totalPnL).toFixed(3)}%` : "—",
                    color: (defiData?.totalPnL || 0) >= 0 ? "#00ffa3" : "#ff6b6b" },
                  { label: "Strategy", value: defiData?.strategy || "MOMENTUM", color: "#f59e0b" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px", padding: "14px",
                  }}>
                    <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1px", marginBottom: "6px" }}>{stat.label}</div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {defiData?.lastDecision && (
                <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)",
                  borderRadius: "8px", padding: "16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1px", marginBottom: "8px" }}>🧠 LAST AGENT DECISION</div>
                  <div style={{ fontSize: "13px", color: "#e2e8f0" }}>{defiData.lastDecision}</div>
                  {defiData?.nextAction && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#6366f1" }}>→ Next: {defiData.nextAction}</div>
                  )}
                </div>
              )}

              {/* Price History Chart */}
              {defiData?.priceHistory && defiData.priceHistory.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1px", marginBottom: "12px" }}>PRICE HISTORY</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "80px" }}>
                    {defiData.priceHistory.slice(-30).map((price, i, arr) => {
                      const min = Math.min(...arr);
                      const max = Math.max(...arr);
                      const h = max === min ? 50 : ((price - min) / (max - min)) * 70 + 10;
                      const isLatest = i === arr.length - 1;
                      return (
                        <div key={i} style={{
                          flex: 1, height: `${h}px`, borderRadius: "2px 2px 0 0",
                          background: isLatest ? "#00ffa3" : "rgba(99,102,241,0.5)",
                          transition: "height 0.3s ease",
                        }} title={`$${Number(price).toFixed(2)}`} />
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#475569", marginTop: "4px" }}>
                    <span>${Math.min(...defiData.priceHistory).toFixed(2)}</span>
                    <span>Latest: ${Number(defiData.currentPrice).toFixed(2)}</span>
                    <span>${Math.max(...defiData.priceHistory).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button onClick={async () => {
                  setLoading(true);
                  await fetch(`${API}/defi/swap`, { method: "POST", headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ action: "BUY", solAmount: 0.1 }) });
                  await fetchAll(); setLoading(false);
                  showNotification("Manual BUY executed");
                }} style={{
                  padding: "12px", borderRadius: "6px", border: "1px solid rgba(0,255,163,0.4)",
                  background: "rgba(0,255,163,0.08)", color: "#00ffa3", fontFamily: "inherit",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer",
                }}>⬆ Manual BUY 0.1 SOL</button>
                <button onClick={async () => {
                  setLoading(true);
                  await fetch(`${API}/defi/swap`, { method: "POST", headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ action: "SELL", solAmount: 0.1 }) });
                  await fetchAll(); setLoading(false);
                  showNotification("Manual SELL executed");
                }} style={{
                  padding: "12px", borderRadius: "6px", border: "1px solid rgba(255,107,107,0.4)",
                  background: "rgba(255,107,107,0.08)", color: "#ff6b6b", fontFamily: "inherit",
                  fontSize: "13px", fontWeight: "700", cursor: "pointer",
                }}>⬇ Manual SELL 0.1 SOL</button>
              </div>
            </div>

            {/* Trade History */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ margin: "0 0 6px", fontSize: "16px", color: "#f59e0b" }}>
                Trade History ({totalTrades})
              </h2>
              <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "12px" }}>
                Paper trading — prices are real from Jupiter API, execution is simulated in sandboxed environment
              </p>
              <div style={{ display: "grid", gap: "8px", maxHeight: "400px", overflowY: "auto" }}>
                {trades.slice().reverse().map((trade, i) => (
                  <div key={i} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "12px", alignItems: "center",
                    background: trade.action === "BUY" ? "rgba(0,255,163,0.04)" : "rgba(255,107,107,0.04)",
                    border: `1px solid ${trade.action === "BUY" ? "rgba(0,255,163,0.15)" : "rgba(255,107,107,0.15)"}`,
                    borderRadius: "6px", padding: "12px",
                  }}>
                    <span style={{
                      fontSize: "10px", fontWeight: "700", padding: "3px 10px", borderRadius: "4px",
                      background: trade.action === "BUY" ? "rgba(0,255,163,0.2)" : "rgba(255,107,107,0.2)",
                      color: trade.action === "BUY" ? "#00ffa3" : "#ff6b6b",
                    }}>{trade.action}</span>
                    <div>
                      <div style={{ fontSize: "12px", color: "#e2e8f0" }}>
                        {trade.action === "BUY" ? "Bought" : "Sold"} {trade.solAmount} SOL for {Number(trade.usdcAmount).toFixed(2)} USDC
                      </div>
                      {trade.signature && (
                        <div style={{ fontSize: "10px", color: "#475569", marginTop: "2px" }}>
                          Sig: {trade.signature.slice(0, 20)}...
                        </div>
                      )}
                      <div style={{ fontSize: "10px", color: "#475569" }}>{trade.timestamp}</div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "14px", fontWeight: "700",
                      color: trade.action === "BUY" ? "#00ffa3" : "#ff6b6b" }}>
                      ${Number(trade.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SDK TAB */}
        {activeTab === "sdk" && (
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "16px", color: "#06b6d4" }}>⟨⟩ AgentWalletSDK</h2>
              <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>
                The most important feature for the bounty: a standalone SDK that <strong style={{color:"#e2e8f0"}}>any AI agent framework
                can use outside the browser</strong>. LangChain tools, AutoGen agents, ElizaOS plugins, and custom Python/TypeScript
                scripts can all import this SDK and control the wallet programmatically.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                {[
                  { icon: "🔗", label: "LangChain", desc: "Use as a tool in LangChain agents" },
                  { icon: "🤖", label: "AutoGen", desc: "Wrap as AutoGen function tool" },
                  { icon: "⚡", label: "ElizaOS", desc: "Plugin for Eliza AI agents" },
                  { icon: "🐍", label: "Any Script", desc: "Import in any TS/JS program" },
                ].map(f => (
                  <div key={f.label} style={{
                    background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)",
                    borderRadius: "8px", padding: "14px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>{f.icon}</div>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#06b6d4", marginBottom: "4px" }}>{f.label}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "1.5px", marginBottom: "10px" }}>CODE EXAMPLE</div>
                <pre style={{
                  background: "#0d1117", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "8px",
                  padding: "20px", margin: 0, fontSize: "12px", lineHeight: "1.7",
                  color: "#e2e8f0", overflowX: "auto",
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  <code>{SDK_EXAMPLE}</code>
                </pre>
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                {[
                  { method: "getWalletInfo()", desc: "Get public key, balance, network" },
                  { method: "sendSOL(address, amount)", desc: "Transfer SOL to any address" },
                  { method: "sendMemo(message)", desc: "Write any text permanently on-chain" },
                  { method: "executeAgentDecision(decision)", desc: "Execute + record AI decision on-chain" },
                  { method: "requestAirdrop(amount)", desc: "Request devnet SOL airdrop" },
                  { method: "runAutonomousLoop(cycles)", desc: "Run fully autonomous decision loop" },
                  { method: "exportWallet()", desc: "Export wallet for use in other agents" },
                ].map(m => (
                  <div key={m.method} style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
                    background: "rgba(255,255,255,0.02)", borderRadius: "6px", padding: "10px 14px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <code style={{ fontSize: "12px", color: "#06b6d4" }}>{m.method}</code>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ON-CHAIN PROOF TAB */}
        {activeTab === "onchain" && (
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ margin: "0 0 8px", fontSize: "16px", color: "#f59e0b" }}>⛓ Verified On-Chain Transactions</h2>
              <p style={{ margin: "0 0 20px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>
                These are <strong style={{color:"#e2e8f0"}}>real transactions on Solana Devnet</strong>, permanently recorded and
                verifiable by anyone on Solana Explorer. The AI agent wrote its decisions directly to the blockchain
                using the <strong style={{color:"#f59e0b"}}>Solana Memo Program</strong> — an official Solana dApp/protocol.
              </p>

              <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
                {VERIFIED_TXS.map((tx, i) => (
                  <div key={i} style={{
                    background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: "10px", padding: "20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      marginBottom: "12px", gap: "12px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b", marginBottom: "4px" }}>{tx.label}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>{tx.desc}</div>
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "700", padding: "4px 10px", borderRadius: "4px",
                        background: "rgba(0,255,163,0.15)", color: "#00ffa3", flexShrink: 0 }}>
                        ✓ FINALIZED
                      </span>
                    </div>
                    <div style={{ background: "#0d1117", borderRadius: "6px", padding: "12px", marginBottom: "12px",
                      fontSize: "11px", color: "#64748b", wordBreak: "break-all", fontFamily: "monospace" }}>
                      {tx.sig}
                    </div>
                    <a href={`https://explorer.solana.com/tx/${tx.sig}?cluster=devnet`}
                      target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "8px 16px", borderRadius: "6px", textDecoration: "none",
                        background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
                        color: "#f59e0b", fontSize: "12px", fontWeight: "700", fontFamily: "inherit",
                      }}>
                      ⛓ Verify on Solana Explorer →
                    </a>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px", padding: "20px" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                  What is the Memo Program?
                </h3>
                <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>
                  The <strong style={{color:"#e2e8f0"}}>Solana Memo Program</strong> (Program ID: Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo)
                  is an official on-chain Solana program that allows any data to be permanently written to the blockchain.
                  It is used by real DeFi protocols to attach notes to transactions.
                </p>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>
                  Our AI agent uses it to <strong style={{color:"#f59e0b"}}>record every trading decision permanently on-chain</strong> —
                  creating an immutable audit trail of all autonomous agent actions. This proves real dApp/protocol interaction
                  as required by the bounty.
                </p>
              </div>
            </div>

            {/* Links */}
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px", padding: "24px" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "13px", color: "#64748b", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Project Links
              </h3>
              <div style={{ display: "grid", gap: "10px" }}>
                {[
                  { label: "GitHub Repository", url: "https://github.com/John-04/Solana-AI-Agent-Wallet", icon: "◈" },
                  { label: "Live Backend API", url: "https://solana-ai-agent-wallet.onrender.com", icon: "⬡" },
                  { label: "Frontend (this site)", url: "https://solana-ai-agent-wallet.vercel.app", icon: "◎" },
                ].map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px",
                    borderRadius: "8px", textDecoration: "none",
                    background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94a3b8", fontSize: "13px", transition: "all 0.2s",
                  }}>
                    <span style={{ color: "#00ffa3", fontSize: "16px" }}>{link.icon}</span>
                    <span style={{ flex: 1 }}>{link.label}</span>
                    <span style={{ color: "#475569", fontSize: "11px" }}>{link.url}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "40px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px" }}>
          <p style={{ margin: 0, fontSize: "11px", color: "#334155", letterSpacing: "1px" }}>
            Built for Superteam Nigeria DeFi Developer Challenge 2026 · Solana Devnet ·{" "}
            <a href="https://github.com/John-04/Solana-AI-Agent-Wallet" target="_blank" rel="noopener noreferrer"
              style={{ color: "#475569", textDecoration: "none" }}>GitHub</a>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,255,163,0.2); border-radius: 2px; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </div>
  );
}