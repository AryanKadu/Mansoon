import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.container}>
          {/* Logo */}
          <Link to="/home" style={styles.brand}>
            <img
              src="/images/product_images/logomo.png"
              alt="Mansoon Logo"
              height={60}
              style={{ objectFit: 'contain' }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul style={styles.navLinks}>
            <li>
              <Link to="/home" style={styles.navLink}>
                <i className="fas fa-home" style={styles.icon} />
                Home
              </Link>
            </li>
            <li>
              <Link to="/products" style={styles.navLink}>
                <i className="fas fa-th-large" style={styles.icon} />
                Products
              </Link>
            </li>
            <li>
              <Link to="/coming-soon" style={styles.navLink}>
                <i className="fa-solid fa-circle-info" style={styles.icon} />
                About Us
              </Link>
            </li>
            <li>
              <Link to="/cart" style={styles.navLink}>
                <i className="fas fa-shopping-cart" style={styles.icon} />
                Cart
              </Link>
            </li>
            <li>
              <Link to="/my-orders" style={styles.navLink}>
                <i className="fa-solid fa-box" style={styles.icon} />
                My Orders
              </Link>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div style={styles.authButtons}>
            {user ? (
              <>
                <span style={styles.userGreet}>
                  <i className="fas fa-user-circle" style={{ marginRight: 6 }} />
                  {user.name.split(' ')[0]}
                </span>
                {(user.admin === true || user.admin === 1) && (
                  <Link to="/admin/dashboard" style={styles.loginBtn}>
                    <i className="fa-solid fa-user-tie" style={{ marginRight: 6 }} />
                    Admin
                  </Link>
                )}
                <button onClick={logout} style={styles.loginBtn}>
                  <i className="fas fa-sign-out-alt" style={{ marginRight: 6 }} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.loginBtn}>
                  <i className="fas fa-sign-in-alt" style={{ marginRight: 6 }} />
                  Login
                </Link>
                <Link to="/register" style={styles.registerBtn}>
                  <i className="fas fa-user-plus" style={{ marginRight: 6 }} />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            style={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={styles.mobileMenu}>
            <Link to="/home" style={styles.mobileLink}><i className="fas fa-home" style={styles.icon} /> Home</Link>
            <Link to="/products" style={styles.mobileLink}><i className="fas fa-th-large" style={styles.icon} /> Products</Link>
            <Link to="/coming-soon" style={styles.mobileLink}><i className="fa-solid fa-circle-info" style={styles.icon} /> About Us</Link>
            <Link to="/cart" style={styles.mobileLink}><i className="fas fa-shopping-cart" style={styles.icon} /> Cart</Link>
            <Link to="/my-orders" style={styles.mobileLink}><i className="fa-solid fa-box" style={styles.icon} /> My Orders</Link>
            {(user?.admin === true || user?.admin === 1) && (
              <Link to="/admin/dashboard" style={{ ...styles.mobileLink, color: '#f07d13' }}>
                <i className="fa-solid fa-user-tie" style={styles.icon} /> Admin Dashboard
              </Link>
            )}
            <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
            {user ? (
              <button onClick={logout} style={{ ...styles.mobileLink, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <i className="fas fa-sign-out-alt" style={styles.icon} /> Logout ({user.name.split(' ')[0]})
              </button>
            ) : (
              <>
                <Link to="/login" style={styles.mobileLink}><i className="fas fa-sign-in-alt" style={styles.icon} /> Login</Link>
                <Link to="/register" style={styles.mobileLink}><i className="fas fa-user-plus" style={styles.icon} /> Register</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 20px rgba(0,0,0,0.35)',
  },
  nav: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    height: 70,
    gap: 16,
  },
  brand: {
    textDecoration: 'none',
    flexShrink: 0,
  },
  navLinks: {
    display: 'flex',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    gap: 4,
    flex: 1,
    alignItems: 'center',
  },
  navLink: {
    color: 'rgba(255,255,255,0.82)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'background 0.2s, color 0.2s',
    whiteSpace: 'nowrap',
  },
  icon: {
    fontSize: 13,
  },
  authButtons: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexShrink: 0,
  },
  userGreet: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
  },
  loginBtn: {
    color: 'rgba(255,255,255,0.88)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '7px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'none',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s, border-color 0.2s',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
  registerBtn: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    padding: '7px 16px',
    borderRadius: 8,
    background: 'linear-gradient(135deg, #e44d26, #f07d13)',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 3px 12px rgba(228,77,38,0.4)',
    transition: 'opacity 0.2s, transform 0.15s',
    whiteSpace: 'nowrap',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    fontSize: 18,
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    flexShrink: 0,
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    background: '#16213e',
    padding: '12px 20px 16px',
    gap: 4,
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mobileLink: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: 15,
    padding: '10px 8px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    transition: 'background 0.2s',
  },
}

export default Header

