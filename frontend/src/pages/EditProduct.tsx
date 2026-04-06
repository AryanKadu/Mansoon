import { config } from '../config';
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

interface Category {
  _id: string
  title: string
}

interface ProductData {
  title: string
  desc: string
  category: string
  price: string
  tt: string
  size: string
  image: string
}

const EditProduct: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ProductData>({
    title: '',
    desc: '',
    category: '',
    price: '',
    tt: '',
    size: '',
    image: ''
  })
  const [newImage, setNewImage] = useState<File | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch(`${config.API_URL}/api/admin/categories`, { credentials: 'include' }),
          fetch(`http://localhost:8000/api/admin/products/${id}`, { credentials: 'include' })
        ])
        
        if (catRes.ok && prodRes.ok) {
          const catData = await catRes.json()
          const prodData = await prodRes.json()
          setCategories(catData.categories)
          setFormData({
            ...prodData.product,
            price: prodData.product.price.toString(),
            tt: prodData.product.tt.toString(),
            size: prodData.product.size.toString()
          })
        }
      } catch (err) {
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'image' && key !== '_id' && key !== '__v' && key !== 'slug' && key !== 'createdAt' && key !== 'updatedAt') {
        data.append(key, value)
      }
    })
    if (newImage) data.append('image', newImage)

    try {
      const res = await fetch(`http://localhost:8000/admin/products/edit-product/${id}`, {
        method: 'POST',
        body: data,
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      })

      const result = await res.json()
      if (res.ok && result.ok) {
        navigate('/admin/dashboard')
      } else {
        setError(result.message || 'Failed to update product.')
      }
    } catch (err) {
      setError('An error occurred during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="state-center"><div className="spinner" /><p>Loading product details...</p></div>

  return (
    <div className="admin-page">
      <div className="admin-container narrow-content">
        <div className="admin-header">
          <div>
            <Link to="/admin/dashboard" className="back-link">
              <i className="fas fa-arrow-left" /> Back to Dashboard
            </Link>
            <h1>Edit Product</h1>
          </div>
        </div>

        <div className="admin-section">
          <form onSubmit={handleSubmit} className="admin-form">
            {error && <div className="auth-error">{error}</div>}
            
            <div className="form-field">
              <label className="form-label">Product Name</label>
              <input 
                type="text" 
                className="form-input" 
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
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {formData.image && (
                  <div className="img-preview-mini">
                    <img src={formData.image} alt="Product" />
                  </div>
                )}
                <div className="file-upload-box" style={{ flex: 1 }}>
                  <input 
                    type="file" 
                    id="edit-image"
                    className="file-input-hidden" 
                    onChange={e => setNewImage(e.target.files ? e.target.files[0] : null)}
                    accept="image/*"
                  />
                  <label htmlFor="edit-image" className="file-input-label">
                    <i className="fas fa-camera" />
                    <span>{newImage ? newImage.name : 'Update image (optional)'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: 24 }}>
              <button type="submit" className="btn btn-brand" disabled={submitting} style={{ width: '100%' }}>
                {submitting ? 'Saving Changes...' : 'Save Product Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditProduct
