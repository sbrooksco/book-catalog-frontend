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
    if (!isAdmin) {
      navigate('/')
      return
    }
    fetchBook()
  }, [bookId, isAdmin])

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
      const config = await getAuthHeaders()
      const response = await axios.get(`${API_URL}/books/${bookId}`, config)
      setBook({
        title: response.data.title,
        author: response.data.author,
        isbn: response.data.isbn || '',
        publishedYear: response.data.publishedYear || ''
      })
      setError(null)
    } catch (err) {
      setError('Failed to load book: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = await getAuthHeaders()
      await axios.put(`${API_URL}/books/${bookId}`, {
        title: book.title,
        author: book.author,
        isbn: book.isbn || null,
        publishedYear: book.publishedYear ? parseInt(book.publishedYear) : null
      }, config)

      setSuccess(true)
      setError(null)

      // Redirect back to book detail after a moment
      setTimeout(() => {
        navigate(`/book/${bookId}`)
      }, 1500)
    } catch (err) {
      setError('Failed to update book: ' + err.message)
      setSuccess(false)
    }
  }

  const handleCancel = () => {
    navigate(`/book/${bookId}`)
  }

  if (!isAdmin) {
    return <div className="error">Access denied. Admin only.</div>
  }

  if (loading) return <div className="loading">Loading book...</div>

  return (
    <div className="edit-book-page">
      <h2>Edit Book</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Book updated successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Enter book title"
            value={book.title}
            onChange={(e) => setBook({ ...book, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            id="author"
            type="text"
            placeholder="Enter author name"
            value={book.author}
            onChange={(e) => setBook({ ...book, author: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="isbn">ISBN (optional)</label>
          <input
            id="isbn"
            type="text"
            placeholder="Enter ISBN"
            value={book.isbn}
            onChange={(e) => setBook({ ...book, isbn: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="year">Published Year (optional)</label>
          <input
            id="year"
            type="number"
            placeholder="Enter publication year"
            min="1000"
            max="2100"
            value={book.publishedYear}
            onChange={(e) => setBook({ ...book, publishedYear: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Update Book
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditBook