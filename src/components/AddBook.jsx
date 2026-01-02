import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://book-service-innn.onrender.com'

function AddBook() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publishedYear: ''
  })

  const getAuthHeaders = async () => {
    const token = await getToken()
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const config = await getAuthHeaders()
      const response = await axios.post(`${API_URL}/books`, {
        title: newBook.title.trim(),
        author: newBook.author.trim(),
        isbn: newBook.isbn.trim() || null,
        publishedYear: newBook.publishedYear ? parseInt(newBook.publishedYear) : null
      }, config)

      setSuccess(true)

      // Redirect to the new book's detail page after a moment
      setTimeout(() => {
        navigate(`/book/${response.data.id}`)
      }, 1500)
    } catch (err) {
      setError('Failed to create book: ' + (err.response?.data?.message || err.message))
      setSuccess(false)
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const isFormValid = newBook.title.trim() && newBook.author.trim()

  return (
    <div className="add-book-page">
      <h2>📖 Add New Book</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">✅ Book created successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">
            Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., The Great Gatsby"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
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
            placeholder="e.g., F. Scott Fitzgerald"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
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
            placeholder="e.g., 978-0-7432-7356-5"
            value={newBook.isbn}
            onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
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
            placeholder="e.g., 1925"
            min="1000"
            max="2100"
            value={newBook.publishedYear}
            onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })}
            disabled={submitting}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid || submitting}
          >
            {submitting ? '📚 Adding Book...' : '➕ Add Book'}
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
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-primary)' }}>💡 Tips</h4>
        <ul style={{
          paddingLeft: '1.5rem',
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
          lineHeight: '1.7'
        }}>
          <li>Title and Author are required fields</li>
          <li>ISBN should be in standard format (e.g., 978-0-7432-7356-5)</li>
          <li>After adding the book, you'll be redirected to its detail page where you can add reviews</li>
        </ul>
      </div>
    </div>
  )
}

export default AddBook