import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import MyOrders from './pages/MyOrders'
import ThankYou from './pages/ThankYou'
import AddressSelection from './pages/AddressSelection'
import AdminDashboard from './pages/AdminDashboard'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import UserOrders from './pages/UserOrders'
import AdminOrderDetails from './pages/AdminOrderDetails'
import AdminEditOrder from './pages/AdminEditOrder'
import { AuthProvider } from './context/AuthContext'

import './style.css'

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="app-root">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:category/:slug" element={<ProductDetails />} />
                <Route path="/coming-soon" element={<ComingSoon />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/address-selection" element={<AddressSelection />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products/add" element={<AddProduct />} />
                <Route path="/admin/products/edit/:id" element={<EditProduct />} />
                <Route path="/admin/user-orders/:userId" element={<UserOrders />} />
                <Route path="/admin/orders/:id" element={<AdminOrderDetails />} />
                <Route path="/admin/orders/edit/:id" element={<AdminEditOrder />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  )
}

export default App


