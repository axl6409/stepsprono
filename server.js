const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const apiRoutes = require('./server/src/routes/api')
const sequelize = require('./server/database');
const models = require('./server/src/models')
const { runCronJob } = require("./server/cronJob");
const morgan = require('morgan')
const logger = require('./server/src/utils/logger/logger');
const rfs = require('rotating-file-stream');
const path = require("path");
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, 'log'),
});
const PORT = process.env.PORT || 3001

require('./server/src/events/rewardsEvents');
const {updateRequireDetails, fetchWeekMatches} = require("./server/src/services/matchService");

app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

const corsOptions = {
  origin: [
    'http://127.0.0.1:3001',
    'http://localhost:3001',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://stepsprono.fr',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'client', 'src', 'assets', 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    await models.sequelize.authenticate()
    console.log('Connection to the database has been established successfully')
    await sequelize.sync({ force: false })
    console.log('Database synchronized')
    runCronJob()
    console.log('Cron job started')
    await fetchWeekMatches().then(r => {
      logger.info('Week Matches Fetched : Success');
    })
  } catch (error) {
    console.log('Unable to connect to the database: ', error)
  }
})

process.on('uncaughtException', (error) => {
  logger.error(`Exception non gérée: ${error.message}`, { stack: error.stack });
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejet de promesse non géré', { reason, promise });
});