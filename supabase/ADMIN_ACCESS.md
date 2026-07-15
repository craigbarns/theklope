# Acces administrateur Supabase

Le back-office utilise une allowlist `public.admin_users`. Un utilisateur
Supabase simplement authentifie n'a aucun droit d'administration.

## Mise en production

1. Dans Supabase Dashboard, ouvrir **Authentication > Providers > Email** et
   desactiver l'inscription de nouveaux utilisateurs (option **Allow new users
   to sign up** ou **Enable email signups**, selon l'interface). Ce reglage est
   heberge par Supabase et ne peut pas etre applique depuis ce depot.
2. Dans **Authentication > Users**, verifier chaque compte. Supprimer ou bannir
   tout compte inconnu avant de continuer.
3. Executer les migrations suivantes, dans l'ordre, depuis le SQL Editor :
   `migrations/202607130001_lock_down_admin_access.sql`, puis
   `migrations/202607130002_add_api_rate_limits.sql`, puis
   `migrations/202607150003_add_product_related_ids.sql`.
4. Ajouter uniquement le compte proprietaire a l'allowlist, en remplacant
   l'adresse ci-dessous :

```sql
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('adresse-admin@exemple.fr')
on conflict (user_id) do nothing;
```

Verifier que la requete a trouve exactement le compte attendu :

```sql
select a.user_id, u.email, a.created_at
from public.admin_users a
join auth.users u on u.id = a.user_id;
```

Pour revoquer immediatement un administrateur :

```sql
delete from public.admin_users
where user_id = (
  select id from auth.users where lower(email) = lower('adresse-admin@exemple.fr')
);
```

L'autorisation est consultee dans la base a chaque operation sensible. Une
revocation ne depend donc pas de l'expiration du jeton de session.

5. Deployer ensuite l'application et verifier la connexion `/admin`. Les API
   publiques attendent aussi la fonction `consume_rate_limit` creee a l'etape 3.
