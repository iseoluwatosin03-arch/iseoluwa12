import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Heart, MessageSquare, Search, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) return null; // Don't render navbar while checking auth state

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold text-brand-primary">
          SoloParentLove
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <NavLink to="/dashboard" icon={<Home size={20} />} text="Home" />
              <NavLink to="/matches" icon={<Heart size={20} />} text="Matches" />
              <NavLink to="/search" icon={<Search size={20} />} text="Search" />
              <NavLink to="/profile" icon={<User size={20} />} text="Profile" />
              <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition">
                <LogOut size={20} />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-primary transition">Login</Link>
              <Link to="/signup" className="bg-brand-primary text-white px-4 py-2 rounded-full hover:bg-brand-primary-hover transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

const NavLink = ({ to, icon, text }: { to: string, icon: React.ReactNode, text: string }) => (
  <Link to={to} className="flex items-center space-x-2 text-gray-600 hover:text-brand-primary transition">
    {icon}
    <span className="hidden md:inline">{text}</span>
  </Link>
)

export default Navbar;
