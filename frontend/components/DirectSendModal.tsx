import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useSession } from 'next-auth/react';

const DirectSendModal = ({ onClose }: { onClose: () => void }) => {
  const { register, handleSubmit, reset } = useForm();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data: any) => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      console.log('Form data:', data); 
      const recipientsText = data.recipients.trim();
      const recipients = recipientsText
        .split(/[,\n]/)
        .map((email: string) => email.trim())
        .filter((email: string) => email);

      console.log('Parsed recipients:', recipients); 

      if (recipients.length === 0) {
        setError('Please enter at least one email address');
        setLoading(false);
        return;
      }

    
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        setError(`Invalid emails: ${invalidEmails.join(', ')}`);
        setLoading(false);
        return;
      }

      const payload = {
        subject: data.subject,
        body: data.body,
        recipients: recipients,
        delayBetweenEmails: parseInt(data.delay) || 1,
        sender: session?.user?.email || 'noreply@emailscheduler.com',
        userId: session?.user?.email || 'user',
      };

      console.log('Sending payload:', payload); 

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.post(`${apiUrl}/api/send-now`, payload);
      
      console.log('Response:', response.data);

      setSuccess(`✓ Email sent immediately to ${recipients.length} recipient(s)`);
      reset();
      
    
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error details:', err); 
      console.error('Error response:', err.response?.data); 
      setError(err.response?.data?.error || err.message || 'Failed to send email');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Send Email Now</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              {...register('subject')}
              placeholder="Email subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              {...register('body')}
              placeholder="Email body"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
            <textarea
              {...register('recipients')}
              placeholder="Enter email addresses (comma or newline separated)&#10;example@email.com&#10;another@email.com"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between Emails (seconds)</label>
            <input
              type="number"
              {...register('delay', { valueAsNumber: true })}
              placeholder="1"
              defaultValue={1}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Now'}
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

export default DirectSendModal;
