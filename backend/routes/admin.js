// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/adminController');
// const upload = require('../cloudConfig') 



// // Admin dashboard
// router.get('/dashboard', adminController.getDashboard);
    
// // Show Add Product Form
// router.get('/products/add-product',adminController.getAddProduct);
// // Handle Add Product Form Submission
// router.post('/products/add-product', upload.single('image'), adminController.postAddProduct);



// // Edit product
// router.get('/products/edit-product/:id', adminController.getEditProduct);
// router.post('/products/edit-product/:id',upload.single('image'), adminController.postEditProduct);

// // Delete product
// router.get('/products/delete-product/:id', adminController.deleteProduct);

// // Toggle stock status
// router.post('/products/toggle-stock/:id', adminController.toggleStock);

// module.exports = router;


// // // routes/admin.js - Enhanced Admin Routes
// // const express = require('express');
// // const router = express.Router();
// // const adminController = require('../controllers/adminController');

// // // Middleware to check if user is admin
// // function isAdmin(req, res, next) {
// //     if (req.user && req.user.admin === 1) {
// //         return next();
// //     }
// //     req.flash('danger', 'Access denied. Admin privileges required.');
// //     res.redirect('/users/login');
// // }

// // // Apply admin middleware to all routes
// // router.use(isAdmin);

// // // Dashboard
// // router.get('/', adminController.getDashboard);
// // router.get('/dashboard', adminController.getDashboard);

// // // Product Management
// // router.get('/products/add-product', adminController.getAddProduct);
// // router.post('/products/add-product', adminController.postAddProduct);
// // router.get('/products/edit-product/:id', adminController.getEditProduct);
// // router.post('/products/edit-product/:id', adminController.postEditProduct);
// // router.get('/products/delete-product/:id', adminController.deleteProduct);
// // router.post('/products/toggle-stock/:id', adminController.toggleStock);

// // // Order Management
// // router.get('/orders', adminController.getAllOrders);

// // // User Management
// // router.get('/users', adminController.getAllUsers);
// // router.get('/users/delete/:id', adminController.deleteUser);

// // // Analytics API
// // router.get('/api/analytics', adminController.getAnalyticsData);

// // module.exports = router;


const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../cloudConfig');

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.admin === 1) {
        return next();
    }
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);
}

// Apply admin middleware to all admin routes
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);


// Product Management
router.get('/products/add-product', adminController.getAddProduct);
router.post('/products/add-product', upload.single('image'), adminController.postAddProduct);

router.get('/products/edit-product/:id', adminController.getEditProduct);
router.post('/products/edit-product/:id', upload.single('image'), adminController.postEditProduct);

router.get('/products/delete-product/:id', adminController.deleteProduct);
router.post('/products/toggle-stock/:id', adminController.toggleStock);

// router.get('/orders/:id', adminController.getOrderDetails);
// router.get('/orders/:id', adminController.getOrdersByUser);

// View single order details
router.get('/orders/:id', adminController.getOrderDetails);

// View all orders by a specific user
router.get('/user-orders/:userId', adminController.getOrdersByUser);




router.get('/orders/edit/:id', adminController.getEditOrder);
router.post('/orders/edit/:id', adminController.postEditOrder);

router.post('/orders/:id/delete', adminController.deleteOrder);



// Order Management
// router.get('/orders', adminController.getAllOrders);

// User Management
// router.get('/users', adminController.getAllUsers);
// router.get('/users/delete/:id', adminController.deleteUser);

// (Optional) Analytics API
// router.get('/api/analytics', adminController.getAnalyticsData);

module.exports = router;
