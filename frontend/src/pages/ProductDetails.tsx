import { config } from '../config';
import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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

type GalleryImage = {
  name: string
  full: string
  thumb: string
}

const ProductDetails: React.FC = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!slug) throw new Error('Missing product slug')
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data = (await res.json()) as { product: Product; galleryImages?: GalleryImage[] }
        if (!cancelled) {
          setProduct(data.product ?? null)
          setGallery(Array.isArray(data.galleryImages) ? data.galleryImages : [])
          setQuantity(1)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load product')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(t)
  }, [toast])

  if (loading) return (
    <div className="product-details-page">
      <div className="container">
        <div className="product-details-grid">
           <div className="skeleton" style={{ width: '100%', height: 400, borderRadius: 12 }} />
           <div className="product-info-col">
              <div className="skeleton skeleton-text" style={{ width: '60%', height: 32, marginBottom: 16 }} />
              <div className="skeleton skeleton-text" style={{ width: '30%', height: 24, marginBottom: 24 }} />
              <div className="skeleton skeleton-text" style={{ width: '100%', height: 16 }} />
              <div className="skeleton skeleton-text" style={{ width: '90%', height: 16 }} />
              <div className="skeleton skeleton-text" style={{ width: '40%', height: 16, marginBottom: 32 }} />
              <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: 8 }} />
           </div>
        </div>
      </div>
    </div>
  )

  if (error || !product) {
    return (
      <div className="product-details-page">
        <div className="container">
          <div className="state-center">
             <i className="fas fa-exclamation-circle" style={{ fontSize: 40, color: 'var(--brand)' }} />
             <h2>Error Loading Product</h2>
             <p>{error || 'Product not found.'}</p>
             <Link to="/products" className="btn btn-brand" style={{ marginTop: 12 }}>
                <i className="fas fa-arrow-left" /> Back to Products
             </Link>
          </div>
        </div>
      </div>
    )
  }

  const inStock = (product.tt ?? 0) > 0 && (product.inStock ?? true)
  const mainImageSrc = product.image || '/images/product_images/logomo.png'

  const clampQuantity = (value: number) => Math.max(1, Math.min(10, value))

  const addToCart = async () => {
    try {
      const res = await fetch(`http://localhost:8000/cart/add/${encodeURIComponent(product.slug)}`, {
        method: 'GET',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Add to cart failed: ${res.status}`)
      setToast({ type: 'success', message: `${product.title} added to cart!` })
    } catch (e) {
      setToast({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to add to cart',
      })
    }
  }

  const buyNow = () => {
    navigate('/address-selection', { 
      state: { 
        productId: product._id, 
        quantity, 
        productTitle: product.title, 
        productPrice: product.price 
      } 
    })
  }

  return (
    <div className="product-details-page">
      <Helmet>
        <title>{product.title} - Mansoon Gruhudyog</title>
        <meta name="description" content={product.desc?.substring(0, 160) || 'Fresh natural beverages from Kolhapur.'} />
        <meta property="og:title" content={`${product.title} - Mansoon Gruhudyog`} />
        <meta property="og:image" content={product.image || ''} />
      </Helmet>
      <div className={`custom-alert ${toast ? 'show' : ''} ${toast?.type === 'error' ? 'error' : ''}`}>
        <span className="alert-icon">{toast?.type === 'success' ? '✅' : '❌'}</span>
        <span>{toast?.message}</span>
        <button className="close-btn" onClick={() => setToast(null)}>&times;</button>
      </div>

      <div className="container">
        <div className="product-details-grid">
          
          {/* Left: Gallery */}
          <div className="product-gallery">
            <div className="main-img-wrap" onClick={() => setZoomSrc(mainImageSrc)}>
              <img src={mainImageSrc} alt={product.title} />
            </div>
            
            {(gallery.length > 0 || product.image) && (
              <div className="thumb-grid">
                <div className={`thumb-item ${!zoomSrc || zoomSrc === mainImageSrc ? 'active' : ''}`} onClick={() => setZoomSrc(mainImageSrc)}>
                   <img src={mainImageSrc} alt="Main" />
                </div>
                {gallery.map(img => (
                  <div key={img.name} className={`thumb-item ${zoomSrc === img.full ? 'active' : ''}`} onClick={() => setZoomSrc(img.full)}>
                    <img src={img.thumb} alt="Thumb" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="product-info-panel">
            <div className="info-header">
              <span className="badge badge-brand">{product.category}</span>
              <h1>{product.title}</h1>
              <div className="info-price">₹{Number(product.price || 0).toFixed(2)}</div>
            </div>

            <p className="info-desc">{product.desc}</p>

            <div className="info-specs">
              <div className="spec-item">
                <div className="spec-icon"><i className="fas fa-flask" /></div>
                <div className="spec-content">
                  <label>Volume</label>
                  <span>{product.size} ml</span>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-icon"><i className="fas fa-certificate" /></div>
                <div className="spec-content">
                  <label>Quality</label>
                  <span>100% Homemade</span>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-icon"><i className="fas fa-truck-fast" /></div>
                <div className="spec-content">
                  <label>Delivery</label>
                  <span>Standard Shipping</span>
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-icon">
                  <i className={`fas ${inStock ? 'fa-check' : 'fa-times'}`} style={{ color: inStock ? '#16a34a' : '#dc2626' }} />
                </div>
                <div className="spec-content">
                  <label>Availability</label>
                  <span style={{ color: inStock ? '#16a34a' : '#dc2626' }}>
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {inStock ? (
              <div className="info-actions">
                <div className="qty-selector-wrap">
                  <label className="qty-label">Select Quantity:</label>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => setQuantity(q => clampQuantity(q - 1))}>
                      <i className="fas fa-minus" />
                    </button>
                    <input 
                      className="qty-input" 
                      type="number" 
                      value={quantity} 
                      onChange={e => setQuantity(clampQuantity(parseInt(e.target.value) || 1))} 
                    />
                    <button className="qty-btn" onClick={() => setQuantity(q => clampQuantity(q + 1))}>
                      <i className="fas fa-plus" />
                    </button>
                  </div>
                </div>

                <div className="action-btns">
                  <form onSubmit={e => { e.preventDefault(); buyNow() }}>
                    <button type="submit" className="btn btn-brand" style={{ width: '100%' }}>
                      <i className="fas fa-bolt" /> Buy Now
                    </button>
                  </form>
                  <button className="btn btn-outline" onClick={addToCart}>
                    <i className="fas fa-cart-plus" /> Add to Cart
                  </button>
                </div>
              </div>
            ) : (
              <div className="out-of-stock-msg" style={{ 
                padding: '16px', 
                background: '#fff1f2', 
                color: '#be123c', 
                borderRadius: '12px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                <i className="fas fa-circle-info" style={{ marginRight: 8 }} />
                Currently Out of Stock
              </div>
            )}
          </div>

        </div>
      </div>

      {zoomSrc && (
        <div className="image-zoom-overlay active" onClick={() => setZoomSrc(null)}>
          <button className="zoom-close"><i className="fas fa-times" /></button>
          <img src={zoomSrc} alt="Zoomed" />
        </div>
      )}
    </div>
  )
}

export default ProductDetails
