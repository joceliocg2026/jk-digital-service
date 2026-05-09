const https = require('https');

export default function handler(req, res) {
    // Configurações extraídas do seu JSON
    const options = {
        hostname: '137.131.143.111',
        port: 443,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            // O Host interno que o seu Xray espera (do seu JSON anterior)
            'host': 'relay-c1612a.orgod.shop'
        },
        rejectUnauthorized: false, // Permite SSL mesmo com erro na VPS
        agent: false
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Repassa exatamente o que a VPS responder (isso vai trazer o 400)
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        // Se a VPS não responder, mostra erro 502
        res.status(502).send('VPS_OFFLINE_OU_FIREWALL');
    });

    // Envia o corpo da requisição (essencial para gerar dados no xHTTP)
    req.pipe(proxyReq, { end: true });
}

export const config = {
    api: {
        // Mantemos false para não corromper os pacotes de dados
        bodyParser: false,
        externalResolver: true,
    },
};
