import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000";

export default function App() {
  const [agentWallet, setAgentWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newWallet, setNewWallet] = useState(null);
  const [balanceCheck, setBalanceCheck] = useState(null);
  const [balanceInput, setBalanceInput] = useState("");
  const [status, setStatus] = useState("Checking connection...");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchAgentWallet();
    fetchHistory();
    const interval = setInterval(() => {
      fetchAgentWallet();
      fetchHistory();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      await axios.get(`${API}/`);
      setConnected(true);
      setStatus("Connected to AI Agent");
    } catch {
      setConnected(false);
      setStatus("Disconnected - Start the backend server");
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

  const triggerAction = async () => {
    setLoading(true);
    try {
      await axios.post(`${API}/agent/act`);
      await fetchAgentWallet();
      await fetchHistory();
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
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
    } catch (e) {
      alert("Invalid address or network error");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🤖 AI Agent Wallet</h1>
        <p style={styles.subtitle}>Autonomous DeFi Wallet on Solana Devnet</p>
        <span style={{ ...styles.badge, background: connected ? "#00ff88" : "#ff4444", color: "#000" }}>
          {status}
        </span>
      </div>

      {/* Agent Wallet Card */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>🧠 Agent Wallet</h2>
        {agentWallet ? (
          <>
            <p style={styles.label}>Public Key</p>
            <p style={styles.mono}>{agentWallet.publicKey}</p>
            <p style={styles.label}>Balance</p>
            <p style={styles.balance}>{agentWallet.balance} SOL</p>
          </>
        ) : (
          <p style={styles.muted}>Loading agent wallet...</p>
        )}
        <button style={styles.button} onClick={triggerAction} disabled={loading}>
          {loading ? "⏳ Processing..." : "⚡ Trigger Autonomous Action"}
        </button>
      </div>

      {/* Create Wallet */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>➕ Create New Wallet</h2>
        <button style={styles.buttonSecondary} onClick={createWallet} disabled={loading}>
          {loading ? "⏳ Creating..." : "🔑 Generate Wallet"}
        </button>
        {newWallet && (
          <div style={styles.result}>
            <p style={styles.label}>Public Key</p>
            <p style={styles.mono}>{newWallet.publicKey}</p>
            <p style={styles.label}>Private Key</p>
            <p style={styles.mono}>{newWallet.privateKey}</p>
          </div>
        )}
      </div>

      {/* Balance Checker */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>💰 Check Any Wallet Balance</h2>
        <input
          style={styles.input}
          placeholder="Enter Solana public key..."
          value={balanceInput}
          onChange={(e) => setBalanceInput(e.target.value)}
        />
        <button style={styles.button} onClick={checkBalance} disabled={loading}>
          Check Balance
        </button>
        {balanceCheck && (
          <div style={styles.result}>
            <p style={styles.label}>Balance</p>
            <p style={styles.balance}>{balanceCheck.balance} SOL</p>
          </div>
        )}
      </div>

      {/* Action History */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📝 Agent Action History ({history.length})</h2>
        {history.length === 0 ? (
          <p style={styles.muted}>No actions yet. Trigger an action above.</p>
        ) : (
          [...history].reverse().map((action, i) => (
            <div key={i} style={styles.historyItem}>
              <span style={styles.actionBadge}>{action.type}</span>
              <span style={styles.muted}>{new Date(action.timestamp).toLocaleString()}</span>
              <p style={styles.mono}>{action.result}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: "0 auto", padding: "20px", fontFamily: "monospace", background: "#0a0a0a", minHeight: "100vh", color: "#fff" },
  header: { textAlign: "center", marginBottom: 30 },
  title: { fontSize: 32, margin: 0, color: "#00ff88" },
  subtitle: { color: "#888", marginTop: 8 },
  badge: { padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold" },
  card: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24, marginBottom: 20 },
  cardTitle: { margin: "0 0 16px", color: "#00ff88", fontSize: 18 },
  label: { color: "#888", fontSize: 12, margin: "12px 0 4px" },
  mono: { background: "#1a1a1a", padding: "8px 12px", borderRadius: 6, fontSize: 12, wordBreak: "break-all", margin: 0 },
  balance: { fontSize: 28, fontWeight: "bold", color: "#00ff88", margin: 0 },
  button: { background: "#00ff88", color: "#000", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", marginTop: 12, width: "100%" },
  buttonSecondary: { background: "#1a1a1a", color: "#00ff88", border: "1px solid #00ff88", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", marginTop: 12, width: "100%" },
  input: { width: "100%", padding: "10px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, color: "#fff", fontSize: 12, marginBottom: 8, boxSizing: "border-box" },
  result: { background: "#1a1a1a", borderRadius: 8, padding: 12, marginTop: 12 },
  historyItem: { borderBottom: "1px solid #222", paddingBottom: 12, marginBottom: 12 },
  actionBadge: { background: "#00ff88", color: "#000", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold", marginRight: 8 },
  muted: { color: "#555", fontSize: 13 },
};