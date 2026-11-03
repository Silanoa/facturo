-- Bonova v6 : statuts complets, paiements partiels, options d'affichage, rôle admin, realtime
alter table documents add column if not exists paid_amount numeric not null default 0;
alter table documents add column if not exists payments jsonb not null default '[]';
alter table documents add column if not exists opts jsonb not null default '{}';
alter table documents add column if not exists declined_at timestamptz;
alter table documents add column if not exists sent_at timestamptz;
alter table documents add column if not exists source_id uuid;
alter table documents add column if not exists updated_at timestamptz not null default now();
alter table documents drop constraint if exists documents_status_check;
update documents set status='sent' where status not in ('draft','sent','partial','paid','accepted','declined','cancelled','invoiced');
alter table documents add constraint documents_status_check check (status in ('draft','sent','partial','paid','accepted','declined','cancelled','invoiced'));
alter table profiles add column if not exists role text not null default 'user';
alter table profiles add column if not exists settings jsonb not null default '{}';
-- cohérence des statuts et des montants
create or replace function doc_consistency() returns trigger language plpgsql set search_path to public as $$
begin
  new.updated_at := now();
  if new.kind = 'receipt' then new.status := 'paid'; new.paid_amount := new.total; end if;
  if new.kind = 'invoice' then
    if new.status = 'paid' then new.paid_amount := greatest(coalesce(new.paid_amount,0), coalesce(new.total,0));
    elsif new.status = 'partial' then
      if coalesce(new.paid_amount,0) <= 0 then new.status := 'sent';
      elsif new.paid_amount >= new.total then new.status := 'paid'; end if;
    elsif new.status in ('draft','sent') and tg_op = 'UPDATE' and old.status in ('paid','partial') then new.paid_amount := 0; end if;
  end if;
  if new.kind = 'quote' then
    if new.status = 'accepted' and new.accepted_at is null then new.accepted_at := now(); end if;
    if new.status <> 'accepted' and new.status <> 'invoiced' then new.accepted_at := null; end if;
    if new.status = 'declined' and new.declined_at is null then new.declined_at := now(); end if;
    if new.status <> 'declined' then new.declined_at := null; end if;
  end if;
  if new.status = 'sent' and new.sent_at is null then new.sent_at := now(); end if;
  if new.status = 'paid' then new.declared_paid_at := null; end if;
  return new;
end $$;
drop trigger if exists doc_consistency on documents;
create trigger doc_consistency before insert or update on documents for each row execute function doc_consistency();
-- le client accepte / refuse un devis depuis le lien
create or replace function accept_quote(p_token text) returns void language plpgsql security definer set search_path to public as $$
begin update documents set status='accepted' where public_token=p_token and kind='quote' and status in ('sent','draft'); end $$;
create or replace function decline_quote(p_token text) returns void language plpgsql security definer set search_path to public as $$
begin update documents set status='declined' where public_token=p_token and kind='quote' and status in ('sent','draft'); end $$;
grant execute on function decline_quote(text) to anon, authenticated;
-- le rôle et le plan ne sont modifiables que côté serveur
create or replace function guard_plan() returns trigger language plpgsql set search_path to public as $$
begin if current_user in ('authenticated','anon') then new.plan := old.plan; new.pro_until := old.pro_until; new.role := old.role; end if; return new; end $$;
-- admin
create or replace function is_admin() returns boolean language sql stable security definer set search_path to public as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin') $$;
create or replace function admin_overview() returns jsonb language plpgsql security definer set search_path to public as $$
begin if not is_admin() then raise exception 'FORBIDDEN'; end if;
return jsonb_build_object(
 'users', (select count(*) from auth.users), 'users_7d', (select count(*) from auth.users where created_at>now()-interval '7 days'),
 'pro', (select count(*) from profiles where plan='pro' and (pro_until is null or pro_until>now())),
 'docs', (select count(*) from documents), 'docs_30d', (select count(*) from documents where created_at>now()-interval '30 days'),
 'invoiced', (select coalesce(jsonb_object_agg(currency, s),'{}') from (select currency, sum(total) s from documents where kind='invoice' group by 1) x),
 'paid', (select coalesce(jsonb_object_agg(currency, s),'{}') from (select currency, sum(paid_amount) s from documents where kind='invoice' group by 1) x),
 'list_users', (select coalesce(jsonb_agg(u order by u->>'created_at' desc),'[]') from (select jsonb_build_object('id',a.id,'email',a.email,'created_at',a.created_at,'last_sign_in_at',a.last_sign_in_at,'business_name',p.business_name,'country',p.country,'plan',p.plan,'pro_until',p.pro_until,'role',p.role,'docs',(select count(*) from documents d where d.user_id=a.id)) u from auth.users a left join profiles p on p.id=a.id limit 500) y),
 'list_docs', (select coalesce(jsonb_agg(d order by d->>'created_at' desc),'[]') from (select jsonb_build_object('id',d.id,'kind',d.kind,'number',d.number,'status',d.status,'total',d.total,'paid_amount',d.paid_amount,'currency',d.currency,'client',d.client->>'name','created_at',d.created_at,'due_date',d.due_date,'owner',a.email,'public_token',d.public_token) d from documents d join auth.users a on a.id=d.user_id order by d.created_at desc limit 300) z)
); end $$;
create or replace function admin_set_plan(p_user uuid, p_plan text, p_days int) returns void language plpgsql security definer set search_path to public as $$
begin if not is_admin() then raise exception 'FORBIDDEN'; end if;
update profiles set plan=p_plan, pro_until = case when p_plan='pro' and p_days>0 then now()+make_interval(days=>p_days) else null end where id=p_user; end $$;
create or replace function admin_set_role(p_user uuid, p_role text) returns void language plpgsql security definer set search_path to public as $$
begin if not is_admin() then raise exception 'FORBIDDEN'; end if; if p_user=auth.uid() then raise exception 'SELF'; end if;
update profiles set role=p_role where id=p_user; end $$;
create or replace function admin_delete_user(p_user uuid) returns void language plpgsql security definer set search_path to public, auth as $$
begin if not is_admin() then raise exception 'FORBIDDEN'; end if; if p_user=auth.uid() then raise exception 'SELF'; end if;
delete from documents where user_id=p_user; delete from clients where user_id=p_user; delete from profiles where id=p_user; delete from auth.users where id=p_user; end $$;
create or replace function admin_delete_doc(p_doc uuid) returns void language plpgsql security definer set search_path to public as $$
begin if not is_admin() then raise exception 'FORBIDDEN'; end if; delete from documents where id=p_doc; end $$;
-- l'utilisateur supprime son propre compte
create or replace function delete_my_account() returns void language plpgsql security definer set search_path to public, auth as $$
declare u uuid := auth.uid(); begin if u is null then raise exception 'AUTH'; end if;
delete from documents where user_id=u; delete from clients where user_id=u; delete from profiles where id=u; delete from auth.users where id=u; end $$;
revoke all on function admin_overview(), admin_set_plan(uuid,text,int), admin_set_role(uuid,text), admin_delete_user(uuid), admin_delete_doc(uuid), delete_my_account() from public, anon;
grant execute on function admin_overview(), admin_set_plan(uuid,text,int), admin_set_role(uuid,text), admin_delete_user(uuid), admin_delete_doc(uuid), delete_my_account(), is_admin() to authenticated;
-- realtime
do $$ begin begin alter publication supabase_realtime add table documents; exception when duplicate_object then null; end; end $$;
alter table documents replica identity full;
-- v6c : paiements d'abonnement visibles par l'admin
create or replace function public.admin_payments() returns jsonb language plpgsql security definer set search_path to public, private as $$ begin if not is_admin() then raise exception 'FORBIDDEN'; end if; return (select coalesce(jsonb_agg(jsonb_build_object('tx',p.tx_id,'provider',case when p.tx_id like 'ls\_%' then 'Lemon Squeezy' else 'FedaPay' end,'email',a.email,'created_at',p.created_at,'plan',pr.plan,'pro_until',pr.pro_until) order by p.created_at desc),'[]') from private.payments p left join auth.users a on a.id=p.user_id left join profiles pr on pr.id=p.user_id); end $$;
