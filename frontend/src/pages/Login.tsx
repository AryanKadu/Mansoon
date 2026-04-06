import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)
    if (result.ok) {
      navigate('/products')
    } else {
      setError(result.message || 'Invalid credentials')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card narrow">
        <img src="/images/product_images/logomo.png" alt="Mansoon" className="auth-logo" />
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to your Mansoon account</p>

        {error && (
          <div className="auth-error">
            <i className="fas fa-circle-exclamation" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label className="form-label">Username</label>
            <div className="form-input-wrap">
              <i className="fas fa-user form-input-icon" />
              <input
                id="login-username"
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="form-input-wrap">
              <i className="fas fa-lock form-input-icon" />
              <input
                id="login-password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button id="login-submit" type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> Signing in…</>
              : <><i className="fas fa-arrow-right-to-bracket" /> Sign In</>
            }
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
