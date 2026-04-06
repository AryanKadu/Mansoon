import { config } from '../config';
import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

interface Order {
  _id: string
  totalAmount: number
  paidAmount: number
  createdAt: string
  items: Array<{
    product: { title: string }
    quantity: number
  }>
}

interface User {
  name: string
  email: string
  mobile: string
}

const UserOrders: React.FC = () => {
  const { userId } = useParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/user-orders/${userId}`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders)
          setUser(data.user)
        } else {
          setError('Failed to fetch orders')
        }
      } catch (err) {
        setError('An error occurred while fetching orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [userId])

  if (loading) return <div className="state-center"><div className="spinner" /><p>Loading customer orders...</p></div>

  if (error || !user) {
    return (
      <div className="state-center">
        <i className="fas fa-exclamation-circle" style={{ fontSize: 40, color: 'var(--brand)' }} />
        <h2>Error</h2>
        <p>{error || 'User not found'}</p>
        <Link to="/admin/dashboard" className="btn btn-brand">Back to Dashboard</Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <Link to="/admin/dashboard" className="back-link">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
            <h1>Orders: {user.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.email} • {user.mobile || 'No mobile number'}</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="admin-section">
            <div className="empty-state">
              <i className="fas fa-box-open empty-icon" />
              <h3>No orders yet</h3>
              <p>This customer hasn't placed any orders yet.</p>
            </div>
          </div>
        ) : (
          <div className="admin-section">
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Products Owned</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Remaining</th>
                    <th>Order Date</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {order.items.map((item, idx) => (
                            <span key={idx} className="badge" style={{ background: 'var(--gray-50)', color: 'var(--gray-700)', border: '1px solid var(--border)', fontSize: '11px' }}>
                              {item.product?.title || 'Unknown Product'} × {item.quantity}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{order.totalAmount}</td>
                      <td style={{ color: '#16a34a', fontWeight: 600 }}>₹{order.paidAmount}</td>
                      <td style={{ color: 'var(--brand)', fontWeight: 600 }}>₹{order.totalAmount - order.paidAmount}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <Link to={`/admin/orders/${order._id}`} className="action-btn" title="View Details">
                          <i className="fas fa-external-link-alt" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserOrders
