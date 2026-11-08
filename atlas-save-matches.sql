-- Run once in the existing Supabase SQL Editor. Additive, no collection replacement.
begin;
create or replace function public.atlas_save_matches(p_expected_revision bigint,p_changes jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 private_data jsonb; public_data jsonb; current_revision bigint; public_revision bigint;
 change jsonb; game jsonb; idx integer; target jsonb; patch_path text[];
 seen integer[] := array[]::integer[]; match_ids text[]; match_id text;
 field_name text; new_revision bigint;
begin
 if not public.atlas_is_admin() then
  raise insufficient_privilege using message='Editor access required';
 end if;
 if p_expected_revision is null or jsonb_typeof(p_changes) is distinct from 'array' then
  raise exception 'Invalid match changes';
 end if;
 if jsonb_array_length(p_changes)<1 or jsonb_array_length(p_changes)>100
    or octet_length(p_changes::text)>1048576 then raise exception 'Match changes exceed limit'; end if;
 select data,revision into private_data,current_revision from public.atlas_state where id='main' for update;
 if not found or current_revision<>p_expected_revision then
  raise exception using errcode='40001',message='ATLAS_CONFLICT: the collection changed; reload before saving';
 end if;
 select data,revision into public_data,public_revision from public.atlas_public where id='main' for update;
 if not found or public_revision<>current_revision then raise exception 'Public collection is not synchronized'; end if;
 if jsonb_typeof(private_data->'visits') is distinct from 'array'
    or jsonb_typeof(public_data->'visits') is distinct from 'array' then raise exception 'Invalid visits'; end if;
 for change in select value from jsonb_array_elements(p_changes) loop
  if jsonb_typeof(change) is distinct from 'object' then raise exception 'Invalid match change'; end if;
  if change - array['index','iso','city','stadium','matches'] <> '{}'::jsonb
     or jsonb_typeof(change->'index') is distinct from 'number'
     or (change->>'index') !~ '^(0|[1-9][0-9]{0,5})$'
     or jsonb_typeof(change->'iso') is distinct from 'string'
     or jsonb_typeof(change->'city') is distinct from 'string'
     or jsonb_typeof(change->'stadium') is distinct from 'string'
     or coalesce(change->>'stadium','')=''
     or jsonb_typeof(change->'matches') is distinct from 'array' then raise exception 'Invalid match change'; end if;
  idx := (change->>'index')::integer;
  if idx=any(seen) or idx>=jsonb_array_length(private_data->'visits') then raise exception 'Invalid or repeated stadium index'; end if;
  seen:=array_append(seen,idx);
  target:=private_data->'visits'->idx;
  if (target->>'iso') is distinct from (change->>'iso')
     or (target->>'city') is distinct from (change->>'city')
     or (target->>'stadium') is distinct from (change->>'stadium')
     or (public_data->'visits'->idx->>'iso') is distinct from (change->>'iso')
     or (public_data->'visits'->idx->>'city') is distinct from (change->>'city')
     or (public_data->'visits'->idx->>'stadium') is distinct from (change->>'stadium') then
   raise exception 'Stadium identity mismatch';
  end if;
  if jsonb_array_length(change->'matches')>5000 then raise exception 'Too many matches'; end if;
  match_ids:=array[]::text[];
  for game in select value from jsonb_array_elements(change->'matches') loop
   if jsonb_typeof(game) is distinct from 'object' then raise exception 'Invalid match'; end if;
   if game - array['id','date','homeTeam','awayTeam','homeScore','awayScore','competition','notes','sourceUrl','importSource'] <> '{}'::jsonb then raise exception 'Unexpected match field'; end if;
   foreach field_name in array array['id','date','homeTeam','awayTeam','competition','notes','sourceUrl'] loop
    if game ? field_name and jsonb_typeof(game->field_name) not in ('string','null') then raise exception 'Invalid match text'; end if;
   end loop;
   foreach field_name in array array['homeScore','awayScore'] loop
    if game ? field_name and game->field_name<>'null'::jsonb then
     if jsonb_typeof(game->field_name) is distinct from 'number' or (game->>field_name)!~ '^[0-9]{1,2}$' then raise exception 'Invalid match score'; end if;
    end if;
   end loop;
   if game ? 'importSource' and jsonb_typeof(game->'importSource') not in ('object','null') then raise exception 'Invalid match source'; end if;
   match_id:=game->>'id';
   if coalesce(match_id,'')<>'' then
    if match_id=any(match_ids) then raise exception 'Repeated match identifier'; end if;
    match_ids:=array_append(match_ids,match_id);
   end if;
  end loop;
  patch_path:=array['visits',idx::text,'matches'];
  private_data:=jsonb_set(private_data,patch_path,change->'matches',true);
  public_data:=jsonb_set(public_data,patch_path,change->'matches',true);
 end loop;
 new_revision:=current_revision+1;
 update public.atlas_state set data=private_data,revision=new_revision,updated_at=now() where id='main';
 update public.atlas_public set data=public_data,revision=new_revision where id='main';
 -- Small receipt: no photos, flights or full collection returned to the browser.
 return jsonb_build_object('revision',new_revision,'initialized',true);
end $$;
revoke all on function public.atlas_save_matches(bigint,jsonb) from public,anon;
grant execute on function public.atlas_save_matches(bigint,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
