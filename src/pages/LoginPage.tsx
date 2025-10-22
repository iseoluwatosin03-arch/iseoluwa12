import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate(from, { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-brand-text mb-6">Welcome Back!</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-full hover:bg-brand-primary-hover transition disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="text-center mt-6">
          Don't have an account? <Link to="/signup" className="text-brand-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
