const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Prijzen in centen (EUR)
const PRICES = {
  // Instagram Bereik
  'ig-v-100':    299,  'ig-v-500':    599,  'ig-v-1000':   999,
  'ig-v-2000':  1499,  'ig-v-5000':  2999,  'ig-v-10000': 5499,
  'ig-v-25000':10999,  'ig-v-50000':19999,
  // Instagram Likes
  'ig-l-50':     199,  'ig-l-100':    299,  'ig-l-250':    349,
  'ig-l-500':    499,  'ig-l-1000':   899,  'ig-l-2000':  1599,
  'ig-l-5000':  2199,  'ig-l-10000': 3499,
  // Instagram Views
  'ig-vw-250':   149,  'ig-vw-500':   199,  'ig-vw-1000':  399,
  'ig-vw-2000':  599,  'ig-vw-5000':  999,  'ig-vw-10000':1999,
  'ig-vw-25000':3499,  'ig-vw-50000':5999,
  // TikTok Bereik
  'tt-v-50':     199,  'tt-v-100':    399,  'tt-v-250':    549,
  'tt-v-500':    699,  'tt-v-1000':  1299,  'tt-v-2500':  1999,
  'tt-v-5000':  3799,  'tt-v-10000': 6499,
  // TikTok Likes
  'tt-l-50':      99,  'tt-l-100':    199,  'tt-l-250':    299,
  'tt-l-500':    399,  'tt-l-1000':   699,  'tt-l-2000':   899,
  'tt-l-5000':  1499,  'tt-l-10000': 2499,
  // TikTok Views
  'tt-vw-500':    99,  'tt-vw-1000':  199,  'tt-vw-2500':  349,
  'tt-vw-5000':  499,  'tt-vw-10000': 899,  'tt-vw-25000':1499,
  'tt-vw-50000':2499,  'tt-vw-100000':3999,
  // Facebook Bereik
  'fb-v-100':    299,  'fb-v-250':    449,  'fb-v-500':    599,
  'fb-v-1000':   999,  'fb-v-2500':  1999,  'fb-v-5000':  3499,
  'fb-v-10000': 5999,  'fb-v-25000':10999,
  // Facebook Likes
  'fb-l-50':     149,  'fb-l-100':    249,  'fb-l-200':    399,
  'fb-l-500':    699,  'fb-l-1000':  1199,  'fb-l-2000':  1899,
  'fb-l-5000':  3499,  'fb-l-10000': 5999,
  // Facebook Views
  'fb-vw-500':   149,  'fb-vw-1000':  299,  'fb-vw-2000':  499,
  'fb-vw-5000':  799,  'fb-vw-10000':1499,  'fb-vw-25000':2499,
  'fb-vw-50000':3999,  'fb-vw-100000':6499,
  // YouTube Abonnees
  'yt-a-50':     399,  'yt-a-100':    699,  'yt-a-250':   1499,
  'yt-a-500':   2499,  'yt-a-1000':  4499,  'yt-a-2000':  7999,
  'yt-a-5000': 16499,  'yt-a-10000':29999,
  // YouTube Likes
  'yt-l-50':     199,  'yt-l-100':    399,  'yt-l-250':    699,
  'yt-l-500':    899,  'yt-l-1000':  1499,  'yt-l-2000':  2499,
  'yt-l-5000':  4999,  'yt-l-10000': 8999,
  // YouTube Views
  'yt-vw-500':   199,  'yt-vw-1000':  399,  'yt-vw-2500':  799,
  'yt-vw-5000': 1199,  'yt-vw-10000':1999,  'yt-vw-25000':3499,
  'yt-vw-50000':5499,  'yt-vw-100000':8999,
};

const LABELS = {
  'ig-v-100':'Instagram 100 Bereik',   'ig-v-500':'Instagram 500 Bereik',
  'ig-v-1000':'Instagram 1.000 Bereik','ig-v-2000':'Instagram 2.000 Bereik',
  'ig-v-5000':'Instagram 5.000 Bereik','ig-v-10000':'Instagram 10.000 Bereik',
  'ig-v-25000':'Instagram 25.000 Bereik','ig-v-50000':'Instagram 50.000 Bereik',
  'ig-l-50':'Instagram 50 Likes',      'ig-l-100':'Instagram 100 Likes',
  'ig-l-250':'Instagram 250 Likes',    'ig-l-500':'Instagram 500 Likes',
  'ig-l-1000':'Instagram 1.000 Likes', 'ig-l-2000':'Instagram 2.000 Likes',
  'ig-l-5000':'Instagram 5.000 Likes', 'ig-l-10000':'Instagram 10.000 Likes',
  'ig-vw-250':'Instagram 250 Views',   'ig-vw-500':'Instagram 500 Views',
  'ig-vw-1000':'Instagram 1.000 Views','ig-vw-2000':'Instagram 2.000 Views',
  'ig-vw-5000':'Instagram 5.000 Views','ig-vw-10000':'Instagram 10.000 Views',
  'ig-vw-25000':'Instagram 25.000 Views','ig-vw-50000':'Instagram 50.000 Views',
  'tt-v-50':'TikTok 50 Bereik',        'tt-v-100':'TikTok 100 Bereik',
  'tt-v-250':'TikTok 250 Bereik',      'tt-v-500':'TikTok 500 Bereik',
  'tt-v-1000':'TikTok 1.000 Bereik',   'tt-v-2500':'TikTok 2.500 Bereik',
  'tt-v-5000':'TikTok 5.000 Bereik',   'tt-v-10000':'TikTok 10.000 Bereik',
  'tt-l-50':'TikTok 50 Likes',         'tt-l-100':'TikTok 100 Likes',
  'tt-l-250':'TikTok 250 Likes',       'tt-l-500':'TikTok 500 Likes',
  'tt-l-1000':'TikTok 1.000 Likes',    'tt-l-2000':'TikTok 2.000 Likes',
  'tt-l-5000':'TikTok 5.000 Likes',    'tt-l-10000':'TikTok 10.000 Likes',
  'tt-vw-500':'TikTok 500 Views',      'tt-vw-1000':'TikTok 1.000 Views',
  'tt-vw-2500':'TikTok 2.500 Views',   'tt-vw-5000':'TikTok 5.000 Views',
  'tt-vw-10000':'TikTok 10.000 Views', 'tt-vw-25000':'TikTok 25.000 Views',
  'tt-vw-50000':'TikTok 50.000 Views', 'tt-vw-100000':'TikTok 100.000 Views',
  'fb-v-100':'Facebook 100 Bereik',    'fb-v-250':'Facebook 250 Bereik',
  'fb-v-500':'Facebook 500 Bereik',    'fb-v-1000':'Facebook 1.000 Bereik',
  'fb-v-2500':'Facebook 2.500 Bereik', 'fb-v-5000':'Facebook 5.000 Bereik',
  'fb-v-10000':'Facebook 10.000 Bereik','fb-v-25000':'Facebook 25.000 Bereik',
  'fb-l-50':'Facebook 50 Likes',       'fb-l-100':'Facebook 100 Likes',
  'fb-l-200':'Facebook 200 Likes',     'fb-l-500':'Facebook 500 Likes',
  'fb-l-1000':'Facebook 1.000 Likes',  'fb-l-2000':'Facebook 2.000 Likes',
  'fb-l-5000':'Facebook 5.000 Likes',  'fb-l-10000':'Facebook 10.000 Likes',
  'fb-vw-500':'Facebook 500 Views',    'fb-vw-1000':'Facebook 1.000 Views',
  'fb-vw-2000':'Facebook 2.000 Views', 'fb-vw-5000':'Facebook 5.000 Views',
  'fb-vw-10000':'Facebook 10.000 Views','fb-vw-25000':'Facebook 25.000 Views',
  'fb-vw-50000':'Facebook 50.000 Views','fb-vw-100000':'Facebook 100.000 Views',
  'yt-a-50':'YouTube 50 Abonnees',     'yt-a-100':'YouTube 100 Abonnees',
  'yt-a-250':'YouTube 250 Abonnees',   'yt-a-500':'YouTube 500 Abonnees',
  'yt-a-1000':'YouTube 1.000 Abonnees','yt-a-2000':'YouTube 2.000 Abonnees',
  'yt-a-5000':'YouTube 5.000 Abonnees','yt-a-10000':'YouTube 10.000 Abonnees',
  'yt-l-50':'YouTube 50 Likes',        'yt-l-100':'YouTube 100 Likes',
  'yt-l-250':'YouTube 250 Likes',      'yt-l-500':'YouTube 500 Likes',
  'yt-l-1000':'YouTube 1.000 Likes',   'yt-l-2000':'YouTube 2.000 Likes',
  'yt-l-5000':'YouTube 5.000 Likes',   'yt-l-10000':'YouTube 10.000 Likes',
  'yt-vw-500':'YouTube 500 Views',     'yt-vw-1000':'YouTube 1.000 Views',
  'yt-vw-2500':'YouTube 2.500 Views',  'yt-vw-5000':'YouTube 5.000 Views',
  'yt-vw-10000':'YouTube 10.000 Views','yt-vw-25000':'YouTube 25.000 Views',
  'yt-vw-50000':'YouTube 50.000 Views','yt-vw-100000':'YouTube 100.000 Views',
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { productId, username, platform, service, pakket } = req.body;

  if (!productId || !PRICES[productId]) {
    return res.status(400).json({ error: 'Ongeldig pakket: ' + productId });
  }
  if (!username) {
    return res.status(400).json({ error: 'Gebruikersnaam ontbreekt' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'ideal', 'bancontact'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: LABELS[productId] || pakket,
            description: `Levering op @${username} · Inclusief bonus`,
          },
          unit_amount: PRICES[productId],
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/succes.html?username=${encodeURIComponent(username)}&pakket=${encodeURIComponent(LABELS[productId] || pakket)}&value=${(PRICES[productId]/100).toFixed(2)}&order={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/?cancelled=true`,
      metadata: {
        username,
        platform,
        service,
        pakket: LABELS[productId] || pakket,
        product_id: productId,
      },
      locale: 'nl',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};
