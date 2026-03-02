import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import bs58 from "bs58";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export class WalletManager {
  private keypair: Keypair;
  private walletsDir: string;

  constructor() {
    this.walletsDir = path.join(process.cwd(), "wallets");
    if (!fs.existsSync(this.walletsDir)) {
      fs.mkdirSync(this.walletsDir, { recursive: true });
    }
    this.keypair = Keypair.generate();
  }

  createWallet(): { publicKey: string; privateKey: string } {
    const keypair = Keypair.generate();
    const walletData = {
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      createdAt: new Date().toISOString(),
    };

    const filePath = path.join(this.walletsDir, `${walletData.publicKey}.json`);
    fs.writeFileSync(filePath, JSON.stringify(walletData, null, 2));

    console.log(`✅ Wallet created: ${walletData.publicKey}`);
    return { publicKey: walletData.publicKey, privateKey: walletData.privateKey };
  }

  loadWallet(privateKey: string): Keypair {
    const secretKey = bs58.decode(privateKey);
    return Keypair.fromSecretKey(secretKey);
  }

  async getBalance(publicKey: string): Promise<number> {
    const pubKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubKey);
    return balance / LAMPORTS_PER_SOL;
  }

  async sendSOL(
    fromPrivateKey: string,
    toPublicKey: string,
    amount: number
  ): Promise<string> {
    const fromKeypair = this.loadWallet(fromPrivateKey);
    const toPublicKeyObj = new PublicKey(toPublicKey);
    const lamports = amount * LAMPORTS_PER_SOL;

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromKeypair,
    ]);

    console.log(`✅ Transaction sent: ${signature}`);
    return signature;
  }

  async requestAirdrop(publicKey: string, amount: number = 1): Promise<string> {
    try {
      const pubKey = new PublicKey(publicKey);
      const signature = await connection.requestAirdrop(
        pubKey,
        amount * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      console.log(`✅ Airdrop successful: ${signature}`);
      return signature;
    } catch (error) {
      console.log(`⚠️ Airdrop failed (use faucet.solana.com instead): ${publicKey}`);
      return "airdrop-skipped";
    }
  }
}