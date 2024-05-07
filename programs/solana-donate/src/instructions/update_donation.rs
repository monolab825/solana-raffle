use anchor_lang::prelude::*;

use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
#[instruction(_identifier: u8)]
pub struct UpdateDonation<'info> {
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
        seeds = [DONATION_STATE_SEED, &_identifier.to_le_bytes()],
        bump,
    )]
    pub donation_info: Box<Account<'info, DonationInfo>>,
    
    // Must be included when initializing an account
    pub system_program: Program<'info, System>,
}

// Edit the details for a donation
pub fn handle(
    ctx: Context<UpdateDonation>,
    _identifier: u8,
    softcap_amount: u64,
    hardcap_amount: u64,
    start_time: u64,
    end_time: u64,
) -> Result<()> {
    let accts = ctx.accounts;

    accts.donation_info.softcap_amount = softcap_amount;
    accts.donation_info.hardcap_amount = hardcap_amount;
    accts.donation_info.start_time = start_time;
    accts.donation_info.end_time = end_time;

    msg!(
        "Donation has updated"
    );

    Ok(())
}