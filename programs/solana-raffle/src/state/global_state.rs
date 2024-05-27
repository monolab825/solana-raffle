use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GlobalState {
    // Admin authority
    pub authority: Pubkey,
    // Bool to avoid reinitialization attack
    pub is_initialized: bool,
    // Raffle stage
    pub raffle_stage: u8,
    // Treasury
    pub vault: Pubkey
}

#[account]
#[derive(Default)]
pub struct VaultState {
    // Bool to avoid reinitialization attack
    pub is_initialized: bool,
    // Treasury
    pub vault: Pubkey
}