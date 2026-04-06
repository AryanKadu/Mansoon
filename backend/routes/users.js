const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Order = require('../models/order');

// GET Register Page
router.get('/register', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`);
});

// POST Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, password2, mobile } = req.body;
    if (password !== password2) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`);

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, mobile, username, password: hash, admin: 0 });

    await newUser.save();
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register`);
  }
});

// GET Login
router.get('/login', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
});

// POST Login
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`,
  }),
  (req, res) => {
    res.cookie('username', req.body.username, { maxAge: 900000, httpOnly: true });
    if (req.user.admin) res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`);
    else res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/home`);
  }
);

// GET Logout
router.get('/logout', async function(req,res){
   req.logOut();
   res.clearCookie('username');
   res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
});

// GET My Orders
router.get('/orders', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders`);
});

module.exports = router;
