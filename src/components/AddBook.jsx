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
    try {
      const config = await getAuthHeaders()
      const response = await axios.post(`${API_URL}/books`, {
        title: newBook.title,
        author: newBook.author,
        isbn: newBook.isbn || null,
        publishedYear: newBook.publishedYear ? parseInt(newBook.publishedYear) : null
      }, config)

      setSuccess(true)
      setError(null)

      // Redirect to the new book's detail page after a moment
      setTimeout(() => {
        navigate(`/book/${response.data.id}`)
      }, 1500)
    } catch (err) {
      setError('Failed to create book: ' + err.message)
      setSuccess(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <div className="add-book-page">
      <h2>Add New Book</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Book created successfully! Redirecting...</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            placeholder="Enter book title"
            value={newBook.title}
            onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            id="author"
            type="text"
            placeholder="Enter author name"
            value={newBook.author}
            onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="isbn">ISBN (optional)</label>
          <input
            id="isbn"
            type="text"
            placeholder="Enter ISBN"
            value={newBook.isbn}
            onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
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
            value={newBook.publishedYear}
            onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Add Book
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBook