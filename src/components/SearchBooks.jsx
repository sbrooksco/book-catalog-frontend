import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'https://book-service-innn.onrender.com'

function SearchBooks() {
  const { getToken, isSignedIn } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState({
    title: '',
    author: '',
    year: ''
  })

  // Check if current user is admin
  const isAdmin = user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    // Load all books initially
    searchBooks()
  }, [])

  const getAuthHeaders = async () => {
    if (!isSignedIn) return {}
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
      setError(null)
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
    } catch (err) {
      setError('Failed to search books: ' + err.message)
      setBooks([])
    } finally {
      setLoading(false)
      setInitialLoad(false)
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

      // Remove the book from the current list without re-fetching
      setBooks(books.filter(book => book.id !== id))

      // Show success feedback
      const successMsg = document.createElement('div')
      successMsg.className = 'success'
      successMsg.textContent = 'Book deleted successfully'
      successMsg.style.position = 'fixed'
      successMsg.style.top = '20px'
      successMsg.style.right = '20px'
      successMsg.style.zIndex = '1000'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    } catch (err) {
      setError('Failed to delete book: ' + err.message)
    }
  }

  const handleEdit = (bookId) => {
    navigate(`/edit-book/${bookId}`)
  }

  const hasSearchParams = searchParams.title || searchParams.author || searchParams.year

  return (
    <div className="search-books-page">
      <h2>📚 Book Catalog</h2>

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
            {loading ? '🔍 Searching...' : '🔍 Search'}
          </button>
          {hasSearchParams && (
            <button type="button" onClick={handleClear} className="clear-btn">
              Clear Filters
            </button>
          )}
        </div>
      </form>

      <div className="books-list">
        <h3>
          {initialLoad && loading ? (
            'Loading books...'
          ) : books.length === 0 ? (
            hasSearchParams ? 'No books match your search' : 'No books found'
          ) : (
            `${books.length} book${books.length !== 1 ? 's' : ''} found`
          )}
        </h3>

        {!initialLoad && books.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Published</th>
                {isAdmin && <th>Actions</th>}
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
                  <td>{book.isbn || '—'}</td>
                  <td>{book.publishedYear || '—'}</td>
                  {isAdmin && (
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(book.id)}
                          className="edit-btn"
                          title="Edit book"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="delete-btn"
                          title="Delete book"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  )}
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