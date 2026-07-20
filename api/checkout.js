const { createMollieClient } = require('@mollie/api-client');

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

// Prijzen in centen — exact gesynchroniseerd met de website catalogus
const PRICES = {
  // ── INSTAGRAM BEREIK ──────────────────────────────
  'ig-v-500':    599,  'ig-v-1000':   999,  'ig-v-2000':  1499,
  'ig-v-5000':  2999,  'ig-v-10000': 5499,  'ig-v-25000':10999,
  'ig-v-50000':19999,  'ig-v-100000':34999,
  // ── INSTAGRAM LIKES ───────────────────────────────
  'ig-l-100':    199,  'ig-l-250':    299,  'ig-l-500':    499,
  'ig-l-1000':   699,  'ig-l-2000':   899,  'ig-l-5000':  1499,
  'ig-l-10000': 2499,  'ig-l-50000': 7999,
  // ── INSTAGRAM VIEWS ───────────────────────────────
  'ig-vw-1000':  199,  'ig-vw-2500':  299,  'ig-vw-5000':  399,
  'ig-vw-10000': 499,  'ig-vw-25000': 999,  'ig-vw-50000':1799,
  'ig-vw-100000':2999, 'ig-vw-500000':9999,
  // ── TIKTOK BEREIK ─────────────────────────────────
  'tt-v-500':    599,  'tt-v-1000':   999,  'tt-v-2000':  1499,
  'tt-v-5000':  2999,  'tt-v-10000': 5499,  'tt-v-25000':10999,
  'tt-v-50000':19999,  'tt-v-100000':34999,
  // ── TIKTOK LIKES ──────────────────────────────────
  'tt-l-100':    199,  'tt-l-250':    299,  'tt-l-500':    499,
  'tt-l-1000':   699,  'tt-l-2000':   899,  'tt-l-5000':  1499,
  'tt-l-10000': 2499,  'tt-l-50000': 7999,
  // ── TIKTOK VIEWS ──────────────────────────────────
  'tt-vw-1000':  199,  'tt-vw-2500':  299,  'tt-vw-5000':  399,
  'tt-vw-10000': 499,  'tt-vw-25000': 999,  'tt-vw-50000':1799,
  'tt-vw-100000':2999, 'tt-vw-500000':9999,
  // ── FACEBOOK BEREIK ───────────────────────────────
  'fb-v-500':    599,  'fb-v-1000':   999,  'fb-v-2000':  1499,
  'fb-v-5000':  2999,  'fb-v-10000': 5499,  'fb-v-25000':10999,
  'fb-v-50000':19999,  'fb-v-100000':34999,
  // ── FACEBOOK LIKES ────────────────────────────────
  'fb-l-100':    199,  'fb-l-250':    299,  'fb-l-500':    499,
  'fb-l-1000':   699,  'fb-l-2000':   899,  'fb-l-5000':  1499,
  'fb-l-10000': 2499,  'fb-l-50000': 7999,
  // ── FACEBOOK VIEWS ────────────────────────────────
  'fb-vw-1000':  199,  'fb-vw-2500':  299,  'fb-vw-5000':  399,
  'fb-vw-10000': 499,  'fb-vw-25000': 999,  'fb-vw-50000':1799,
  'fb-vw-100000':2999, 'fb-vw-500000':9999,
  // ── YOUTUBE ABONNEES ──────────────────────────────
  'yt-a-500':    599,  'yt-a-1000':   999,  'yt-a-2000':  1499,
  'yt-a-5000':  2999,  'yt-a-10000': 5499,  'yt-a-25000':10999,
  'yt-a-50000':19999,  'yt-a-100000':34999,
  // ── YOUTUBE LIKES ─────────────────────────────────
  'yt-l-100':    199,  'yt-l-250':    299,  'yt-l-500':    499,
  'yt-l-1000':   699,  'yt-l-2000':   899,  'yt-l-5000':  1499,
  'yt-l-10000': 2499,  'yt-l-50000': 7999,
  // ── YOUTUBE VIEWS ─────────────────────────────────
  'yt-vw-1000':  199,  'yt-vw-2500':  299,  'yt-vw-5000':  399,
  'yt-vw-10000': 499,  'yt-vw-25000': 999,  'yt-vw-50000':1799,
  'yt-vw-100000':2999, 'yt-vw-500000':9999,
};

const LABELS = {
  'ig-v-500':'Instagram 500 Bereik',     'ig-v-1000':'Instagram 1.000 Bereik',
  'ig-v-2000':'Instagram 2.000 Bereik',  'ig-v-5000':'Instagram 5.000 Bereik',
  'ig-v-10000':'Instagram 10.000 Bereik','ig-v-25000':'Instagram 25.000 Bereik',
  'ig-v-50000':'Instagram 50.000 Bereik','ig-v-100000':'Instagram 100.000 Bereik',
  'ig-l-100':'Instagram 100 Likes',      'ig-l-250':'Instagram 250 Likes',
  'ig-l-500':'Instagram 500 Likes',      'ig-l-1000':'Instagram 1.000 Likes',
  'ig-l-2000':'Instagram 2.000 Likes',   'ig-l-5000':'Instagram 5.000 Likes',
  'ig-l-10000':'Instagram 10.000 Likes', 'ig-l-50000':'Instagram 50.000 Likes',
  'ig-vw-1000':'Instagram 1.000 Views',  'ig-vw-2500':'Instagram 2.500 Views',
  'ig-vw-5000':'Instagram 5.000 Views',  'ig-vw-10000':'Instagram 10.000 Views',
  'ig-vw-25000':'Instagram 25.000 Views','ig-vw-50000':'Instagram 50.000 Views',
  'ig-vw-100000':'Instagram 100.000 Views','ig-vw-500000':'Instagram 500.000 Views',
  'tt-v-500':'TikTok 500 Bereik',        'tt-v-1000':'TikTok 1.000 Bereik',
  'tt-v-2000':'TikTok 2.000 Bereik',     'tt-v-5000':'TikTok 5.000 Bereik',
  'tt-v-10000':'TikTok 10.000 Bereik',   'tt-v-25000':'TikTok 25.000 Bereik',
  'tt-v-50000':'TikTok 50.000 Bereik',   'tt-v-100000':'TikTok 100.000 Bereik',
  'tt-l-100':'TikTok 100 Likes',         'tt-l-250':'TikTok 250 Likes',
  'tt-l-500':'TikTok 500 Likes',         'tt-l-1000':'TikTok 1.000 Likes',
  'tt-l-2000':'TikTok 2.000 Likes',      'tt-l-5000':'TikTok 5.000 Likes',
  'tt-l-10000':'TikTok 10.000 Likes',    'tt-l-50000':'TikTok 50.000 Likes',
  'tt-vw-1000':'TikTok 1.000 Views',     'tt-vw-2500':'TikTok 2.500 Views',
  'tt-vw-5000':'TikTok 5.000 Views',     'tt-vw-10000':'TikTok 10.000 Views',
  'tt-vw-25000':'TikTok 25.000 Views',   'tt-vw-50000':'TikTok 50.000 Views',
  'tt-vw-100000':'TikTok 100.000 Views', 'tt-vw-500000':'TikTok 500.000 Views',
  'fb-v-500':'Facebook 500 Bereik',      'fb-v-1000':'Facebook 1.000 Bereik',
  'fb-v-2000':'Facebook 2.000 Bereik',   'fb-v-5000':'Facebook 5.000 Bereik',
  'fb-v-10000':'Facebook 10.000 Bereik', 'fb-v-25000':'Facebook 25.000 Bereik',
  'fb-v-50000':'Facebook 50.000 Bereik', 'fb-v-100000':'Facebook 100.000 Bereik',
  'fb-l-100':'Facebook 100 Likes',       'fb-l-250':'Facebook 250 Likes',
  'fb-l-500':'Facebook 500 Likes',       'fb-l-1000':'Facebook 1.000 Likes',
  'fb-l-2000':'Facebook 2.000 Likes',    'fb-l-5000':'Facebook 5.000 Likes',
  'fb-l-10000':'Facebook 10.000 Likes',  'fb-l-50000':'Facebook 50.000 Likes',
  'fb-vw-1000':'Facebook 1.000 Views',   'fb-vw-2500':'Facebook 2.500 Views',
  'fb-vw-5000':'Facebook 5.000 Views',   'fb-vw-10000':'Facebook 10.000 Views',
  'fb-vw-25000':'Facebook 25.000 Views', 'fb-vw-50000':'Facebook 50.000 Views',
  'fb-vw-100000':'Facebook 100.000 Views','fb-vw-500000':'Facebook 500.000 Views',
  'yt-a-500':'YouTube 500 Abonnees',     'yt-a-1000':'YouTube 1.000 Abonnees',
  'yt-a-2000':'YouTube 2.000 Abonnees',  'yt-a-5000':'YouTube 5.000 Abonnees',
  'yt-a-10000':'YouTube 10.000 Abonnees','yt-a-25000':'YouTube 25.000 Abonnees',
  'yt-a-50000':'YouTube 50.000 Abonnees','yt-a-100000':'YouTube 100.000 Abonnees',
  'yt-l-100':'YouTube 100 Likes',        'yt-l-250':'YouTube 250 Likes',
  'yt-l-500':'YouTube 500 Likes',        'yt-l-1000':'YouTube 1.000 Likes',
  'yt-l-2000':'YouTube 2.000 Likes',     'yt-l-5000':'YouTube 5.000 Likes',
  'yt-l-10000':'YouTube 10.000 Likes',   'yt-l-50000':'YouTube 50.000 Likes',
  'yt-vw-1000':'YouTube 1.000 Views',    'yt-vw-2500':'YouTube 2.500 Views',
  'yt-vw-5000':'YouTube 5.000 Views',    'yt-vw-10000':'YouTube 10.000 Views',
  'yt-vw-25000':'YouTube 25.000 Views',  'yt-vw-50000':'YouTube 50.000 Views',
  'yt-vw-100000':'YouTube 100.000 Views','yt-vw-500000':'YouTube 500.000 Views',
};
// Upsell-prijzen (afwijkend van catalogusprijs) — server-side vastgelegd.
// NOOIT prijzen uit de client vertrouwen.
const UPSELL_PRICES = {
  'ig-l-500': 499,  'ig-vw-2000': 599, 'ig-v-500': 699,  'ig-vw-1000': 399,
  'tt-l-500': 399,  'tt-vw-5000': 499, 'tt-v-500': 699,
  'fb-l-500': 699,  'fb-v-500': 999,
  'yt-a-500': 2499, 'yt-l-500': 899,   'yt-vw-5000': 1199,
};

const UPSELL_LABELS = {
  'ig-vw-2000': 'Instagram 2.000 Views',
};

const label = (id, fallback) => LABELS[id] || UPSELL_LABELS[id] || fallback || id;

// Mollie verwacht een bedrag als string met exact 2 decimalen: "9.99"
const toAmount = (cents) => (cents / 100).toFixed(2);

// Bepaalt de basis-URL en maakt hem ongevoelig voor invoerfouten:
// slash op het eind, ontbrekend https://, of een lege env-variabele.
function baseUrl(req) {
  let base = (process.env.SITE_URL || '').trim();
  if (!base) {
    // Terugval op het domein waar het verzoek vandaan komt
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    base = host ? `https://${host}` : '';
  }
  if (base && !/^https?:\/\//i.test(base)) base = 'https://' + base;
  return base.replace(/\/+$/, ''); // slashes aan het eind eraf
}

module.exports = async (req, res) => {
  const origin = baseUrl(req);
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { productId, username, platform, service, pakket, email, upsellId } = body;

  if (!productId || !PRICES[productId]) {
    return res.status(400).json({ error: 'Ongeldig pakket: ' + productId });
  }
  if (!username) {
    return res.status(400).json({ error: 'Gebruikersnaam ontbreekt' });
  }
  // Mollie levert GEEN e-mailadres aan (anders dan Stripe Checkout).
  // Zonder e-mail kun je geen bevestiging sturen, dus hier hard afdwingen.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: 'Geldig e-mailadres is verplicht' });
  }

  // Hoofdproduct + optionele upsell samentellen tot één betaling
  let cents = PRICES[productId];
  let omschrijving = label(productId, pakket);
  let upsellLabel = null;

  if (upsellId && UPSELL_PRICES[upsellId]) {
    cents += UPSELL_PRICES[upsellId];
    upsellLabel = label(upsellId);
    omschrijving += ' + ' + upsellLabel;
  }

  if (!/^https:\/\/[^\/]+\./.test(origin)) {
    console.error('Ongeldige basis-URL:', JSON.stringify(origin), '| SITE_URL =', JSON.stringify(process.env.SITE_URL));
    return res.status(500).json({ error: 'Serverconfiguratie: SITE_URL ontbreekt of is ongeldig' });
  }

  const orderRef = 'BS-' + Date.now().toString(36).toUpperCase();

  try {
    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: toAmount(cents) },
      // Deze omschrijving verschijnt op het bankafschrift van de klant.
      // Kort houden: Mollie kapt lange omschrijvingen af.
      description: `BoostSocials ${orderRef}`,
      redirectUrl: `${origin}/succes.html?username=${encodeURIComponent(username)}&pakket=${encodeURIComponent(omschrijving)}&value=${toAmount(cents)}&order=${orderRef}`,
      cancelUrl: `${origin}/?cancelled=true`,
      webhookUrl: `${origin}/api/webhook`,
      locale: 'nl_NL',
      metadata: {
        order_ref: orderRef,
        username,
        platform: platform || '',
        service: service || '',
        pakket: omschrijving,
        product_id: productId,
        upsell_id: upsellId || '',
        upsell_label: upsellLabel || '',
        email,
      },
    });

    // payment.getCheckoutUrl() === payment._links.checkout.href
    res.status(200).json({ url: payment.getCheckoutUrl(), order: orderRef });
  } catch (err) {
    console.error('Mollie error:', err);
    res.status(500).json({ error: err.message || 'Betaling kon niet worden gestart' });
  }
};
