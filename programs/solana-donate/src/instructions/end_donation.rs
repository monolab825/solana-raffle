use anchor_lang::prelude::*;
use solana_program::{program::invoke_signed, system_instruction};

use crate::{state::*, constants::*, errors::*};

#[derive(Accounts)]
#[instruction(
    identifier: u8
)]
pub struct EndDonation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

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
        seeds = [DONATION_STATE_SEED, &identifier.to_le_bytes()],
        bump,
    )]
    pub donation_info: Box<Account<'info, DonationInfo>>,

    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump,
        address = global_state.vault
    )]
    /// CHECK: this should be set by admin
    pub vault: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [VAULT_STATE_SEED],
        bump,
        constraint = vault_state.is_initialized == true,
    )]
    pub vault_state: Account<'info, VaultState>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle(
    ctx: Context<EndDonation>, 
    amount: u64
) -> Result<()> {
    let accts = ctx.accounts;

    require!(accts.donation_info.donate_amount >= accts.donation_info.softcap_amount, DonationError::InsufficientSoftcap);

    invoke_signed(
        &system_instruction::transfer(
            &accts.vault.key(),
            &accts.authority.key(),
            amount
        ),
        &[
            accts.vault.to_account_info().clone(),
            accts.authority.to_account_info().clone(),
            accts.system_program.to_account_info().clone(),
        ],
        &[&[VAULT_SEED, &[ctx.bumps.vault]]],
    )?;

    Ok(())
}