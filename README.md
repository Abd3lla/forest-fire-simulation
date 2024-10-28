# Simulation de Propagation d'un Feu de Forêt

Ce projet implémente une simulation interactive de la propagation d'un feu de forêt sur une grille dynamique. Il permet de visualiser et de comprendre comment un incendie peut se propager dans différentes conditions.

## Fonctionnalités Principales

- **Grille Dynamique** : Représentation visuelle de la forêt avec des cases qui s'enflamment.
- **Propagation Aléatoire** : Le feu se propage selon une probabilité configurable.
- **Simulation en Temps Réel** : Affichage de l'évolution du feu étape par étape.
- **Paramètres Ajustables** : Possibilité de modifier la taille de la grille, la probabilité de propagation, et plus encore.

## Prérequis

- [Node.js](https://nodejs.org/)

## Installation

1. **Clonez le dépôt** :
   ```bash
   git clone https://github.com/Abd3lla/forest-fire-simulation.git
   cd forest-fire-simulation
   ```

2. **Installez les dépendances** :
   ```bash
   npm install
   ```

## Configuration

Le fichier `config.json` (forest-fire-simulation/public/config.json) vous permet de personnaliser les paramètres par défaut de la simulation.

## Lancement de l'Application

1. **Démarrez le serveur de développement** :
   ```bash
   npm run serve
   ```

2. **Accédez à l'application** :
   Ouvrez votre navigateur et allez à `http://localhost:8080`.

## Utilisation

1. Sur l'interface principale, cliquez sur "Start Simulation" pour lancer une nouvelle simulation.
2. Pour ajuster les paramètres, cliquez sur "Edit Parameters". Vous pourrez modifier :
   - La taille de la grille (largeur/hauteur)
   - La probabilité de propagation du feu
   - La vitesse de propagation
   - Les positions initiales des foyers d'incendie (format : ligne1,colonne1; ligne2,colonne2;)