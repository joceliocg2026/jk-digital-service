const https = require('https');

export default function handler(req, res) {
  const options = {
    hostname: '137.131.143.111',
    port: 443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: '137.131.143.111', // Força o host para o IP da sua VPS
    },
    rejectUnauthorized: false, // Ignora erro de SSL
  };

  const proxyReq = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.status(500).send('VPS Inalcançável');
  });

  req.pipe(proxyReq, { end: true });
}

export const config = {
  api: {
    bodyParser: false, // Necessário para não corromper o tráfego xHTTP
  },
};
