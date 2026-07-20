const { createMollieClient } = require('@mollie/api-client');

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

const AFZENDER  = process.env.MAIL_FROM || 'BoostSocials <orders@boostsocials.nl>';
const NOTIFY_TO = process.env.MAIL_TO   || 'mrstekelenburg@hotmail.com';

// Domeinen waarvan we een postlink verwachten
const TOEGESTAAN = [
  'instagram.com', 'instagr.am',
  'tiktok.com', 'vm.tiktok.com',
  'facebook.com', 'fb.watch', 'fb.com',
  'youtube.com', 'youtu.be',
];

function controleerLink(raw) {
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, fout: 'Dat lijkt geen geldige link. Plak de volledige URL, inclusief https://' };
  }
  if (!/^https?:$/.test(url.protocol)) {
    return { ok: false, fout: 'Alleen links die beginnen met https:// worden geaccepteerd.' };
  }
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (!TOEGESTAAN.some((d) => host === d || host.endsWith('.' + d))) {
    return { ok: false, fout: 'Dit lijkt geen link naar Instagram, TikTok, Facebook of YouTube.' };
  }
  return { ok: true, schoon: url.origin + url.pathname + url.search };
}

async function stuurMail({ to, subject, html }) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: AFZENDER, to: [to], subject, html }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  return r.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { pid, url } = body;

  if (!pid || !url) {
    return res.status(400).json({ error: 'Ontbrekende gegevens' });
  }

  const check = controleerLink(String(url));
  if (!check.ok) {
    return res.status(400).json({ error: check.fout });
  }

  // Verificatie: alleen een daadwerkelijk betaalde order mag een link insturen.
  // Zonder deze check kan iedereen dit endpoint volspammen.
  let payment;
  try {
    payment = await mollie.payments.get(String(pid));
  } catch (err) {
    console.error('Postlink: betaling niet gevonden:', err.message);
    return res.status(404).json({ error: 'Bestelling niet gevonden' });
  }

  if (payment.status !== 'paid') {
    return res.status(403).json({ error: 'Deze bestelling is nog niet betaald' });
  }

  const meta = payment.metadata || {};
  const orderRef = meta.order_ref || payment.id;

  try {
    await stuurMail({
      to: NOTIFY_TO,
      subject: `Postlink ontvangen: ${orderRef} — @${meta.username || '?'}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f9f9f9;padding:24px;border-radius:12px">
          <h2 style="color:#FF2D78;margin-bottom:4px">Postlink binnen</h2>
          <p style="color:#666;margin-top:0;margin-bottom:20px">De klant heeft de link naar de post doorgegeven.</p>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr><td style="padding:10px 0;color:#888;width:35%;border-bottom:1px solid #eee">Ordernummer</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${orderRef}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Account</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">@${meta.username || '?'}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #eee">Pakket</td><td style="padding:10px 0;font-weight:700;border-bottom:1px solid #eee">${meta.pakket || '?'}</td></tr>
            <tr><td style="padding:10px 0;color:#888">Postlink</td><td style="padding:10px 0"><a href="${check.schoon}" style="color:#FF2D78;font-weight:700;word-break:break-all">${check.schoon}</a></td></tr>
          </table>
          <div style="margin-top:20px;background:#e8f5e9;border-radius:8px;padding:14px;font-size:13px;color:#2e5c31">
            Deze order is compleet en kan verwerkt worden.
          </div>
        </div>
      `,
    });

    console.log('Postlink ontvangen voor', orderRef, check.schoon);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Postlink mail fout:', err.message);
    res.status(500).json({ error: 'Kon de link niet doorsturen. Mail hem naar support@boostsocials.nl.' });
  }
};
