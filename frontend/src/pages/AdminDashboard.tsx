import { config } from '../config';
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Product {
  _id: string
  title: string
  category: string
  price: number
  tt: number
  inStock: boolean
  size: string
}

interface Order {
  _id: string
  user: {
    _id: string
    name: string
    mobile: string
  }
  totalAmount: number
  createdAt: string
}

interface DashboardData {
  userCount: number
  productCount: number
  products: Product[]
  orders: Order[]
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${config.API_URL}/api/admin/dashboard`, {
        credentials: 'include',
      })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (err) {
      setError('An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const toggleStock = async (productId: string) => {
    try {
      // Create a hidden form to submit if using traditional backend routes, 
      // or use fetch if the backend supports JSON for this too.
      // Current backend only has traditional POST for this.
      await fetch(`http://localhost:8000/admin/products/toggle-stock/${productId}`, {
        method: 'POST',
        credentials: 'include',
      })
      // Even if it redirects, we just need the outcome
      fetchDashboardData()
    } catch (err) {
      console.error('Failed to toggle stock', err)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      // Backend redirect logic might prevent simple fetch delete if it's not JSON
      await fetch(`http://localhost:8000/admin/products/delete-product/${productId}`, {
        credentials: 'include',
      })
      fetchDashboardData()
    } catch (err) {
      console.error('Failed to delete product', err)
    }
  }

  if (loading) return (
    <div className="admin-page">
      <div className="admin-container">
         <div className="skeleton skeleton-text" style={{ width: 300, height: 40, marginBottom: 32 }} />
         <div className="admin-grid" style={{ marginBottom: 32 }}>
            {[1, 2, 3].map(n => <div key={n} className="skeleton" style={{ height: 120, borderRadius: 12 }} />)}
         </div>
         <div className="admin-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
            <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
            <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
         </div>
      </div>
    </div>
  )

  if (error || !data) {
    return (
      <div className="state-center">
        <i className="fas fa-exclamation-circle" style={{ fontSize: 40, color: 'var(--brand)' }} />
        <h2>Access Denied</h2>
        <p>{error || 'You do not have permission to view this page.'}</p>
        <Link to="/home" className="btn btn-brand">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
          </div>
          <Link to="/admin/products/add" className="btn btn-brand">
            <i className="fas fa-plus" /> Add Product
          </Link>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users" />
            </div>
            <div className="stat-content">
              <h3>Total Registered Users</h3>
              <div className="stat-value">{data.userCount}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--brand-light)', color: 'var(--brand)' }}>
              <i className="fas fa-th-large" />
            </div>
            <div className="stat-content">
              <h3>Total Products</h3>
              <div className="stat-value">{data.productCount}</div>
            </div>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Product Management</h2>
            <span className="badge badge-brand">{data.products.length} Products</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map(product => (
                  <tr key={product._id}>
                    <td style={{ fontWeight: 600 }}>{product.title}</td>
                    <td><span className="badge">{product.category}</span></td>
                    <td>₹{product.price.toLocaleString('en-IN')}</td>
                    <td>{product.tt}</td>
                    <td>
                      {product.inStock ? (
                        <span className="badge badge-success">In Stock</span>
                      ) : (
                        <span className="badge badge-danger">Out of Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-btn-group">
                        <Link to={`/admin/products/edit/${product._id}`} title="Edit" className="action-btn">
                          <i className="fas fa-edit" />
                        </Link>
                        <button 
                          title={product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                          onClick={() => toggleStock(product._id)} 
                          className="action-btn btn-warning"
                        >
                          <i className={`fas ${product.inStock ? 'fa-toggle-on' : 'fa-toggle-off'}`} />
                        </button>
                        <button 
                          title="Delete" 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="action-btn btn-danger"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Recent Orders</h2>
            <span className="badge badge-brand">{data.orders.length} Users</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Mobile</th>
                  <th>Total Amount</th>
                  <th>Order Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ fontWeight: 600 }}>{order.user?.name || 'Unknown'}</td>
                    <td>{order.user?.mobile || 'N/A'}</td>
                    <td style={{ color: 'var(--brand)', fontWeight: 700 }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/admin/user-orders/${order.user?._id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                        View All Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
