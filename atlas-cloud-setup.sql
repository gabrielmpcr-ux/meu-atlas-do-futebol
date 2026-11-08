-- Run in your own Supabase project after creating the sole editor under Authentication > Users.
-- Replace __OWNER_EMAIL__ with your editor's e-mail before running. Never put passwords here.
begin;
create schema if not exists private;
create table if not exists private.atlas_admin(slot integer primary key check(slot=1),user_id uuid not null unique references auth.users(id));
revoke all on private.atlas_admin from public,anon,authenticated;
do $$ declare wanted uuid; existing uuid; begin
 select id into wanted from auth.users where lower(email)=lower('__OWNER_EMAIL__');
 if wanted is null then raise exception 'Create the editor under Authentication > Users before running this script.'; end if;
 select user_id into existing from private.atlas_admin where slot=1;
 if existing is not null and existing<>wanted then raise exception 'An owner is already configured; refusing to replace it.'; end if;
 insert into private.atlas_admin(slot,user_id) values(1,wanted) on conflict(slot) do nothing;
end $$;
create table if not exists public.atlas_state(id text primary key check(id='main'),revision bigint not null default 0,data jsonb,updated_at timestamptz not null default now());
alter table public.atlas_state enable row level security;
revoke all on public.atlas_state from anon,authenticated;
create table if not exists public.atlas_public(id text primary key check(id='main'),revision bigint not null default 0,initialized boolean not null default false,data jsonb not null);
alter table public.atlas_public enable row level security;
revoke all on public.atlas_public from anon,authenticated;
grant select on public.atlas_public to anon,authenticated;
drop policy if exists atlas_public_read on public.atlas_public;
create policy atlas_public_read on public.atlas_public for select to anon,authenticated using(true);
insert into public.atlas_state(id) values('main') on conflict(id) do nothing;
insert into public.atlas_public(id,data) values('main','{"version":2,"visits":[],"aviation":{"version":1,"flights":[],"trips":[]}}'::jsonb) on conflict(id) do nothing;
create or replace function public.atlas_is_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from private.atlas_admin where slot=1 and user_id=(select auth.uid())) $$;
revoke all on function public.atlas_is_admin() from public;
grant execute on function public.atlas_is_admin() to anon,authenticated;
create or replace function public.atlas_load() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.atlas_is_admin() then raise insufficient_privilege using message='Editor access required'; end if;
 return (select jsonb_build_object('revision',revision,'data',data,'initialized',data is not null) from public.atlas_state where id='main');
end $$;
revoke all on function public.atlas_load() from public;
grant execute on function public.atlas_load() to authenticated;
create or replace function public.atlas_save(p_expected_revision bigint,p_data jsonb)
returns jsonb language plpgsql security definer set search_path='' set statement_timeout='15s' as $$
declare
 new_revision bigint;
 visible_data jsonb;
 visits_data jsonb;
 flights_data jsonb;
 trips_data jsonb;
 flight_ids text[];
 flight_count bigint;
 unique_flight_count bigint;
begin
 if not public.atlas_is_admin() then
  raise insufficient_privilege using message='Editor access required';
 end if;
 if jsonb_typeof(p_data) is distinct from 'object' then
  raise exception 'Invalid Atlas backup';
 end if;
 -- Extract each subtree once. Embedded photos no longer travel through every flight lookup.
 visits_data := p_data->'visits';
 flights_data := p_data#>'{aviation,flights}';
 trips_data := p_data#>'{aviation,trips}';
 if jsonb_typeof(visits_data) is distinct from 'array'
    or jsonb_typeof(flights_data) is distinct from 'array'
    or jsonb_typeof(trips_data) is distinct from 'array' then
  raise exception 'Invalid Atlas backup';
 end if;
 if pg_column_size(p_data)>16777216
    or jsonb_array_length(visits_data)>20000
    or jsonb_array_length(flights_data)>20000 then
  raise exception 'Atlas exceeds the storage limit for this import';
 end if;
 if exists(select 1 from jsonb_to_recordset(visits_data) as v(country text,city text,iso text)
           where coalesce(v.country,'')='' or coalesce(v.city,'')='' or coalesce(v.iso,'')!~'^[A-Za-z]{3}$') then
  raise exception 'Invalid visit';
 end if;
 select count(*),count(distinct f.id),coalesce(array_agg(f.id),array[]::text[])
 into flight_count,unique_flight_count,flight_ids
 from jsonb_to_recordset(flights_data) as f(id text);
 if flight_count<>unique_flight_count or ''=any(flight_ids) then
  raise exception 'Invalid or repeated flight identifier';
 end if;
 if exists(select 1 from jsonb_to_recordset(trips_data) as t(id text,"flightIds" jsonb)
           where coalesce(t.id,'')='' or jsonb_typeof(t."flightIds") is distinct from 'array') then
  raise exception 'Invalid trip';
 end if;
 -- Check references against the small ID list, not by repeatedly expanding the flight JSON.
 if exists(select 1 from jsonb_to_recordset(trips_data) as t("flightIds" jsonb)
           cross join lateral jsonb_array_elements_text(t."flightIds") as ref(id)
           where not coalesce(ref.id=any(flight_ids),false)) then
  raise exception 'A trip references a missing flight';
 end if;
 update public.atlas_state set data=p_data,revision=revision+1,updated_at=now()
 where id='main' and revision=p_expected_revision returning revision into new_revision;
 if new_revision is null then
  raise exception using errcode='40001',message='ATLAS_CONFLICT: the collection changed; reload before saving';
 end if;
 visible_data := jsonb_set(p_data,'{aviation,flights}',coalesce(
  (select jsonb_agg(f - array['source','notes','yearNote','dateNote','manualWindow','manualEvidence','sourceImages'])
   from jsonb_array_elements(flights_data) f),'[]'::jsonb));
 insert into public.atlas_public(id,revision,initialized,data)
 values('main',new_revision,true,visible_data)
 on conflict(id) do update set revision=excluded.revision,initialized=true,data=excluded.data;
 return jsonb_build_object('revision',new_revision,'data',p_data,'initialized',true);
end $$;
revoke all on function public.atlas_save(bigint,jsonb) from public;
grant execute on function public.atlas_save(bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
