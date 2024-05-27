use anchor_lang::prelude::*;

use crate::state::*;
use crate::constants::*;

#[derive(Accounts)]
pub struct CreateRaffle<'info> {
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
        seeds = [RAFFLE_STATE_SEED, &global_state.raffle_stage.to_le_bytes()],
        bump,
        space = 8 + std::mem::size_of::<RaffleInfo>(),
        payer = authority,
    )]
    pub raffle_info: Box<Account<'info, RaffleInfo>>,

    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<CreateRaffle>,
    softcap_amount:u64,
    hardcap_amount:u64,
    start_time: u64,
    end_time: u64
) -> Result<()> {    
    let accts = ctx.accounts;

    accts.raffle_info.identifier = accts.global_state.raffle_stage;
    accts.raffle_info.softcap_amount = softcap_amount;
    accts.raffle_info.hardcap_amount = hardcap_amount;
    accts.raffle_info.raffle_amount = 0;
    accts.raffle_info.start_time = start_time;
    accts.raffle_info.end_time = end_time;

    accts.global_state.raffle_stage += 1;
    
    msg!(
        "Raffle has created : {}",
        accts.raffle_info.start_time
    );

    Ok(())
}