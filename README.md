# Duduma Catalogue — Site vitrine WhatsApp

Site catalogue Next.js 14 pour la boutique Duduma.  
Les clients choisissent un article et cliquent "Commander" → WhatsApp s'ouvre avec le message pré-rempli → le bot n8n prend le relai.

## Stack
- Next.js 14 App Router + TypeScript
- Supabase (lecture publique)
- Tailwind CSS (structure uniquement)
- Déploiement Vercel

---

## 1. Prérequis Supabase

### a) Exécuter la migration
Dans ton dashboard Supabase → **SQL Editor** → coller le contenu de `supabase-migration.sql` → Run.

### b) Récupérer la clé anon
**Supabase Dashboard** → Settings → API → copie **anon public key**.

---

## 2. Variables d'environnement

Copie `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Remplis les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://evswdhwcgvsumkeqsxza.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ta_clé_anon_ici>
NEXT_PUBLIC_WHATSAPP_NUMBER=24107990169
NEXT_PUBLIC_STORE_NAME=Duduma
```

---

## 3. Développement local

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000 → redirige vers `/catalogue`.

---

## 4. Déploiement Vercel

### Option A — Via CLI
```bash
npm i -g vercel
vercel --prod
```

### Option B — Via GitHub (recommandé)
1. Push ce dossier sur un repo GitHub
2. **Vercel Dashboard** → New Project → importer le repo
3. Framework : **Next.js** (détecté automatiquement)
4. **Environment Variables** → ajoute les 4 variables du `.env.example`
5. Deploy

L'URL sera du type `duduma-catalogue.vercel.app`.

---

## 5. Relier le lien dans n8n

Dans le workflow **"Agent Commerçant V2 — WhatsApp Bot"**, le nœud **"Send Catalogue"** doit envoyer :

```
🛍️ *Catalogue Duduma*

Découvrez tous nos articles, choisissez votre produit, votre taille et votre couleur :

👉 https://duduma-catalogue.vercel.app

Une fois votre choix fait, cliquez sur *Commander* sur le site — je m'occupe du reste ! 🚀
```

Avec `preview_url: true` pour afficher l'aperçu du lien.

---

## 6. Flux complet

```
Client WhatsApp
  → tape "catalogue"
  → bot envoie le lien https://duduma-catalogue.vercel.app
  → client visite le site sur Chrome Android
  → choisit produit + taille + couleur
  → clique "Commander sur WhatsApp"
  → WhatsApp s'ouvre avec : "Je veux commander SKU-123"
  → bot n8n reçoit, vérifie le stock, crée la commande, demande le paiement
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirige vers `/catalogue` |
| `/catalogue` | Grille produits avec recherche et filtre stock |
| `/produit/[code]` | Détail produit, variantes, bouton Commander |

## Composants

| Composant | Rôle |
|-----------|------|
| `ProductCard` | Carte produit dans la grille |
| `ProductGrid` | Grille + barre de recherche + filtre |
| `VariantSelector` | Sélecteur taille (boutons) + couleur (cercles) |
| `WhatsAppButton` | Bouton flottant bas-droite |
| `SkeletonCard` | Placeholder de chargement |
| `StockBadge` | Badge DISPO / RUPTURE |
| `PriceDisplay` | Prix formaté en FCFA |
