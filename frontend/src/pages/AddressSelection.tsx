import React, { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Helmet } from 'react-helmet-async'

import { config } from '../config';
const API = config.API_URL;
const RAZORPAY_KEY = config.RAZORPAY_KEY;

interface Toast {
  type: 'success' | 'error' | 'info'
  message: string
}

const AddressSelection: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  const [checkingOut, setCheckingOut] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const { productId, quantity, productTitle, productPrice } = location.state || {}

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

  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
    if (!productId) {
      navigate('/products')
    }
  }, [user, productId, navigate])

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(t)
  }, [toast])

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

  const handleCheckout = async () => {
    if (!user) return navigate('/login')
    if (!productId || quantity < 1) {
      showToast('error', 'Invalid product details')
      return
    }
    
    if (selectedAddressIndex === null || !user.addresses || !user.addresses[selectedAddressIndex]) {
      showToast('error', 'Please select a delivery address')
      return;
    }

    setCheckingOut(true)
    const shippingAddress = user.addresses[selectedAddressIndex]

    if (paymentMethod === 'cod') {
      try {
        const checkoutRes = await fetch(`${API}/api/direct-buy/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            productId: productId,
            quantity: quantity,
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
      const total = productPrice * quantity;
      
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
        description: `Buy ${productTitle}`,
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

            // Step 4: Create order in DB via Direct Buy Checkout route
            const checkoutRes = await fetch(`${API}/api/direct-buy/checkout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                productId: productId,
                quantity: quantity,
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

  if (!productId || !user) return null

  return (
    <div className="cart-page">
      <Helmet>
        <title>Address Selection - Mansoon Gruhudyog</title>
      </Helmet>

      {/* Toast */}
      <div className={`custom-alert ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'error' : ''}`}
           style={toast?.type === 'info' ? { background: '#1e293b' } : undefined}>
        <span className="alert-icon">
          {toast?.type === 'success' ? '✅' : toast?.type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span>{toast?.message}</span>
        <button className="close-btn" onClick={() => setToast(null)}>&times;</button>
      </div>

      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ background: 'var(--white)', padding: 32, borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-sm)' }}>
          <h1 style={{ fontSize: 24, marginBottom: 20 }}>Select Delivery Address</h1>
          
          <div style={{ padding: 16, background: 'var(--brand-light)', borderRadius: 'var(--r-md)', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, marginBottom: 8 }}>Order Summary:</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{productTitle} (x{quantity})</span>
              <span style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 18 }}>₹{(productPrice * quantity).toFixed(2)}</span>
            </div>
          </div>

          {/* Address Selection Block */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ fontSize: 15 }}>My Addresses</h4>
              {!showAddressForm && (
                 <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setShowAddressForm(true)}>
                   + Add New
                 </button>
              )}
            </div>

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <input required className="input-field" placeholder="Full Name" value={newAddress.fullName} onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                <input required className="input-field" placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <input required className="input-field" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                  <input required className="input-field" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <input required className="input-field" placeholder="Pincode" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                  <input required className="input-field" placeholder="Mobile" value={newAddress.mobile} onChange={e => setNewAddress({...newAddress, mobile: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                   <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddressForm(false)}>Cancel</button>
                   <button type="submit" className="btn btn-brand" style={{ flex: 1 }} disabled={addingAddress}>{addingAddress ? 'Saving...' : 'Save Address'}</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {user?.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr, idx) => (
                    <div key={idx} style={{ 
                      padding: 16, 
                      border: `1.5px solid ${selectedAddressIndex === idx ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: 'var(--r-md)',
                      background: selectedAddressIndex === idx ? 'var(--brand-light)' : 'var(--white)',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start'
                    }} onClick={() => setSelectedAddressIndex(idx)}>
                      <div style={{ 
                        width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--brand)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0
                      }}>
                        {selectedAddressIndex === idx && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{addr.fullName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {addr.street}<br/>{addr.city}, {addr.state} - {addr.pincode}<br/>Phone: {addr.mobile}
                        </div>
                      </div>
                      <button 
                        title="Delete"
                        onClick={(e) => { e.stopPropagation(); handleDeleteAddress(idx); }}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 4 }}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  ))
                ) : (
                   <div style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', border: '1px dashed var(--border)', borderRadius: 'var(--r-md)' }}>
                     No addresses found. Add a delivery address to proceed.
                   </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method Selection Block */}
          {user && (
            <div style={{ marginBottom: 24, background: 'var(--gray-50)', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 15, marginBottom: 12 }}>Payment Method</h4>
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

          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkingOut || showAddressForm}
            className="btn btn-brand"
            style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 12 }}
          >
            {checkingOut
              ? <><div className="fas fa-spinner fa-spin" /> Processing…</>
              : paymentMethod === 'cod' 
                ? <><i className="fas fa-truck" /> Place Order (COD)</>
                : <><i className="fas fa-credit-card" /> Pay with Razorpay</>
            }
          </button>
          
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12, border: 'none' }} onClick={() => navigate(-1)}>
             <i className="fas fa-arrow-left" /> Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressSelection
