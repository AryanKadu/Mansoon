import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register: React.FC = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', username: '', mobile: '', password: '', password2: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.ok) {
      setSuccess('Account created! Redirecting to login…')
      setTimeout(() => navigate('/login'), 1500)
    } else {
      setError(result.message || 'Registration failed')
    }
  }

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value })
  })

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <img src="/images/product_images/logomo.png" alt="Mansoon" className="auth-logo" />
        <h1>Create your account</h1>
        <p className="auth-sub">Join Mansoon Gruhudyog — it's free</p>

        {error && (
          <div className="auth-error">
            <i className="fas fa-circle-exclamation" />{error}
          </div>
        )}
        {success && (
          <div className="auth-success">
            <i className="fas fa-circle-check" />{success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <div className="form-input-wrap">
                <i className="fas fa-user form-input-icon" />
                <input id="reg-name" className="form-input" type="text" placeholder="Your full name" {...f('name')} required />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Mobile</label>
              <div className="form-input-wrap">
                <i className="fas fa-phone form-input-icon" />
                <input id="reg-mobile" className="form-input" type="tel" placeholder="10-digit number" {...f('mobile')} required />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrap">
              <i className="fas fa-envelope form-input-icon" />
              <input id="reg-email" className="form-input" type="email" placeholder="you@example.com" {...f('email')} required />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Username</label>
            <div className="form-input-wrap">
              <i className="fas fa-at form-input-icon" />
              <input id="reg-username" className="form-input" type="text" placeholder="Choose a username" {...f('username')} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Password</label>
              <div className="form-input-wrap">
                <i className="fas fa-lock form-input-icon" />
                <input id="reg-password" className="form-input" type="password" placeholder="Min 6 characters" {...f('password')} required minLength={6} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Confirm Password</label>
              <div className="form-input-wrap">
                <i className="fas fa-lock form-input-icon" />
                <input id="reg-password2" className="form-input" type="password" placeholder="Repeat password" {...f('password2')} required minLength={6} />
              </div>
            </div>
          </div>

          <button id="reg-submit" type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> Creating account…</>
              : <><i className="fas fa-user-plus" /> Create Account</>
            }
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
