import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardPage from './DashboardPage';

const HomePage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (user) {
    return <DashboardPage />;
  }

  return (
    <div className="text-center flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-2xl">
        <h1 className="text-5xl font-extrabold text-brand-text mb-4">
          Find love that understands your story ❤️
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          SoloParentLove is the place where single parents connect, share experiences, and find meaningful relationships.
        </p>
        <Link
          to="/signup"
          className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-brand-primary-hover transition-transform transform hover:scale-105"
        >
          Join for Free
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
