use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("7BhKkim3e5Cfb8Krd4Sa82CvZ557t4kZfLVGfwrP76aR");
#[program]
pub mod solana_raffle {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handle(ctx)
    }

    pub fn update_auth(ctx: Context<UpdateAuth>) -> Result<()> {
        update_auth::handle(ctx)
    }

    pub fn update_config(ctx: Context<UpdateConfig>, is_initialized: bool) -> Result<()> {
        update_config::handle(ctx, is_initialized)
    }

    pub fn create_raffle(
        ctx: Context<CreateRaffle>,
        softcap_amount:u64,
        hardcap_amount:u64,
        start_time: u64,
        end_time: u64
    ) -> Result<()> {
        create_raffle::handle(
            ctx,
            softcap_amount,
            hardcap_amount,
            start_time,
            end_time
        )
    }

    pub fn update_raffle(
        ctx: Context<UpdateRaffle>,
        identifier: u8,
        softcap_amount: u64,
        hardcap_amount: u64,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        update_raffle::handle(
            ctx,
            identifier,
            softcap_amount,
            hardcap_amount,
            start_time,
            end_time
        )
    }

    pub fn join_raffle(
        ctx: Context<JoinRaffle>, 
        identifier: u8,
        amount: u64,
    ) -> Result<()> {
        join_raffle::handle(
            ctx,
            identifier,
            amount
        )
    }

    pub fn end_raffle(
        ctx: Context<EndRaffle>,
        _identifier: u8,
        amount: u64
    ) -> Result<()> {
        end_raffle::handle(
            ctx,
            _identifier,
            amount
        )
    }
}






