import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { loadAnalytics } from './components/Analytics'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import PublicProfile from './pages/PublicProfile'
import Explorer from './pages/Explorer'
import ListingDetail from './pages/ListingDetail'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import MyListings from './pages/MyListings'
import MyWatchlist from './pages/MyWatchlist'
import Inbox from './pages/Inbox'
import Addresses from './pages/Addresses'

export default function App() {
  useEffect(() => { loadAnalytics() }, [])
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explorer />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users/:id" element={<PublicProfile />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/watchlist"
          element={
            <ProtectedRoute>
              <MyWatchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/addresses"
          element={
            <ProtectedRoute>
              <Addresses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/new"
          element={
            <ProtectedRoute>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <ProtectedRoute>
              <EditListing />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
