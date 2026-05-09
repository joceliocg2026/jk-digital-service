const httpProxy = require('http-proxy');

// Criamos o proxy fora do handler para estabilidade
const proxy = httpProxy.createProxyServer({
    target: 'https://137.131.143.111:443',
    changeOrigin: true,
    secure: false, 
    ws: true
});

// Intercetador para transformar 400 em 404 (Camuflagem solicitada)
proxy.on('proxyRes', function (proxyRes, req, res) {
    if (proxyRes.statusCode === 400) {
        proxyRes.statusCode = 404;
    }
});

export default function handler(req, res) {
    // AJUSTE PARA O TEU XRAY: 
    // O teu config.json espera o host "relay-c1612a.orgod.shop" internamente
    req.headers['host'] = 'relay-c1612a.orgod.shop';

    // Executa o redirecionamento
    proxy.web(req, res, (err) => {
        if (err) {
            // Caso a VPS não responda, mostra o 404 de Nginx
            res.setHeader('Content-Type', 'text/html');
            res.status(404).send('<html><head><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1></center><hr><center>nginx</center></body></html>');
        }
    });
}

export const config = {
    api: {
        bodyParser: false, // Vital para tráfego xHTTP/VLESS não corromper
        externalResolver: true,
    },
};
