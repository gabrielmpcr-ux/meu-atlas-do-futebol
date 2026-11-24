-- Run once in the existing Supabase SQL Editor. Adds isolated aviation saving.
begin;
create or replace function public.atlas_save_aviation(p_expected_revision bigint,p_aviation jsonb)
returns jsonb language plpgsql security definer
set search_path='' set statement_timeout='15s' as $$
declare
 current_revision bigint; public_revision bigint; new_revision bigint;
 flights jsonb; trips jsonb; visible_flights jsonb; visible_aviation jsonb;
 flight_ids text[]; trip_ids text[];
begin
 if not public.atlas_is_admin() then
  raise insufficient_privilege using message='Editor access required';
 end if;
 if p_expected_revision is null or jsonb_typeof(p_aviation) is distinct from 'object' then
  raise exception 'Invalid aviation data';
 end if;
 flights:=p_aviation->'flights'; trips:=p_aviation->'trips';
 if jsonb_typeof(flights) is distinct from 'array' or jsonb_typeof(trips) is distinct from 'array' then
  raise exception 'Invalid flights or trips';
 end if;
 if octet_length(p_aviation::text)>4194304 or jsonb_array_length(flights)>20000
    or jsonb_array_length(trips)>5000 then raise exception 'Aviation data exceed limit'; end if;
 if exists(select 1 from jsonb_array_elements(flights) f
   where jsonb_typeof(f) is distinct from 'object'
      or jsonb_typeof(f->'id') is distinct from 'string' or btrim(coalesce(f->>'id',''))='')
 then raise exception 'Invalid flight identifier'; end if;
 select coalesce(array_agg(f->>'id'),array[]::text[]) into flight_ids from jsonb_array_elements(flights) f;
 if cardinality(flight_ids)<>(select count(distinct x) from unnest(flight_ids) x)
 then raise exception 'Repeated flight identifier'; end if;
 if exists(select 1 from jsonb_array_elements(trips) t
   where jsonb_typeof(t) is distinct from 'object'
      or jsonb_typeof(t->'id') is distinct from 'string' or btrim(coalesce(t->>'id',''))=''
      or jsonb_typeof(t->'flightIds') is distinct from 'array')
 then raise exception 'Invalid trip'; end if;
 select coalesce(array_agg(t->>'id'),array[]::text[]) into trip_ids from jsonb_array_elements(trips) t;
 if cardinality(trip_ids)<>(select count(distinct x) from unnest(trip_ids) x)
 then raise exception 'Repeated trip identifier'; end if;
 if exists(select 1 from jsonb_array_elements(trips) t
   cross join lateral jsonb_array_elements(t->'flightIds') ref
   where jsonb_typeof(ref) is distinct from 'string' or not ((ref #>> '{}')=any(flight_ids)))
 then raise exception 'Unknown flight in trip'; end if;
 -- Match the existing full-save privacy rules for the public collection.
 select coalesce(jsonb_agg(f - array['source','notes','yearNote','dateNote','manualWindow','manualEvidence','sourceImages'] order by ord),'[]'::jsonb)
 into visible_flights from jsonb_array_elements(flights) with ordinality as items(f,ord);
 visible_aviation:=jsonb_set(p_aviation,'{flights}',visible_flights,true);
 -- Use the same lock order as full and match saves. Both updates are atomic.
 select revision into current_revision from public.atlas_state where id='main' for update;
 if not found or current_revision<>p_expected_revision then
  raise exception using errcode='40001',message='ATLAS_CONFLICT: the collection changed; reload before saving';
 end if;
 select revision into public_revision from public.atlas_public where id='main' for update;
 if not found or public_revision<>current_revision then raise exception 'Public collection is not synchronized'; end if;
 if exists(select 1 from public.atlas_state where id='main' and jsonb_typeof(data) is distinct from 'object')
    or exists(select 1 from public.atlas_public where id='main' and jsonb_typeof(data) is distinct from 'object')
 then raise exception 'Collection is not initialized'; end if;
 new_revision:=current_revision+1;
 update public.atlas_state set data=jsonb_set(data,'{aviation}',p_aviation,true),
  revision=new_revision,updated_at=now() where id='main';
 update public.atlas_public set data=jsonb_set(data,'{aviation}',visible_aviation,true),
  revision=new_revision where id='main';
 return jsonb_build_object('revision',new_revision,'initialized',true);
end $$;
revoke all on function public.atlas_save_aviation(bigint,jsonb) from public,anon;
grant execute on function public.atlas_save_aviation(bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
