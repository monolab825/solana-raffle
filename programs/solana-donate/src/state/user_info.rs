use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct UserInfo {
    // User address
    pub user: Pubkey,
    // Donation identifier
    pub identifier: u8,
    // Donated amount
    pub donate_amount: u64,
    // Donated time
    pub donate_time: u64,
}