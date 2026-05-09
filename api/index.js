const https = require('https');

export default function handler(req, res) {
    // Configurações da sua VPS
    const options = {
        hostname: '137.131.143.111',
        port: 443,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': '137.131.143.111', // Mantém o host como o IP para o Xray
        },
        rejectUnauthorized: false, // Permite SSL da VPS mesmo se estiver "incompleto"
        agent: false
    };

    // Criamos a requisição de Proxy
    const proxyReq = https.request(options, (proxyRes) => {
        // Se o navegador acessar, o Xray vai devolver 400 ou 404
        // Nós repassamos exatamente o que a VPS responder para a Vercel não desconfiar
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    // Tratamento de Erro para não "crashar" a função da Vercel
    proxyReq.on('error', (err) => {
        // Se a VPS não responder, mostramos um 404 padrão de servidor
        res.setHeader('Content-Type', 'text/html');
        res.status(404).send(`
            <html>
                <head><title>404 Not Found</title></head>
                <body>
                    <center><h1>404 Not Found</h1></center>
                    <hr><center>nginx</center>
                </body>
            </html>
        `);
    });

    // ESSENCIAL PARA GERAR DADOS (xHTTP/WebSocket):
    // Repassa o corpo da requisição sem nenhuma alteração
    req.pipe(proxyReq, { end: true });
}

export const config = {
    api: {
        bodyParser: false, // NÃO mude isso. O BodyParser quebra os dados da VPN.
        externalResolver: true,
    },
};
