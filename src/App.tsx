import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MatchesPage from './pages/MatchesPage';
import ChatPage from './pages/ChatPage';
import SearchPage from './pages/SearchPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
          <Route path="/chat/:matchId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
          
          {/* Hardcoded admin route for now */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboardPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
