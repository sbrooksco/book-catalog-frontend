import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const BOOK_API_URL = 'https://book-service-innn.onrender.com'
const REVIEW_API_URL = 'https://review-service-x2si.onrender.com'

function BookDetail() {
  const { getToken } = useAuth()
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddReview, setShowAddReview] = useState(false)
  const [newReview, setNewReview] = useState({
    reviewerName: '',
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    fetchBookAndReviews()
  }, [bookId])

  const getAuthHeaders = async () => {
    const token = await getToken()
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  }

  const fetchBookAndReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const config = await getAuthHeaders()

      // Fetch book first
      const bookRes = await axios.get(`${BOOK_API_URL}/books/${bookId}`, config)
      setBook(bookRes.data)
      console.log('Book loaded:', bookRes.data)

      // Get all reviews and filter client-side (more reliable for now)
      const allReviewsRes = await axios.get(`${REVIEW_API_URL}/reviews`, config)
      console.log('All reviews:', allReviewsRes.data)
      const filtered = allReviewsRes.data.filter(review => {
        console.log(`Comparing review.bookId (${review.bookId}, type: ${typeof review.bookId}) with bookId (${bookId}, type: ${typeof bookId})`)
        return review.bookId === parseInt(bookId)
      })
      console.log('Filtered reviews for book', bookId, ':', filtered)
      setReviews(filtered)
    } catch (err) {
      console.error('Error loading book/reviews:', err)
      setError('Failed to load book details: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      const config = await getAuthHeaders()
      const reviewData = {
        bookId: parseInt(bookId),
        reviewerName: newReview.reviewerName,
        rating: parseInt(newReview.rating),
        comment: newReview.comment
      }

      console.log('Submitting review:', reviewData)
      const response = await axios.post(`${REVIEW_API_URL}/reviews`, reviewData, config)
      console.log('Review created:', response.data)

      setNewReview({ reviewerName: '', rating: 5, comment: '' })
      setShowAddReview(false)

      // Show success message
      const successMsg = document.createElement('div')
      successMsg.className = 'success'
      successMsg.textContent = 'Review added successfully!'
      successMsg.style.position = 'fixed'
      successMsg.style.top = '20px'
      successMsg.style.right = '20px'
      successMsg.style.zIndex = '1000'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)

      fetchBookAndReviews()
    } catch (err) {
      console.error('Review submission error:', err.response?.data || err.message)
      setError('Failed to add review: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return
    try {
      const config = await getAuthHeaders()
      await axios.delete(`${REVIEW_API_URL}/reviews/${reviewId}`, config)

      // Remove from list immediately
      setReviews(reviews.filter(r => r.id !== reviewId))

      // Show success message
      const successMsg = document.createElement('div')
      successMsg.className = 'success'
      successMsg.textContent = 'Review deleted successfully'
      successMsg.style.position = 'fixed'
      successMsg.style.top = '20px'
      successMsg.style.right = '20px'
      successMsg.style.zIndex = '1000'
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    } catch (err) {
      setError('Failed to delete review: ' + err.message)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <>
        {'⭐'.repeat(fullStars)}
        {hasHalfStar && '✨'}
        {'☆'.repeat(emptyStars)}
      </>
    )
  }

  if (loading) return <div className="loading">Loading book details...</div>
  if (!book) return <div className="error">Book not found</div>

  return (
    <div className="book-detail-page">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Catalog
      </button>

      {error && <div className="error">{error}</div>}

      <div className="book-info">
        <h2>{book.title}</h2>
        <p className="author">by {book.author}</p>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {book.isbn && (
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>ISBN</span>
              <p className="isbn" style={{ marginTop: '0.25rem' }}>{book.isbn}</p>
            </div>
          )}
          {book.publishedYear && (
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>Published</span>
              <p className="year" style={{ marginTop: '0.25rem' }}>{book.publishedYear}</p>
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="rating-summary">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span className="avg-rating">{calculateAverageRating()}</span>
              <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>out of 5</span>
            </div>
            <span className="stars">{renderStars(parseFloat(calculateAverageRating()))}</span>
            <span className="review-count">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Reviews {reviews.length > 0 && `(${reviews.length})`}</h3>
          {!showAddReview && (
            <button
              onClick={() => setShowAddReview(true)}
              className="add-review-btn"
            >
              ✍️ Write a Review
            </button>
          )}
        </div>

        {showAddReview && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <h4>Share Your Thoughts</h4>

            <div className="form-group">
              <label htmlFor="reviewerName">Your Name *</label>
              <input
                id="reviewerName"
                type="text"
                placeholder="Enter your name"
                value={newReview.reviewerName}
                onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Rating: {newReview.rating} {renderStars(newReview.rating)}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: 'var(--color-text-muted)'
              }}>
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review *</label>
              <textarea
                id="comment"
                placeholder="What did you think about this book? Share your experience..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
                rows="5"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                📝 Submit Review
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddReview(false)
                  setNewReview({ reviewerName: '', rating: 5, comment: '' })
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No reviews yet</p>
              <p style={{ fontSize: '0.9375rem' }}>Be the first to share your thoughts about this book!</p>
            </div>
          ) : (
            reviews
              .sort((a, b) => b.id - a.id) // Show newest first
              .map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <span className="reviewer">{review.reviewerName}</span>
                        <span className="rating">{renderStars(review.rating)}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {review.rating} out of 5 stars
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="delete-btn-small"
                      title="Delete review"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="comment">{review.comment}</p>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

export default BookDetail