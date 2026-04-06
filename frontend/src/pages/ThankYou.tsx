import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const ThankYou: React.FC = () => {
  const [show, setShow] = useState(false)
  useEffect(() => { setTimeout(() => setShow(true), 80) }, [])

  return (
    <div className="thankyou-page">
      <div
        className="thankyou-card"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <div className="thankyou-check">
          <i className="fas fa-check" />
        </div>

        <h1>Order Placed!</h1>
        <p>
          Thank you for shopping with{' '}
          <strong style={{ color: 'var(--brand)' }}>Mansoon Gruhudyog</strong>.
          <br />
          Your order has been received and is being processed.
        </p>

        <div className="thankyou-actions">
          <Link to="/my-orders" className="btn btn-brand" style={{ fontSize: 15, padding: '13px 24px' }}>
            <i className="fas fa-box" /> View My Orders
          </Link>
          <Link to="/products" className="btn btn-ghost" style={{ fontSize: 14, padding: '12px 24px' }}>
            <i className="fas fa-shopping-bag" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ThankYou
