import { config } from '../config';
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface Category {
  _id: string
  title: string
}

const AddProduct: React.FC = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    category: '',
    price: '',
    tt: '1',
    size: ''
  })
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${config.API_URL}/api/admin/categories`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories)
          if (data.categories.length > 0) {
            setFormData(prev => ({ ...prev, category: data.categories[0].title }))
          }
        }
      } catch (err) {
        console.error('Failed to fetch categories')
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))
    if (image) data.append('image', image)

    try {
      const res = await fetch(`${config.API_URL}/admin/products/add-product`, {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })
      
      const result = await res.json()
      if (res.ok && result.ok) {
        navigate('/admin/dashboard')
      } else {
        setError(result.message || 'Failed to add product. Please check your inputs.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-container narrow-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/dashboard" className="back-link">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
            <h1>Add New Product</h1>
          </div>
        </div>

        <div className="admin-section">
          <form onSubmit={handleSubmit} className="admin-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="form-field">
              <label className="form-label">Product Title</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Alphonso Mango Pulp"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required 
              />
            </div>

            <div className="form-field">
              <label className="form-label">Description</label>
              <textarea 
                className="form-input" 
                rows={4}
                placeholder="Describe your product..."
                value={formData.desc}
                onChange={e => setFormData({ ...formData, desc: e.target.value })}
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Category</label>
                <select 
                  className="form-input"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.title}>{cat.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Size (ml)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="e.g. 500"
                  value={formData.size}
                  onChange={e => setFormData({ ...formData, size: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label className="form-label">Price (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="0.00"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  required 
                />
              </div>
              <div className="form-field">
                <label className="form-label">Stock Quantity</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.tt}
                  onChange={e => setFormData({ ...formData, tt: e.target.value })}
                  required 
                />
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Product Image</label>
              <div className="file-upload-box">
                <input 
                  type="file" 
                  id="product-image"
                  className="file-input-hidden" 
                  onChange={e => setImage(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
                <label htmlFor="product-image" className="file-input-label">
                  <i className="fas fa-cloud-upload-alt" />
                  <span>{image ? image.name : 'Click to select an image'}</span>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-brand" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Adding Product...' : 'Add New Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
