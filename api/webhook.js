const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await new Promise((resolve, reject) => {
    let data = Buffer.alloc(0);
    req.on('data', chunk => { data = Buffer.concat([data, chunk]); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook fout:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const meta = session.metadata || {};

    try {
      const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: 'mrstekelenburg@hotmail.com',
        subject: `Nieuwe bestelling: @${meta.username || '?'} - ${meta.pakket || '?'}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px">
            <h2 style="color:#FF2D78;margin-bottom:4px">Nieuwe bestelling!</h2>
            <p style="color:#666;margin-top:0;margin-bottom:20px">BoostSocials.nl</p>
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:10px 0;color:#888;width:40%;border-bottom:1px solid #eee">Gebruikersnaam</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">@${meta.username || 'onbekend'}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Platform</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.platform || 'onbekend'}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Pakket</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.pakket || 'onbekend'}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Bedrag</td><td style="padding:10px 0;font-weight:700;color:#FF2D78;border-bottom:1px solid #eee">€${((session.amount_total || 0) / 100).toFixed(2).replace('.', ',')}</td></tr>
              <tr><td style="padding:10px 0;color:#888">Stripe ID</td><td style="padding:10px 0;font-size:11px;color:#aaa">${session.id}</td></tr>
            </table>
            <div style="margin-top:20px;background:#fff3cd;border-radius:8px;padding:14px;font-size:13px;color:#856404">
              Verwerk deze bestelling handmatig op <strong>@${meta.username || '?'}</strong>.
            </div>
          </div>
        `,
      });

      console.log('Mail verstuurd voor:', meta.username);
    } catch (err) {
      console.error('Mail fout:', err.message);
    }
  }

  res.status(200).json({ received: true });
};
