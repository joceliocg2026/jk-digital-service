export const config = {
  runtime: "edge",
};

// Configuração direta para o seu IP 
const TARGET_IP = "137.131.143.111";
const TARGET_PORT = "443";

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    // Monta a URL de destino
    const destination = `http://${TARGET_IP}:${TARGET_PORT}${url.pathname}${url.search}`;

    const newHeaders = new Headers(req.headers);
    
    // Configura o Host para o IP da VPS (Essencial para o Xray)
    newHeaders.set("Host", TARGET_IP);
    
    // Remove cabeçalhos de proteção da Vercel que causam o erro 403
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // Faz o fetch em modo streaming (duplex half) para protocolos VPN
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Retorna a resposta bruta (Onde o navegador dará o erro 400)
    return response;

  } catch (error) {
    return new Response("ERRO_LIGACAO_VPS", { status: 502 });
  }
}
