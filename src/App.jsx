import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import SearchBooks from './components/SearchBooks'
import AddBook from './components/AddBook'
import EditBook from './components/EditBook'
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

          <nav>
            <Link to="/" className="nav-link">
              Search Books
            </Link>
            <SignedIn>
              <Link to="/add-book" className="nav-link">
                Add Book
              </Link>
            </SignedIn>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<SearchBooks />} />
            <Route path="/add-book" element={<AddBook />} />
            <Route path="/edit-book/:bookId" element={<EditBook />} />
            <Route path="/book/:bookId" element={<BookDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App