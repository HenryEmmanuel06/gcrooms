-- New simple table to track each mail-button payment attempt
CREATE TABLE IF NOT EXISTS details_payment_attempts (
  id BIGSERIAL PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  send_details_id INTEGER NOT NULL REFERENCES send_details(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
  currency VARCHAR(10) DEFAULT 'NGN',
  payment_email VARCHAR(255) NOT NULL,
  paystack_ref VARCHAR(255),
  payment_uuid VARCHAR(36) NOT NULL,
  transaction_id VARCHAR(255),
  transaction_status VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  gateway_response TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_details_attempts_profile_id ON details_payment_attempts(profile_id);
CREATE INDEX IF NOT EXISTS idx_details_attempts_send_details_id ON details_payment_attempts(send_details_id);
CREATE INDEX IF NOT EXISTS idx_details_attempts_paystack_ref ON details_payment_attempts(paystack_ref);
CREATE UNIQUE INDEX IF NOT EXISTS idx_details_attempts_uuid ON details_payment_attempts(payment_uuid);
CREATE INDEX IF NOT EXISTS idx_details_attempts_status ON details_payment_attempts(payment_status);

-- Comment for clarity
COMMENT ON TABLE details_payment_attempts IS 'Tracks each click/payment attempt from the mail button for profile details access';


