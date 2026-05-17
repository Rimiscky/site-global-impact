# Global Impact Consulting — Site web

Site vitrine du cabinet **Global Impact Consulting (GIC)** : formation, coaching et conseil stratégique.
Site statique en HTML/CSS/JS vanilla, sans build, déployable sur n'importe quel hébergement statique.

---

## Sommaire

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Lancer en local](#lancer-en-local)
- [Workflow Git](#workflow-git)
- [Déploiement](#déploiement)
- [Conformité légale](#conformité-légale)
- [Auteur](#auteur)

---

## Aperçu

Le site présente l'offre de GIC autour de la méthodologie **G.I.M.P.A.C.T.** et regroupe :

- Page d'accueil et présentation des services
- Catalogue de formations
- Page "Qui sommes-nous" (équipe, valeurs, références clients)
- Formulaire de contact
- Pages légales obligatoires (RGPD, CGU, confidentialité)

Thème clair/sombre persistant via `localStorage`, design responsive, optimisé SEO (Open Graph, Twitter Card, balises canoniques).

---

## Stack technique

| Couche | Outils |
|---|---|
| Markup | HTML5 sémantique |
| Style | CSS3 (variables, custom properties, dark mode) |
| Interactivité | JavaScript vanilla (pas de framework) |
| Typographie | Google Fonts (Inter, Fraunces) |
| Hébergement | Statique (Netlify, Vercel, GitHub Pages, GitLab Pages…) |

Aucune dépendance npm. Aucun build step.

---

## Structure du projet

```
.
├── index.html                       # Page d'accueil
├── formation.html                   # Catalogue de formations
├── qui-sommes-nous.html             # Présentation de l'équipe
├── contact.html                     # Formulaire de contact
├── politique-confidentialite.html   # RGPD
├── conditions-utilisation.html      # CGU + Propriété intellectuelle
├── conformite-donnees.html          # Conformité données
├── styles.css                       # Feuille de styles globale
├── script.js                        # Interactions, thème, menu
├── assets/                          # Photos, visuels marketing
│   └── photo et logo/               # Portraits de l'équipe
└── logo/                            # Logos clients & partenaires
```

---

## Lancer en local

Aucun build, aucun serveur Node nécessaire. Au choix :

```bash
# Option 1 : ouvrir directement dans le navigateur
open index.html

# Option 2 : serveur local (Python)
python3 -m http.server 8080
# → http://localhost:8080

# Option 3 : serveur local (Node)
npx serve .
```

---

## Workflow Git

Le projet est hébergé sur **GitHub** (privé) et **GitLab** (privé).

### Branches

- **`main`** — version stable, prête pour la production
- **`dev`** — branche de développement courant (branche par défaut pour le travail)

### Cycle de travail

```bash
# Toujours partir de dev à jour
git checkout dev
git pull origin dev

# Travailler, commit
git add .
git commit -m "feat: description du changement"

# Pousser sur les deux remotes
git push origin dev     # GitHub
git push gitlab dev     # GitLab

# Quand dev est stable → merger dans main
git checkout main
git merge dev
git push origin main
git push gitlab main
```

### Remotes configurés

```bash
origin   https://github.com/Rimiscky/site-global-impact.git
gitlab   git@gitlab.com:Rimiscky/site-global-impact.git
```

Pour pousser sur les deux en une commande, ajouter dans `.git/config` :

```ini
[remote "all"]
    url = https://github.com/Rimiscky/site-global-impact.git
    url = git@gitlab.com:Rimiscky/site-global-impact.git
```

Puis : `git push all dev`.

---

## Déploiement

Le site étant 100 % statique, il peut être déployé sur :

- **Netlify** — drag & drop du dossier, ou connecter le repo
- **Vercel** — import direct depuis GitHub
- **GitHub Pages** — activer Pages dans les paramètres du repo
- **GitLab Pages** — ajouter un `.gitlab-ci.yml` minimal
- **Cloudflare Pages**, OVH, hébergeur classique, etc.

---

## Conformité légale

Le site inclut les pages obligatoires :

- **Politique de confidentialité** (RGPD) — collecte, finalités, droits utilisateur
- **Conditions Générales d'Utilisation** — incluant la clause de propriété intellectuelle
- **Conformité données** — registre des traitements, mesures de sécurité

À mettre à jour avant chaque mise en production majeure.

---

## Auteur

**Global Impact Consulting (GIC)**
République du Congo

Maintenance technique : [@Rimiscky](https://github.com/Rimiscky)
