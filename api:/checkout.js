const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Prijzen per pakket-id (in eurocenten)
const PRICES = {
  // Instagram Volgers
  'ig-v-500':    599,
  'ig-v-1000':   999,
  'ig-v-2000':   1499,
  'ig-v-5000':   2999,
  'ig-v-10000':  5499,
  'ig-v-25000':  10999,
  'ig-v-50000':  19999,
  // Instagram Likes
  'ig-l-50':     199,
  'ig-l-100':    299,
  'ig-l-200':    399,
  'ig-l-500':    499,
  'ig-l-1000':   899,
  'ig-l-2000':   1599,
  'ig-l-5000':   2199,
  // Instagram Views
  'ig-vw-500':   199,
  'ig-vw-1000':  399,
  'ig-vw-2000':  599,
  'ig-vw-5000':  999,
  'ig-vw-10000': 1999,
  // TikTok Volgers
  'tt-v-100':    399,
  'tt-v-500':    699,
  'tt-v-1000':   1299,
  'tt-v-5000':   3799,
  // TikTok Likes
  'tt-l-100':    199,
  'tt-l-500':    399,
  'tt-l-1000':   699,
  // TikTok Views
  'tt-vw-1000':  199,
  'tt-vw-5000':  499,
  'tt-vw-10000': 899,
  // Facebook Volgers
  'fb-v-500':    599,
  'fb-v-1000':   999,
  'fb-v-5000':   3499,
  // Facebook Likes
  'fb-l-200':    399,
  'fb-l-500':    699,
  'fb-l-1000':   1199,
  // Facebook Views
  'fb-vw-1000':  299,
  'fb-vw-5000':  799,
  // YouTube Abonnees
  'yt-a-100':    699,
  'yt-a-500':    2499,
  'yt-a-1000':   4499,
  // YouTube Likes
  'yt-l-100':    399,
  'yt-l-500':    899,
  // YouTube Views
  'yt-vw-1000':  399,
  'yt-vw-5000':  1199,
  'yt-vw-10000': 1999,
};

const LABELS = {
  'ig-v-500':    'Instagram 500 Volgers',
  'ig-v-1000':   'Instagram 1.000 Volgers',
  'ig-v-2000':   'Instagram 2.000 Volgers',
  'ig-v-5000':   'Instagram 5.000 Volgers',
  'ig-v-10000':  'Instagram 10.000 Volgers',
  'ig-v-25000':  'Instagram 25.000 Volgers',
  'ig-v-50000':  'Instagram 50.000 Volgers',
  'ig-l-50':     'Instagram 50 Likes',
  'ig-l-100':    'Instagram 100 Likes',
  'ig-l-200':    'Instagram 200 Likes',
  'ig-l-500':    'Instagram 500 Likes',
  'ig-l-1000':   'Instagram 1.000 Likes',
  'ig-l-2000':   'Instagram 2.000 Likes',
  'ig-l-5000':   'Instagram 5.000 Likes',
  'ig-vw-500':   'Instagram 500 Views',
  'ig-vw-1000':  'Instagram 1.000 Views',
  'ig-vw-2000':  'Instagram 2.000 Views',
  'ig-vw-5000':  'Instagram 5.000 Views',
  'ig-vw-10000': 'Instagram 10.000 Views',
  'tt-v-100':    'TikTok 100 Volgers',
  'tt-v-500':    'TikTok 500 Volgers',
  'tt-v-1000':   'TikTok 1.000 Volgers',
  'tt-v-5000':   'TikTok 5.000 Volgers',
  'tt-l-100':    'TikTok 100 Likes',
  'tt-l-500':    'TikTok 500 Likes',
  'tt-l-1000':   'TikTok 1.000 Likes',
  'tt-vw-1000':  'TikTok 1.000 Views',
  'tt-vw-5000':  'TikTok 5.000 Views',
  'tt-vw-10000': 'TikTok 10.000 Views',
  'fb-v-500':    'Facebook 500 Volgers',
  'fb-v-1000':   'Facebook 1.000 Volgers',
  'fb-v-5000':   'Facebook 5.000 Volgers',
  'fb-l-200':    'Facebook 200 Likes',
  'fb-l-500':    'Facebook 500 Likes',
  'fb-l-1000':   'Facebook 1.000 Likes',
  'fb-vw-1000':  'Facebook 1.000 Views',
  'fb-vw-5000':  'Facebook 5.000 Views',
  'yt-a-100':    'YouTube 100 Abonnees',
  'yt-a-500':    'YouTube 500 Abonnees',
  'yt-a-1000':   'YouTube 1.000 Abonnees',
  'yt-l-100':    'YouTube 100 Likes',
  'yt-l-500':    'YouTube 500 Likes',
  'yt-vw-1000':  'YouTube 1.000 Views',
  'yt-vw-5000':  'YouTube 5.000 Views',
  'yt-vw-10000': 'YouTube 10.000 Views',
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { productId, username, platform, service, pakket } = req.body;

  if (!productId || !PRICES[productId]) {
    return res.status(400).json({ error: 'Ongeldig pakket' });
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
      // Stuur klant terug naar bedankpagina na betaling
      success_url: `${process.env.SITE_URL}/succes.html?username=${encodeURIComponent(username)}&pakket=${encodeURIComponent(LABELS[productId] || pakket)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.SITE_URL}/?cancelled=true`,
      // Klantgegevens opslaan als metadata — zichtbaar in Stripe dashboard
      metadata: {
        username,
        platform,
        service,
        pakket: LABELS[productId] || pakket,
        product_id: productId,
      },
      // Vraag e-mailadres op bij checkout
      customer_email: undefined,
      phone_number_collection: { enabled: false },
      locale: 'nl',
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};
