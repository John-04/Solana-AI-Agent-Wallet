import React, { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "https://solana-ai-agent-wallet.onrender.com";

export default function App() {
  const [agentWallet, setAgentWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newWallet, setNewWallet] = useState(null);
  const [balanceCheck, setBalanceCheck] = useState(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [status, setStatus] = useState("Checking connection...");
  const [connected, setConnected] = useState(false);
  const [defiState, setDefiState] = useState(null);
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState("agent");
  const [solPrice, setSolPrice] = useState(null);
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchAgentWallet(),
      fetchHistory(),
      fetchDefiState(),
      fetchTrades(),
      fetchPrice(),
    ]);
  };

  const checkConnection = async () => {
    try {
      await axios.get(`${API}/`);
      setConnected(true);
      setStatus("Connected to AI Agent");
    } catch {
      setConnected(false);
      setStatus("Disconnected");
    }
  };

  const fetchAgentWallet = async () => {
    try {
      const res = await axios.get(`${API}/agent/wallet`);
      setAgentWallet(res.data);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/agent/history`);
      setHistory(res.data);
    } catch {}
  };

  const fetchDefiState = async () => {
    try {
      const res = await axios.get(`${API}/defi/state`);
      setDefiState(res.data);
    } catch {}
  };

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`${API}/defi/trades`);
      setTrades(res.data);
    } catch {}
  };

  const fetchPrice = async () => {
    try {
      const res = await axios.get(`${API}/defi/price`);
      setSolPrice(res.data.price);
    } catch {}
  };

  const triggerAction = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/agent/act`);
      await fetchAll();
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/defi/analyze`);
      await fetchDefiState();
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const triggerSwap = async (action) => {
    setSwapLoading(true);
    try {
      await axios.post(`${API}/defi/swap`, { action, amount: 0.1 });
      await fetchAll();
    } catch (e) {
      alert("Error: " + e.message);
    }
    setSwapLoading(false);
  };

  const createWallet = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/wallet/create`);
      setNewWallet(res.data);
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  const checkBalance = async () => {
    if (!balanceInput) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/wallet/balance/${balanceInput}`);
      setBalanceCheck(res.data);
    } catch {
      alert("Invalid address or network error");
    }
    setLoading(false);
  };

  const getSignalColor = (signal) => {
    if (!signal) return "#888";
    if (signal.includes("BUY")) return "#00ff88";
    if (signal.includes("SELL")) return "#ff4444";
    return "#ffaa00";
  };

  const formatPrice = (p) => p ? `$${parseFloat(p).toFixed(2)}` : "Loading...";
  const shortKey = (key) => key ? `${key.slice(0, 8)}...${key.slice(-8)}` : "";

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <h1 style={s.title}>🤖 AI Agent Wallet</h1>
          <span style={{ ...s.badge, background: connected ? "#00ff88" : "#ff4444", color: "#000" }}>
            ● {status}
          </span>
        </div>
        <p style={s.subtitle}>Autonomous DeFi Agent on Solana Devnet</p>

        {/* Stats Bar */}
        <div style={s.statsBar}>
          <div style={s.stat}>
            <span style={s.statLabel}>SOL Price</span>
            <span style={s.statValue}>{formatPrice(solPrice)}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Agent Balance</span>
            <span style={s.statValue}>{agentWallet ? `${parseFloat(agentWallet.balance).toFixed(4)} SOL` : "..."}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Total Trades</span>
            <span style={s.statValue}>{trades.length}</span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Strategy PnL</span>
            <span style={{ ...s.statValue, color: defiState?.totalPnL >= 0 ? "#00ff88" : "#ff4444" }}>
              {defiState ? `${defiState.totalPnL.toFixed(2)}%` : "..."}
            </span>
          </div>
          <div style={s.stat}>
            <span style={s.statLabel}>Actions Taken</span>
            <span style={s.statValue}>{history.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {["agent", "defi", "wallets"].map(tab => (
            <button
              key={tab}
              style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "agent" ? "🤖 Agent" : tab === "defi" ? "📈 DeFi Strategy" : "👛 Wallets"}
            </button>
          ))}
        </div>
      </div>

      {/* AGENT TAB */}
      {activeTab === "agent" && (
        <div>
          <div style={s.card}>
            <h2 style={s.cardTitle}>🧠 Agent Wallet</h2>
            {agentWallet ? (
              <>
                <div style={s.row}>
                  <div style={s.col}>
                    <p style={s.label}>Public Key</p>
                    <p style={s.mono}>{agentWallet.publicKey}</p>
                  </div>
                  <div style={{ ...s.col, textAlign: "right" }}>
                    <p style={s.label}>Balance</p>
                    <p style={s.bigNum}>{parseFloat(agentWallet.balance).toFixed(4)} SOL</p>
                    <p style={{ color: "#888", fontSize: 13 }}>
                      ≈ {solPrice ? `$${(agentWallet.balance * solPrice).toFixed(2)}` : "..."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p style={s.muted}>Loading agent wallet...</p>
            )}
            <button style={s.btnGreen} onClick={triggerAction} disabled={loading}>
              {loading ? "⏳ Processing..." : "⚡ Trigger Autonomous Action"}
            </button>
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>📝 Autonomous Action History ({history.length})</h2>
            {history.length === 0 ? (
              <p style={s.muted}>No actions yet.</p>
            ) : (
              [...history].reverse().map((action, i) => (
                <div key={i} style={s.historyItem}>
                  <div style={s.historyHeader}>
                    <span style={s.actionBadge}>{action.type}</span>
                    <span style={s.muted}>{new Date(action.timestamp).toLocaleString()}</span>
                  </div>
                  <p style={s.mono}>{action.result}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* DEFI TAB */}
      {activeTab === "defi" && (
        <div>
          {/* Strategy Status */}
          <div style={s.card}>
            <div style={s.row}>
              <h2 style={s.cardTitle}>📈 DeFi Strategy Engine</h2>
              <span style={{
                ...s.badge,
                background: defiState?.isActive ? "#00ff88" : "#ff4444",
                color: "#000",
                alignSelf: "center"
              }}>
                {defiState?.isActive ? "● ACTIVE" : "● STOPPED"}
              </span>
            </div>

            {defiState && (
              <>
                <div style={s.strategyGrid}>
                  <div style={s.stratCard}>
                    <p style={s.label}>Current SOL Price</p>
                    <p style={s.bigNum}>{formatPrice(defiState.currentPrice)}</p>
                  </div>
                  <div style={s.stratCard}>
                    <p style={s.label}>Entry Price</p>
                    <p style={s.bigNum}>{defiState.entryPrice > 0 ? formatPrice(defiState.entryPrice) : "No position"}</p>
                  </div>
                  <div style={s.stratCard}>
                    <p style={s.label}>Total PnL</p>
                    <p style={{ ...s.bigNum, color: defiState.totalPnL >= 0 ? "#00ff88" : "#ff4444" }}>
                      {defiState.totalPnL.toFixed(3)}%
                    </p>
                  </div>
                  <div style={s.stratCard}>
                    <p style={s.label}>Strategy</p>
                    <p style={s.bigNum}>{defiState.strategy}</p>
                  </div>
                </div>

                <div style={s.decisionBox}>
                  <p style={s.label}>🧠 Last Decision</p>
                  <p style={{ ...s.mono, color: getSignalColor(defiState.lastDecision), marginBottom: 12 }}>
                    {defiState.lastDecision}
                  </p>
                  <p style={s.label}>⏭️ Next Action</p>
                  <p style={{ ...s.mono, color: "#ffaa00" }}>{defiState.nextAction}</p>
                </div>

                {/* Price History Mini Chart */}
                {defiState.priceHistory && defiState.priceHistory.length > 1 && (
                  <div style={s.chartContainer}>
                    <p style={s.label}>📊 Price History</p>
                    <div style={s.chart}>
                      {defiState.priceHistory.map((p, i) => {
                        const prices = defiState.priceHistory.map(x => x.price);
                        const min = Math.min(...prices);
                        const max = Math.max(...prices);
                        const range = max - min || 1;
                        const height = ((p.price - min) / range) * 60 + 10;
                        const isLast = i === defiState.priceHistory.length - 1;
                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                            <div style={{
                              width: "80%",
                              height: `${height}px`,
                              background: isLast ? "#00ff88" : "#1a4a2e",
                              borderRadius: "2px 2px 0 0",
                              marginTop: "auto",
                              transition: "height 0.3s"
                            }} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={s.chartLabels}>
                      <span>{formatPrice(Math.min(...defiState.priceHistory.map(p => p.price)))}</span>
                      <span>Latest: {formatPrice(defiState.currentPrice)}</span>
                      <span>{formatPrice(Math.max(...defiState.priceHistory.map(p => p.price)))}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            <div style={s.btnRow}>
              <button style={s.btnGreen} onClick={triggerAnalysis} disabled={loading}>
                🔍 Analyze Market Now
              </button>
              <button style={{ ...s.btnGreen, background: "#00aaff" }} onClick={() => triggerSwap("BUY")} disabled={swapLoading}>
                📈 Manual BUY 0.1 SOL
              </button>
              <button style={{ ...s.btnGreen, background: "#ff6644" }} onClick={() => triggerSwap("SELL")} disabled={swapLoading}>
                📉 Manual SELL 0.1 SOL
              </button>
            </div>
          </div>

          {/* Trade History */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>🔄 Trade History ({trades.length})</h2>
            {trades.length === 0 ? (
              <p style={s.muted}>No trades yet. Strategy is analyzing market...</p>
            ) : (
              [...trades].reverse().map((trade, i) => (
                <div key={i} style={s.historyItem}>
                  <div style={s.historyHeader}>
                    <span style={{
                      ...s.actionBadge,
                      background: trade.action === "BUY" ? "#00ff88" : "#ff4444"
                    }}>
                      {trade.action === "BUY" ? "📈 BUY" : "📉 SELL"}
                    </span>
                    <span style={s.muted}>{new Date(trade.timestamp).toLocaleString()}</span>
                    <span style={{ color: "#00ff88", fontSize: 13 }}>@ {formatPrice(trade.price)}</span>
                  </div>
                  <p style={s.mono}>
                    {trade.action === "BUY"
                      ? `Bought ${trade.outputAmount.toFixed(4)} SOL for ${trade.inputAmount.toFixed(2)} USDC`
                      : `Sold ${trade.inputAmount.toFixed(4)} SOL for ${trade.outputAmount.toFixed(2)} USDC`
                    }
                  </p>
                  <p style={{ ...s.mono, color: "#555", fontSize: 11 }}>
                    Sig: {trade.signature?.slice(0, 40)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* WALLETS TAB */}
      {activeTab === "wallets" && (
        <div>
          <div style={s.card}>
            <h2 style={s.cardTitle}>➕ Create New Wallet</h2>
            <button style={s.btnOutline} onClick={createWallet} disabled={loading}>
              {loading ? "⏳ Creating..." : "🔑 Generate New Wallet"}
            </button>
            {newWallet && (
              <div style={s.resultBox}>
                <p style={s.label}>Public Key</p>
                <p style={s.mono}>{newWallet.publicKey}</p>
                <p style={s.label}>Private Key</p>
                <p style={s.mono}>{newWallet.privateKey}</p>
              </div>
            )}
          </div>

          <div style={s.card}>
            <h2 style={s.cardTitle}>💰 Check Any Wallet Balance</h2>
            <input
              style={s.input}
              placeholder="Enter any Solana public key..."
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
            />
            <button style={s.btnGreen} onClick={checkBalance} disabled={loading}>
              Check Balance
            </button>
            {balanceCheck && (
              <div style={s.resultBox}>
                <p style={s.label}>Address: {shortKey(balanceCheck.publicKey)}</p>
                <p style={s.bigNum}>{balanceCheck.balance} SOL</p>
                {solPrice && (
                  <p style={{ color: "#888" }}>≈ ${(balanceCheck.balance * solPrice).toFixed(2)} USD</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={s.footer}>
        <p>🔗 Backend: <a href={API} style={{ color: "#00ff88" }} target="_blank">{API}</a></p>
        <p>📁 GitHub: <a href="https://github.com/John-04/Solana-AI-Agent-Wallet" style={{ color: "#00ff88" }} target="_blank">Solana-AI-Agent-Wallet</a></p>
        <p style={{ color: "#333", marginTop: 8 }}>Built for Superteam Nigeria DeFi Developer Challenge 2026</p>
      </div>
    </div>
  );
}

const s = {
  container: { maxWidth: 900, margin: "0 auto", padding: "20px", fontFamily: "monospace", background: "#050505", minHeight: "100vh", color: "#fff" },
  header: { marginBottom: 24 },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  title: { fontSize: 28, margin: 0, color: "#00ff88" },
  subtitle: { color: "#555", margin: "0 0 16px", fontSize: 13 },
  badge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  statsBar: { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  stat: { background: "#111", border: "1px solid #222", borderRadius: 8, padding: "10px 16px", flex: 1, minWidth: 120 },
  statLabel: { color: "#555", fontSize: 11, display: "block", marginBottom: 4 },
  statValue: { color: "#00ff88", fontSize: 16, fontWeight: "bold" },
  tabs: { display: "flex", gap: 8, marginBottom: 0 },
  tab: { padding: "8px 20px", background: "#111", border: "1px solid #222", borderRadius: "8px 8px 0 0", color: "#555", cursor: "pointer", fontSize: 13 },
  tabActive: { background: "#1a1a1a", borderBottom: "1px solid #1a1a1a", color: "#00ff88", borderColor: "#333" },
  card: { background: "#111", border: "1px solid #222", borderRadius: "0 12px 12px 12px", padding: 24, marginBottom: 16 },
  cardTitle: { margin: "0 0 16px", color: "#00ff88", fontSize: 16 },
  label: { color: "#555", fontSize: 11, margin: "12px 0 4px", textTransform: "uppercase", letterSpacing: 1 },
  mono: { background: "#0a0a0a", padding: "8px 12px", borderRadius: 6, fontSize: 11, wordBreak: "break-all", margin: 0, color: "#aaa" },
  bigNum: { fontSize: 24, fontWeight: "bold", color: "#00ff88", margin: 0 },
  muted: { color: "#333", fontSize: 13 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 },
  col: { flex: 1 },
  btnGreen: { background: "#00ff88", color: "#000", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", marginTop: 12, width: "100%", fontSize: 13 },
  btnOutline: { background: "transparent", color: "#00ff88", border: "1px solid #00ff88", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", marginTop: 12, width: "100%", fontSize: 13 },
  btnRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  input: { width: "100%", padding: "10px 12px", background: "#0a0a0a", border: "1px solid #222", borderRadius: 8, color: "#fff", fontSize: 12, marginBottom: 8, boxSizing: "border-box" },
  resultBox: { background: "#0a0a0a", borderRadius: 8, padding: 12, marginTop: 12 },
  historyItem: { borderBottom: "1px solid #1a1a1a", paddingBottom: 12, marginBottom: 12 },
  historyHeader: { display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" },
  actionBadge: { background: "#00ff88", color: "#000", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" },
  strategyGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 },
  stratCard: { background: "#0a0a0a", borderRadius: 8, padding: 12, border: "1px solid #1a1a1a" },
  decisionBox: { background: "#0a0a0a", borderRadius: 8, padding: 16, marginBottom: 16, border: "1px solid #1a1a1a" },
  chartContainer: { marginBottom: 16 },
  chart: { display: "flex", alignItems: "flex-end", height: 80, gap: 2, background: "#0a0a0a", borderRadius: 8, padding: "8px 8px 0", border: "1px solid #1a1a1a" },
  chartLabels: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#444", marginTop: 4 },
  footer: { textAlign: "center", padding: "24px 0", borderTop: "1px solid #1a1a1a", fontSize: 12, color: "#444", marginTop: 24 },
};