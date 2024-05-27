use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct UserInfo {
    // User address
    pub user: Pubkey,
    // Raffle identifier
    pub identifier: u8,
    // Raffle amount
    pub raffle_amount: u64,
    // Raffle time
    pub raffle_time: u64,
}