import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import axios from 'axios'

const API_URL = 'https://book-service-innn.onrender.com'

function Books() {
  const { getToken } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', publishedYear: '' })

  useEffect(() => {
    fetchBooks()
  }, [])

  const getAuthHeaders = async () => {
    const token = await getToken()
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const config = await getAuthHeaders()
      const response = await axios.get(`${API_URL}/books`, config)
      setBooks(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load books: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const config = await getAuthHeaders()
      await axios.post(`${API_URL}/books`, {
        title: newBook.title,
        author: newBook.author,
        isbn: newBook.isbn || null,
        publishedYear: newBook.publishedYear || null
      }, config)
      setNewBook({ title: '', author: '', isbn: '', publishedYear: '' })
      fetchBooks()
    } catch (err) {
      setError('Failed to create book: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book?')) return
    try {
      const config = await getAuthHeaders()
      await axios.delete(`${API_URL}/books/${id}`, config)
      fetchBooks()
    } catch (err) {
      setError('Failed to delete book: ' + err.message)
    }
  }

  if (loading) return <div className="loading">Loading books...</div>

  return (
    <div className="books-page">
      <h2>Books</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <h3>Add New Book</h3>
        <input
          type="text"
          placeholder="Title *"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Author *"
          value={newBook.author}
          onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="ISBN (optional)"
          value={newBook.isbn}
          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
        />
        <input
          type="number"
          placeholder="Published Year (optional)"
          min="1000"
          max="2100"
          value={newBook.publishedYear}
          onChange={(e) => setNewBook({ ...newBook, publishedYear: e.target.value })}
        />
        <button type="submit">Add Book</button>
      </form>

      <div className="books-list">
        <h3>All Books ({books.length})</h3>
        {books.length === 0 ? (
          <p>No books yet. Add one above!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
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
                  <td>{book.id}</td>
                  <td>{book.title}</td>
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

export default Books
