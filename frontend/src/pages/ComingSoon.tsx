import React from 'react'
import { Link } from 'react-router-dom'

const ComingSoon: React.FC = () => {
  return (
    <div className="coming-soon-page">
      <div>
        <div className="coming-soon-icon">
          <i className="fas fa-rocket" />
        </div>
        <h1>Coming Soon</h1>
        <p>
          We're working hard to bring this page to life. Stay tuned for something amazing!
        </p>
        <Link to="/home" className="btn btn-brand" style={{ margin: '0 auto', fontSize: 15, padding: '12px 32px' }}>
          <i className="fas fa-arrow-left" /> Back to Home
        </Link>
      </div>
    </div>
  )
}

export default ComingSoon
