const bcrypt = require('bcryptjs');
const db = require('../db');

function findByEmail(email) {
  return db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email.trim().toLowerCase());
}

function findById(id) {
  return db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id);
}

function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

function updatePassword(id, newPassword) {
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, id);
}

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    const user = findById(req.session.userId);
    if (user) {
      req.adminUser = user;
      res.locals.adminUser = user;
      return next();
    }
  }
  return res.redirect('/admin/login');
}

module.exports = { findByEmail, findById, verifyPassword, updatePassword, requireAuth };
