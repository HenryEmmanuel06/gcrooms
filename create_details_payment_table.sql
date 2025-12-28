-- Create details_payment table to track payments for profile details access
CREATE TABLE IF NOT EXISTS details_payment (
  id BIGSERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  send_details_id INTEGER NOT NULL REFERENCES send_details(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  currency VARCHAR(10) DEFAULT 'NGN',
  payment_email VARCHAR(255) NOT NULL,
  paystack_ref VARCHAR(255) UNIQUE,
  transaction_id VARCHAR(255),
  transaction_status VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  gateway_response TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_details_payment_profile_id ON details_payment(profile_id);
CREATE INDEX IF NOT EXISTS idx_details_payment_send_details_id ON details_payment(send_details_id);
CREATE INDEX IF NOT EXISTS idx_details_payment_paystack_ref ON details_payment(paystack_ref);
CREATE INDEX IF NOT EXISTS idx_details_payment_status ON details_payment(payment_status);

-- Add comment to table
COMMENT ON TABLE details_payment IS 'Tracks payments made by profile owners to access contact details';

