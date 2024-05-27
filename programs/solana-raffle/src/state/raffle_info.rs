use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct RaffleInfo {
    // Identifier for finding the PDA
    pub identifier: u8,
    // Softcap
    pub softcap_amount: u64,
    // Hardcap
    pub hardcap_amount: u64,
    // Total raffle amount
    pub raffle_amount: u64,
    // Start time of raffle
    pub start_time: u64,
    // End time of raffle
    pub end_time: u64
}