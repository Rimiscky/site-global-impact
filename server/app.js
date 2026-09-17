const path = require('path');
const express = require('express');
const session = require('express-session');
require('dotenv').config();

const db = require('./db');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');
const siteRouter = require('./routes/site');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '1mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'gic-back-office-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12, // 12h
    sameSite: 'lax',
  },
}));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', siteRouter);

app.use((req, res) => {
  res.status(404).send('Page introuvable');
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Une erreur est survenue.');
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`GIC — serveur démarré sur http://localhost:${PORT}`);
  });
}

module.exports = app;
