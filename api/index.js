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
};    method: req.method,
    headers: {
      ...req.headers,
      host: '137.131.143.111',
    },
    rejectUnauthorized: false, // Pula o erro de SSL
    agent: false // Evita cache de conexão que trava o App
  };

  const proxyReq = https.request(options, (proxyRes) => {
    // Repassa os cabeçalhos e o status da VPS
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.status(502).send('VPS_OFFLINE_OU_FIREWALL');
  });

  // Importante para xHTTP: Pipe direto sem mexer no corpo
  req.pipe(proxyReq, { end: true });
}

export const config = {
  api: {
    bodyParser: false, // Desativado para não corromper pacotes do App
    externalResolver: true,
  },
};
