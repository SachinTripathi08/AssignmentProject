import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import EmailTable from '../components/EmailTable';
import ComposeModal from '../components/ComposeModal';
import DirectSendModal from '../components/DirectSendModal';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [showCompose, setShowCompose] = useState(false);
  const [showDirectSend, setShowDirectSend] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Redirect in progress
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Email Scheduler</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compose Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowCompose(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            + Schedule Email
          </button>
          <button
            onClick={() => setShowDirectSend(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            + Send Now
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setTab('scheduled')}
            className={`py-2 px-4 font-semibold transition-colors ${
              tab === 'scheduled'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Scheduled Emails
          </button>
          <button
            onClick={() => setTab('sent')}
            className={`py-2 px-4 font-semibold transition-colors ${
              tab === 'sent'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent Emails
          </button>
        </div>

        {/* Email Table */}
        <div className="bg-white rounded-lg shadow">
          <EmailTable type={tab} />
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
      
      {/* Direct Send Modal */}
      {showDirectSend && <DirectSendModal onClose={() => setShowDirectSend(false)} />}
      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </div>
  );
};

export default Dashboard;
