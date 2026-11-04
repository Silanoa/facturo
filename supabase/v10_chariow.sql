-- Chariow (Mobile Money) : recherche d'utilisateur par e-mail et journal des paiements non rattachés.
create table if not exists private.unmatched_payments (tx_id text primary key, email text, amount numeric, currency text, product text, created_at timestamptz default now(), resolved boolean default false);
create or replace function public.user_by_email(p_email text, p_secret text) returns uuid language plpgsql security definer set search_path to 'public','private' as $$
begin
 if p_secret is null or p_secret is distinct from (select value from private.settings where key='app_secret') then raise exception 'forbidden'; end if;
 return (select id from auth.users where lower(email)=lower(trim(p_email)) limit 1);
end $$;
create or replace function public.log_unmatched_payment(p_secret text, p_tx text, p_email text, p_amount numeric, p_currency text, p_product text) returns text language plpgsql security definer set search_path to 'public','private' as $$
begin
 if p_secret is null or p_secret is distinct from (select value from private.settings where key='app_secret') then raise exception 'forbidden'; end if;
 insert into private.unmatched_payments(tx_id,email,amount,currency,product) values (p_tx,p_email,p_amount,p_currency,p_product) on conflict do nothing;
 return 'logged';
end $$;
revoke all on function public.user_by_email(text,text) from public; grant execute on function public.user_by_email(text,text) to anon, authenticated;
revoke all on function public.log_unmatched_payment(text,text,text,numeric,text,text) from public; grant execute on function public.log_unmatched_payment(text,text,text,numeric,text,text) to anon, authenticated;
create or replace function public.admin_payments() returns jsonb language plpgsql security definer set search_path to 'public','private' as $function$ begin if not is_admin() then raise exception 'FORBIDDEN'; end if;
 return (select coalesce(jsonb_agg(x order by x->>'created_at' desc),'[]') from (
  select jsonb_build_object('tx',p.tx_id,'user_id',p.user_id,'provider',case when p.tx_id like 'ls\_%' then 'Lemon Squeezy' when p.tx_id like 'manual\_%' then 'Manuel' when p.tx_id like 'chariow\_%' then 'Chariow' else 'FedaPay' end,'email',a.email,'created_at',p.created_at,'amount',p.amount,'currency',p.currency,'method',p.method,'note',p.note,'days',p.days,'plan',pr.plan,'pro_until',pr.pro_until) x
   from private.payments p left join auth.users a on a.id=p.user_id left join profiles pr on pr.id=p.user_id
  union all
  select jsonb_build_object('tx',u.tx_id,'user_id',null,'provider','Chariow','email',u.email,'created_at',u.created_at,'amount',u.amount,'currency',u.currency,'method','chariow','note','Aucun compte avec cet e-mail : à activer manuellement ('||coalesce(u.product,'')||')','days',null,'plan',null,'pro_until',null)
   from private.unmatched_payments u where not u.resolved) s); end $function$;
