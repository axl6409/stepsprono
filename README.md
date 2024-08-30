![MrR0b0t](https://github.com/axl6409/acffs/blob/master/ascii-mrr0b0t.png)

# Steps Prono
![Steps Prono Logo](/client/public/img/logo-steps-150x143.png)
## Application de Pronostics Sportifs entre Steps

![npm](https://img.shields.io/badge/npm-v9.6.6-green)
![Express.js](https://img.shields.io/badge/Express.js-v4.18.2-yellow)
![React.js](https://img.shields.io/badge/React.js-v18.2.0-blue)
![Vite.js](https://img.shields.io/badge/Vite.js-v4.4.5-blue)
![Axios](https://img.shields.io/badge/axios-v1.5.1-yellow)
![Moment](https://img.shields.io/badge/moment-v2.94.4-yellow)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3.3.3-yellow)
![MySQL](https://img.shields.io/badge/PostgreSQL-v16.*.*-blue)

## Introduction

Bienvenue dans Steps Prono, une application de pronostics sportifs entre potes. L'objectif principal de Steps Prono est de prédire les résultats des matchs et créer des compétitions.

## Fonctionnalités Principales

- **Pronostics Sportifs** : Faites vos pronostics sur les résultats des matchs de votre sport préféré.

- **Créez des Groupes** : Formez des groupes et organisez des compétitions.

- **Classements** : Consultez les classements pour voir qui est en tête de la compétition.

- **Mises à Jour en Temps Réel** : Recevez des mises à jour instantanées sur les scores des matchs.

- **Badges et Récompenses** : Gagnez des badges en fonction de vos performances de pronostic.

## Installation et Configuration

### Prérequis
- **Node.js** : Version 14 ou supérieure.
- **PostgreSQL** : Version 13 ou supérieure.
- **npm** : Version 7 ou supérieure.

### Étapes d'Installation

1. **Clonage du Dépôt** : Clonez ce dépôt sur votre machine locale
```sh
git clone https://github.com/votreutilisateur/votre-repo.git
```

2. **Configurer l'Environnement**

Créez un fichier ``.env`` à la racine du projet en utilisant ``.env.exemple`` comme modèle. Configurez les variables d'environnement pour votre base de données PostgreSQL et autres paramètres nécessaires.
Créez un fichier ``.env`` à la racine du dossier **client** en utilisant ``.env.exemple`` comme modèle.

3. **Installer les Dépendances** 

Installez les dépendances pour le serveur et le client :
```sh
cd stepsprono
npm install
cd client
npm install
```

4. **Configurez la base de données**

- Assurez-vous que PostgreSQL est en cours d'execution
- Créez la base de données définie dans le fichier .env
- Exécutez la commande : ```npx sequelize init``` pour créer le fichier de configuration dans le dossier ``server/config/config.json``. Puis modifiez ce fichier pour y inclure les informations de votre base de données.
- Executez la commande : ```npm run migrate``` puis ```npm run seed``` pour construire la base de données.

5. **Lancement de l'Application** :

Démarrez le serveur :
```sh
cd stepsprono
npm start
```
Puis, lancez le client :
```sh
cd client
npm run dev
```


## Contributions

C'est un projet et challenge personnel pour le moment, je n'accueille pas de contributions.