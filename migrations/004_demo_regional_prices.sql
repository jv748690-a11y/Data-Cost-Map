-- Up Migration
insert into price_observations
  (plan_id, region_id, source_id, price_minor, observed_at, status)
select
  o.plan_id,
  r.id,
  o.source_id,
  round(o.price_minor * (90 + (abs(hashtext(r.code || o.plan_id::text)) % 31)) / 100.0)::int,
  now() - interval '3 days',
  'pending'
from price_observations o
join sources s on s.id = o.source_id and s.name = 'Demo seed (not real prices)'
cross join regions r
where o.region_id is null
  and r.level = 'state';

-- Down Migration
delete from price_observations
where region_id is not null
  and source_id in (select id from sources where name = 'Demo seed (not real prices)');