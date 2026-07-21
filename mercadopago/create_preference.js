const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) process.env[key.trim()] = value.trim();
    }
  });
}

const token = process.env.MP_ACCESS_TOKEN;
if (!token) {
  console.error('ERROR: MP_ACCESS_TOKEN no configurado en .env');
  process.exit(1);
}

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
    success: process.env.SUCCESS_URL || 'https://web-viejito-john-20260720-01.web.app/index.html',
    failure: process.env.FAILURE_URL || 'https://web-viejito-john-20260720-01.web.app/checkout.html',
    pending: process.env.PENDING_URL || 'https://web-viejito-john-20260720-01.web.app/checkout.html'
  },
  auto_return: 'approved'
};

const options = {
  hostname: 'api.mercadopago.com',
  port: 443,
  path: '/checkout/preferences?access_token=' + token,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const resp = JSON.parse(data);
      if (resp.error) {
        console.error('Error de Mercado Pago:', resp.error);
        process.exit(1);
      }
      console.log('\nPreferencia creada exitosamente');
      console.log('ID:', resp.id);
      if (resp.init_point) console.log('init_point:', resp.init_point);
      if (resp.sandbox_init_point) console.log('sandbox_init_point:', resp.sandbox_init_point);
      console.log('\n✓ Usa la URL above para redirigir a compradores (abre en navegador).');
    } catch (e) {
      console.error('Error parsing response:', e);
      console.error(data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
  process.exit(1);
});

req.write(JSON.stringify(preference));
req.end();
