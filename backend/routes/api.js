const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');

const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const User = require('../models/user');
const Category = require('../models/category');
const fs = require('fs-extra');

router.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ── Auth ────────────────────────────────────────────────

// GET current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user.toObject();
    delete user.password;
    return res.json({ user });
  }
  res.status(401).json({ user: null });
});

// POST append address
router.post('/user/addresses', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const { fullName, street, city, state, pincode, mobile } = req.body;
    if (!fullName || !street || !city || !state || !pincode || !mobile) {
      return res.status(400).json({ message: 'All address fields are required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses.push({ fullName, street, city, state, pincode, mobile });
    await user.save();
    
    res.json({ ok: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error adding address' });
  }
});

// DELETE address
router.delete('/user/addresses/:idx', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const idx = parseInt(req.params.idx, 10);
    if (idx >= 0 && idx < user.addresses.length) {
      user.addresses.splice(idx, 1);
      await user.save();
      res.json({ ok: true, addresses: user.addresses });
    } else {
      res.status(400).json({ message: 'Invalid address index' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting address' });
  }
});

// POST login (JSON)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Invalid credentials' });
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.cookie('username', user.username, { maxAge: 900000, httpOnly: true });
      return res.json({ ok: true, user });
    });
  })(req, res, next);
});

// POST register (JSON)
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, password2, mobile } = req.body;

    if (password !== password2)
      return res.status(400).json({ message: 'Passwords do not match' });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ message: 'Username already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, mobile, username, password: hash, admin: 0 });
    await newUser.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST logout
router.post('/logout', (req, res) => {
  req.logOut();
  res.clearCookie('username');
  res.json({ ok: true });
});

// ── Cart ────────────────────────────────────────────────

router.get('/cart', async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!username) return res.json({ items: [] });
    const items = await Cart.find({ username }).lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Orders ──────────────────────────────────────────────

router.get('/orders', async (req, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: 'Not authenticated' });
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name slug image')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Products ────────────────────────────────────────────

router.get('/products', async (req, res) => {
  try {
    const limitRaw = req.query.limit;
    const limit = Math.min(Math.max(parseInt(limitRaw, 10) || 100, 1), 200);

    const products = await Product.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    res.json({ products });
  } catch (err) {
    console.error('GET /api/products failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ slug }).lean();
    if (!product) return res.status(404).json({ error: 'Not found' });

    const galleryDir = `public/product_images/${product._id}/gallery`;
    let galleryImages = [];
    if (await fs.pathExists(galleryDir)) {
      galleryImages = await fs.readdir(galleryDir);
      galleryImages = galleryImages.filter(name => name !== 'thumbs');
    }

    res.json({
      product,
      galleryImages: galleryImages.map(name => ({
        full: `/product_images/${product._id}/gallery/${name}`,
        thumb: `/product_images/${product._id}/gallery/thumbs/${name}`,
        name,
      })),
    });
  } catch (err) {
    console.error('GET /api/products/:slug failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user && (req.user.admin === 1 || req.user.admin === true)) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin privileges required.' });
}

// ── Admin ───────────────────────────────────────────────

router.get('/admin/categories', isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/products/:id', isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/user-orders/:userId', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email mobile').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    const orders = await Order.find({ user: req.params.userId })
      .populate('items.product', 'title')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ user, orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/orders/:id', isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('items.product', 'title price image')
      .lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/orders/edit/:id', isAdmin, async (req, res) => {
  try {
    const { newPayment } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.paidAmount = parseFloat(order.paidAmount || 0) + parseFloat(newPayment || 0);
    order.remainingAmount = Math.max(0, order.totalAmount - order.paidAmount);
    
    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/orders/status/:id', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Paid', 'Processing', 'Shipped', 'Delivered', 'COD Pending'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    await order.save();
    res.json({ ok: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating status' });
  }
});

router.delete('/admin/orders/:id', isAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/dashboard', isAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const products = await Product.find().lean();
    
    const allOrders = await Order.find()
      .populate('user')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .lean();

    const uniqueOrdersMap = new Map();
    for (const order of allOrders) {
      if (order.user) {
        const userId = order.user._id.toString();
        if (!uniqueOrdersMap.has(userId)) {
          uniqueOrdersMap.set(userId, order);
        }
      }
    }
    const orders = Array.from(uniqueOrdersMap.values());

    res.json({
      userCount,
      productCount,
      products,
      orders
    });
  } catch (err) {
    console.error('GET /api/admin/dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Cart Checkout (JSON, for Razorpay flow) ─────────────────
router.post('/cart/checkout', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
    const username = req.cookies.username;
    if (!username) return res.status(400).json({ message: 'No cart session' });

    const cartItems = await Cart.find({ username }).lean();
    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    let totalAmount = 0;
    const items = [];

    for (const item of cartItems) {
      const product = await Product.findOne({ slug: item.title });
      if (product) {
        totalAmount += product.price * item.qt;
        items.push({ product: product._id, quantity: item.qt, price: product.price });
        product.tt -= item.qt;
        product.inStock = product.tt > 0;
        await product.save();
      }
    }

    const { razorpayPaymentId, razorpayOrderId, shippingAddress, isCOD } = req.body;

    const newOrder = new Order({
      user: req.user._id,
      items,
      totalAmount,
      paidAmount: (razorpayPaymentId && !isCOD) ? totalAmount : 0,
      remainingAmount: (razorpayPaymentId && !isCOD) ? 0 : totalAmount,
      shippingAddress: shippingAddress || null,
      status: isCOD ? 'COD Pending' : 'Paid'
    });

    await newOrder.save();
    await Cart.deleteMany({ username });

    res.json({ ok: true, orderId: newOrder._id });
  } catch (err) {
    console.error('POST /api/cart/checkout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Direct Buy Checkout (JSON, for Razorpay flow) ───────────
router.post('/direct-buy/checkout', async (req, res) => {
  try {
    if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authenticated' });
    
    const { productId, quantity, razorpayPaymentId, razorpayOrderId, shippingAddress, isCOD } = req.body;
    
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (product.tt < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const totalAmount = product.price * quantity;

    const newOrder = new Order({
      user: req.user._id,
      items: [{
        product: product._id,
        quantity,
        price: product.price
      }],
      totalAmount,
      paidAmount: (razorpayPaymentId && !isCOD) ? totalAmount : 0,
      remainingAmount: (razorpayPaymentId && !isCOD) ? 0 : totalAmount,
      shippingAddress: shippingAddress || null,
      status: isCOD ? 'COD Pending' : 'Paid'
    });

    await newOrder.save();

    product.tt -= quantity;
    product.inStock = product.tt > 0;
    await product.save();

    res.json({ ok: true, orderId: newOrder._id });
  } catch (err) {
    console.error('POST /api/direct-buy/checkout error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
