-- Durable fixed-window rate limiting for public serverless endpoints. Only the
-- service role can consume counters; raw IP addresses and e-mails are never
-- stored because the API sends HMAC fingerprints.

begin;

create table if not exists public.api_rate_limits (
  scope text not null,
  key_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (scope, key_hash)
);

create index if not exists api_rate_limits_window_start_idx
on public.api_rate_limits (window_start);

alter table public.api_rate_limits enable row level security;
revoke all on table public.api_rate_limits from anon, authenticated;
grant select, insert, update, delete on table public.api_rate_limits to service_role;

create or replace function public.consume_rate_limit(
  p_scope text,
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window timestamptz;
  v_count integer;
begin
  if p_scope !~ '^[a-z0-9_]{1,80}$'
    or p_key_hash !~ '^[a-f0-9]{64}$'
    or p_limit < 1
    or p_limit > 10000
    or p_window_seconds < 1
    or p_window_seconds > 604800 then
    raise exception 'Invalid rate-limit parameters';
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_rate_limits as limits (
    scope,
    key_hash,
    window_start,
    request_count
  )
  values (p_scope, p_key_hash, v_window, 1)
  on conflict (scope, key_hash) do update
  set
    request_count = case
      when limits.window_start = excluded.window_start then limits.request_count + 1
      else 1
    end,
    window_start = excluded.window_start
  returning request_count into v_count;

  delete from public.api_rate_limits
  where window_start < v_now - interval '8 days';

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer) from public;
revoke all on function public.consume_rate_limit(text, text, integer, integer) from anon;
revoke all on function public.consume_rate_limit(text, text, integer, integer) from authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;

commit;
