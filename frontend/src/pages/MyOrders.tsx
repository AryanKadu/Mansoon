import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import { config } from '../config';
const API = config.API_URL;

interface OrderItem {
  product: { name?: string; slug?: string; image?: string; _id?: string } | null
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  createdAt: string
}

const MyOrders: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    fetch(`${API}/api/orders`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
      .catch(() => { setError('Could not load orders'); setLoading(false) })
  }, [user, authLoading])

  if (authLoading || loading) return (
    <div className="orders-page">
      <div className="container">
        <div className="skeleton skeleton-text" style={{ width: 200, height: 32, marginBottom: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           {[1, 2, 3].map(n => (
              <div key={n} className="skeleton" style={{ width: '100%', height: 180, borderRadius: 12 }} />
           ))}
        </div>
      </div>
    </div>
  )

  if (!user) return (
    <div className="orders-page">
      <div className="container">
        <div className="empty-state">
           <i className="fas fa-lock empty-icon" />
           <h2>Please Login</h2>
           <p>Sign in to view your past orders and track your shipments.</p>
           <Link to="/login" className="btn btn-brand" style={{ marginTop: 24 }}>
             <i className="fas fa-sign-in-alt" /> Sign In Now
           </Link>
        </div>
      </div>
    </div>
  )

  if (error) return (
    <div className="orders-page">
      <div className="container">
        <div className="state-center">
           <i className="fas fa-exclamation-triangle" style={{ fontSize: 32, color: '#dc2626' }} />
           <h2 style={{ color: '#dc2626' }}>Error Loading Orders</h2>
           <p>{error}</p>
           <button className="btn btn-ghost" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    </div>
  )

  if (orders.length === 0) return (
    <div className="orders-page">
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon"><i className="fas fa-box-open" /></div>
          <h2>No orders found</h2>
          <p>You haven't placed any orders yet. Start exploring our refreshing collection!</p>
          <Link to="/products" className="btn btn-brand" style={{ marginTop: 24 }}>
             <i className="fas fa-shopping-bag" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
           <h1>
             <i className="fas fa-clipboard-list" style={{ color: 'var(--brand)', marginRight: 12 }} />
             My <span style={{ color: 'var(--brand)' }}>Orders</span>
           </h1>
           <span className="badge badge-brand">
             {orders.length} order{orders.length !== 1 ? 's' : ''} total
           </span>
        </div>

        <div className="orders-list">
          {orders.map(order => {
             const payStatus = order.paidAmount >= order.totalAmount ? 'paid'
               : order.paidAmount > 0 ? 'partial' : 'unpaid'

             return (
               <div key={order._id} className="order-card">
                 <div className="order-card-header">
                   <div className="order-main-info">
                     <span className="order-id">ORD-#{order._id.slice(-8).toUpperCase()}</span>
                     <div className="order-date">
                       <i className="fas fa-calendar-day" /> 
                       {new Date(order.createdAt).toLocaleDateString('en-IN', {
                         day: 'numeric', month: 'short', year: 'numeric'
                       })}
                     </div>
                   </div>
                   <div className="order-header-right">
                     <span className={`status-badge status-${payStatus}`}>
                       <i className={`fas fa-${payStatus === 'paid' ? 'circle-check' : payStatus === 'partial' ? 'clock' : 'circle-exclamation'}`} />
                       {payStatus.toUpperCase()}
                     </span>
                     <div className="order-grand-total">₹{order.totalAmount.toFixed(2)}</div>
                   </div>
                 </div>

                 <div className="order-items-grid">
                   {order.items.map((item, idx) => (
                     <div key={idx} className="order-item-chip">
                        <span className="item-name">{item.product?.name || 'Product'}</span>
                        <span className="item-qty">× {item.quantity}</span>
                        <span className="item-price">₹{((item.price || 0) * item.quantity).toFixed(2)}</span>
                     </div>
                   ))}
                 </div>

                 {/* Order Status Progress */}
                 <div className="order-progress-container" style={{ padding: '0 24px 20px', background: 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: 8 }}>
                       <div style={{ position: 'absolute', top: 12, left: 16, right: 16, height: 4, background: '#e2e8f0', zIndex: 0, borderRadius: 2 }}></div>
                       {['Paid', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                          const statuses = ['Paid', 'Processing', 'Shipped', 'Delivered']
                          const currentIndex = statuses.indexOf(order.status || 'Paid')
                          const isActive = index <= currentIndex
                          return (
                             <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                                <div style={{ 
                                   width: 28, height: 28, borderRadius: '50%', background: isActive ? 'var(--brand)' : '#e2e8f0',
                                   color: isActive ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                   fontSize: 12, fontWeight: 700, border: '3px solid #f8fafc', transition: 'all 0.3s'
                                }}>
                                   {isActive ? <i className="fas fa-check" /> : index + 1}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--brand)' : '#64748b', marginTop: 4 }}>{step}</span>
                             </div>
                          )
                       })}
                    </div>
                 </div>

                 <div className="order-footer">
                   <div className="payment-summary">
                      <div className="pay-col">
                        <label>Paid</label>
                        <span className="pay-val success">₹{order.paidAmount.toFixed(2)}</span>
                      </div>
                      {order.remainingAmount > 0 && (
                        <div className="pay-col">
                          <label>Remaining</label>
                          <span className="pay-val danger">₹{order.remainingAmount.toFixed(2)}</span>
                        </div>
                      )}
                   </div>
                   <Link to={`/coming-soon`} className="btn btn-ghost" style={{ fontSize: 13, border: 'none', background: 'var(--gray-50)', color: 'var(--gray-700)' }}>
                      <i className="fas fa-file-invoice" /> Order Details
                   </Link>
                 </div>
               </div>
             )
          })}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
