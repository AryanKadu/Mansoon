import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Helmet>
        <title>Mansoon Gruhudyog - Natural & Homemade</title>
        <meta name="description" content="100% Natural & Homemade beverages from Kolhapur." />
      </Helmet>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">

          {/* Left: Content */}
          <div className="hero-content">
            <div className="hero-eyebrow">
              <i className="fas fa-leaf" />
              100% Natural &amp; Homemade
            </div>

            <h1 className="hero-title">
              Taste the<br />
              Freshness of{' '}
              <span className="highlight">Mansoon</span>
            </h1>

            <p className="hero-subtitle">
              Premium fresh juices, sarbats &amp; cold drinks crafted from
              the finest fruits using traditional recipes — delivered to your door.
            </p>

            <div className="hero-actions">
              <Link to="/products" className="btn btn-brand" style={{ fontSize: 15, padding: '13px 30px' }}>
                <i className="fas fa-shopping-bag" />
                Shop Now
              </Link>
              <Link to="/coming-soon" className="btn btn-ghost" style={{ fontSize: 15, padding: '13px 30px' }}>
                <i className="fas fa-circle-info" />
                About Us
              </Link>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">1000+</div>
                <div className="hero-stat-label">Happy Customers</div>
              </div>
              <div>
                <div className="hero-stat-value">20+</div>
                <div className="hero-stat-label">Products</div>
              </div>
              <div>
                <div className="hero-stat-value">4.9★</div>
                <div className="hero-stat-label">Avg Rating</div>
              </div>
            </div>
          </div>

          {/* Right: Image blob */}
          <div className="hero-image-wrap">
            <div className="hero-image-blob">
              <img
                src="/images/product_images/logomo.png"
                alt="Mansoon Fresh Products"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Features Strip ──────────────────────────── */}
      <section className="features-strip">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon"><i className="fas fa-truck" /></div>
            <div>
              <div className="feature-title">Fast Delivery</div>
              <div className="feature-desc">Pan India delivery within 2–4 days.</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><i className="fas fa-hand-holding-heart" /></div>
            <div>
              <div className="feature-title">Homemade Quality</div>
              <div className="feature-desc">Traditional recipes, finest ingredients.</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><i className="fas fa-indian-rupee-sign" /></div>
            <div>
              <div className="feature-title">Affordable Prices</div>
              <div className="feature-desc">Premium taste at the best value.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Strip ───────────────────────────────── */}
      <section className="cta-strip">
        <h2>Ready to taste the difference?</h2>
        <p>
          Explore our full range of refreshing beverages crafted with love from
          Kolhapur, Maharashtra.
        </p>
        <Link to="/products" className="btn btn-white">
          <i className="fas fa-arrow-right" />
          Explore All Products
        </Link>
      </section>

    </div>
  )
}

export default Home
