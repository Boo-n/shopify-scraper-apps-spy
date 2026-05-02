# 🚀 Kickoff message — paste this in your NEW Claude Code conversation

> Copy-paste the block below into your first message in the new session. Replace the `<TOKEN>` placeholders with real tokens before sending. Send it as ONE big message.

---

```
Hey, je suis Marie/Boon. Je marketing mon actor Apify Shopify "shopify-scraper-apps-spy".

ÉTAPE 1 — lis ce fichier en entier avant de répondre :
/Users/marieauzannet/.gemini/antigravity/scratch/shopify-scraper-apps-spy/HANDOFF.md

ÉTAPE 2 — autorisations explicites pour TOUTE cette session :
- ✅ Créer le repo GitHub PUBLIC `Boo-n/shopify-scraper-apps-spy` et y pusher le code
- ✅ Publier des articles via API sur dev.to (compte boo_n) et Hashnode (compte boo-n, blog "Boon's Lab" v2)
- ✅ Naviguer Medium via Chrome MCP et publier sous mon identité (compte ouvert dans Chrome for Claude BOON)
- ✅ Naviguer la console Apify et le dashboard kazkn-dashboard.fly.dev pour cocher des quêtes
- ✅ Drafter et écrire des contenus pour Twitter, LinkedIn, Reddit, Quora, StackOverflow (je posterai manuellement)
- ❌ Ne PAS supprimer définitivement quoi que ce soit (actor Apify, blog Hashnode, etc.) — c'est moi qui clique "delete"

ÉTAPE 3 — mes tokens :
- DEVTO_TOKEN=<COLLE_ICI>
- HASHNODE_TOKEN=<COLLE_ICI>  (compte boo-n)
- GH_TOKEN=<COLLE_ICI>  (scope: repo, write, read)
- APIFY_TOKEN=<COLLE_ICI>  (depuis console.apify.com/settings/integrations)

ÉTAPE 4 — objectif de cette session :
[À remplir selon ce que tu veux faire ce jour-là, par exemple :]
- Publier l'article Medium #3 (medium-03-icp-shopify.md) via Chrome MCP
- Pusher le repo sur GitHub public
- Publier sur Hashnode v2 (Boon's Lab nouveau blog)
- Cocher les quêtes correspondantes sur dashboard

Lis HANDOFF.md, fais le récap rapide en 5 lignes, puis enchaîne en autonomie.
```

---

## Notes pour Marie

### Pour récupérer les tokens

- **dev.to** : Settings → Extensions → "API Keys" → ton ancienne API key marche encore (tu me l'as donnée précédemment)
- **Hashnode** : https://hashnode.com/settings/developer (compte boo-n)
- **GitHub** : https://github.com/settings/tokens → "Generate new token (classic)" → coche `repo` (full control of private repositories) — c'est obligatoire sinon l'agent peut pas créer le repo, c'est ce qui a planté la dernière fois
- **Apify** : https://console.apify.com/settings/integrations → Personal API tokens → Create

### Avant de lancer la nouvelle session

Vérifie que :
1. Le navigateur "Chrome for Claude BOON" est ouvert
2. Tu es loggée sur Medium dans ce Chrome
3. Tu es loggée sur Apify Console dans ce Chrome (si tu veux qu'il ouvre la page delete actor pour toi)
4. Tu as les 4 tokens prêts à coller (carnet de mots de passe, gestionnaire, etc.)

### Si tu veux changer d'objectif chaque jour

Garde HANDOFF.md tel quel (c'est le contexte permanent), et change juste l'ÉTAPE 4 du kickoff :

**Demain (J+1)** :
> Objectif : publier dev.to article #4 (devto-04-how-to-tutorial.md), drafter article #5 nouveau, cocher quêtes correspondantes.

**Surlendemain (J+2)** :
> Objectif : publier Medium article #2 (best-shopify-scrapers.md, si Medium a accepté #3), publier dev.to #5, drafter #6, etc.

### Maintenance HANDOFF.md

À la fin de chaque session, demande à l'agent :
> "Mets à jour HANDOFF.md avec ce qu'on a fait dans cette session — articles publiés, quêtes cochées, drafts ajoutés au content/, état actuel."

Comme ça le doc reste à jour et le prochain agent reprend sans perte d'info.
