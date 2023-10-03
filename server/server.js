const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./src/routes/api')
const sequelize = require('./database');
const models = require('./src/models')
const {Role, League} = require("./src/models");

require('dotenv').config();

// Define routes and middlewares
const PORT = process.env.PORT || 3001

// Use body-parser and cors middleware here (as shown in previous steps)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Use cors middleware to handle Cross-Origin Resource Sharing
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3001', 'http://localhost:3001', 'http://192.168.128.61:5173', 'http://192.168.128.61:3001']
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers)
};
app.use(cors(corsOptions))

// Use the API routes
app.use('/api', apiRoutes);

// Define other routes and middleware here

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`)
  try {
    await sequelize.authenticate()
    console.log('Connection to the database has been established successfully')
    await sequelize.sync({ force: false })
    console.log('Database synchronized.')
    await Role.findOrCreate({ where: { name: 'admin' } });
    await Role.findOrCreate({ where: { name: 'manager' } });
    await Role.findOrCreate({ where: { name: 'user' } });
    await League.findOrCreate({ where: {
        name: 'Ligue 1',
        slug: 'ligue-1',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3c/Logo_Ligue_1_Uber_Eats_2022.svg/langfr-130px-Logo_Ligue_1_Uber_Eats_2022.svg.png',
    } });
    await League.findOrCreate({ where: {
        name: 'Ligue 2',
        slug: 'ligue-2',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Logo_Ligue_2_BKT_2020.svg/langfr-130px-Logo_Ligue_2_BKT_2020.svg.png',
      } });
    await League.findOrCreate({ where: {
        name: 'National',
        slug: 'national',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/a/a0/Logo_Championnat_Football_National_FFF_2017.svg/langfr-180px-Logo_Championnat_Football_National_FFF_2017.svg.png',
      } });
    await League.findOrCreate({ where: {
        name: 'National 2',
        slug: 'national-2',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/8a/Logo_Championnat_Football_National_2_FFF_2017.svg/langfr-180px-Logo_Championnat_Football_National_2_FFF_2017.svg.png',
      } });
    await League.findOrCreate({ where: {
        name: 'National 3',
        slug: 'national-3',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/f/fe/Logo_Championnat_Football_National_3_FFF_2017.svg/langfr-180px-Logo_Championnat_Football_National_3_FFF_2017.svg.png',
      } });
  } catch (error) {
    console.log('Unable to connect to the database: ', error)
  }
})