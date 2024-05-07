use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct DonationInfo {
    // Identifier for finding the PDA
    pub identifier: u8,
    // Softcap
    pub softcap_amount: u64,
    // Hardcap
    pub hardcap_amount: u64,
    // Total donated amount
    pub donate_amount: u64,
    // Start time of donation
    pub start_time: u64,
    // End time of donation
    pub end_time: u64
}