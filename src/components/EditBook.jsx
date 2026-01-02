import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://book-service-innn.onrender.com'

function EditBook() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [book, setBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: ''
  })

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    // Redirect non-admins
    if (user && !isAdmin) {
      navigate('/')
      return
    }
    if (user) {
      fetchBook()
    }
  }, [bookId, isAdmin, user])

  const getAuthHeaders = async () => {
    const token = await getToken()
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  const fetchBook = async () => {
    try {
      setLoading(true)
      setError(null)
      const config = await getAuthHeaders()
      const response = await axios.get(`${API_URL}/books/${bookId}`, config)
      setBook({
        title: response.data.title,
        author: response.data.author,
        isbn: response.data.isbn || '',
        publishedYear: response.data.publishedYear || ''
      })
    } catch (err) {
      setError('Failed to load book: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const config = await getAuthHeaders()
      await axios.put(`${API_URL}/books/${bookId}`, {
        title: book.title.trim(),
        author: book.author.trim(),
        isbn: book.isbn.trim() || null,
        publishedYear: book.publishedYear ? parseInt(book.publishedYear) : null
      }, config)

      setSuccess(true)

      // Redirect back to book detail after a moment
      setTimeout(() => {
        navigate(`/book/${bookId}`)
      }, 1500)
    } catch (err) {
      setError('Failed to update book: ' + (err.response?.data?.message || err.message))
      setSuccess(false)
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/book/${bookId}`)
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  if (!isAdmin) {
    return (
      <div className="error" style={{ marginTop: '2rem' }}>
        🔒 Access denied. This page is only accessible to administrators.
      </div>
    )
  }

  if (loading) return <div className="loading">Loading book details...</div>

  const isFormValid = book.title.trim() && book.author.trim()

  return (
    <div className="edit-book-page">
      <button onClick={handleCancel} className="back-btn">
        ← Back to Book
      </button>

      <h2>✏️ Edit Book</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">✅ Book updated successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="Enter book title"
            value={book.title}
            onChange={(e) => setBook({ ...book, title: e.target.value })}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">
            Author *
          </label>
          <input
            id="author"
            type="text"
            placeholder="Enter author name"
            value={book.author}
            onChange={(e) => setBook({ ...book, author: e.target.value })}
            required
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="isbn">
            ISBN <span style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(optional)</span>
          </label>
          <input
            id="isbn"
            type="text"
            placeholder="Enter ISBN"
            value={book.isbn}
            onChange={(e) => setBook({ ...book, isbn: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">
            Published Year <span style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>(optional)</span>
          </label>
          <input
            id="year"
            type="number"
            placeholder="Enter publication year"
            min="1000"
            max="2100"
            value={book.publishedYear}
            onChange={(e) => setBook({ ...book, publishedYear: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid || submitting}
          >
            {submitting ? '💾 Saving Changes...' : '💾 Update Book'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>

      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: 'rgba(239, 68, 68, 0.05)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}>
        <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-error)' }}>⚠️ Important</h4>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
          lineHeight: '1.7'
        }}>
          Changes to this book will be visible to all users. Make sure all information is accurate before saving.
        </p>
      </div>
    </div>
  )
}

export default EditBook