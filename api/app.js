/* require('dotenv').config(); */
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const withAuth = require('./app/middlewares/withAuth');
require('./app/lib/passport');
const bunyanMiddleware = require('bunyan-middleware');
const { logger } = require('./app/helpers/logger');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());
app.use(passport.initialize())
app.use(express.static(path.join(__dirname, 'public')));
app.use(bunyanMiddleware({
  headerName: 'X-Request-Id',
  propertyName: 'reqId',
  logName: 'reqId',
  obscureHeaders: ['authorization'],
  logger
}));

const authRoutes = require('./app/routes/auth.routes');
const apiRoutes = require('./app/routes/api.routes');

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 200,
    message: 'OK',
    data: {
      name: 'Aquarius API',
      version: require('./package.json').version,
      status: 'online'
    }
  })
});

app.use('/auth', authRoutes);
app.use('/api', withAuth, apiRoutes);

app.use((err, req, res, next) => {
  logger.error(err, 'Something failed.');
  res.status(500).json({error: {message: "Unexpected error."}});
});

app.use((req, res, next) => {
  logger.error('Invalid route.');
  res.status(404).json({error: {message: 'Invalid route.'}});
});

module.exports = app;
