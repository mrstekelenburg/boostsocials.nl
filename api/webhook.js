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

    const customerEmail = session.customer_details?.email || null;
    const customerName  = session.customer_details?.name  || null;
    const bedrag = `€${((session.amount_total || 0) / 100).toFixed(2).replace('.', ',')}`;

    try {
      const transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      // ── MAIL 1: Jouw notificatiemail ──
      await transporter.sendMail({
        from: `"BoostSocials" <${process.env.MAIL_USER}>`,
        to: 'mrstekelenburg@hotmail.com',
        subject: `Nieuwe bestelling: @${meta.username || '?'} — ${meta.pakket || '?'}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px">
            <h2 style="color:#FF2D78;margin-bottom:4px">Nieuwe bestelling!</h2>
            <p style="color:#666;margin-top:0;margin-bottom:20px">BoostSocials.nl</p>
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:10px 0;color:#888;width:40%;border-bottom:1px solid #eee">Gebruikersnaam</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">@${meta.username || 'onbekend'}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Platform</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.platform || 'onbekend'}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Pakket</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.pakket || 'onbekend'}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Bedrag</td><td style="padding:10px 0;font-weight:700;color:#FF2D78;border-bottom:1px solid #eee">${bedrag}</td></tr>
              <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Klant e-mail</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${customerEmail || 'niet opgegeven'}</td></tr>
              <tr><td style="padding:10px 0;color:#888">Stripe ID</td><td style="padding:10px 0;font-size:11px;color:#aaa">${session.id}</td></tr>
            </table>
            <div style="margin-top:20px;background:#fff3cd;border-radius:8px;padding:14px;font-size:13px;color:#856404">
              Verwerk deze bestelling handmatig op <strong>@${meta.username || '?'}</strong>.
            </div>
          </div>
        `,
      });

      // ── MAIL 2: Bevestigingsmail naar klant ──
      if (customerEmail) {
        await transporter.sendMail({
          from: `"BoostSocials" <${process.env.MAIL_USER}>`,
          to: customerEmail,
          subject: `Bevestiging jouw bestelling bij BoostSocials ✓`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #f0f0f0">
              <div style="background:linear-gradient(135deg,#FF2D78,#ff6b9d);padding:32px 24px;text-align:center">
                <h1 style="color:#fff;margin:0;font-size:24px">BoostSocials.nl</h1>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px">Jouw bestelling is bevestigd ✓</p>
              </div>
              <div style="padding:32px 24px">
                <p style="font-size:16px;color:#222;margin-top:0">Hoi${customerName ? ' ' + customerName.split(' ')[0] : ''},</p>
                <p style="font-size:15px;color:#444;line-height:1.6">Bedankt voor je bestelling! We zijn direct aan de slag met de levering op <strong>@${meta.username || '?'}</strong>.</p>
                <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin:24px 0">
                  <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999">Jouw bestelling</p>
                  <table style="width:100%;font-size:14px;border-collapse:collapse">
                    <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Profiel</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">@${meta.username || '?'}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Platform</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">${meta.platform || '?'}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Pakket</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">${meta.pakket || '?'}</td></tr>
                    <tr><td style="padding:8px 0;color:#666">Betaald</td><td style="padding:8px 0;font-weight:700;color:#FF2D78;text-align:right">${bedrag}</td></tr>
                  </table>
                </div>
                <p style="font-size:14px;color:#666;line-height:1.6">Vragen? Mail naar <a href="mailto:${process.env.MAIL_USER}" style="color:#FF2D78">${process.env.MAIL_USER}</a>.</p>
                <p style="font-size:14px;color:#666;margin-bottom:0">Met vriendelijke groet,<br><strong>Team BoostSocials</strong></p>
              </div>
              <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:12px;color:#aaa">
                BoostSocials.nl — Stripe ID: ${session.id}
              </div>
            </div>
          `,
        });
        console.log('Bevestigingsmail verstuurd naar:', customerEmail);
      }

      console.log('Notificatiemail verstuurd voor:', meta.username);
    } catch (err) {
      console.error('Mail fout:', err.message);
    }
  }

  res.status(200).json({ received: true });
};
