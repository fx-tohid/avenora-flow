-- Avenor Flow — Teams & Weekly Leaderboard schema.
--
-- Design notes:
-- * Lifetime XP stays 100% local (AsyncStorage), untouched by this migration.
--   Only WEEKLY team XP is tracked here — the two are intentionally separate
--   (see AGENTS.md / spec section 9).
-- * A user can belong to at most one team at a time: team_members.user_id is
--   UNIQUE, so the database itself — not just app logic — makes a second
--   simultaneous membership impossible.
-- * Every write to teams / team_members / competitions / xp_events /
--   competition_results / team_challenges goes through a SECURITY DEFINER
--   RPC function below. Direct INSERT/UPDATE/DELETE from the client is
--   revoked, so the client can never set its own XP, rank, or team_id by
--   hand — only these functions can, and they only ever act on auth.uid().
--
-- Run this whole file once in the Supabase SQL Editor (Project > SQL Editor
-- > New query > paste > Run).

-- ============================================================================
-- TABLES
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Adventurer',
  avatar_emoji text not null default '🙂',
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 40),
  emoji text not null default '🛡️',
  owner_id uuid not null references public.profiles (id),
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- One row per member. UNIQUE(user_id) is what actually enforces "one active
-- team at a time" — not just a check in application code.
create table if not exists public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade unique,
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

-- One row per team per weekly period.
create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  unique (team_id, period_start)
);

-- Only one ACTIVE competition per team at a time.
create unique index if not exists one_active_competition_per_team
  on public.competitions (team_id)
  where status = 'active';

-- The XP ledger. This is the only source of truth for weekly/team XP —
-- the leaderboard is always a sum over this table, never a client-supplied
-- total.
create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  client_completion_id text not null,
  amount int not null check (amount between 1 and 500),
  source text not null default 'task_completion',
  occurred_on date not null,
  created_at timestamptz not null default now(),
  -- One event per (user, local completion): resubmitting the same
  -- completion (retry, replay, or a client bug) is a no-op, not double XP.
  unique (user_id, client_completion_id)
);

create index if not exists xp_events_competition_idx on public.xp_events (competition_id);
create index if not exists xp_events_team_idx on public.xp_events (team_id);
create index if not exists xp_events_user_idx on public.xp_events (user_id);

-- Frozen final standings, written once per competition by finalize_competition().
create table if not exists public.competition_results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null unique references public.competitions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  winner_user_id uuid references public.profiles (id),
  standings jsonb not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

create index if not exists competition_results_team_idx on public.competition_results (team_id);

-- Cooperative weekly team challenge, one per competition.
create table if not exists public.team_challenges (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null unique references public.competitions (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  target_xp int not null default 5000,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.competitions enable row level security;
alter table public.xp_events enable row level security;
alter table public.competition_results enable row level security;
alter table public.team_challenges enable row level security;

-- Helper: the caller's current team, or null. SECURITY DEFINER so it can
-- read team_members without recursing back through team_members' own RLS
-- policy (which itself calls this function).
create or replace function public.my_team_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select team_id from public.team_members where user_id = auth.uid();
$$;

grant execute on function public.my_team_id() to authenticated;

-- profiles: see yourself and your current teammates only.
create policy "profiles_select_self_or_teammate" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or id in (select user_id from public.team_members where team_id = public.my_team_id())
  );

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- teams / team_members / competitions / xp_events / competition_results /
-- team_challenges: read-only for the client. Every write happens inside a
-- SECURITY DEFINER function below.
create policy "teams_select_own" on public.teams
  for select to authenticated
  using (id = public.my_team_id());

create policy "team_members_select_own_team" on public.team_members
  for select to authenticated
  using (team_id = public.my_team_id());

create policy "competitions_select_own_team" on public.competitions
  for select to authenticated
  using (team_id = public.my_team_id());

create policy "xp_events_select_own_team" on public.xp_events
  for select to authenticated
  using (team_id = public.my_team_id());

create policy "competition_results_select_own_team" on public.competition_results
  for select to authenticated
  using (team_id = public.my_team_id());

create policy "team_challenges_select_own_team" on public.team_challenges
  for select to authenticated
  using (team_id = public.my_team_id());

-- Lock down direct writes: only SELECT is granted on these tables. Every
-- mutation goes through a SECURITY DEFINER RPC (below), which runs with the
-- table owner's privileges regardless of these grants.
revoke insert, update, delete on
  public.teams, public.team_members, public.competitions,
  public.xp_events, public.competition_results, public.team_challenges
  from authenticated;

grant select on
  public.teams, public.team_members, public.competitions,
  public.xp_events, public.competition_results, public.team_challenges
  to authenticated;

grant select, update on public.profiles to authenticated;

-- ============================================================================
-- NEW USER -> PROFILE
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Adventurer'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- WEEKLY COMPETITION LIFECYCLE
-- ============================================================================

-- Freezes standings for a competition, records the winner, marks it
-- completed. Called automatically by ensure_active_competition() once a
-- period has ended — never called directly by the client.
create or replace function public.finalize_competition(p_competition_id uuid)
returns public.competition_results
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comp public.competitions;
  v_result public.competition_results;
  v_standings jsonb;
  v_winner uuid;
begin
  select * into v_comp from public.competitions where id = p_competition_id and status = 'active' for update;
  if not found then
    raise exception 'Competition not found or already finalized.';
  end if;

  select coalesce(jsonb_agg(row_to_json(s) order by s.xp desc), '[]'::jsonb)
  into v_standings
  from (
    select
      p.id as user_id,
      p.display_name,
      p.avatar_emoji,
      coalesce(sum(e.amount), 0)::int as xp
    from public.team_members tm
    join public.profiles p on p.id = tm.user_id
    left join public.xp_events e on e.competition_id = v_comp.id and e.user_id = tm.user_id
    where tm.team_id = v_comp.team_id
    group by p.id, p.display_name, p.avatar_emoji
  ) s;

  select (elem ->> 'user_id')::uuid into v_winner
  from jsonb_array_elements(v_standings) elem
  order by (elem ->> 'xp')::int desc
  limit 1;

  update public.competitions set status = 'completed' where id = v_comp.id;

  insert into public.competition_results (competition_id, team_id, winner_user_id, standings, period_start, period_end)
  values (v_comp.id, v_comp.team_id, v_winner, v_standings, v_comp.period_start, v_comp.period_end)
  returning * into v_result;

  return v_result;
end;
$$;

-- Returns the team's current active competition, finalizing an expired one
-- and starting the next automatically if needed. This is the one place
-- "the weekly reset" happens — called on join/create and before every XP
-- submission, and safe to call from the client any time (e.g. opening the
-- Teams screen) to promptly surface a just-finished week.
create or replace function public.ensure_active_competition(p_team_id uuid)
returns public.competitions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comp public.competitions;
  v_has_active boolean;
  v_start date;
  v_end date;
begin
  if p_team_id is null or p_team_id <> public.my_team_id() then
    raise exception 'Not your team.';
  end if;

  select * into v_comp from public.competitions where team_id = p_team_id and status = 'active';
  v_has_active := v_comp.id is not null;

  if v_has_active and v_comp.period_end <= now()::date then
    perform public.finalize_competition(v_comp.id);
    v_has_active := false;
  end if;

  if v_has_active then
    return v_comp;
  end if;

  v_start := date_trunc('week', now())::date;
  v_end := v_start + 7;

  insert into public.competitions (team_id, period_start, period_end, status)
  values (p_team_id, v_start, v_end, 'active')
  returning * into v_comp;

  insert into public.team_challenges (competition_id, team_id, target_xp)
  values (v_comp.id, p_team_id, 5000);

  return v_comp;
end;
$$;

-- Checks whether the just-inserted XP event pushed the team challenge over
-- its target, and records completed_at exactly once if so.
create or replace function public.check_team_challenge_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
begin
  select coalesce(sum(amount), 0) into v_total from public.xp_events where competition_id = new.competition_id;

  update public.team_challenges
  set completed_at = now()
  where competition_id = new.competition_id
    and completed_at is null
    and v_total >= target_xp;

  return new;
end;
$$;

drop trigger if exists on_xp_event_check_challenge on public.xp_events;
create trigger on_xp_event_check_challenge
  after insert on public.xp_events
  for each row execute function public.check_team_challenge_completion();

-- ============================================================================
-- TEAM MANAGEMENT RPCs
-- ============================================================================

create or replace function public.create_team(p_name text, p_emoji text default '🛡️')
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.teams;
  v_code text;
begin
  if exists (select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'Leave your current team before creating a new one.';
  end if;

  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.teams where invite_code = v_code);
  end loop;

  insert into public.teams (name, emoji, owner_id, invite_code)
  values (trim(p_name), coalesce(nullif(trim(p_emoji), ''), '🛡️'), auth.uid(), v_code)
  returning * into v_team;

  insert into public.team_members (team_id, user_id) values (v_team.id, auth.uid());

  perform public.ensure_active_competition(v_team.id);

  return v_team;
end;
$$;

create or replace function public.join_team_by_code(p_code text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.teams;
  v_count int;
begin
  if exists (select 1 from public.team_members where user_id = auth.uid()) then
    raise exception 'Leave your current team before joining another.';
  end if;

  select * into v_team from public.teams where invite_code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'Invite code not found.';
  end if;

  select count(*) into v_count from public.team_members where team_id = v_team.id;
  if v_count >= 4 then
    raise exception 'This team is full (4/4 members).';
  end if;

  insert into public.team_members (team_id, user_id) values (v_team.id, auth.uid());

  -- If the team had been abandoned (0 members), the joiner becomes owner.
  if v_count = 0 then
    update public.teams set owner_id = auth.uid() where id = v_team.id;
    select * into v_team from public.teams where id = v_team.id;
  end if;

  perform public.ensure_active_competition(v_team.id);

  return v_team;
end;
$$;

create or replace function public.leave_team()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_is_owner boolean;
  v_next_member uuid;
begin
  select team_id into v_team_id from public.team_members where user_id = auth.uid();
  if v_team_id is null then
    raise exception 'You are not in a team.';
  end if;

  select (owner_id = auth.uid()) into v_is_owner from public.teams where id = v_team_id;

  delete from public.team_members where user_id = auth.uid();

  if v_is_owner then
    select user_id into v_next_member
    from public.team_members
    where team_id = v_team_id
    order by joined_at asc
    limit 1;

    if v_next_member is not null then
      update public.teams set owner_id = v_next_member where id = v_team_id;
    end if;
  end if;
end;
$$;

create or replace function public.remove_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
begin
  if p_user_id = auth.uid() then
    raise exception 'Use leave_team() to remove yourself.';
  end if;

  select id into v_team_id from public.teams where id = public.my_team_id() and owner_id = auth.uid();
  if v_team_id is null then
    raise exception 'Only the team owner can remove members.';
  end if;

  delete from public.team_members where team_id = v_team_id and user_id = p_user_id;
end;
$$;

create or replace function public.update_team(p_name text, p_emoji text)
returns public.teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.teams;
begin
  update public.teams set
    name = coalesce(nullif(trim(p_name), ''), name),
    emoji = coalesce(nullif(trim(p_emoji), ''), emoji)
  where id = public.my_team_id() and owner_id = auth.uid()
  returning * into v_team;

  if not found then
    raise exception 'Only the team owner can update the team.';
  end if;

  return v_team;
end;
$$;

create or replace function public.regenerate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_team_id uuid;
begin
  select id into v_team_id from public.teams where id = public.my_team_id() and owner_id = auth.uid();
  if v_team_id is null then
    raise exception 'Only the team owner can regenerate the invite code.';
  end if;

  loop
    v_code := upper(substr(md5(random()::text), 1, 6));
    exit when not exists (select 1 from public.teams where invite_code = v_code);
  end loop;

  update public.teams set invite_code = v_code where id = v_team_id;
  return v_code;
end;
$$;

-- ============================================================================
-- XP SUBMISSION (the only path that can write to xp_events)
-- ============================================================================

create or replace function public.submit_xp_event(
  p_client_completion_id text,
  p_amount int,
  p_occurred_on date
)
returns public.xp_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_comp public.competitions;
  v_event public.xp_events;
  v_amount int;
begin
  v_team_id := public.my_team_id();
  if v_team_id is null then
    raise exception 'You are not in a team.';
  end if;

  -- Never trust the client's raw amount: clamp to the same bounds the app's
  -- own clampXp() enforces locally (src/game/xp.ts: MIN_XP=1, MAX_XP=500).
  v_amount := greatest(1, least(500, p_amount));

  v_comp := public.ensure_active_competition(v_team_id);

  insert into public.xp_events (user_id, team_id, competition_id, client_completion_id, amount, occurred_on)
  values (auth.uid(), v_team_id, v_comp.id, p_client_completion_id, v_amount, p_occurred_on)
  on conflict (user_id, client_completion_id) do nothing
  returning * into v_event;

  return v_event; -- null means this completion was already submitted (safe no-op)
end;
$$;

grant execute on function public.create_team(text, text) to authenticated;
grant execute on function public.join_team_by_code(text) to authenticated;
grant execute on function public.leave_team() to authenticated;
grant execute on function public.remove_member(uuid) to authenticated;
grant execute on function public.update_team(text, text) to authenticated;
grant execute on function public.regenerate_invite_code() to authenticated;
grant execute on function public.submit_xp_event(text, int, date) to authenticated;
grant execute on function public.ensure_active_competition(uuid) to authenticated;

-- ============================================================================
-- READ-ONLY VIEW: live weekly leaderboard
-- ============================================================================

-- security_invoker means this view runs with the QUERYING user's RLS, not
-- the view owner's — without it the view would silently bypass every policy
-- above and leak every team's data to every user.
create or replace view public.team_leaderboard
  with (security_invoker = true) as
select
  tm.team_id,
  p.id as user_id,
  p.display_name,
  p.avatar_emoji,
  c.id as competition_id,
  c.period_start,
  c.period_end,
  coalesce(sum(e.amount), 0)::int as weekly_xp
from public.team_members tm
join public.profiles p on p.id = tm.user_id
join public.competitions c on c.team_id = tm.team_id and c.status = 'active'
left join public.xp_events e on e.user_id = tm.user_id and e.competition_id = c.id
group by tm.team_id, p.id, p.display_name, p.avatar_emoji, c.id, c.period_start, c.period_end;

grant select on public.team_leaderboard to authenticated;
