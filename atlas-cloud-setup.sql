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
create or replace function public.atlas_save(p_expected_revision bigint,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare new_revision bigint; visible_data jsonb; begin
 if not public.atlas_is_admin() then raise insufficient_privilege using message='Editor access required'; end if;
 if jsonb_typeof(p_data)<>'object' or jsonb_typeof(p_data->'visits') is distinct from 'array' or jsonb_typeof(p_data->'aviation'->'flights') is distinct from 'array' or jsonb_typeof(p_data->'aviation'->'trips') is distinct from 'array' then raise exception 'Invalid Atlas backup'; end if;
 if pg_column_size(p_data)>16777216 or jsonb_array_length(p_data->'visits')>20000 or jsonb_array_length(p_data->'aviation'->'flights')>20000 then raise exception 'Atlas exceeds the storage limit for this import'; end if;
 if exists(select 1 from jsonb_array_elements(p_data->'visits') v where coalesce(v->>'country','')='' or coalesce(v->>'city','')='' or coalesce(v->>'iso','')!~'^[A-Za-z]{3}$') then raise exception 'Invalid visit'; end if;
 if exists(select 1 from jsonb_array_elements(p_data->'aviation'->'flights') f where coalesce(f->>'id','')='') or (select count(*)<>count(distinct f->>'id') from jsonb_array_elements(p_data->'aviation'->'flights') f) then raise exception 'Invalid or repeated flight identifier'; end if;
 if exists(select 1 from jsonb_array_elements(p_data->'aviation'->'trips') t where coalesce(t->>'id','')='' or jsonb_typeof(t->'flightIds') is distinct from 'array') then raise exception 'Invalid trip'; end if;
 if exists(select 1 from jsonb_array_elements(p_data->'aviation'->'trips') t, jsonb_array_elements_text(t->'flightIds') ref where not exists(select 1 from jsonb_array_elements(p_data->'aviation'->'flights') f where f->>'id'=ref)) then raise exception 'A trip references a missing flight'; end if;
 update public.atlas_state set data=p_data,revision=revision+1,updated_at=now() where id='main' and revision=p_expected_revision returning revision into new_revision;
 if new_revision is null then raise exception using errcode='40001',message='ATLAS_CONFLICT: the collection changed; reload before saving'; end if;
 -- Public visitors see the collection, without internal boarding-pass/audit metadata.
 visible_data=jsonb_set(p_data,'{aviation,flights}',coalesce((select jsonb_agg(f - array['source','notes','yearNote','dateNote','manualWindow','manualEvidence','sourceImages']) from jsonb_array_elements(p_data->'aviation'->'flights') f),'[]'::jsonb));
 insert into public.atlas_public(id,revision,initialized,data) values('main',new_revision,true,visible_data) on conflict(id) do update set revision=excluded.revision,initialized=true,data=excluded.data;
 return jsonb_build_object('revision',new_revision,'data',p_data,'initialized',true);
end $$;
revoke all on function public.atlas_save(bigint,jsonb) from public;
grant execute on function public.atlas_save(bigint,jsonb) to authenticated;
commit;
