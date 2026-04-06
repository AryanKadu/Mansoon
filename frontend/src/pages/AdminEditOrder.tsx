import { config } from '../config';
import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

interface OrderItem {
  product: { title: string } | null
  quantity: number
}

interface Order {
  _id: string
  user: { name: string; email: string } | null
  items: OrderItem[]
  totalAmount: number
  paidAmount: number
  remainingAmount: number
}

const AdminEditOrder: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [newPayment, setNewPayment] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
        setError('Error fetching order')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/edit/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPayment }),
        credentials: 'include'
      })
      if (res.ok) {
        navigate(`/admin/orders/${id}`)
      } else {
        alert('Failed to update order')
      }
    } catch (err) {
      alert('Error updating order')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="state-center"><div className="spinner" /><p>Loading order detail...</p></div>
  if (error || !order) return <div className="state-center"><h2>Error</h2><p>{error || 'Order not found'}</p></div>

  return (
    <div className="admin-page">
      <div className="admin-container narrow-content">
        <div className="admin-header">
          <div>
            <Link to={`/admin/orders/${id}`} className="back-link">
              <i className="fas fa-arrow-left" /> Back to Details
            </Link>
            <h1>Edit Payment: #{order._id.slice(-8).toUpperCase()}</h1>
          </div>
        </div>

        <div className="admin-section">
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-field">
              <label className="form-label">Customer</label>
              <div style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: '14px', border: '1px solid var(--border)' }}>
                {order.user?.name} ({order.user?.email})
              </div>
            </div>

            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label">Total Amount</label>
                <input className="form-input" type="text" value={`₹${order.totalAmount}`} disabled style={{ background: 'var(--gray-50)' }} />
              </div>
              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label">Previously Paid</label>
                <input className="form-input" type="text" value={`₹${order.paidAmount}`} disabled style={{ background: 'var(--gray-50)' }} />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Add New Payment (₹)</label>
              <input 
                className="form-input" 
                type="number" 
                value={newPayment} 
                onChange={e => setNewPayment(parseFloat(e.target.value) || 0)}
                autoFocus
                required
              />
              <p className="text-muted" style={{ fontSize: '12px', marginTop: '6px' }}>
                Remaining after this: <strong style={{ color: 'var(--brand)' }}>₹{Math.max(0, order.totalAmount - (order.paidAmount + newPayment))}</strong>
              </p>
            </div>

            <div className="form-actions" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="btn btn-brand" disabled={saving}>
                {saving ? 'Updating...' : 'Update Order Payment'}
              </button>
              <Link to={`/admin/orders/${id}`} className="btn btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminEditOrder
