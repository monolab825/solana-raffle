import * as anchor from "@project-serum/anchor";
import { Program, web3, BN } from "@project-serum/anchor";
import { SolanaDonate } from "../target/types/solana_donate";
import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  getAccount
} from "@solana/spl-token"; 
import { assert } from "chai";
import { 
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';

// BAB metadata - https://gateway.pinata.cloud/ipfs/QmbYunxDx4cpsf8KWdmDyiS8E41HW1QdBDLww3HUAyUgPP?_gl=1*1fecquc*_ga*MjA5NDM1ODAyMy4xNjU4MzI5NzY1*_ga_5RMPXG14TE*MTY3NTQyNDMxNC40LjEuMTY3NTQyNTU2OS4zNS4wLjA.

describe("solana_donate", () => {
  // Configure the client to use the local cluster.

  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaDonate as Program<SolanaDonate>;
  const PROGRAM_ID = program.programId;

  const WALLET_SEED = "WALLET_SEED";
  const DONATION_SEED = "DONATION_SEED";

  const myWallet = anchor.AnchorProvider.env().wallet;
  const payer = anchor.AnchorProvider.env().wallet as anchor.Wallet;
  const myPubkey = myWallet.publicKey;

  const pubkey1 = anchor.web3.Keypair.generate().publicKey;
  const pubkey2 = anchor.web3.Keypair.generate().publicKey;
  const TEN = new BN(10);
  const ONE = new BN(1);
  const TWO = new BN(2);

  const tokenTitle = "BuildABonkToken";
  const tokenSymbol = "BAB";
  const tokenUri = "https://gateway.pinata.cloud/ipfs/QmbYunxDx4cpsf8KWdmDyiS8E41HW1QdBDLww3HUAyUgPP?_gl=1*1fecquc*_ga*MjA5NDM1ODAyMy4xNjU4MzI5NzY1*_ga_5RMPXG14TE*MTY3NTQyNDMxNC40LjEuMTY3NTQyNTU2OS4zNS4wLjA.";
  const quoteTokenTitle = "USDC";
  const quoteTokenSymbol = "USDC";
  const quoteTokenUri = "https://gateway.pinata.cloud/ipfs/QmW1YL2G1oY4RCHD78rhYJ15PP2Qo4Vd17wX2CmZpmn2vv?_gl=1*1wwza3w*_ga*MjA5NDM1ODAyMy4xNjU4MzI5NzY1*_ga_5RMPXG14TE*MTY3NjQ2MzgzOC43LjEuMTY3NjQ2Mzg0OS40OS4wLjA.";

  const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const bABTokenPubkey = new PublicKey("FTiEdZ1fjNGTaHDgc7uwzMVFTKx1eDpDxR57Uhg6M4aK");
  const quoteTokenPubkey = new PublicKey("APaCo32kC5hkJVHotZv3uG3p3eZMCAvXRojqB9P7865v");
  const MINT_DECIMALS = 10 ** 9;

  const recipientWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const donationAuthorityPubkey = myPubkey;


  const getWalletPDA = async () => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(WALLET_SEED), myPubkey.toBuffer()],
        PROGRAM_ID
      )
    )[0];
  };

  const getDonationPDA = async (donationIdentifier: number) => {
    return (
      await PublicKey.findProgramAddressSync(
        [Buffer.from(DONATION_SEED), myPubkey.toBuffer(), Uint8Array.from([donationIdentifier])],
        PROGRAM_ID
      )
    )[0];
  };

  

  console.log(`My pubkey: ${myPubkey}`);
  console.log(`pubkey1: ${pubkey1}`);
  console.log(`pubkey2: ${pubkey2}`);

  it("Wallet account is initialized!", async () => {
    const walletPDA = await getWalletPDA();
    console.log(`Wallet account address: ${walletPDA}`);

    const tx = await program.methods
      .initializeWallet( )
      .accounts({
        walletDetails: walletPDA,
        authority: myPubkey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();
    console.log("Your transaction signature", tx);
  });

  it("Donation account 0 is initialized!", async () => {

    const walletPDA = await getWalletPDA();
    const donationPDA = await getDonationPDA( 0 );
    console.log(`Wallet address: ${walletPDA}`);
    console.log(`Donation address: ${donationPDA}`);

    const tx = await program.methods
      .CreateDonation( pubkey1, pubkey2, TEN, ONE, TWO )
      .accounts({
        walletDetails: walletPDA,
        donationDetails: donationPDA,
        authority: myPubkey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });
  it("Donation account 1 is initialized!", async () => {

    const walletPDA = await getWalletPDA();
    const donationPDA = await getDonationPDA( 1 );
    console.log(`Wallet address: ${walletPDA}`);
    console.log(`Donation address: ${donationPDA}`);

    const tx = await program.methods
      .CreateDonation( pubkey1, pubkey2, TEN, ONE, TWO )
      .accounts({
        walletDetails: walletPDA,
        donationDetails: donationPDA,
        authority: myPubkey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

  it("Edited donation account 1!", async () => {

    const donationPDA = await getDonationPDA( 1 );
    console.log(`Donation address: ${donationPDA}`);

    const tx = await program.methods
      .editDonation( 1, pubkey1, pubkey2, ONE, ONE, TEN )
      .accounts({
        donationDetails: donationPDA,
        authority: myPubkey
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

  it("Got accounts!", async () => {

    const walletPDA = await getWalletPDA();
    const donationPDA = await getDonationPDA( 1 );
    console.log(`Donation address: ${donationPDA}`);

    const walletAccounts = await program.account.walletDetails.all();
    const donationAccounts = await program.account.donationDetails.all();
    const donationAccount = await program.account.donationDetails.fetch(donationPDA);
    const allAccounts = await program.account;

    // const todoAccounts = await program.account.todoAccount.all([authorFilter(publicKey.toString())])

    // const incompleteTodos = useMemo(() => todos.filter((todo) => !todo.account.marked), [todos])
    // const completedTodos = useMemo(() => todos.filter((todo) => todo.account.marked), [todos])

    console.log(walletAccounts);
    console.log(donationAccounts);
    console.log(allAccounts);

  });

  /*

  it("Create an SPL Token!", async () => {

    const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];

    const sx = await program.methods.createToken(
      quoteTokenTitle, quoteTokenSymbol, quoteTokenUri
    )
      .accounts({
        metadataAccount: metadataAddress,
        mintAccount: mintKeypair.publicKey,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .signers([mintKeypair, payer.payer])
      .rpc();

    console.log("Success!");
        console.log(`   Mint Address: ${mintKeypair.publicKey}`);
        console.log(`   Tx Signature: ${sx}`);
  });

  it("Mint some tokens to your wallet!", async () => {

    const associatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: payer.publicKey,
    });

    const sx = await program.methods.mintTo(
      new anchor.BN(150)
    )
      .accounts({
        associatedTokenAccount: associatedTokenAccountAddress,
        mintAccount: mintKeypair.publicKey,
        mintAuthority: payer.publicKey,
        payer: payer.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      })
      .signers([payer.payer])
      .rpc();

    console.log("Success!");
        console.log(`   Mint Address: ${mintKeypair.publicKey}`);
        console.log(`   Tx Signature: ${sx}`);
  });
  */

  it("Mint 1M BAB tokens to your wallet!", async () => {

    const associatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: payer.publicKey,
    });

    const tx = await program.methods.mintTo(
      new anchor.BN(1000000 * MINT_DECIMALS)
    )
    .accounts({
      associatedTokenAccount: associatedTokenAccountAddress,
      mintAccount: bABTokenPubkey,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    })
    .signers([payer.payer])
    .rpc();

    console.log("Success!");
        console.log(`   Mint Address: ${bABTokenPubkey}`);
        console.log(`   Your BAB Token ATA: ${associatedTokenAccountAddress}`)
        console.log(`   Tx Signature: ${tx}`);
  });

  it("Mint 1M USDC tokens to your wallet!", async () => {

    const associatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: quoteTokenPubkey,
      owner: payer.publicKey,
    });

    const tx = await program.methods.mintTo(
      new anchor.BN(1000000 * MINT_DECIMALS)
    )
    .accounts({
      associatedTokenAccount: associatedTokenAccountAddress,
      mintAccount: quoteTokenPubkey,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    })
    .signers([payer.payer])
    .rpc();

    console.log("Success!");
        console.log(`   Mint Address: ${quoteTokenPubkey}`);
        console.log(`   Your USDC Token ATA: ${associatedTokenAccountAddress}`)
        console.log(`   Tx Signature: ${tx}`);
  });

  it("Deposit tokens to donation PDA 1!", async () => {

    const donationPDA = await getDonationPDA( 1 );

    console.log(`Donation address: ${donationPDA}`);

    console.log( `Mint: ${bABTokenPubkey}`)

    const fromAssociatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: payer.publicKey,
    });

    console.log(`From: ${fromAssociatedTokenAccountAddress}`);

    const toAssociatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: donationPDA,
    });

    console.log(`To: ${toAssociatedTokenAccountAddress}`);

    const sx = await program.methods.depositDonationTokens(
      new anchor.BN(150 * MINT_DECIMALS),
      1
    )
    .accounts({
      mintAccount: bABTokenPubkey,
      fromAssociatedTokenAccount: fromAssociatedTokenAccountAddress,
      fromAuthority: payer.publicKey,
      toAssociatedTokenAccount: toAssociatedTokenAccountAddress,
      donationDetailsPda: donationPDA,
      payer: payer.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    })
    .signers([payer.payer])
    .rpc();

    console.log("Success!");
        console.log(`   Mint Address: ${bABTokenPubkey}`);
        console.log(`   Tx Signature: ${sx}`);
  });

  it("Withdraw tokens from donation PDA 1!", async () => {

    const donationPDA = await getDonationPDA( 1 );

    console.log(`Donation address: ${donationPDA}`);

    console.log( `Mint: ${bABTokenPubkey}`)

    const fromAssociatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: donationPDA,
    });

    console.log(`From: ${fromAssociatedTokenAccountAddress}`);

    const toAssociatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: payer.publicKey,
    });

    console.log(`To: ${toAssociatedTokenAccountAddress}`);

    const sx = await program.methods.withdrawDonationTokens(
      new anchor.BN(150 * MINT_DECIMALS),
      1
    )
    .accounts({
      donationDetailsPda: donationPDA,
      mintAccount: bABTokenPubkey,
      donationAssociatedTokenAccount: fromAssociatedTokenAccountAddress,
      toAssociatedTokenAccount: toAssociatedTokenAccountAddress,
      recipient: payer.publicKey,
      authority: payer.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    })
    .signers([payer.payer])
    .rpc({skipPreflight: true});

    console.log("Success!");
        console.log(`   Mint Address: ${bABTokenPubkey}`);
        console.log(`   Tx Signature: ${sx}`);
  });


  it("Buy tokens from donation 1!", async () => {

    const donationPDA = await getDonationPDA( 1 );

    console.log(`Donation address: ${donationPDA}`);

    console.log( `Donation token mint: ${bABTokenPubkey}`);
    console.log( `Quote token mint: ${quoteTokenPubkey}`);

    // Quote token ATAs

    const buyerQuoteTokenAssociatedTokenAccount = await anchor.utils.token.associatedAddress({
      mint: quoteTokenPubkey,
      owner: myPubkey,
    });
    const donationQuoteTokenAssociatedTokenAccount = await anchor.utils.token.associatedAddress({
      mint: quoteTokenPubkey,
      owner: donationPDA,
    });

    // Donation token ATAs

    const buyerDonationTokenAssociatedTokenAccount = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: myPubkey,
    });
    const donationDonationTokenAssociatedTokenAccount = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: donationPDA,
    });


    const sx = await program.methods.buyDonationTokens(
      new anchor.BN(150 * MINT_DECIMALS),
      1,
      donationAuthorityPubkey
    )
    .accounts({
      quoteTokenMintAccount: quoteTokenPubkey,
      buyerQuoteTokenAssociatedTokenAccount: buyerQuoteTokenAssociatedTokenAccount,
      donationQuoteTokenAssociatedTokenAccount: donationQuoteTokenAssociatedTokenAccount,
      donationTokenMintAccount: bABTokenPubkey,
      buyerDonationTokenAssociatedTokenAccount: buyerDonationTokenAssociatedTokenAccount,
      donationDonationTokenAssociatedTokenAccount: donationDonationTokenAssociatedTokenAccount,
      donationDetailsPda: donationPDA,
      buyerAuthority: payer.publicKey,
      buyer: payer.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
    })
    .signers([payer.payer])
    .rpc();

    console.log("Success!");
    console.log(`   Tx Signature: ${sx}`);
  });

  /*

  it("Transfer some tokens to another wallet!", async () => {

    const fromAssociatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: payer.publicKey,
    });
    const toAssociatedTokenAccountAddress = await anchor.utils.token.associatedAddress({
      mint: bABTokenPubkey,
      owner: recipientWallet.publicKey,
    });

    const sx = await program.methods.transferTokens(
      new anchor.BN(150 * MINT_DECIMALS)
    )
      .accounts({
        mintAccount: bABTokenPubkey,
        fromAssociatedTokenAccount: fromAssociatedTokenAccountAddress,
        owner: payer.publicKey,
        toAssociatedTokenAccount: toAssociatedTokenAccountAddress,
        recipient: recipientWallet.publicKey,
        payer: payer.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      })
      .signers([payer.payer])
      .rpc();

    console.log("Success!");
        console.log(`   Mint Address: ${bABTokenPubkey}`);
        console.log(`   Tx Signature: ${sx}`);
  });
  */




  
});
