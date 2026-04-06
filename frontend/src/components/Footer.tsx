import React from 'react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <img
              src="/images/product_images/logomo.png"
              alt="Mansoon Logo"
              className="footer-logo"
            />
            <h5>Mansoon Gruhudyog</h5>
            <p>
              Premium fresh juices, sarbats &amp; cold drinks made from the finest fruits.
              Refreshing your day, naturally!
            </p>
            <div className="social-icons">
              <a href="#" className="social-icon" title="Facebook">
                <i className="fab fa-facebook-f" />
              </a>
              <a href="#" className="social-icon" title="Instagram">
                <i className="fab fa-instagram" />
              </a>
              <a href="#" className="social-icon" title="Twitter">
                <i className="fab fa-twitter" />
              </a>
              <a href="#" className="social-icon" title="YouTube">
                <i className="fab fa-youtube" />
              </a>
              <a href="#" className="social-icon" title="WhatsApp">
                <i className="fab fa-whatsapp" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li>
                <a href="/products">All Products</a>
              </li>
              <li>
                <a href="/products/juices">Fresh Juices</a>
              </li>
              <li>
                <a href="/products/sarbats">Sarbats</a>
              </li>
              <li>
                <a href="/products/cold-drinks">Cold Drinks</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h5>Customer Service</h5>
            <ul className="footer-links">
              <li>
                <a href="/faq">FAQ</a>
              </li>
              <li>
                <a href="/coming-soon">Shipping Info</a>
              </li>
              <li>
                <a href="/coming-soon">Returns &amp; Refunds</a>
              </li>
              <li>
                <a href="/coming-soon">Track Your Order</a>
              </li>
              <li>
                <a href="/coming-soon">Customer Support</a>
              </li>
              <li>
                <a href="/coming-soon">Bulk Orders</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h5>Get in Touch</h5>
            <div className="contact-info">
              <i className="fas fa-map-marker-alt" />
              <span>Mansoon Mahila Gruh Udyog, Kolhapur, Maharashtra, India</span>
            </div>
            <div className="contact-info">
              <i className="fas fa-phone" />
              <span>+91 7038905454</span>
            </div>
            <div className="contact-info">
              <i className="fas fa-envelope" />
              <span>info@mansoongruhudyog.com</span>
            </div>
            <div className="contact-info">
              <i className="fas fa-clock" />
              <span>Mon-Sat: 8AM-8PM</span>
            </div>

            <h5 style={{ marginTop: '1.5rem' }}>Stay Fresh!</h5>
            <p>Subscribe for exclusive offers and new product updates.</p>
            <form
              className="newsletter-form"
              onSubmit={e => {
                e.preventDefault()
                const form = e.currentTarget
                const input = form.querySelector<HTMLInputElement>('.newsletter-input')
                if (input && input.value) {
                  alert('Thank you for subscribing!')
                  input.value = ''
                }
              }}
            >
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email"
                required
              />
              <button type="submit" className="newsletter-btn">
                <i className="fas fa-paper-plane" />
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {currentYear} Mansoon Gruhudyog. All rights reserved. |{' '}
            <a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a> | Made
            with ❣️ for fresh living
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

