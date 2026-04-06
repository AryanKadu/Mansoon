import { config } from '../config';
import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

interface OrderItem {
  product: { title: string; price: number; image?: string } | null
  quantity: number
  price: number
}

interface Order {
  _id: string
  user: { name: string; email: string; mobile: string } | null
  items: OrderItem[]
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  shippingAddress?: {
    fullName: string
    street: string
    city: string
    state: string
    pincode: string
    mobile: string
  }
  createdAt: string
}

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusUpdating, setStatusUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !window.confirm(`Update order status to ${newStatus}?`)) return
    setStatusUpdating(true)
    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/status/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setOrder({ ...order, status: newStatus })
      } else {
        alert('Failed to update status')
      }
    } catch {
      alert('Error updating status')
    } finally {
      setStatusUpdating(false)
    }
  }

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/orders/${id}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setOrder(data.order)
        } else {
          setError('Order not found')
        }
      } catch (err) {
        setError('An error occurred while fetching order details')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const deleteOrder = async () => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.ok) {
        navigate('/admin/dashboard')
      } else {
        alert('Failed to delete order')
      }
    } catch (err) {
      alert('Error deleting order')
    }
  }

  if (loading) return <div className="state-center"><div className="spinner" /><p>Loading order details...</p></div>
  if (error || !order) return (
    <div className="state-center">
      <h2>Error</h2><p>{error || 'Order not found'}</p>
      <Link to="/admin/dashboard" className="btn btn-brand">Back to Dashboard</Link>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <Link to="/admin/dashboard" className="back-link">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
            <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
          <div className="admin-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={order.status || 'Paid'} 
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={statusUpdating}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontWeight: 600, outline: 'none', background: 'var(--white)', cursor: 'pointer' }}
            >
               <option value="Paid">Paid</option>
               <option value="Processing">Processing</option>
               <option value="Shipped">Shipped</option>
               <option value="Delivered">Delivered</option>
            </select>
            <Link to={`/admin/orders/edit/${order._id}`} className="btn btn-ghost">
              <i className="fas fa-edit" /> Edit Payments
            </Link>
            <button onClick={deleteOrder} className="btn btn-outline" style={{ borderColor: '#dc2626', color: '#dc2626' }}>
              <i className="fas fa-trash" /> Delete Order
            </button>
          </div>
        </div>

        <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) 1fr', gap: '24px' }}>
          <div className="admin-section">
            <h3 className="section-title">Order Items</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product?.title || 'Unknown Product'}</td>
                      <td>₹{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="order-totals" style={{ marginTop: '24px', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div style={{ fontSize: '15px' }}>Total Amount: <strong style={{ fontSize: '18px' }}>₹{order.totalAmount}</strong></div>
               <div style={{ fontSize: '15px', color: '#16a34a' }}>Paid: <strong>₹{order.paidAmount}</strong></div>
               <div style={{ fontSize: '15px', color: 'var(--brand)' }}>Remaining: <strong>₹{order.remainingAmount}</strong></div>
            </div>
          </div>

          <div className="admin-section">
            <h3 className="section-title">Customer Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="info-item">
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>NAME</label>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{order.user?.name || 'Guest'}</div>
                </div>
                <div className="info-item">
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>EMAIL</label>
                    <div>{order.user?.email || 'N/A'}</div>
                </div>
                <div className="info-item">
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>MOBILE</label>
                    <div>{order.user?.mobile || 'N/A'}</div>
                </div>
            </div>

            {order.shippingAddress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
                 <h3 className="section-title">Shipping Address</h3>
                 <div className="info-item">
                     <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ADDRESS</label>
                     <div style={{ lineHeight: 1.5 }}>
                        <strong>{order.shippingAddress.fullName}</strong><br/>
                        {order.shippingAddress.street}<br/>
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br/>
                        Phone: {order.shippingAddress.mobile || order.user?.mobile}
                     </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetails
