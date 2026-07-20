const { createMollieClient } = require('@mollie/api-client');

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

// Microsoft heeft basic authentication voor Outlook/Hotmail uitgezet (april 2026),
// daarom verloopt verzending via Resend in plaats van nodemailer/SMTP.
const AFZENDER  = process.env.MAIL_FROM || 'BoostSocials <orders@boostsocials.nl>';
const NOTIFY_TO = process.env.MAIL_TO   || 'mrstekelenburg@hotmail.com';

async function stuurMail({ to, subject, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: AFZENDER, to: [to], subject, html }),
  });
  if (!r.ok) {
    const tekst = await r.text();
    throw new Error(`Resend ${r.status}: ${tekst}`);
  }
  return r.json();
}

// Mollie kan dezelfde webhook meerdere keren aanroepen (retries, statuswijzigingen).
// Deze set voorkomt dubbele mails binnen dezelfde warme lambda-instantie.
// LET OP: geen harde garantie — zie de notitie onderaan dit bestand.
const verwerkt = new Set();

async function leesPaymentId(req) {
  if (req.body && typeof req.body === 'object' && req.body.id) return req.body.id;
  if (typeof req.body === 'string' && req.body) {
    return new URLSearchParams(req.body).get('id');
  }
  const raw = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
  return new URLSearchParams(raw).get('id');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let paymentId;
  try {
    paymentId = await leesPaymentId(req);
  } catch (err) {
    console.error('Webhook body fout:', err.message);
    return res.status(400).end();
  }

  if (!paymentId) {
    console.error('Webhook zonder payment id');
    return res.status(400).end();
  }

  // Mollie ondertekent zijn webhooks NIET (anders dan Stripe).
  // De verificatie is: haal de betaling op bij Mollie met je eigen API-key.
  // Alleen wat Mollie zelf teruggeeft is te vertrouwen — nooit de POST-body.
  let payment;
  try {
    payment = await mollie.payments.get(paymentId);
  } catch (err) {
    console.error('Betaling niet op te halen bij Mollie:', err.message);
    // 200 bij onbekend id, anders blijft Mollie eindeloos retryen.
    return res.status(200).json({ received: true });
  }

  // Alleen bij daadwerkelijk betaald verwerken.
  // Andere statussen: open, pending, authorized, canceled, expired, failed.
  if (payment.status !== 'paid') {
    console.log(`Betaling ${paymentId} status: ${payment.status} — geen actie`);
    return res.status(200).json({ received: true });
  }

  if (verwerkt.has(paymentId)) {
    return res.status(200).json({ received: true, duplicate: true });
  }
  verwerkt.add(paymentId);

  const meta = payment.metadata || {};
  const customerEmail = meta.email || null;
  const orderRef = meta.order_ref || payment.id;
  const bedrag = `€${Number(payment.amount.value).toFixed(2).replace('.', ',')}`;

  try {
    // ── MAIL 1: Notificatie naar jou ──
    await stuurMail({
      to: NOTIFY_TO,
      subject: `Nieuwe bestelling: @${meta.username || '?'} — ${meta.pakket || '?'}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px">
          <h2 style="color:#FF2D78;margin-bottom:4px">Nieuwe bestelling!</h2>
          <p style="color:#666;margin-top:0;margin-bottom:20px">BoostSocials.nl</p>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:10px 0;color:#888;width:40%;border-bottom:1px solid #eee">Ordernummer</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${orderRef}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Gebruikersnaam</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">@${meta.username || 'onbekend'}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Platform</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.platform || 'onbekend'}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Pakket</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.pakket || 'onbekend'}</td></tr>
            ${meta.upsell_label ? `<tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Upsell</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.upsell_label}</td></tr>` : ''}
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Bedrag</td><td style="padding:10px 0;font-weight:700;color:#FF2D78;border-bottom:1px solid #eee">${bedrag}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Betaalmethode</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${payment.method || '-'}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Klant e-mail</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${customerEmail || 'niet opgegeven'}</td></tr>
            <tr><td style="padding:10px 0;color:#888">Mollie ID</td><td style="padding:10px 0;font-size:11px;color:#aaa">${payment.id}</td></tr>
          </table>
          <div style="margin-top:20px;background:#fff3cd;border-radius:8px;padding:14px;font-size:13px;color:#856404">
            Verwerk deze bestelling handmatig op <strong>@${meta.username || '?'}</strong>.
          </div>
        </div>
      `,
    });

    // ── MAIL 2: Bevestiging naar klant ──
    if (customerEmail) {
      await stuurMail({
        to: customerEmail,
        subject: `Bevestiging jouw bestelling bij BoostSocials ✓`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #f0f0f0">
            <div style="background:linear-gradient(135deg,#FF2D78,#ff6b9d);padding:32px 24px;text-align:center">
              <h1 style="color:#fff;margin:0;font-size:24px">BoostSocials.nl</h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px">Jouw bestelling is bevestigd ✓</p>
            </div>
            <div style="padding:32px 24px">
              <p style="font-size:16px;color:#222;margin-top:0">Hoi,</p>
              <p style="font-size:15px;color:#444;line-height:1.6">Bedankt voor je bestelling! We zijn direct aan de slag met de levering op <strong>@${meta.username || '?'}</strong>.</p>
              <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin:24px 0">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#999">Jouw bestelling</p>
                <table style="width:100%;font-size:14px;border-collapse:collapse">
                  <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Ordernummer</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">${orderRef}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Profiel</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">@${meta.username || '?'}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Platform</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">${meta.platform || '?'}</td></tr>
                  <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee">Pakket</td><td style="padding:8px 0;font-weight:700;border-bottom:1px solid #eee;text-align:right">${meta.pakket || '?'}</td></tr>
                  <tr><td style="padding:8px 0;color:#666">Betaald</td><td style="padding:8px 0;font-weight:700;color:#FF2D78;text-align:right">${bedrag}</td></tr>
                </table>
              </div>
              ${meta.needs_link === 'ja' ? `<div style="background:#fff8e6;border:1px solid #f5c96b;border-radius:10px;padding:16px;margin:0 0 20px">
                <p style="margin:0;font-size:14px;color:#6b5416;line-height:1.6"><strong>Heb je de link naar je post al doorgegeven?</strong><br>
                Likes en views leveren we op één specifieke post. Heb je het formulier op de bevestigingspagina overgeslagen, stuur de link dan even naar ons met ordernummer ${orderRef} erbij.</p>
              </div>` : ''}
              <p style="font-size:14px;color:#666;line-height:1.6">Vragen? Mail naar <a href="mailto:${process.env.MAIL_SUPPORT || 'support@boostsocials.nl'}" style="color:#FF2D78">${process.env.MAIL_SUPPORT || 'support@boostsocials.nl'}</a> en vermeld je ordernummer.</p>
              <p style="font-size:14px;color:#666;margin-bottom:0">Met vriendelijke groet,<br><strong>Team BoostSocials</strong></p>
            </div>
            <div style="background:#f5f5f5;padding:16px 24px;text-align:center;font-size:12px;color:#aaa">
              BoostSocials.nl — Order ${orderRef}
            </div>
          </div>
        `,
      });
      console.log('Bevestigingsmail verstuurd naar:', customerEmail);
    }

    console.log('Notificatiemail verstuurd voor:', meta.username, orderRef);
  } catch (err) {
    console.error('Mail fout:', err.message);
    // Uit de set halen zodat de retry van Mollie het opnieuw mag proberen
    verwerkt.delete(paymentId);
  }

  // Altijd 200, anders blijft Mollie de webhook herhalen.
  res.status(200).json({ received: true });
};

// ─────────────────────────────────────────────────────────────
// NOTITIE OVER DUBBELE MAILS
// De `verwerkt` set leeft alleen in het geheugen van één lambda-instantie.
// Bij een cold start is hij leeg, dus in theorie kan een klant twee mails
// krijgen. Voor je huidige volume acceptabel. Waterdicht maken:
// zet een key in Vercel KV / Upstash Redis met `SET order:<id> NX`
// en verstuur alleen als die set slaagt.
// ─────────────────────────────────────────────────────────────
