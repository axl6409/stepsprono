const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./src/routes/api')
require('dotenv').config();

// Define routes and middlewares
const PORT = process.env.PORT || 3001
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;

// Use body-parser and cors middleware here (as shown in previous steps)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Use cors middleware to handle Cross-Origin Resource Sharing
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Enable credentials (cookies, authorization headers)
};
app.use(cors())

// Use the API routes
app.use('/api', apiRoutes);

// Define other routes and middleware here

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})