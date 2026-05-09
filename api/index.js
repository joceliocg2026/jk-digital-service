javascript
export const config = {
  runtime: "edge",
};

const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Forçamos HTTPS para matar o erro "Client sent HTTP to HTTPS"
  const destination = `https://${TARGET_DOMAIN}:443${url.pathname}${url.search}`;

  try {
    const newHeaders = new Headers(req.headers);
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Limpeza de headers para o protocolo XHTTP passar sem travas
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

    // Aqui deve aparecer o 400 Bad Request no navegador
    return response;

  } catch (error) {
    // Se der erro de Handshake, tentamos uma rota alternativa
    return new Response("ERRO_DE_HANDSHAKE: Verifique se o SSL na VPS está ativo", { status: 502 });
  }
}
