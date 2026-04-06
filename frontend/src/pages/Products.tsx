import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

type Product = {
  _id: string
  title: string
  slug: string
  desc: string
  category: string
  price: number
  image: string
  tt: number
  inStock?: boolean
  size: number
}

interface Toast {
  type: 'success' | 'error'
  message: string
}

import { config } from '../config';
const API = config.API_URL;

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<Toast | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message })
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 3000)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API}/api/products?limit=200`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = (await res.json()) as { products: Product[] }
        if (!cancelled) setProducts(Array.isArray(data.products) ? data.products : [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const addToCart = async (slug: string, title: string) => {
    setAdding(slug)
    try {
      const res = await fetch(`${API}/cart/add/${slug}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      })
      const data = await res.json()
      if (data.ok) {
        showToast('success', `${title} added to cart!`)
      } else {
        showToast('error', data.message || 'Failed to add to cart')
      }
    } catch {
      showToast('error', 'Network error. Please try again.')
    } finally {
      setAdding(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return [...products]
      .filter(p => !q || p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
      .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }, [products, search])

  return (
    <div className="products-page">
      <Helmet>
        <title>Our Collection - Mansoon Gruhudyog</title>
        <meta name="description" content="Explore our fresh and natural products." />
      </Helmet>
      {/* Toast Notification */}
      <div className={`custom-alert ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'error' : ''}`}>
        <span className="alert-icon">{toast?.type === 'success' ? '✅' : '❌'}</span>
        <span>{toast?.message}</span>
        <button className="close-btn" onClick={() => setToast(null)}>&times;</button>
      </div>

      <div className="products-banner">
        <span className="badge badge-brand" style={{ marginBottom: 12 }}>
          <i className="fas fa-layer-group" /> Our Collection
        </span>
        <h1>
          Explore <span style={{ color: 'var(--brand)' }}>Freshness</span>
        </h1>
        <p>Natural beverages crafted with care from Kolhapur</p>

        {!loading && products.length > 0 && (
          <div className="search-wrap">
            <i className="fas fa-search" />
            <input
              className="search-input"
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="products-container">
        {loading && (
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="product-card" style={{ padding: 12 }}>
                 <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 16 }} />
                 <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                 <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                    <div className="skeleton" style={{ width: '45%', height: 36, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: '45%', height: 36, borderRadius: 6 }} />
                 </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="state-center">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: 32, color: '#dc2626' }} />
            <p style={{ color: '#dc2626' }}>{error}</p>
            <button className="btn btn-ghost" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filtered.length === 0 && (
              <div className="state-center">
                <i className="fas fa-search" style={{ fontSize: 40, color: 'var(--border)' }} />
                <h3>No results found</h3>
                <p>Try searching for something else.</p>
                <button className="btn btn-ghost" onClick={() => setSearch('')}>Clear Search</button>
              </div>
            )}

            <div className="products-grid">
              {filtered.map(p => {
                const inStock = (p.tt ?? 0) > 0 && (p.inStock ?? true)
                const imgSrc = p.image || '/images/product_images/logomo.png'

                return (
                  <div key={p._id} className="product-card">
                    <Link to={`/products/${p.category}/${p.slug}`} className="product-img-wrap">
                      <img
                        src={imgSrc}
                        alt={p.title}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/product_images/logomo.png' }}
                      />
                      {!inStock && (
                        <div className="product-card-overlay">
                          <span className="badge badge-danger">Out of Stock</span>
                        </div>
                      )}
                    </Link>

                    <div className="product-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h3 className="product-title" title={p.title}>{p.title}</h3>
                        <span className="badge" style={{ padding: '2px 8px', fontSize: 10, background: 'var(--gray-50)', color: 'var(--gray-600)' }}>
                          {p.size}ml
                        </span>
                      </div>
                      
                      <div className="product-price">₹{Number(p.price || 0).toFixed(2)}</div>

                      <div className="product-actions">
                        <Link
                          to={`/products/${p.category}/${p.slug}`}
                          className="btn btn-brand"
                        >
                          <i className="fas fa-eye" /> View
                        </Link>
                        {inStock && (
                           <button
                              onClick={() => addToCart(p.slug, p.title)}
                              disabled={adding === p.slug}
                              className="btn btn-outline"
                              title="Add to Cart"
                           >
                              {adding === p.slug ? (
                                <i className="fas fa-spinner fa-spin" />
                              ) : (
                                <i className="fas fa-cart-plus" />
                              )}
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Products
