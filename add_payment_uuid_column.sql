-- Add UUID column to details_payment table for reliable payment lookup
ALTER TABLE details_payment 
ADD COLUMN IF NOT EXISTS payment_uuid VARCHAR(36);

-- Create unique index on payment_uuid for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_details_payment_uuid ON details_payment(payment_uuid);

-- Add comment
COMMENT ON COLUMN details_payment.payment_uuid IS 'Unique UUID identifier for payment record lookup';

