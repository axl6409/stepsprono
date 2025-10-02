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
const {updateRequireDetails, fetchAndProgramWeekMatches, updateSingleMatch} = require("./server/src/services/matchService");
const {programSpecialRule} = require("./server/src/services/appService");
const {updateSeasonMatchday} = require("./server/src/services/seasonService");

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

// Routes API
app.use('/api', apiRoutes);
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'client', 'src', 'assets', 'uploads')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`Server is running on port ${PORT}`);
  try {
    await models.sequelize.authenticate()
    logger.info('[START] => Connection to the database has been established successfully');
    await sequelize.sync({ force: false })
    logger.info('[START] => Database synchronized');
    await fetchAndProgramWeekMatches().then(r => {
      logger.info('[MATCHS] => Week Matches Fetched : Success');
    })
    await programSpecialRule();
    runCronJob()
    logger.info('[CRON] => Cron job started');
    await updateSeasonMatchday().then(r => {
      logger.info('Season Matchday Updated : Success');
    })
  } catch (error) {
    logger.info('[START] => Unable to connect to the database: ', error);
  }
})

process.on('uncaughtException', (error) => {
  logger.error(`Exception non gérée: ${error.message}`, { stack: error.stack });
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Rejet de promesse non géré', { reason, promise });
});