require('dotenv').config();
const express = require('express');
const helmet = require("helmet");
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const withAuth = require('./app/middlewares/withAuth');
require('./app/lib/passport');
const bunyanMiddleware = require('bunyan-middleware');
const { logger } = require('./app/helpers/logger');
const app = express();

app.use(helmet())
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

const authRoutes = require('./app/components/auth/auth.routes');
const postsRoutes = require('./app/components/posts/posts.routes');
const profileRoutes = require('./app/components/profile/profile.routes');
const { ApiError } = require('./app/utils/api-errors');

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
app.use('/api', withAuth, postsRoutes, profileRoutes);
app.use('/api/ping', (req, res) => res.status(200).send({data: {message: 'pong!'}}));

app.use((err, req, res, next) => {
  logger.error(err, 'Something failed.');
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({error: {message: err.message}});
  } else {
    res.status(500).json({error: {message: 'Unexpected error.'}});
  }
});

app.use((req, res, next) => {
  logger.error('Invalid route.');
  res.status(404).json({error: {message: 'Invalid route.'}});
});

module.exports = app;
