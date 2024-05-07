use anchor_lang::prelude::*;

// Not yet implemented

#[error_code]
pub enum DonationError {
    #[msg("Donation not started yet")]
    DonationNotStarted,
    #[msg("Donation already ended")]
    DonationEnded,
    #[msg("Insufficent Softcap")]
    InsufficientSoftcap,
    #[msg("Insufficent Hardcap")]
    InsufficientHardcap,
}