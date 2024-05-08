use anchor_lang::prelude::*;

use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct CreateDonation<'info> {
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
        init_if_needed,
        seeds = [DONATION_STATE_SEED, &global_state.donation_stage.to_le_bytes()],
        bump,
        space = 8 + std::mem::size_of::<DonationInfo>(),
        payer = authority,
    )]
    pub donation_info: Box<Account<'info, DonationInfo>>,

    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<CreateDonation>,
    softcap_amount:u64,
    hardcap_amount:u64,
    start_time: u64,
    end_time: u64
) -> Result<()> {    
    let accts = ctx.accounts;

    accts.donation_info.identifier = accts.global_state.donation_stage;
    accts.donation_info.softcap_amount = softcap_amount;
    accts.donation_info.hardcap_amount = hardcap_amount;
    accts.donation_info.donate_amount = 0;
    accts.donation_info.start_time = start_time;
    accts.donation_info.end_time = end_time;

    accts.global_state.donation_stage += 1;
    
    msg!(
        "Donation has created : {}",
        accts.donation_info.start_time
    );

    Ok(())
}