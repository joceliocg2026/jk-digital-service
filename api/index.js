const https = require('https');

export default function handler(req, res) {
  // Se for acesso pelo navegador (GET sem cabeçalhos de VPN), mostra página "Online"
  if (req.method === 'GET' && !req.headers['x-requested-with'] && !req.headers['authorization']) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>JK Digital Service - Status</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { background: #0f172a; color: #38bdf8; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); text-align: center; border: 1px solid #334155; }
            .status { font-size: 1.2rem; font-weight: bold; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; gap: 10px; }
            .dot { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
            p { color: #94a3b8; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="status"><div class="dot"></div> SISTEMA ONLINE</div>
            <p>JK Digital Services - Vercel Relay Ativo</p>
            <p style="font-size: 0.7rem; opacity: 0.5;">Aguardando conexões de túnel...</p>
          </div>
        </body>
      </html>
    `);
  }

  // Se for tráfego do App (VPN), faz o Proxy
  const options = {
    hostname: '137.131.143.111',
    port: 443,
    path: req.url,
    method: req.method,
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
