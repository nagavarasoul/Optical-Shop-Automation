-- ==========================================================================
-- VS Lens Mart: database security (grants + forced row-level security)
-- Applied by `npm run db:migrate` after the table migrations, as vslm_owner.
-- Safe to re-run: every statement replaces what it creates.
--
-- How it works (CLAUDE.md "Data security"):
--   * The browser never connects. Server code connects as vslm_app and runs each
--     request inside withRole() (src/lib/db.ts), which sets app.role to
--     'public', 'staff' or 'admin' for that transaction only.
--   * Every table has row-level security ENABLED and FORCED, so even the owner
--     is filtered. A request with no app.role counts as 'public'.
--   * Better Auth's tables are reachable only by vslm_auth.
-- ==========================================================================

-- ---------- Helpers ----------
create or replace function app_role() returns text
language sql stable as $$
  select coalesce(nullif(current_setting('app.role', true), ''), 'public')
$$;

create or replace function app_is_staff() returns boolean
language sql stable as $$ select app_role() in ('staff', 'admin') $$;

-- ---------- Grants ----------
revoke all on schema public from public;
grant usage on schema public to vslm_app, vslm_auth;

-- The website user: data rights on app tables only (row-level security narrows them).
grant select, insert, update, delete on
  branches, branch_closures, brands, colours, frames, frame_images, lenses,
  eye_camps, camp_photos, gallery_photos, testimonials, appointments, enquiries
to vslm_app;
grant execute on function app_role(), app_is_staff() to vslm_app;

-- Login tables: only Better Auth's user. vslm_app gets nothing on them.
revoke all on "user", "session", "account", "verification" from vslm_app;
grant select, insert, update, delete on "user", "session", "account", "verification" to vslm_auth;

-- ---------- Row-level security: enable and force on every table ----------
do $$
declare t text;
begin
  foreach t in array array[
    'branches','branch_closures','brands','colours','frames','frame_images','lenses',
    'eye_camps','camp_photos','gallery_photos','testimonials','appointments','enquiries',
    'user','session','account','verification'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
  end loop;
end $$;

-- Drops every policy on a table, so this file can redefine them cleanly.
create or replace function pg_temp.reset_policies(tbl text) returns void
language plpgsql as $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = tbl loop
    execute format('drop policy %I on %I', p.policyname, tbl);
  end loop;
end $$;

-- ---------- Public content: anyone reads visible rows; staff write; admin deletes ----------
-- read_rule: what the public may see. Staff and admin see everything.
do $$
declare
  r record;
begin
  for r in select * from (values
    ('branches',        'is_visible'),
    ('branch_closures', 'true'),
    ('brands',          'true'),
    ('colours',         'true'),
    ('frames',          'status = ''approved'' and is_active'),
    ('frame_images',    'exists (select 1 from frames f where f.id = frame_id and f.status = ''approved'' and f.is_active)'),
    ('lenses',          'is_active'),
    ('eye_camps',       'is_visible'),
    ('camp_photos',     'exists (select 1 from eye_camps c where c.id = camp_id and c.is_visible)'),
    ('gallery_photos',  'is_visible'),
    ('testimonials',    'is_visible')
  ) as v(tbl, read_rule) loop
    perform pg_temp.reset_policies(r.tbl);
    execute format('create policy read on %I for select using (app_is_staff() or (%s))', r.tbl, r.read_rule);
    execute format('create policy staff_insert on %I for insert with check (app_is_staff())', r.tbl);
    execute format('create policy staff_update on %I for update using (app_is_staff()) with check (app_is_staff())', r.tbl);
    execute format('create policy admin_delete on %I for delete using (app_role() = ''admin'')', r.tbl);
  end loop;
end $$;

-- Frame photos: staff remove and reorder photos while editing a frame (Requirements_Admin.md 6.2).
-- Deleting the whole frame stays admin-only (frames' admin_delete policy).
create policy staff_delete on frame_images for delete using (app_is_staff());

-- Branch details and closed days: only the admin changes them (Requirements_Admin.md 7.1).
drop policy staff_insert on branches;
drop policy staff_update on branches;
create policy admin_insert on branches for insert with check (app_role() = 'admin');
create policy admin_update on branches for update using (app_role() = 'admin') with check (app_role() = 'admin');
drop policy staff_insert on branch_closures;
drop policy staff_update on branch_closures;
create policy admin_insert on branch_closures for insert with check (app_role() = 'admin');
create policy admin_update on branch_closures for update using (app_role() = 'admin') with check (app_role() = 'admin');

-- ---------- Private: bookings and enquiries ----------
-- Public: insert only, as a new row. No select, so it can't read anything back
-- (the server generates the id and reference itself and inserts without RETURNING).
select pg_temp.reset_policies('appointments');
create policy public_insert on appointments for insert
  with check (status = 'booked' and consent_at is not null);
create policy staff_read on appointments for select using (app_is_staff());
create policy staff_update on appointments for update using (app_is_staff()) with check (app_is_staff());
create policy admin_delete on appointments for delete using (app_role() = 'admin');

select pg_temp.reset_policies('enquiries');
create policy public_insert on enquiries for insert
  with check (status = 'new' and consent_at is not null);
create policy staff_read on enquiries for select using (app_is_staff());
create policy staff_update on enquiries for update using (app_is_staff()) with check (app_is_staff());
create policy admin_delete on enquiries for delete using (app_role() = 'admin');

-- ---------- Login tables: Better Auth only ----------
do $$
declare t text;
begin
  foreach t in array array['user','session','account','verification'] loop
    perform pg_temp.reset_policies(t);
    execute format('create policy auth_only on %I to vslm_auth using (true) with check (true)', t);
  end loop;
end $$;

-- ---------- Frames: only an admin approves ----------
-- Staff may edit an already-approved frame (it stays approved, Requirements_Admin.md 6.3),
-- but can't move a frame into 'approved' or set the approver.
create or replace function frames_guard_approval() returns trigger
language plpgsql as $$
begin
  if app_role() <> 'admin' then
    if new.status = 'approved' and (tg_op = 'INSERT' or old.status <> 'approved') then
      raise exception 'Only an admin can approve a frame' using errcode = '42501';
    end if;
    if tg_op = 'INSERT' and new.approved_by is not null
       or tg_op = 'UPDATE' and new.approved_by is distinct from old.approved_by then
      raise exception 'Only an admin can set the approver' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists frames_guard_approval on frames;
create trigger frames_guard_approval before insert or update on frames
  for each row execute function frames_guard_approval();

-- ---------- Booking availability: counts only, no personal data ----------
-- SECURITY DEFINER: runs as vslm_owner, which may read appointments through the
-- owner_read policy below (the website user, vslm_app, never can), and returns
-- only slot -> number booked. A function can't set app.role itself
-- (PostgreSQL refuses custom settings in a function's SET clause).
create policy owner_read on appointments for select to vslm_owner using (true);

create or replace function slot_counts(p_branch uuid, p_day date)
returns table (slot_start time, booked integer)
language sql stable security definer
set search_path = public
as $$
  select a.slot_start, count(*)::int
  from appointments a
  where a.branch_id = p_branch and a.day = p_day and a.status <> 'cancelled'
  group by a.slot_start
$$;
revoke all on function slot_counts(uuid, date) from public;
grant execute on function slot_counts(uuid, date) to vslm_app;

-- ---------- Retention: bookings and messages are deleted after the period on /privacy ----------
-- (Requirements_Privacy.md 4.5; the period is DUMMY D9, RETENTION_DAYS in src/lib/site-config.ts.)
-- SECURITY DEFINER, like slot_counts: the website calls it after each booking or message
-- and when staff open the lists, so deletion needs no separate scheduler. It refuses a
-- period shorter than 30 days, so a slip in code can't wipe recent bookings.
create policy owner_purge on appointments for delete to vslm_owner using (true);
create policy owner_read on enquiries for select to vslm_owner using (true);
create policy owner_purge on enquiries for delete to vslm_owner using (true);

create or replace function purge_expired(p_days integer)
returns integer
language plpgsql volatile security definer
set search_path = public
as $$
declare n integer; m integer;
begin
  if p_days is null or p_days < 30 then
    raise exception 'purge_expired: a retention period under 30 days is refused (%)', p_days;
  end if;
  delete from appointments where created_at < now() - make_interval(days => p_days);
  get diagnostics n = row_count;
  delete from enquiries where created_at < now() - make_interval(days => p_days);
  get diagnostics m = row_count;
  return n + m;
end $$;
revoke all on function purge_expired(integer) from public;
grant execute on function purge_expired(integer) to vslm_app;
