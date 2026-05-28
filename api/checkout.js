const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICES = {
  // Instagram Volgers
  'ig-v-500':     599,  'ig-v-1000':   999,  'ig-v-2000':  1499,
  'ig-v-5000':   2999,  'ig-v-10000': 5499,  'ig-v-25000':10999,
  'ig-v-50000': 19999,
  // Instagram Likes
  'ig-l-50':      199,  'ig-l-100':    299,  'ig-l-200':    399,
  'ig-l-500':     499,  'ig-l-1000':   899,  'ig-l-2000':  1599,
  'ig-l-5000':   2199,  'ig-l-10000': 3199,  'ig-l-20000': 5299,
  'ig-l-50000': 11599,
  // Instagram Views
  'ig-vw-500':    199,  'ig-vw-1000':  399,  'ig-vw-2000':  599,
  'ig-vw-5000':   999,  'ig-vw-10000':1999,  'ig-vw-20000':3499,
  'ig-vw-30000': 4999,  'ig-vw-50000':7499,  'ig-vw-100000':9999,
  // TikTok Volgers
  'tt-v-100':     399,  'tt-v-250':    599,  'tt-v-500':    699,
  'tt-v-1000':   1299,  'tt-v-2500':  1999,  'tt-v-5000':  3799,
  'tt-v-10000':  6499,  'tt-v-25000':14999,
  // TikTok Likes
  'tt-l-100':     199,  'tt-l-500':    399,  'tt-l-1000':   699,
  'tt-l-2000':    899,  'tt-l-5000':  1499,  'tt-l-10000': 2499,
  'tt-l-25000':  4499,  'tt-l-50000': 7999,
  // TikTok Views
  'tt-vw-1000':   199,  'tt-vw-5000':  499,  'tt-vw-10000': 899,
  'tt-vw-20000': 1499,  'tt-vw-50000':2499,  'tt-vw-100000':3999,
  // Facebook Volgers
  'fb-v-500':     599,  'fb-v-1000':   999,  'fb-v-5000':  3499,
  'fb-v-10000':  5999,
  // Facebook Likes
  'fb-l-200':     399,  'fb-l-500':    699,  'fb-l-1000':  1199,
  'fb-l-5000':   3999,
  // Facebook Views
  'fb-vw-1000':   299,  'fb-vw-5000':  799,  'fb-vw-10000':1499,
  // YouTube Abonnees
  'yt-a-100':     699,  'yt-a-500':   2499,  'yt-a-1000':  4499,
  'yt-a-2500':   8999,
  // YouTube Likes
  'yt-l-100':     399,  'yt-l-500':    899,  'yt-l-1000':  1499,
  // YouTube Views
  'yt-vw-1000':   399,  'yt-vw-5000': 1199,  'yt-vw-10000':1999,
  'yt-vw-20000': 3499,  'yt-vw-50000':7499,  'yt-vw-100000':9999,
};

const LABELS = {
  'ig-v-500':'Instagram 500 Volgers','ig-v-1000':'Instagram 1.000 Volgers',
  'ig-v-2000':'Instagram 2.000 Volgers','ig-v-5000':'Instagram 5.000 Volgers',
  'ig-v-10000':'Instagram 10.000 Volgers','ig-v-25000':'Instagram 25.000 Volgers',
  'ig-v-50000':'Instagram 50.000 Volgers',
  'ig-l-50':'Instagram 50 Likes','ig-l-100':'Instagram 100 Likes',
  'ig-l-200':'Instagram 200 Likes','ig-l-500':'Instagram 500 Likes',
  'ig-l-1000':'Instagram 1.000 Likes','ig-l-2000':'Instagram 2.000 Likes',
  'ig-l-5000':'Instagram 5.000 Likes','ig-l-10000':'Instagram 10.000 Likes',
  'ig-l-20000':'Instagram 20.000 Likes','ig-l-50000':'Instagram 50.000 Likes',
  'ig-vw-500':'Instagram 500 Views','ig-vw-1000':'Instagram 1.000 Views',
  'ig-vw-2000':'Instagram 2.000 Views','ig-vw-5000':'Instagram 5.000 Views',
  'ig-vw-10000':'Instagram 10.000 Views','ig-vw-20000':'Instagram 20.000 Views',
  'ig-vw-30000':'Instagram 30.000 Views','ig-vw-50000':'Instagram 50.000 Views',
  'ig-vw-100000':'Instagram 100.000 Views',
  'tt-v-100':'TikTok 100 Volgers','tt-v-250':'TikTok 250 Volgers',
  'tt-v-500':'TikTok 500 Volgers','tt-v-1000':'TikTok 1.000 Volgers',
  'tt-v-2500':'TikTok 2.500 Volgers','tt-v-5000':'TikTok 5.000 Volgers',
  'tt-v-10000':'TikTok 10.000 Volgers','tt-v-25000':'TikTok 25.000 Volgers',
  'tt-l-100':'TikTok 100 Likes','tt-l-500':'TikTok 500 Likes',
  'tt-l-1000':'TikTok 1.000 Likes','tt-l-2000':'TikTok 2.000 Likes',
  'tt-l-5000':'TikTok 5.000 Likes','tt-l-10000':'TikTok 10.000 Likes',
  'tt-l-25000':'TikTok 25.000 Likes','tt-l-50000':'TikTok 50.000 Likes',
  'tt-vw-1000':'TikTok 1.000 Views','tt-vw-5000':'TikTok 5.000 Views',
  'tt-vw-10000':'TikTok 10.000 Views','tt-vw-20000':'TikTok 20.000 Views',
  'tt-vw-50000':'TikTok 50.000 Views','tt-vw-100000':'TikTok 100.000 Views',
  'fb-v-500':'Facebook 500 Volgers','fb-v-1000':'Facebook 1.000 Volgers',
  'fb-v-5000':'Facebook 5.000 Volgers','fb-v-10000':'Facebook 10.000 Volgers',
  'fb-l-200':'Facebook 200 Likes','fb-l-500':'Facebook 500 Likes',
  'fb-l-1000':'Facebook 1.000 Likes','fb-l-5000':'Facebook 5.000 Likes',
  'fb-vw-1000':'Facebook 1.000 Views','fb-vw-5000':'Facebook 5.000 Views',
  'fb-vw-10000':'Facebook 10.000 Views',
  'yt-a-100':'YouTube 100 Abonnees','yt-a-500':'YouTube 500 Abonnees',
  'yt-a-1000':'YouTube 1.000 Abonnees','yt-a-2500':'YouTube 2.500 Abonnees',
  'yt-l-100':'YouTube 100 Likes','yt-l-500':'YouTube 500 Likes',
  'yt-l-1000':'YouTube 1.000 Likes',
  'yt-vw-1000':'YouTube 1.000 Views','yt-vw-5000':'YouTube 5.000 Views',
  'yt-vw-10000':'YouTube 10.000 Views','yt-vw-20000':'YouTube 20.000 Views',
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
            description: `Levering op @${username}`,
          },
          unit_amount: PRICES[productId],
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/succes.html?username=${encodeURIComponent(username)}&pakket=${encodeURIComponent(LABELS[productId] || pakket)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/?cancelled=true`,
      metadata: { username, platform, service, pakket: LABELS[productId] || pakket, product_id: productId },
      phone_number_collection: { enabled: false },
      locale: 'nl',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};
