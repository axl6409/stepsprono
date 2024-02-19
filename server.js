const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./server/src/routes/api')
const sequelize = require('./server/database');
const models = require('./server/src/models')
const {Role} = require("./server/src/models");
const { runCronJob, createOrUpdateTeams, updateTeamsRanking, updateMatches, fetchWeekMatches, updateMatchStatusAndPredictions, updatePlayers, checkupBets } = require("./server/cronJob");
const path = require("path");

require('dotenv').config();

// Define routes and middlewares
const PORT = process.env.PORT || 3001

// Use body-parser and cors middleware here (as shown in previous steps)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Use cors middleware to handle Cross-Origin Resource Sharing
const corsOptions = {
  origin: [
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3001',
    'http://localhost:5173',
    'http://localhost:3001',
    'http://192.168.128.61:5173',
    'http://192.168.128.61:3001',
    'http://192.168.1.22:5173',
    'http://192.168.1.22:3001',
    'http://192.168.1.23:5173',
    'http://192.168.1.23:3001',
    'http://192.168.56.1:5173',
    'http://192.168.1.29:5173',
    'http://192.168.1.29:3001',
    'http://192.168.56.1:3001'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Utiliser CORS pour toutes les routes
app.use(cors(corsOptions));
// Routes API
app.use('/api', apiRoutes);

app.listen(PORT, '0.0.0.0', async () => {
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
    // runCronJob()
    // Total => 18 * 2 => 36 API requests
    // await createOrUpdateTeams( 116, 2023, 61, false, true )
    // Total => 1 API request
    // await updateMatches(61)
    // Total => 1 API request
    // await updateTeamsRanking(null, 61)
    // Total => 1 API request
    // await fetchWeekMatches()
    // Total => 18 API requests
    // await updatePlayers([82,83,84], 61)
    // Total => 1 API requests by matchId
    // await updateMatchStatusAndPredictions()
    // Total => 0 API request
    // await checkupBets()
  } catch (error) {
    console.log('Unable to connect to the database: ', error)
  }
})