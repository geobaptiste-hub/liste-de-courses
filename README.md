# 🛒 La Liste de Course

Application web mobile-first pour gérer vos listes de courses, organisées par magasin.

## 📱 Fonctionnalités

### Onglet 1 — Validation (Courses)
- Liste des produits par magasin (Super U, Lidl, Action, Autre)
- Cliquez sur un produit pour le cocher / décocher
- Chaque magasin est rétractable (cliquez sur son titre)
- Bouton **"Valider et effacer"** disponible uniquement quand tous les produits sont cochés → efface uniquement ce magasin

### Onglet 2 — Liste
- Ajoutez des produits par magasin avec le champ texte + bouton `+`
- Appuyez sur **Entrée** pour ajouter rapidement
- Bouton `−` pour supprimer un produit (supprimé aussi dans l'onglet Validation)
- Chaque magasin est rétractable

### Onglet 3 — Carte U
- Affiche votre carte de fidélité Super U
- Placez votre image dans `Carte U/carte.png`

### Onglet 4 — Heure Paniers
- Rappel hebdomadaire programmable
- Par défaut : Vendredi à 16h00
- Notification navigateur (si autorisée)

### Onglet 5 — Réserves
- Disponible prochainement

### Onglet 6 — Recettes
- Disponible prochainement

## 🚀 Installation

### Option 1 — GitHub Pages (recommandé)
1. Forkez ou clonez ce dépôt
2. Allez dans **Settings → Pages**
3. Choisissez la branche `main`, dossier `/` (root)
4. Votre app sera disponible à `https://[votre-pseudo].github.io/[nom-du-repo]/`

### Option 2 — En local
Ouvrez simplement `index.html` dans votre navigateur.

> ⚠️ Certaines fonctionnalités (notifications) nécessitent HTTPS, donc GitHub Pages est recommandé.

## 🃏 Ajouter votre Carte U

1. Prenez une photo ou un scan de votre carte Super U
2. Renommez le fichier `carte.png` (ou `.jpg`, `.jpeg`, `.webp`)
3. Placez-le dans le dossier `Carte U/`
4. Si vous utilisez un autre format, modifiez la ligne dans `index.html` :
   ```html
   <img src="Carte U/carte.png" ...>
   ```

## 💾 Données

Toutes vos listes sont sauvegardées **localement dans votre navigateur** (localStorage). Elles persistent entre les sessions mais sont liées à votre appareil.

## 📂 Structure du projet

```
La liste de course/
├── index.html       → Structure de l'application
├── style.css        → Styles et thème
├── app.js           → Logique de l'application
├── README.md        → Ce fichier
└── Carte U/
    └── carte.png    → Votre image de carte (à ajouter)
```
