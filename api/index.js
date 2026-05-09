export const config = {
  runtime: "edge",
};

// Agora usamos HTTPS pois o seu servidor VPS está exigindo (Porta 443 com SSL)
const TARGET_DOMAIN = "jkvercel.jkinfinitenet.com";
const TARGET_PORT = "443";

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    // Mudamos para https:// para resolver o erro de "HTTP request to HTTPS server"
    const destination = `https://${TARGET_DOMAIN}:${TARGET_PORT}${url.pathname}${url.search}`;

    const newHeaders = new Headers(req.headers);
    
    // O Host deve ser o domínio configurado na sua VPS
    newHeaders.set("Host", TARGET_DOMAIN);
    
    // Limpeza de headers para evitar o erro 403 da Vercel
    newHeaders.delete("x-vercel-id");
    newHeaders.delete("x-vercel-proxy-signature");
    newHeaders.delete("x-vercel-protection-bypass");
    newHeaders.delete("connection");

    // Executa o fetch com streaming habilitado (duplex half)
    const response = await fetch(destination, {
      method: req.method,
      headers: newHeaders,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "manual",
      duplex: "half", 
    });

    // Retorna a resposta bruta (Deve dar o Erro 400 ou resposta do Xray agora)
    return response;

  } catch (error) {
    return new Response("ERRO_LIGACAO_SSL_VPS", { status: 502 });
  }
}
