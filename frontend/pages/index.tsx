import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import EmailTable from '../components/EmailTable';
import ComposeModal from '../components/ComposeModal';

const Home = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCompose, setShowCompose] = useState(false);
  const [tab, setTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'authenticated') {
    return null; // Redirect in progress
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard',
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Login Heading */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
              required
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
              required
            />

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            Demo: Use any email and password to login
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;