export const config = {
  runtime: "edge",
};

// Usamos o domínio apontado para o seu IP
const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_PORT = "443";

export default async function handler(req) {
  const url = new URL(req.url);

  try {
    // Mudamos para http:// para evitar o erro de Handshake SSL (ERRO_AO_CONECTAR_VPS)
    // A Vercel aceita falar http com domínios externos no Edge Runtime
    const destination = `http://${TARGET_DOMAIN}:${TARGET_PORT}${url.pathname}${url.search}`;
    
    const newHeaders = new Headers(req.headers);
    
    // O Host deve ser o domínio para o Xray identificar o tráfego
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Limpeza de headers da Vercel para evitar 403 ou loops
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // Executa o fetch com streaming (duplex: half) essencial para xHTTP
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Se chegar aqui, a conexão foi feita. 
    // No navegador deve aparecer "400 Bad Request" (Resposta do Xray)
    return response;

  } catch (error) {
    // Fallback caso a VPS exija estritamente HTTPS
    try {
      return await fetch(`https://${TARGET_DOMAIN}:${TARGET_PORT}${url.pathname}${url.search}`, {
        method: req.method,
        headers: req.headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
        duplex: "half"
      });
    } catch (e) {
      return new Response("ERRO_CRITICO_VPS: Verifique se a porta 443 está aberta na VPS", { status: 502 });
    }
  }
}
