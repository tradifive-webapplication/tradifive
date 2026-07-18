-- Add balance column to broker_connections so we can cache the last fetched broker balance
ALTER TABLE broker_connections ADD COLUMN IF NOT EXISTS balance NUMERIC DEFAULT 0;
ALTER TABLE broker_connections ADD COLUMN IF NOT EXISTS api_secret TEXT;
