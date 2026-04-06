const express = require('express');
const router = express.Router();
const Pages = require('../models/page');

/*
 * GET /
 */
router.get('/', async function (req, res) {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/`);
});

router.get('/:slug', async function (req, res) {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/${req.params.slug}`);
});



module.exports = router;
