import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import SearchBooks from './components/SearchBooks'
import AddBook from './components/AddBook'
import BookDetail from './components/BookDetail'
import './App.css'

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
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>

          <SignedIn>
            <nav>
              <Link to="/" className="nav-link">
                Search Books
              </Link>
              <Link to="/add-book" className="nav-link">
                Add Book
              </Link>
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
            <Routes>
              <Route path="/" element={<SearchBooks />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="/book/:bookId" element={<BookDetail />} />
            </Routes>
          </SignedIn>
        </main>
      </div>
    </Router>
  )
}

export default App