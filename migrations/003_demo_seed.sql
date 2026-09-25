-- Up Migration
insert into sources (name, type, trust_weight)
values ('Demo seed (not real prices)', 'imported', 0.10);

insert into plans (provider_id, name, data_mb, validity_days, network_type)
select p.id, v.name, v.data_mb, v.validity_days, 'any'
from (values
  ('mtn', '1GB Monthly', 1024, 30),
  ('mtn', '5GB Monthly', 5120, 30),
  ('airtel', '1GB Monthly', 1024, 30),
  ('airtel', '5GB Monthly', 5120, 30),
  ('glo', '1GB Monthly', 1024, 30),
  ('glo', '5GB Monthly', 5120, 30),
  ('9mobile', '1GB Monthly', 1024, 30),
  ('9mobile', '5GB Monthly', 5120, 30)
) as v(slug, name, data_mb, validity_days)
join providers p on p.slug = v.slug;

insert into price_observations (plan_id, source_id, price_minor, observed_at, status)
select pl.id, s.id, v.price, now() - interval '2 days', 'pending'
from (values
  ('mtn', 1024, 150000),
  ('mtn', 5120, 550000),
  ('airtel', 1024, 140000),
  ('airtel', 5120, 520000),
  ('glo', 1024, 130000),
  ('glo', 5120, 500000),
  ('9mobile', 1024, 145000),
  ('9mobile', 5120, 530000)
) as v(slug, data_mb, price)
join providers p on p.slug = v.slug
join plans pl on pl.provider_id = p.id and pl.data_mb = v.data_mb
cross join sources s
where s.name = 'Demo seed (not real prices)';

-- Down Migration
delete from price_observations
where source_id in (select id from sources where name = 'Demo seed (not real prices)');
delete from plans where name in ('1GB Monthly', '5GB Monthly');
delete from sources where name = 'Demo seed (not real prices)';