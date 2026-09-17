# Global Impact Consulting — Site web + Back office

Site vitrine du cabinet **Global Impact Consulting (GIC)** : formation, coaching et conseil stratégique.

Le site est maintenant une application **Node.js / Express** avec base de données, dotée d'un
**back office** (façon WordPress ou PrestaShop) permettant à une personne non-technique de modifier
les textes, images et contenus du site (formations, équipe, réalisations, FAQ, etc.) sans toucher au code.

---

## Sommaire

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Installation et lancement en local](#installation-et-lancement-en-local)
- [Utiliser le back office](#utiliser-le-back-office)
- [Ce qui est éditable depuis le back office](#ce-qui-est-éditable-depuis-le-back-office)
- [Déploiement](#déploiement)
- [Conformité légale](#conformité-légale)
- [Auteur](#auteur)

---

## Aperçu

Le site présente l'offre de GIC autour de la méthodologie **G.I.M.P.A.C.T.** et regroupe :

- Page d'accueil et présentation des services
- Catalogue de formations (7 domaines, ~49 programmes)
- Page "Qui sommes-nous" (équipe, valeurs, histoire, références clients)
- Formulaire de contact (les messages arrivent dans le back office)
- Pages légales obligatoires (RGPD, CGU, conformité des données)

Thème clair/sombre persistant via `localStorage`, design responsive, optimisé SEO.

---

## Stack technique

| Couche | Outils |
|---|---|
| Serveur | Node.js + Express 5 |
| Base de données | SQLite (via `better-sqlite3`), fichier unique dans `data/` |
| Vues (site public + back office) | EJS |
| Authentification back office | Sessions serveur + mots de passe hachés (`bcryptjs`) |
| Upload d'images | `multer`, stockage dans `public/uploads` |
| Éditeur de texte riche | Quill (chargé via CDN dans le back office uniquement) |
| Style / JS du site public | CSS3 + JavaScript vanilla (inchangés) |

Aucun build front-end : les pages publiques restent du HTML/CSS/JS servi tel quel, seul le contenu est
désormais injecté depuis la base de données au moment du rendu (côté serveur, via EJS).

---

## Structure du projet

```
.
├── server/
│   ├── app.js                 # Point d'entrée Express
│   ├── db.js                  # Connexion SQLite + schéma des tables
│   ├── seed.js                # Remplit la base avec le contenu d'origine du site
│   ├── lib/
│   │   ├── auth.js            # Authentification back office
│   │   ├── blocks.js          # Définition des blocs de contenu éditables par page
│   │   ├── content.js         # Lecture/écriture des blocs et réglages
│   │   ├── crud.js            # Générateur de routes CRUD génériques (équipe, FAQ, etc.)
│   │   └── upload.js          # Upload d'images (médiathèque)
│   └── routes/
│       ├── site.js            # Pages publiques
│       ├── api.js             # API publique (formulaire de contact)
│       ├── admin.js           # Back office
│       └── admin-training.js  # Back office — catalogue de formations (domaines + programmes)
├── views/
│   ├── pages/                 # Gabarits EJS des pages publiques
│   ├── admin/                 # Gabarits EJS du back office
│   └── partials/              # En-têtes / pieds de page réutilisables
├── public/                    # Fichiers statiques servis tels quels
│   ├── styles.css, script.js  # Style et interactions du site public (inchangés)
│   ├── assets/, logo/         # Photos, visuels marketing, logos clients
│   ├── admin.css              # Style du back office
│   └── uploads/               # Images envoyées depuis la médiathèque du back office
├── scripts/
│   ├── extract-legacy.js      # Script d'extraction ponctuel (site statique → JSON)
│   └── legacy-content.json    # Contenu d'origine, utilisé par server/seed.js
├── legacy/                    # Copie des pages HTML statiques d'origine (référence)
├── data/                      # Base SQLite (créée automatiquement, non versionnée)
└── .env.example                # Variables d'environnement à copier vers .env
```

---

## Installation et lancement en local

Prérequis : Node.js 18+.

```bash
# 1. Installer les dépendances (crée aussi la base de données et le compte admin)
npm install

# 2. Copier le fichier d'environnement et l'ajuster si besoin
cp .env.example .env

# 3. Lancer le serveur
npm start
# → http://localhost:3000        (site public)
# → http://localhost:3000/admin  (back office)
```

Au premier `npm install`, un compte administrateur est créé automatiquement. Les identifiants
sont affichés dans le terminal (et configurables via `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env`
avant l'installation). **Pensez à changer ce mot de passe dès la première connexion**, depuis
`/admin/account`.

Pour regénérer la base à partir de zéro : supprimez le dossier `data/` puis relancez `npm run seed`.

---

## Utiliser le back office

Rendez-vous sur `/admin`, connectez-vous, puis utilisez le menu de gauche :

- **Pages du site** — textes de l'accueil, de la page Formations, de "Qui sommes-nous" et de Contact
  (titres, paragraphes, chiffres clés...), plus les 3 pages légales.
- **Formations** — les 7 domaines et leurs programmes ; ajoutez, modifiez, réordonnez ou supprimez un
  programme et il apparaît immédiatement sur la page Formations **et** dans l'onglet correspondant de
  l'accueil (les deux pages partagent la même source).
- **Équipe, Références clients, Réalisations, Notre histoire, FAQ** — listes avec photo/image,
  réordonnables par flèches, avec un statut publié/masqué.
- **Médiathèque** — toutes les images envoyées depuis le back office.
- **Réglages du site** — email, téléphone, adresse, horaires, description SEO (utilisés partout sur
  le site).
- **Messages reçus** — les demandes envoyées depuis le formulaire de contact du site.

Toute modification est visible immédiatement sur le site public, sans redéploiement.

---

## Ce qui est éditable depuis le back office

L'objectif a été de rendre éditable tout le **contenu réel** (textes, images, listes) sans exposer les
aspects purement visuels/animations qui font le design du site (SVG décoratifs, effets de parallax,
mise en page). Deux pages légales très structurées (sommaire, sections numérotées) sont éditables en
HTML brut plutôt qu'avec l'éditeur visuel, pour ne pas casser leur mise en page — un avertissement est
affiché dans le back office à ce sujet.

---

## Déploiement

Le site nécessite désormais un hébergement **Node.js** (ce n'est plus un site 100 % statique) :

- **Render, Railway, Fly.io** — déploiement simple avec build command `npm install` et start command `npm start`
- **VPS classique (OVH, etc.)** — `npm install && npm start`, derrière un reverse-proxy (Nginx) avec HTTPS
- Toute plateforme supportant Node.js 18+

Pensez à :
- définir `SESSION_SECRET` avec une valeur aléatoire longue en production ;
- monter un volume persistant pour le dossier `data/` (base de données) et `public/uploads/`
  (images envoyées), pour ne pas les perdre à chaque redéploiement ;
- changer le mot de passe administrateur par défaut dès la mise en production.

---

## Conformité légale

Le site inclut les pages obligatoires, éditables depuis le back office (`/admin/legal`) :

- **Politique de confidentialité** (RGPD) — collecte, finalités, droits utilisateur
- **Conditions Générales d'Utilisation** — incluant la clause de propriété intellectuelle
- **Conformité données** — registre des traitements, mesures de sécurité

À mettre à jour avant chaque mise en production majeure.

---

## Auteur

**Global Impact Consulting (GIC)**
République du Congo

Maintenance technique : [@Rimiscky](https://github.com/Rimiscky)
