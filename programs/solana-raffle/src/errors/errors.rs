use anchor_lang::prelude::*;

// Not yet implemented

#[error_code]
pub enum RaffleError {
    #[msg("Raffle not started yet")]
    RaffleNotStarted,
    #[msg("Raffle already ended")]
    RaffleEnded,
    #[msg("Insufficent Softcap")]
    InsufficientSoftcap,
    #[msg("Insufficent Hardcap")]
    InsufficientHardcap,
}