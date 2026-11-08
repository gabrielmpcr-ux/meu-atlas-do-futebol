-- Apply once in the existing project's Supabase SQL Editor.
-- Replaces only atlas_save; preserves data, owner checks, revision conflicts and public redaction.
begin;
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
