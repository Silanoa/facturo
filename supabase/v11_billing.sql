-- Historique d'abonnement visible par l'utilisateur lui-même (lecture seule, sans données d'autrui).
create or replace function public.my_payments()
returns table(created_at timestamptz, amount numeric, currency text, method text, months int)
language sql stable security definer set search_path = public, private as $$
  select p.created_at, p.amount, p.currency, p.method, case when p.note = '1 an' or p.days >= 300 then 12 when p.days >= 28 then 1 else null end
  from private.payments p where p.user_id = auth.uid() order by p.created_at desc limit 24;
$$;
revoke all on function public.my_payments() from public, anon;
grant execute on function public.my_payments() to authenticated;
