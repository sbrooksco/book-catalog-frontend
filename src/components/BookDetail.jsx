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

      setError(null)
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
      fetchBookAndReviews()
    } catch (err) {
      setError('Failed to delete review: ' + err.message)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!book) return <div className="error">Book not found</div>

  return (
    <div className="book-detail-page">
      <button onClick={() => navigate('/')} className="back-btn">
        ← Back to Search
      </button>

      {error && <div className="error">{error}</div>}

      <div className="book-info">
        <h2>{book.title}</h2>
        <p className="author">by {book.author}</p>
        {book.isbn && <p className="isbn">ISBN: {book.isbn}</p>}
        {book.publishedYear && <p className="year">Published: {book.publishedYear}</p>}

        {reviews.length > 0 && (
          <div className="rating-summary">
            <span className="avg-rating">{calculateAverageRating()}</span>
            <span className="stars">{'⭐'.repeat(Math.round(calculateAverageRating()))}</span>
            <span className="review-count">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      <div className="reviews-section">
        <div className="reviews-header">
          <h3>Reviews</h3>
          {!showAddReview && (
            <button
              onClick={() => setShowAddReview(true)}
              className="add-review-btn"
            >
              Add Review
            </button>
          )}
        </div>

        {showAddReview && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <h4>Write a Review</h4>

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
              <label>Rating: {newReview.rating} ⭐</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review *</label>
              <textarea
                id="comment"
                placeholder="Write your review..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setShowAddReview(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this book!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div>
                    <span className="reviewer">{review.reviewerName}</span>
                    <span className="rating">{'⭐'.repeat(review.rating)}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="delete-btn-small"
                  >
                    Delete
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