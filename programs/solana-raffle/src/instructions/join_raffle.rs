use anchor_lang::prelude::*;
use solana_program::{program::invoke, system_instruction};
use std::mem::size_of;

use crate::{state::*, constants::*, errors::*};

#[derive(Accounts)]
#[instruction(identifier: u8)]
pub struct JoinRaffle<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: this should be checked with address in global_state
    pub authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED, authority.key().as_ref()],
        bump,
        has_one = authority,
        constraint = global_state.is_initialized == true,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [RAFFLE_STATE_SEED, &identifier.to_le_bytes()],
        bump,
    )]
    pub raffle_info: Box<Account<'info, RaffleInfo>>,

    #[account(
        init_if_needed,
        seeds = [USER_STATE_SEED, user.key().as_ref(), &identifier.to_le_bytes()],
        bump,
        space = 8 + size_of::<UserInfo>(),
        payer = user,
    )]
    pub user_info: Box<Account<'info, UserInfo>>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump,
        address = global_state.vault
    )]
    /// CHECK: this should be set by admin
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle(
    ctx: Context<JoinRaffle>, 
    identifier: u8,
    amount: u64,
) -> Result<()> {
    let accts = ctx.accounts;
    
    let cur_timestamp = Clock::get()?.unix_timestamp as u64;

    require!(cur_timestamp >= accts.raffle_info.start_time, RaffleError::RaffleNotStarted);
    require!(cur_timestamp <= accts.raffle_info.end_time, RaffleError::RaffleEnded);
    require!(accts.raffle_info.raffle_amount + amount <= accts.raffle_info.hardcap_amount, RaffleError::InsufficientHardcap);

    accts.user_info.user = accts.user.key();
    accts.user_info.identifier = identifier;
    accts.user_info.raffle_amount += amount;
    accts.user_info.raffle_time = cur_timestamp;
    
    accts.raffle_info.raffle_amount += amount;

    invoke(
        &system_instruction::transfer(
            &accts.user.key(),
            &accts.vault.key(),
            amount
        ),
        &[
            accts.user.to_account_info().clone(),
            accts.vault.clone(),
            accts.system_program.to_account_info().clone(),
        ],
    )?;
    
    msg!(
        "Raffle joined successfully : {}",
        accts.raffle_info.raffle_amount
    );

    Ok(())
}