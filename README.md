# Facturo

Factures, devis et reçus pour l'Afrique francophone, anglophone et la diaspora : FCFA/XAF/NGN/GHS/MAD/KES/EUR/USD, mentions OHADA (IFU/NINEA/RCCM, montant en lettres), Mobile Money sur la facture, envoi WhatsApp, PDF A4, fichier clients, tableau de bord, freemium (10 docs/mois) + Pro via FedaPay.

Stack : Next.js 14 · Supabase (Auth + Postgres + RLS) · Vercel.

## Variables d'environnement
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (valeurs publiques par défaut dans le code)
- `FEDAPAY_SECRET_KEY` — clé secrète FedaPay (sandbox `sk_sandbox_...` ou live)
- `FEDAPAY_ENV` — `sandbox` (défaut) ou `live`
- `APP_SECRET` — secret partagé avec la fonction SQL `activate_pro`
