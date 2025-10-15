// api/send-message.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { name, email, service, message } = req.body || {};

    // simple validation
    if (!name || !message) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ ok: false, error: 'Bot not configured' });
    }

    const text = `📢 New Contact Form Submission\n\n👤 Name: ${name}\n📧 Email: ${email || 'N/A'}\n🛠 Service: ${service || 'N/A'}\n📝 Message:\n${message}`;

    const tgResp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });

    const data = await tgResp.json();
    if (!data.ok) return res.status(502).json({ ok: false, error: 'Telegram error', details: data });

    return res.status(200).json({ ok: true, result: data.result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
}