export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'MailerLite API key not configured' });
  }

  try {
    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true });
    }

    // MailerLite returns 422 if already subscribed — treat as success
    if (response.status === 422) {
      return res.status(200).json({ success: true });
    }

    return res.status(response.status).json({ error: data.message || 'Subscription failed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to connect to MailerLite' });
  }
}
