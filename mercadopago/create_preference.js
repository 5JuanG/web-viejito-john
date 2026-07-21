require('dotenv').config();
const mercadopago = require('mercadopago');

const token = process.env.MP_ACCESS_TOKEN;
if (!token) {
  console.error('ERROR: set MP_ACCESS_TOKEN in .env (sandbox test token)');
  process.exit(1);
}

mercadopago.configure({ access_token: token });

const title = process.argv[2] || 'Gel Balsámico del Viejito John';
const quantity = Number(process.argv[3] || 1);
const unit_price = Number(process.argv[4] || 95);

const preference = {
  items: [
    {
      title,
      quantity,
      unit_price
    }
  ],
  back_urls: {
    success: process.env.SUCCESS_URL || 'https://httpbin.org/get',
    failure: process.env.FAILURE_URL || 'https://httpbin.org/status/400',
    pending: process.env.PENDING_URL || 'https://httpbin.org/status/202'
  },
  auto_return: 'approved'
};

(async () => {
  try {
    const resp = await mercadopago.preferences.create(preference);
    console.log('\nPreference created successfully');
    console.log('id:', resp.body.id);
    if (resp.body.init_point) console.log('init_point:', resp.body.init_point);
    if (resp.body.sandbox_init_point) console.log('sandbox_init_point:', resp.body.sandbox_init_point);
    console.log('\nUse the `init_point` or `sandbox_init_point` URL to redirect customers (open in browser).');
  } catch (err) {
    console.error('Error creating preference:');
    console.error(err);
    process.exit(1);
  }
})();
