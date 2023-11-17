const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./server/src/routes/api')
const sequelize = require('./server/database');
const models = require('./server/src/models')
const {Role, Area, Competition, Season, Settings} = require("./server/src/models");
const { runCronJob, updateTeams, updateMatches, updateTeamsRanking } = require("./server/cronJob");
const path = require("path");

require('dotenv').config();

// Define routes and middlewares
const PORT = process.env.PORT || 3001

// Use body-parser and cors middleware here (as shown in previous steps)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Use cors middleware to handle Cross-Origin Resource Sharing
const corsOptions = {
  origin: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3001', 'http://localhost:3001', 'https://steps-prono-03d6d44a1031.herokuapp.com/'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Utiliser CORS pour toutes les routes
app.use(cors(corsOptions));

// Routes statiques avec CORS

// Routes API
app.use('/api', apiRoutes);

app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  try {
    await models.sequelize.authenticate()
    console.log('Connection to the database has been established successfully')
    await sequelize.sync({ force: false })
    console.log('Database synchronized.')
    await Role.findOrCreate({ where: { name: 'admin' } });
    await Role.findOrCreate({ where: { name: 'manager' } });
    await Role.findOrCreate({ where: { name: 'treasurer' } });
    await Role.findOrCreate({ where: { name: 'user' } });
    await Role.findOrCreate({ where: { name: 'visitor' } });
    await Area.findOrCreate({
      where: {
        id: 2081,
        name: 'France',
        code: 'FRA',
        flag: 'https://crests.football-data.org/773.svg',
      }
    });
    await Competition.findOrCreate({
      where: {
        id: 2015,
        name: 'Ligue 1',
        code: 'FL1',
        type: 'LEAGUE',
        emblem: 'https://crests.football-data.org/FL1.png',
      }
    });
    await Season.findOrCreate({
      where: {
        id: 1595,
        startDate: '2023-08-13 00:00:00',
        endDate: '2024-05-18 00:00:00',
        winner: null
      }
    })
    await Settings.findOrCreate({
      where: {
        key: 'matchMode',
        displayName: 'Mode de match',
        type: 'select',
        description: '<p>Quel mode de pari utiliser pour les matchs ?</p><ul><li><p><span>Mode par défaut : </span><span>Modèle de paris pour les matchs par défaut, seul le dernier match du weekend inclus les scores et le butteur</span></li><li><p><span>Mode Full : </span><span>Modèle de paris ou tous les matchs du weekend incluent les scores et le butteur</span></li><li><p><span>Mode Select : </span><span>Modèle de paris ou seul quelques matchs présélectionnés du weekend incluent les scores et le butteur</span></li></ul>',
        options: '{"Full": {"title": "Full", "value": "full", "description": "Modèle de paris ou tous les matchs du weekend incluent les scores et le butteur"}, "Default": {"title": "Défaut", "value": "default", "description": "Modèle de paris pour les matchs par défaut, seul le dernier match du weekend inclus les scores et le butteur"}, "Selected": {"title": "Select", "value": "select", "Description": "Modèle de paris ou seul quelques matchs présélectionnés du weekend incluent les scores et le butteur"}}',
        activeOption: 'Default'
      }
    })
    await Settings.findOrCreate({
      where: {
        key: 'regulation',
        displayName: 'Règlement',
        type: 'text',
        description: '<p>Règlement intérieur des steps prono</p>',
        options: '{"Value": ""}',
        activeOption: 'Default'
      }
    })
    await updateTeams();
    await updateMatches();
    await updateTeamsRanking()
    runCronJob();
  } catch (error) {
    console.log('Unable to connect to the database: ', error)
  }
})