use crate::{constants::*, state::*};
use anchor_lang::prelude::*;
use solana_program::{program::invoke, system_instruction};
use std::mem::size_of;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        seeds = [GLOBAL_STATE_SEED, authority.key().as_ref()],
        bump,
        space = 8 + size_of::<GlobalState>(),
        payer = authority,
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump
    )]
    /// CHECK: this should be set by admin
    pub vault: AccountInfo<'info>,
    
    #[account(
        init_if_needed,
        seeds = [VAULT_STATE_SEED],
        bump,
        space = 8 + size_of::<VaultState>(),
        payer = authority,
    )]
    pub vault_state: Account<'info, VaultState>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle(ctx: Context<Initialize>) -> Result<()> {
    let accts = ctx.accounts;
    accts.global_state.authority = accts.authority.key();
    accts.global_state.is_initialized = true;
    accts.global_state.donation_stage = 0;
    accts.global_state.vault = accts.vault.key();
    
    accts.vault_state.is_initialized = true;
    accts.vault_state.vault = accts.vault.key();

    let rent = Rent::default();
    let required_lamports = rent
        .minimum_balance(0)
        .max(1)
        .saturating_sub(accts.vault.to_account_info().lamports());

    msg!(
        "required lamports = {:?}", 
        required_lamports
    );
    
    invoke(
        &system_instruction::transfer(
            &accts.authority.key(),
            &accts.vault.key(),
            required_lamports,
        ),
        &[
            accts.authority.to_account_info().clone(),
            accts.vault.clone(),
            accts.system_program.to_account_info().clone(),
        ],
    )?;
    
    Ok(())
}
