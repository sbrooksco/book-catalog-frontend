import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import SearchBooks from './components/SearchBooks'
import AddBook from './components/AddBook'
import EditBook from './components/EditBook'
import BookDetail from './components/BookDetail'
import './App.css'

function Navigation() {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav>
      <Link
        to="/"
        className={`nav-link ${isActive('/') ? 'active' : ''}`}
      >
        🔍 Search Books
      </Link>
      <SignedIn>
        <Link
          to="/add-book"
          className={`nav-link ${isActive('/add-book') ? 'active' : ''}`}
        >
          ➕ Add Book
        </Link>
      </SignedIn>
    </nav>
  )
}

function App() {
  return (
    <Router>
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
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>

          <Navigation />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<SearchBooks />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/edit-book/:bookId" element={<EditBook />} />
            <Route path="/book/:bookId" element={<BookDetail />} />
          </Routes>
        </main>

        <footer style={{
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-xl)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          marginTop: 'auto'
        }}>
          <p>Book Catalog © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </Router>
  )
}

export default App