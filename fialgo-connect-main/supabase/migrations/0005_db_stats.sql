create or replace function get_db_stats()
returns json
language plpgsql
security definer
as $$
declare
  active_conns int;
begin
  select count(*) into active_conns from pg_stat_activity where state = 'active';
  return json_build_object(
    'active_connections', active_conns
  );
end;
$$;
