import { useEffect, useState } from 'react';
import axios from 'axios';

interface Email { id: string; email: string; subject: string; time: string; status: string; }

const EmailTable = ({ type }: { type: 'scheduled' | 'sent' }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = type === 'scheduled' ? '/api/scheduledEmails' : '/api/sentEmails';
    axios.get(endpoint).then(res => { setEmails(res.data.emails || []); setLoading(false); }).catch(() => setLoading(false));
  }, [type]);

  if (loading) return <div>Loading...</div>;
  if (!emails.length) return <div>No {type} emails</div>;

  return (
    <table className="w-full border">
      <thead className="bg-gray-200"><tr><th className="p-2 text-left">Email</th><th className="p-2 text-left">Subject</th><th className="p-2 text-left">{type === 'scheduled' ? 'Scheduled' : 'Sent'} Time</th><th className="p-2 text-left">Status</th></tr></thead>
      <tbody>{emails.map(e => <tr key={e.id} className="border-t"><td className="p-2">{e.email}</td><td className="p-2">{e.subject}</td><td className="p-2">{e.time}</td><td className="p-2"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{e.status}</span></td></tr>)}</tbody>
    </table>
  );
};

export default EmailTable;