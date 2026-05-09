const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    target: 'https://137.131.143.111:443',
    changeOrigin: true,
    secure: false, // Ignora erros de SSL da VPS
    ws: true
});

export default function handler(req, res) {
    // 1. Forçamos o host para o IP da sua VPS
    req.headers['host'] = '137.131.143.111';

    // 2. Interceptamos a resposta da VPS para camuflar o erro 400 em 404
    proxy.on('proxyRes', function (proxyRes, req, res) {
        // Se a VPS responder 400 (Bad Request), nós trocamos para 404 (Not Found)
        // Isso faz o seu link ficar igual ao link do exemplo que você viu
        if (proxyRes.statusCode === 400) {
            proxyRes.statusCode = 404;
        }
    });

    // 3. Executa o proxy
    proxy.web(req, res, (err) => {
        if (err) {
            // Se a VPS estiver fora, mostra um 404 padrão de Nginx
            res.setHeader('Content-Type', 'text/html');
            res.status(404).send('<html><head><title>404 Not Found</title></head><body><center><h1>404 Not Found</h1></center><hr><center>nginx</center></body></html>');
        }
    });
}

export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};
