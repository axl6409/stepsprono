const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./src/routes/api')
const sequelize = require('./database');
const models = require('./src/models')
const {Role} = require("./src/models");
const runCronJob = require("./cronJob");

require('dotenv').config();

// Define routes and middlewares
const PORT = process.env.PORT || 3001

// Use body-parser and cors middleware here (as shown in previous steps)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Use cors middleware to handle Cross-Origin Resource Sharing
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3001', 'http://localhost:3001', 'http://stepsprono.arsher-off.fr:3001', 'http://stepsprono.arsher-off.fr:5173']
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

runCronJob();
// Define other routes and middleware here

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT}`)
  try {
    await models.sequelize.authenticate()
    console.log('Connection to the database has been established successfully')
    await sequelize.sync({ force: false })
    console.log('Database synchronized.')
    await Role.findOrCreate({ where: { name: 'admin' } });
    await Role.findOrCreate({ where: { name: 'manager' } });
    await Role.findOrCreate({ where: { name: 'user' } });
  } catch (error) {
    console.log('Unable to connect to the database: ', error)
  }
})