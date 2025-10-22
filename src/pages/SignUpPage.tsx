import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
       options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      // The trigger 'create_profile_on_signup' in Supabase will create the profile row.
      setMessage('Sign up successful! Please check your email to verify your account.');
      // We don't navigate immediately, user needs to verify email first.
      // After verification, they will be redirected to the dashboard, and from there we can guide them to profile-setup.
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-brand-text mb-6">Create Your Account</h2>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4">{message}</p>}
        <form onSubmit={handleSignUp}>
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
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-full hover:bg-brand-primary-hover transition disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center mt-6">
          Already have an account? <Link to="/login" className="text-brand-primary hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
