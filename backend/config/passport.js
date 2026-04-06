const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async function (username, password, done) {
      try {
        const user = await User.findOne({ username: username });

        if (!user) {
          return done(null, false, { message: 'No user found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Wrong password' });
        }
      } catch (err) {
        console.log('Error in passport strategy:', err);
        return done(err);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
