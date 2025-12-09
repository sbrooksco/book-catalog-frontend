import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'https://review-service-x2si.onrender.com'
const BOOK_API_URL = 'https://book-service-innn.onrender.com'

function Reviews() {
  const [reviews, setReviews] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newReview, setNewReview] = useState({ 
    bookId: '', 
    reviewerName: '', 
    rating: 5, 
    comment: '' 
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reviewsRes, booksRes] = await Promise.all([
        axios.get(`${API_URL}/reviews`),
        axios.get(`${BOOK_API_URL}/books`)
      ])
      setReviews(reviewsRes.data)
      setBooks(booksRes.data)
      setError(null)
    } catch (err) {
      setError('Failed to load data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/reviews`, {
        bookId: parseInt(newReview.bookId),
        reviewerName: newReview.reviewerName,
        rating: parseInt(newReview.rating),
        comment: newReview.comment
      })
      setNewReview({ bookId: '', reviewerName: '', rating: 5, comment: '' })
      fetchData()
    } catch (err) {
      setError('Failed to create review: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return
    try {
      await axios.delete(`${API_URL}/reviews/${id}`)
      fetchData()
    } catch (err) {
      setError('Failed to delete review: ' + err.message)
    }
  }

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : `Book #${bookId}`
  }

  if (loading) return <div className="loading">Loading reviews...</div>

  return (
    <div className="reviews-page">
      <h2>Reviews</h2>
      
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="review-form">
        <h3>Add New Review</h3>
        
        <select
          value={newReview.bookId}
          onChange={(e) => setNewReview({ ...newReview, bookId: e.target.value })}
          required
        >
          <option value="">Select a book *</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} by {book.author}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Your name *"
          value={newReview.reviewerName}
          onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
          required
        />

        <div className="rating-input">
          <label>Rating: {newReview.rating} ⭐</label>
          <input
            type="range"
            min="1"
            max="5"
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
          />
        </div>

        <textarea
          placeholder="Your review *"
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          required
          rows="4"
        />

        <button type="submit">Add Review</button>
      </form>

      <div className="reviews-list">
        <h3>All Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet. Add one above!</p>
        ) : (
          <div className="review-cards">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <h4>{getBookTitle(review.bookId)}</h4>
                  <span className="rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="reviewer">— {review.reviewerName}</p>
                <p className="comment">{review.comment}</p>
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reviews
