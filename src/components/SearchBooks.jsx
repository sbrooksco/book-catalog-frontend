import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://book-service-innn.onrender.com'

function SearchBooks() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState({
    title: '',
    author: '',
    year: ''
  })

  useEffect(() => {
    // Load all books initially
    searchBooks()
  }, [])

  const getAuthHeaders = async () => {
    const token = await getToken()
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  const searchBooks = async (e) => {
    if (e) e.preventDefault()

    try {
      setLoading(true)
      const config = await getAuthHeaders()

      // Build query params
      const params = new URLSearchParams()
      if (searchParams.title) params.append('title', searchParams.title)
      if (searchParams.author) params.append('author', searchParams.author)
      if (searchParams.year) params.append('year', searchParams.year)

      const url = params.toString()
        ? `${API_URL}/books/search?${params.toString()}`
        : `${API_URL}/books`

      const response = await axios.get(url, config)
      setBooks(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to search books: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSearchParams({ title: '', author: '', year: '' })
    // Reload all books
    setTimeout(searchBooks, 100)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? This will also delete all associated reviews.')) return
    try {
      const config = await getAuthHeaders()
      await axios.delete(`${API_URL}/books/${id}`, config)
      searchBooks()
    } catch (err) {
      setError('Failed to delete book: ' + err.message)
    }
  }

  return (
    <div className="search-books-page">
      <h2>Search Books</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={searchBooks} className="search-form">
        <div className="search-inputs">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchParams.title}
            onChange={(e) => setSearchParams({ ...searchParams, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Search by author..."
            value={searchParams.author}
            onChange={(e) => setSearchParams({ ...searchParams, author: e.target.value })}
          />
          <input
            type="number"
            placeholder="Published year..."
            min="1000"
            max="2100"
            value={searchParams.year}
            onChange={(e) => setSearchParams({ ...searchParams, year: e.target.value })}
          />
        </div>
        <div className="search-buttons">
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            Clear
          </button>
        </div>
      </form>

      <div className="books-list">
        <h3>
          {books.length === 0
            ? 'No books found'
            : `Found ${books.length} book${books.length !== 1 ? 's' : ''}`}
        </h3>

        {books.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <button
                      className="book-title-link"
                      onClick={() => navigate(`/book/${book.id}`)}
                    >
                      {book.title}
                    </button>
                  </td>
                  <td>{book.author}</td>
                  <td>{book.isbn || '-'}</td>
                  <td>{book.publishedYear || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default SearchBooks