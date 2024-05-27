import * as anchor from "@project-serum/anchor";
import { Program, web3, BN } from "@project-serum/anchor";
import { SolanaRaffle } from "../target/types/solana_raffle";
import { PublicKey } from "@solana/web3.js";

describe("solana_raffle", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaRaffle as Program<SolanaRaffle>;
  const PROGRAM_ID = program.programId;

  const GLOBAL_STATE_SEED = "GLOBAL_STATE_SEED";
  const RAFFLE_STATE_SEED = "RAFFLE_STATE_SEED";
  const USER_STATE_SEED = "USER_STATE_SEED";
  const VAULT_SEED = "VAULT_SEED";
  const VAULT_STATE_SEED = "VAULT_STATE_SEED";

  const myWallet = provider.wallet;
  const payer = provider.wallet as anchor.Wallet;
  const myPubkey = myWallet.publicKey;

  const myKeypair = anchor.web3.Keypair.generate();
  const keypair1 = anchor.web3.Keypair.generate();
  const keypair2 = anchor.web3.Keypair.generate();

  const HUNDRED = new BN(100000000000);
  const THOUSAND = new BN(1000000000000);

  const INIT_TIME = "2020-05-19T05:00:00-04:00";
  const START_TIME = "2024-05-1T05:00:00-04:00";
  const END_TIME = "2024-06-19T05:00:00-04:00";
  const DEAD_TIME = "2024-12-31:00:00-04:00";

  const getGlobalPDA = async (owner: PublicKey) => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(GLOBAL_STATE_SEED), owner.toBuffer()],
        PROGRAM_ID
      )
    )[0];
  };

  const getRafflePDA = async (raffleIdentifier: number) => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(RAFFLE_STATE_SEED), Uint8Array.from([raffleIdentifier])],
        PROGRAM_ID
      )
    )[0];

    // // Convert the u64 integer to a Buffer or Uint8Array of 8 bytes
    // const idBuffer = Buffer.alloc(8);
    // idBuffer.writeBigUInt64LE(BigInt(raffleIdentifier)); // Using BigInt to handle u64

    // // Combine the seeds with the idBuffer
    // const seeds = [Buffer.from(RAFFLE_STATE_SEED), idBuffer];

    // const [rafflePDA] = await PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);

    // return rafflePDA;
  };

  const getUserPDA = async (user: PublicKey, raffleIdentifier: number) => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(USER_STATE_SEED), user.toBuffer(), Uint8Array.from([raffleIdentifier])],
        PROGRAM_ID
      )
    )[0];

    // // Convert the u64 integer to a Buffer or Uint8Array of 8 bytes
    // const idBuffer = Buffer.alloc(8);
    // idBuffer.writeBigUInt64LE(BigInt(raffleIdentifier)); // Using BigInt to handle u64

    // // Combine the seeds with the idBuffer
    // const seeds = [Buffer.from(USER_STATE_SEED),  user.toBuffer(), idBuffer];

    // const [userPDA] = await PublicKey.findProgramAddressSync(seeds, PROGRAM_ID);

    // return userPDA;
  };

  const getVaultPDA = async () => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(VAULT_SEED)],
        PROGRAM_ID
      )
    )[0];
  };

  const getVaultSPDA = async () => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(VAULT_STATE_SEED)],
        PROGRAM_ID
      )
    )[0];
  };

  const airdropSol = async (
    provider: anchor.AnchorProvider,
    target: PublicKey,
    lamps: number
  ): Promise<string> => {
    try {
      const sig: string = await provider.connection.requestAirdrop(target, lamps);
      await provider.connection.confirmTransaction(sig);
      return sig;
    } catch (e) {
      console.error("Airdrop failed:", e);
      throw e;
    }
  };

  console.log(`My pubkey: ${myPubkey}`);
  console.log(`pubkey0: ${myKeypair.publicKey}`);
  console.log(`pubkey1: ${keypair1.publicKey}`);
  console.log(`pubkey2: ${keypair2.publicKey}`);

  let globalPDA = null;
  let myGlobalPDA = null;
  let rafflePDA0 = null;
  let rafflePDA1 = null;
  let rafflePDA2 = null;
  let rafflePDA3 = null;
  let userPDA0 = null;
  let userPDA1 = null;
  let vaultPDA = null;
  let vaultSPDA = null;

  it("Global account is initialized!", async () => {
    globalPDA = await getGlobalPDA(myPubkey);
    vaultPDA = await getVaultPDA();
    vaultSPDA = await getVaultSPDA();
    console.log(`globalPDA: ${globalPDA}`);
    console.log(`vaultPDA: ${vaultPDA}`);
    console.log(`vaultSPDA: ${vaultSPDA}`);

    await airdropSol(provider, myKeypair.publicKey, 100000000000);
    await airdropSol(provider, keypair1.publicKey, 10000000000);
    await airdropSol(provider, keypair2.publicKey, 10000000000);

    const tx = await program.methods
      .initialize()
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        vault: vaultPDA,
        vaultState: vaultSPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Contract is initialied by owner", tx);
  });

  it("Raffle 0 is initialized!", async () => {
    rafflePDA0 = await getRafflePDA(0);
    console.log(`Raffle address: ${rafflePDA0}`);

    const tx = await program.methods
      .createRaffle(HUNDRED, THOUSAND, new BN(new Date(START_TIME).getTime() / 1000), new BN(new Date(END_TIME).getTime() / 1000))
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA0,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Raffle 0 is created by owner", tx);

    const globalInfo = await program.account.globalState.fetchNullable(globalPDA) as any;
    console.log(`globalInfo: ${globalInfo.raffleStage}`);
  });

  it("Raffle 1 is initialized!", async () => {
    rafflePDA1 = await getRafflePDA(1);
    console.log(`Raffle address: ${rafflePDA1}`);

    const tx = await program.methods
      .createRaffle(HUNDRED, THOUSAND, new BN(new Date(START_TIME).getTime() / 1000), new BN(new Date(END_TIME).getTime() / 1000))
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA1,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Raffle 1 is created by owner", tx);
    let balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);

    const globalInfo = await program.account.globalState.fetchNullable(globalPDA) as any;
    console.log(`globalInfo: ${globalInfo.raffleStage}`);
  });

  it("Raffle 2 is initialized!", async () => {
    rafflePDA2 = await getRafflePDA(2);
    console.log(`Raffle address: ${rafflePDA2}`);

    const tx = await program.methods
      .createRaffle(HUNDRED, THOUSAND, new BN(new Date(START_TIME).getTime() / 1000), new BN(new Date(END_TIME).getTime() / 1000))
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA2,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Raffle 2 is created by owner", tx);
    let balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);

    const globalInfo = await program.account.globalState.fetchNullable(globalPDA) as any;
    console.log(`globalInfo: ${globalInfo.raffleStage}`);
  });

  it("Raffle 3 is initialized!", async () => {
    rafflePDA3 = await getRafflePDA(3);
    console.log(`Raffle address: ${rafflePDA3}`);

    const tx = await program.methods
      .createRaffle(HUNDRED, THOUSAND, new BN(new Date(START_TIME).getTime() / 1000), new BN(new Date(END_TIME).getTime() / 1000))
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA3,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Raffle 3 is created by owner", tx);
    let balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);

    const globalInfo = await program.account.globalState.fetchNullable(globalPDA) as any;
    console.log(`globalInfo: ${globalInfo.raffleStage}`);
  });

  it("Raffle 1 is updated!", async () => {
    const tx = await program.methods
      .updateRaffle(1, new BN(0), HUNDRED, new BN(new Date(INIT_TIME).getTime() / 1000), new BN(new Date(DEAD_TIME).getTime() / 1000))
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA1,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Raffle 1 is updated by owner", tx);
  });

  it("Raffle 0 joining", async () => {
    userPDA0 = await getUserPDA(keypair1.publicKey, 0);
    userPDA1 = await getUserPDA(keypair2.publicKey, 0);
    console.log(`User address 0: ${userPDA0}`);
    console.log(`User address 1: ${userPDA1}`);

    let tx = await program.methods
      .joinRaffle(0, new BN(1000000000))
      .accounts({
        user: keypair1.publicKey,
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA0,
        userInfo: userPDA0,
        vault: vaultPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([keypair1])
      .rpc();

    console.log("User 0 joined raffle 0", tx);
    let balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);

    tx = await program.methods
      .joinRaffle(0, new BN(1000000000))
      .accounts({
        user: keypair2.publicKey,
        authority: myPubkey,
        globalState: globalPDA,
        raffleInfo: rafflePDA0,
        userInfo: userPDA1,
        vault: vaultPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([keypair2])
      .rpc();

    console.log("User 1 joined raffle 0", tx);
    balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);
  });

  it("Raffle 0 is disabled!", async () => {
    myGlobalPDA = await getGlobalPDA(myKeypair.publicKey);
    console.log(`My global PDA: ${myGlobalPDA}`);

    let tx = await program.methods
      .initialize()
      .accounts({
        authority: myKeypair.publicKey,
        globalState: myGlobalPDA,
        vault: vaultPDA,
        vaultState: vaultSPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([myKeypair])
      .rpc();
    console.log("Another contract is initialized by dev", tx);

    tx = await program.methods
      .createRaffle(new BN(0), new BN(0), new BN(new Date(INIT_TIME).getTime() / 1000), new BN(new Date(DEAD_TIME).getTime() / 1000))
      .accounts({
        authority: myKeypair.publicKey,
        globalState: myGlobalPDA,
        raffleInfo: rafflePDA0,        
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([myKeypair])
      .rpc();

    console.log("Another raffle 0 is created by dev", tx);

    tx = await program.methods
      .updateConfig(false)
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        vaultState: vaultSPDA,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Config is updated by dev", tx);

    // tx = await program.methods
    //   .endRaffle(0, new BN(2000000000))
    //   .accounts({
    //     authority: myPubkey,
    //     globalState: globalPDA,
    //     raffleInfo: rafflePDA0,
    //     vault: vaultPDA,
    //     vaultState: vaultSPDA,
    //     systemProgram: web3.SystemProgram.programId,
    //   })
    //   .rpc();

    // console.log("Raffle 0 is ended by owner", tx);

    let balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);
  });

  it("Raffle 0 ended", async () => {  
    let balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);

    let tx = await program.methods
      .updateConfig(true)
      .accounts({
        authority: myPubkey,
        globalState: globalPDA,
        vaultState: vaultSPDA,        
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

  console.log("Config is updated by dev", tx);

    tx = await program.methods
      .endRaffle(0, new BN(2000000000))
      .accounts({
        authority: myKeypair.publicKey,
        globalState: myGlobalPDA,
        raffleInfo: rafflePDA0,
        vault: vaultPDA,
        vaultState: vaultSPDA,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([myKeypair])
      .rpc();

    console.log("Raffle 0 is ended by dev", tx);

    balance = await provider.connection.getBalance(vaultPDA);
    console.log(`Vault balance: ${balance}`);
  });
});
