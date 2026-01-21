import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const ComposeModal = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit } = useForm();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: any) => {
    try {
      setError('');
      setLoading(true);

      // Read CSV file and parse recipients
      const file = data.csv[0];
      if (!file) {
        setError('Please select a CSV file');
        return;
      }

      const text = await file.text();
      const lines = text.split('\n').filter((line: string) => line.trim());
      const recipients = lines.slice(1).map((line: string) => line.split(',')[0].trim()).filter((email: string) => email);

      if (recipients.length === 0) {
        setError('No valid emails found in CSV');
        return;
      }

      const payload = {
        subject: data.subject,
        body: data.body,
        recipients: recipients,
        startTime: data.startTime,
        delayBetweenEmails: parseInt(data.delay) || 0,
        sender: session?.user?.email || 'noreply@emailscheduler.com',
        userId: session?.user?.email || 'user',
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(`${apiUrl}/api/schedule-emails`, payload);
      
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to schedule emails');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Schedule Emails</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              {...register('subject')}
              placeholder="Email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              {...register('body')}
              placeholder="Email body"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CSV File (with emails in first column)</label>
            <input
              type="file"
              {...register('csv')}
              accept=".csv"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              {...register('startTime')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between Emails (seconds)</label>
            <input
              type="number"
              {...register('delay')}
              placeholder="0"
              defaultValue="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeModal;