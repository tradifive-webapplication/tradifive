UPDATE public.system_settings
SET value = jsonb_set(
  value,
  '{0,status}',
  '"approved"'::jsonb
),
updated_at = NOW()
WHERE id = 'ib_transfer_requests';

UPDATE public.profiles
SET activation_key = 'FIALGO-OXR8-9401-XAU1'
WHERE id = '473a891d-8f3c-4d38-b31b-2050c0ee82aa';

INSERT INTO public.mt5_accounts (
  user_id, account_number, broker_name, broker_server, is_active, is_connected, algo_status, balance, equity, currency, activation_key
) VALUES (
  '473a891d-8f3c-4d38-b31b-2050c0ee82aa',
  '414416991',
  'Vantage Markets',
  'Vantage Markets-Real',
  true,
  true,
  true,
  2000.0,
  2000.0,
  'USD',
  'FIALGO-OXR8-9401-XAU1'
);
