import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sent-emails`);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sent emails' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
