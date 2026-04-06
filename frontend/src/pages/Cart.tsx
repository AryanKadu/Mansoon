import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { config } from '../config';
const API = config.API_URL;
const RAZORPAY_KEY = config.RAZORPAY_KEY;

interface CartItem {
  _id: string
  title: string
  qt: number
  price: number
  image: string
}

interface Toast {
  type: 'success' | 'error' | 'info'
  message: string
}

declare global {
  interface Window {
    Razorpay: any
  }
}

const Cart: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  // Address State
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    mobile: ''
  })
  
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay')

  // Auto-select first address if available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && selectedAddressIndex === null) {
      setSelectedAddressIndex(0);
    }
  }, [user, selectedAddressIndex])

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(t)
  }, [toast])

  const fetchCart = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true)
    try {
      const res = await fetch(`${API}/api/cart`, { credentials: 'include' })
      const data = await res.json()
      setItems(data.items || [])
    } catch {
      setItems([])
    } finally {
      if (showLoader) setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCart() }, [fetchCart])

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingAddress(true)
    try {
      const res = await fetch(`${API}/api/user/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newAddress)
      })
      const data = await res.json()
      if (data.ok) {
        await refreshUser()
        showToast('success', 'Address added successfully')
        setShowAddressForm(false)
        setNewAddress({ fullName: '', street: '', city: '', state: '', pincode: '', mobile: '' })
      } else {
        showToast('error', data.message || 'Failed to add address')
      }
    } catch (err) {
      showToast('error', 'Network error adding address')
    } finally {
      setAddingAddress(false)
    }
  }

  const handleDeleteAddress = async (idx: number) => {
    if (!window.confirm('Delete this address?')) return
    try {
      const res = await fetch(`${API}/api/user/addresses/${idx}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      if (data.ok) {
        await refreshUser()
        if (selectedAddressIndex === idx) setSelectedAddressIndex(null)
        showToast('info', 'Address deleted')
      }
    } catch {
      showToast('error', 'Failed to delete address')
    }
  }

  const updateItem = async (slug: string, action: 'add' | 'remove' | 'clear') => {
    setUpdating(slug + action)

    // Optimistic update
    setItems(prev => {
      if (action === 'add') return prev.map(i => i.title === slug ? { ...i, qt: i.qt + 1 } : i)
      if (action === 'remove') {
        return prev.map(i => i.title === slug ? { ...i, qt: Math.max(0, i.qt - 1) } : i).filter(i => i.qt > 0)
      }
      if (action === 'clear') return prev.filter(i => i.title !== slug)
      return prev
    })

    try {
      await fetch(`${API}/cart/update/${slug}?action=${action}`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      // Sync with server in background
      await fetchCart(false)
    } catch {
      await fetchCart(false)
    }
    setUpdating(null)
  }

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return
    setItems([])
    try {
      await fetch(`${API}/cart/clear`, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })
      showToast('info', 'Cart cleared')
    } catch {
      await fetchCart(false)
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qt, 0)

  const handleCheckout = async () => {
    if (!user) return navigate('/login')
    if (items.length === 0) return
    
    if (selectedAddressIndex === null || !user.addresses || !user.addresses[selectedAddressIndex]) {
      showToast('error', 'Please select a delivery address')
      return;
    }

    setCheckingOut(true)
    const shippingAddress = user.addresses[selectedAddressIndex]

    if (paymentMethod === 'cod') {
      try {
        const checkoutRes = await fetch(`${API}/api/cart/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            isCOD: true,
            shippingAddress: shippingAddress
          }),
        })
        const checkoutData = await checkoutRes.json()

        if (checkoutData.ok) {
          navigate('/thank-you')
        } else {
          showToast('error', checkoutData.message || 'Checkout failed')
          setCheckingOut(false)
        }
      } catch (err) {
        showToast('error', 'Network error during checkout')
        setCheckingOut(false)
      }
      return;
    }

    try {
      // Step 1: Create Razorpay order
      const amountPaise = Math.round(total * 100)
      const orderRes = await fetch(`${API}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: amountPaise }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.json()
        throw new Error(err.error || 'Could not create payment order')
      }

      const razorpayOrder = await orderRes.json()

      // Step 2: Open Razorpay popup
      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Mansoon Gruhudyog',
        description: 'Cart Checkout',
        order_id: razorpayOrder.id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile || shippingAddress.mobile || '',
        },
        theme: { color: '#e44d26' },
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const verifyRes = await fetch(`${API}/payment/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()

            if (!verifyData.ok) {
              showToast('error', 'Payment verification failed')
              setCheckingOut(false)
              return
            }

            // Step 4: Create order in DB
            const checkoutRes = await fetch(`${API}/api/cart/checkout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                shippingAddress: shippingAddress
              }),
            })
            const checkoutData = await checkoutRes.json()

            if (checkoutData.ok) {
              navigate('/thank-you')
            } else {
              showToast('error', checkoutData.message || 'Checkout failed')
            }
          } catch (e) {
            showToast('error', 'Something went wrong after payment')
          }
          setCheckingOut(false)
        },
        modal: {
          ondismiss: () => {
            setCheckingOut(false)
            showToast('info', 'Payment cancelled')
          },
        },
      }

      if (!window.Razorpay) {
        showToast('error', 'Razorpay SDK not loaded. Please refresh the page.')
        setCheckingOut(false)
        return
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp: any) => {
        showToast('error', resp.error?.description || 'Payment failed')
        setCheckingOut(false)
      })
      rzp.open()
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Checkout failed')
      setCheckingOut(false)
    }
  }

  if (loading) return (
    <div className="cart-page">
      <div className="container" style={{ textAlign: 'center' }}>
        {/* Skeleton loading for cart page */}
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
           <div className="skeleton" style={{ width: 250, height: 40, borderRadius: 8, marginBottom: 30 }} />
           <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {[1,2,3].map(i => (
               <div key={i} className="skeleton" style={{ width: '100%', height: 100, borderRadius: 12 }} />
             ))}
           </div>
        </div>
      </div>
    </div>
  )

  if (items.length === 0) return (
    <div className="cart-page">
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-shopping-basket" /></div>
          <h2>Your cart is empty</h2>
          <p>It looks like you haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn btn-brand" style={{ marginTop: 20 }}>
            <i className="fas fa-arrow-left" /> Start Shopping
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cart-page">
      {/* Toast */}
      <div className={`custom-alert ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'error' : ''}`}
           style={toast?.type === 'info' ? { background: '#1e293b' } : undefined}>
        <span className="alert-icon">
          {toast?.type === 'success' ? '✅' : toast?.type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span>{toast?.message}</span>
        <button className="close-btn" onClick={() => setToast(null)}>&times;</button>
      </div>

      <div className="container">
        <div className="cart-header-row">
          <h1>
            <span style={{ color: 'var(--brand)' }}>Shopping</span> Cart
          </h1>
          <button onClick={clearCart} className="btn btn-ghost" style={{ fontSize: 13 }}>
            <i className="fas fa-trash-alt" /> Clear Cart
          </button>
        </div>

        <div className="cart-layout">
          <div className="cart-items-list">
            {items.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-img-wrap">
                   <img
                     src={item.image?.startsWith('http') ? item.image : `${API}/images${item.image}`}
                     alt={item.title}
                     onError={(e) => { (e.target as HTMLImageElement).src = '/images/product_images/logomo.png' }}
                   />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.title.replace(/-/g, ' ')}</div>
                  <div className="cart-item-unit">₹{Number(item.price).toFixed(2)} per unit</div>
                </div>
                <div className="qty-controls" style={{ border: '1.5px solid var(--border)', borderRadius: '10px', background: 'var(--white)' }}>
                  <button
                    className="qty-btn"
                    onClick={() => updateItem(item.title, 'remove')}
                    disabled={!!updating}
                  >
                    <i className={`fas ${updating === item.title + 'remove' ? 'fa-spinner fa-spin' : 'fa-minus'}`} />
                  </button>
                  <span className="qty-val" style={{ padding: '0 12px', fontWeight: 700, fontSize: 15 }}>{item.qt}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateItem(item.title, 'add')}
                    disabled={!!updating}
                  >
                    <i className={`fas ${updating === item.title + 'add' ? 'fa-spinner fa-spin' : 'fa-plus'}`} />
                  </button>
                </div>
                <div className="cart-item-total">₹{(item.price * item.qt).toFixed(2)}</div>
                <button
                  className="cart-remove-btn"
                  onClick={() => updateItem(item.title, 'clear')}
                  title="Remove Item"
                  disabled={!!updating}
                >
                  <i className="fas fa-times-circle" style={{ fontSize: 18 }} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-details">
               {items.map(i => (
                 <div key={i._id} className="summary-row">
                   <span className="summary-label">{i.title.replace(/-/g, ' ')} × {i.qt}</span>
                   <span className="summary-val">₹{(i.price * i.qt).toFixed(2)}</span>
                 </div>
               ))}
               <div className="divider" style={{ margin: '20px 0' }} />
               <div className="summary-total-row">
                 <span>Total Payable</span>
                 <span className="summary-total-val">₹{total.toFixed(2)}</span>
               </div>
            </div>

            {/* Address Selection Block */}
            {user && (
              <div style={{ marginTop: 20, marginBottom: 16, background: 'var(--gray-50)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 14 }}>Delivery Address</h4>
                  {!showAddressForm && (
                     <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => setShowAddressForm(true)}>
                       + Add New
                     </button>
                  )}
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input required className="input-field" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                    <input required className="input-field" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input required className="input-field" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                      <input required className="input-field" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input required className="input-field" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                      <input required className="input-field" placeholder="Mobile" value={newAddress.mobile} onChange={e => setNewAddress({...newAddress, mobile: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                       <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddressForm(false)}>Cancel</button>
                       <button type="submit" className="btn btn-brand" style={{ flex: 1 }} disabled={addingAddress}>{addingAddress ? 'Saving...' : 'Save'}</button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {user.addresses && user.addresses.length > 0 ? (
                      user.addresses.map((addr, idx) => (
                        <div key={idx} style={{ 
                          padding: 12, 
                          border: `1.5px solid ${selectedAddressIndex === idx ? 'var(--brand)' : 'var(--border)'}`,
                          borderRadius: 8,
                          background: selectedAddressIndex === idx ? 'var(--brand-light)' : 'var(--white)',
                          cursor: 'pointer',
                          position: 'relative'
                        }} onClick={() => setSelectedAddressIndex(idx)}>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{addr.fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </div>
                          <button 
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(idx); }}
                            style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      ))
                    ) : (
                       <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No addresses found. Add one to proceed.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {user && (
              <div style={{ marginBottom: 16, background: 'var(--gray-50)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: 14, marginBottom: 12 }}>Payment Method</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="razorpay" 
                      checked={paymentMethod === 'razorpay'} 
                      onChange={() => setPaymentMethod('razorpay')}
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    <span style={{ fontSize: 14 }}>Razorpay (Online Payment)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod" 
                      checked={paymentMethod === 'cod'} 
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: 'var(--brand)' }}
                    />
                    <span style={{ fontSize: 14 }}>Cash on Delivery (COD)</span>
                  </label>
                </div>
              </div>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut || showAddressForm}
                className="btn btn-brand"
                style={{ width: '100%', padding: '16px', fontSize: 16 }}
              >
                {checkingOut
                  ? <><div className="fas fa-spinner fa-spin" /> Processing…</>
                  : paymentMethod === 'cod' 
                    ? <><i className="fas fa-truck" /> Place Order (COD)</>
                    : <><i className="fas fa-credit-card" /> Pay with Razorpay</>
                }
              </button>
            ) : (
              <Link to="/login" className="btn btn-brand" style={{ width: '100%', padding: '16px', fontSize: 16 }}>
                <i className="fas fa-sign-in-alt" /> Login to Place Order
              </Link>
            )}
            
            <Link to="/products" className="btn btn-ghost" style={{ width: '100%', marginTop: 12, border: 'none' }}>
               <i className="fas fa-arrow-left" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
