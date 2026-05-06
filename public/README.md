# Frontend (dossier de travail)

Ce dossier est prévu pour **ton intégration front** (pages, CSS, JS, images) sans toucher au backend.

## Structure attendue

- `frontend/index.html`
- `frontend/css/**`
- `frontend/js/**`
- `frontend/img/**`
- `frontend/fonts/**` (si besoin)

## Comment ça marche côté Spring Boot

L’application Spring Boot sert les fichiers statiques depuis:

1. `./frontend/` (priorité)
2. `./vaultedge-1.0.0/` (fallback: template original)

Donc dès que tu mets ton `index.html` et tes assets dans `frontend/`, la home `http://localhost:8083/` affichera ton travail.

## Démarrage

Depuis la racine du projet:

- `mvnw.cmd spring-boot:run`

