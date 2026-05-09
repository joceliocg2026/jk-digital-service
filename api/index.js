export const config = {
  runtime: "edge",
};

// Vamos usar o domínio para evitar o erro de "Direct IP"
const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_PORT = "443";

export default async function handler(req) {
  const url = new URL(req.url);

  try {
    // Forçamos HTTPS para resolver o erro "Client sent HTTP to HTTPS"
    const destination = `https://${TARGET_DOMAIN}:${TARGET_PORT}${url.pathname}${url.search}`;
    
    const newHeaders = new Headers(req.headers);
    
    // O Host deve ser o domínio para validar o SSL da VPS
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Removemos os filtros da Vercel que causam o 403
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // O segredo para protocolos VPN: duplex "half" e não seguir redirecionamentos
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Se aparecer "400 Bad Request" no navegador, seu app vai conectar na hora!
    return response;

  } catch (error) {
    // Se der erro de SSL aqui, significa que o certificado da VPS expirou ou é inválido
    return new Response("ERRO_HANDSHAKE_OU_SSL: Verifique o certificado na VPS", { status: 502 });
  }
}
