import { useState } from 'react'
import Books from './components/Books'
import Reviews from './components/Reviews'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('books')

  return (
    <div className="app">
      <header>
        <h1>📚 Book Catalog</h1>
        <nav>
          <button 
            onClick={() => setCurrentPage('books')}
            className={currentPage === 'books' ? 'active' : ''}
          >
            Books
          </button>
          <button 
            onClick={() => setCurrentPage('reviews')}
            className={currentPage === 'reviews' ? 'active' : ''}
          >
            Reviews
          </button>
        </nav>
      </header>

      <main>
        {currentPage === 'books' && <Books />}
        {currentPage === 'reviews' && <Reviews />}
      </main>
    </div>
  )
}

export default App
