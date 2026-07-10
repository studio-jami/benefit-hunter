-- Per-user color token overrides. Stored as a JSON object keyed by
-- token name (accent, gold, ok, cat-devops, neutral, etc.) with
-- { l, c, h } OKLCH values. Empty = use defaults from tokens.css.

alter table public.hunter_user_state
  add column if not exists accents jsonb not null default '{}'::jsonb;
