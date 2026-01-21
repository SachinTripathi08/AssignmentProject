import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { subject, body, csvFile, startTime, delay, sender } = req.body;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schedule-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body, csvFile, startTime, delay, sender }),
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to schedule emails' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
