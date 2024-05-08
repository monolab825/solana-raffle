use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("G2tD9mUeKEQEfdTMseQqgxK7JrGB4DaJVbWZoYfRFgGK");
#[program]
pub mod solana_donate {
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

    pub fn create_donation(
        ctx: Context<CreateDonation>,
        softcap_amount:u64,
        hardcap_amount:u64,
        start_time: u64,
        end_time: u64
    ) -> Result<()> {
        create_donation::handle(
            ctx,
            softcap_amount,
            hardcap_amount,
            start_time,
            end_time
        )
    }

    pub fn update_donation(
        ctx: Context<UpdateDonation>,
        identifier: u8,
        softcap_amount: u64,
        hardcap_amount: u64,
        start_time: u64,
        end_time: u64,
    ) -> Result<()> {
        update_donation::handle(
            ctx,
            identifier,
            softcap_amount,
            hardcap_amount,
            start_time,
            end_time
        )
    }

    pub fn join_donation(
        ctx: Context<JoinDonation>, 
        identifier: u8,
        amount: u64,
    ) -> Result<()> {
        join_donation::handle(
            ctx,
            identifier,
            amount
        )
    }

    pub fn end_donation(
        ctx: Context<EndDonation>,
        _identifier: u8,
        amount: u64
    ) -> Result<()> {
        end_donation::handle(
            ctx,
            _identifier,
            amount
        )
    }
}






