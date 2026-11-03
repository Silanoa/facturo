-- v9 : un seul administrateur. L'email autorisé est stocké en privé (non lisible par l'API).
create table if not exists private.admin_owner (one boolean primary key default true check (one), email text not null);
revoke all on private.admin_owner from anon, authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path to public, private, auth as $$
  select exists(select 1 from profiles p join auth.users u on u.id=p.id join private.admin_owner o on lower(o.email)=lower(u.email) where p.id=auth.uid() and p.role='admin') $$;
create or replace function public.admin_set_role(p_user uuid, p_role text) returns void language plpgsql security definer set search_path to public as $$
begin if not is_admin() then raise exception 'FORBIDDEN'; end if; if p_user=auth.uid() then raise exception 'SELF'; end if;
 if p_role <> 'user' then raise exception 'SINGLE_ADMIN'; end if; update profiles set role='user' where id=p_user; end $$;
-- Garde-fou : le rôle admin n'est accepté que pour l'email propriétaire, quel que soit l'appelant.
create or replace function public.guard_admin_role() returns trigger language plpgsql security definer set search_path to public, private, auth as $$
begin if new.role='admin' and not exists(select 1 from auth.users u join private.admin_owner o on lower(o.email)=lower(u.email) where u.id=new.id) then raise exception 'SINGLE_ADMIN'; end if; return new; end $$;
drop trigger if exists profiles_admin_guard on public.profiles;
create trigger profiles_admin_guard before insert or update of role on public.profiles for each row execute function guard_admin_role();
revoke execute on function public.guard_admin_role() from anon, authenticated, public;
-- Pour désigner l'admin (à faire une fois, avec l'email de Rosalex) :
-- insert into private.admin_owner(email) values ('EMAIL') on conflict (one) do update set email=excluded.email;
-- update profiles set role='user' where role='admin'; update profiles set role='admin' where id=(select id from auth.users where lower(email)=lower('EMAIL'));
-- Fonctions admin : plus exécutables sans connexion.
revoke execute on function public.admin_add_payment(uuid,numeric,text,text,text,integer), public.admin_plan(uuid,text,integer), public.admin_set_config(text,jsonb), public.admin_user(uuid), public.admin_overview(), public.admin_payments(), public.admin_set_plan(uuid,text,integer), public.admin_set_role(uuid,text), public.admin_delete_user(uuid), public.admin_delete_doc(uuid), public.delete_my_account() from anon, public;
