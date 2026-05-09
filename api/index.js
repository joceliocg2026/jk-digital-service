export const config = {
  runtime: "edge",
};

// Vamos usar o IP direto para evitar problemas de DNS, 
// e vamos tentar a conexão sem forçar o SSL da Vercel
const TARGET_IP = "137.131.143.111";
const TARGET_PORT = "443";

export default async function handler(req) {
  const url = new URL(req.url);

  try {
    // Tenta conectar via HTTP para ignorar o erro de Handshake SSL
    // Já que seu config.json está com security: none
    const destination = `http://${TARGET_IP}:${TARGET_PORT}${url.pathname}${url.search}`;
    
    const newHeaders = new Headers(req.headers);
    newHeaders.set("Host", TARGET_IP);
    
    // Limpeza de segurança da Vercel
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("connection");

    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    return response;

  } catch (error) {
    // Se falhar, tentamos via HTTPS mas sem validar (fallback)
    try {
      return await fetch(`https://${TARGET_IP}:${TARGET_PORT}${url.pathname}${url.search}`, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
        duplex: "half"
      });
    } catch (e) {
      return new Response("ERRO_AO_CONECTAR_VPS", { status: 502 });
    }
  }
}
