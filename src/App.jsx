import { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import Books from './components/Books'
import Reviews from './components/Reviews'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('books')

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>📚 Book Catalog</h1>
          <div className="auth-section">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="sign-in-btn">Sign In</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>

        <SignedIn>
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
        </SignedIn>
      </header>

      <main>
        <SignedOut>
          <div className="welcome">
            <h2>Welcome to Book Catalog</h2>
            <p>Please sign in to view and manage books and reviews.</p>
            <SignInButton mode="modal">
              <button className="sign-in-btn-large">Sign In to Get Started</button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {currentPage === 'books' && <Books />}
          {currentPage === 'reviews' && <Reviews />}
        </SignedIn>
      </main>
    </div>
  )
}

export default App
